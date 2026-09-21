import {
  ActionBinding,
  BindingInput,
  ConflictSeverity,
  ConflictDetails,
  ConflictReport,
  ActionMapsDocument
} from '@sc-mapping/shared-types';
import { ExclusionMatrix } from './ExclusionMatrix.js';
import { TemporalEvaluator } from './TemporalEvaluator.js';
import { RedundancyEvaluator } from './RedundancyEvaluator.js';

/**
 * Intelligent Conflict Detection Engine for Star Citizen
 * Evaluates contextual mutual exclusivity, Master Flight Modes (SCM vs NAV),
 * temporal activation mechanics (press, hold, double_tap, multiTap),
 * and redundant/deprecated mappings for modern game versions.
 */
export class ConflictResolver {
  /**
   * Evaluates two action bindings and returns a conflict severity score (0 = None, 1 = Warning, 2 = Fatal, 3 = Redundant)
   * with detailed explanatory diagnostics.
   *
   * @param mapA Action map context of first action (e.g. 'spaceship_movement')
   * @param actionA First action binding object
   * @param mapB Action map context of second action (e.g. 'player_input_onfoot')
   * @param actionB Second action binding object
   * @returns The highest ConflictDetails detected across any shared inputs, or severity 0 if none.
   */
  public static evaluateActions(
    mapA: string,
    actionA: ActionBinding,
    mapB: string,
    actionB: ActionBinding
  ): ConflictDetails {
    // If the two actions are literally the same action in the same map, ignore self-comparison
    if (mapA === mapB && actionA.name === actionB.name) {
      return {
        severity: ConflictSeverity.None,
        sourceContext: mapA,
        sourceAction: actionA.name,
        targetContext: mapB,
        targetAction: actionB.name,
        sharedInput: '',
        reason: 'Identical action identity (self-comparison)'
      };
    }

    // Step 1: Check if the actionmaps are mutually exclusive operational contexts
    // e.g. spaceship_movement vs player_input_onfoot -> Never conflict
    if (!ExclusionMatrix.areContextsConcurrent(mapA, mapB)) {
      return {
        severity: ConflictSeverity.None,
        sourceContext: mapA,
        sourceAction: actionA.name,
        targetContext: mapB,
        targetAction: actionB.name,
        sharedInput: '',
        reason: `Mutually exclusive operational contexts (${mapA} vs ${mapB})`
      };
    }

    // Step 1b: Check if specific actions are mutually exclusive (e.g. vehicle role toggles, state sequencing, UI lifecycle)
    if (ExclusionMatrix.areActionsMutuallyExclusive(mapA, actionA.name, mapB, actionB.name)) {
      return {
        severity: ConflictSeverity.None,
        sourceContext: mapA,
        sourceAction: actionA.name,
        targetContext: mapB,
        targetAction: actionB.name,
        sharedInput: '',
        reason: `Mutually exclusive operational modes or state-lifecycle actions (${actionA.name} vs ${actionB.name})`
      };
    }

    // Step 2: Check Star Citizen 3.23+ Master Modes (SCM vs NAV)
    // e.g. v_attack1_group1 (SCM) vs v_quantum_spool (NAV) -> Isolated, no conflict
    if (!ExclusionMatrix.areMasterModesConcurrent(actionA.name, actionB.name)) {
      return {
        severity: ConflictSeverity.None,
        sourceContext: mapA,
        sourceAction: actionA.name,
        targetContext: mapB,
        targetAction: actionB.name,
        sharedInput: '',
        reason: 'Isolated across operational flight Master Modes (SCM combat vs NAV quantum)'
      };
    }

    // Step 3: Compare each input pair across both actions to find matching physical hardware inputs
    let highestConflict: ConflictDetails = {
      severity: ConflictSeverity.None,
      sourceContext: mapA,
      sourceAction: actionA.name,
      targetContext: mapB,
      targetAction: actionB.name,
      sharedInput: '',
      reason: 'No shared hardware inputs'
    };

    for (const inputA of actionA.inputs) {
      for (const inputB of actionB.inputs) {
        if (this.arePhysicalInputsEqual(inputA, inputB)) {
          // Rule R1: Check Subsumed Action Redundancy (e.g. v_flightready + v_power_set_on)
          const subsumed = RedundancyEvaluator.checkSubsumedPair(actionA.name, actionB.name);
          if (subsumed.isRedundant) {
            return {
              severity: ConflictSeverity.Redundant,
              conflictType: 'redundancy',
              sourceContext: mapA,
              sourceAction: actionA.name,
              targetContext: mapB,
              targetAction: actionB.name,
              sharedInput: inputA.input,
              reason: subsumed.reason || 'Subsumed action redundancy',
              recommendation: subsumed.recommendation
            };
          }

          const temporal = TemporalEvaluator.evaluate(actionA, inputA, actionB, inputB);

          if (temporal.severity > highestConflict.severity) {
            highestConflict = {
              severity: temporal.severity,
              conflictType: temporal.severity === ConflictSeverity.Fatal ? 'collision' : 'latency',
              sourceContext: mapA,
              sourceAction: actionA.name,
              targetContext: mapB,
              targetAction: actionB.name,
              sharedInput: inputA.input,
              reason: temporal.reason,
              recommendation: temporal.recommendation
            };

            // If we found a Fatal conflict, no need to check further on this pair
            if (highestConflict.severity === ConflictSeverity.Fatal) {
              return highestConflict;
            }
          }
        }
      }
    }

    return highestConflict;
  }

  /**
   * Helper evaluation function accepting two action objects and returning raw severity score:
   * 0 = None, 1 = Warning, 2 = Fatal, 3 = Redundant
   */
  public static evaluateSeverity(
    mapA: string,
    actionA: ActionBinding,
    mapB: string,
    actionB: ActionBinding
  ): ConflictSeverity {
    const details = this.evaluateActions(mapA, actionA, mapB, actionB);
    return details.severity;
  }

  /**
   * Full document auditor: Scans an entire ActionMapsDocument and returns a categorized ConflictReport.
   * Optionally filters analysis to a specific device family (e.g. 'js' for joysticks, 'kb' for keyboard).
   */
  public static auditDocument(
    doc: ActionMapsDocument,
    options?: { deviceFilter?: string }
  ): ConflictReport {
    const report: ConflictReport = {
      hasFatalConflicts: false,
      warningCount: 0,
      fatalCount: 0,
      redundantCount: 0,
      conflicts: []
    };

    const filter = options?.deviceFilter?.toLowerCase();

    // Flatten all actions into a comparable list
    const allActions: Array<{ mapName: string; action: ActionBinding }> = [];
    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      for (const action of Object.values(group.actions)) {
        if (action.inputs && action.inputs.length > 0) {
          // If deviceFilter is specified, only include actions containing that device prefix
          if (filter && filter !== 'all') {
            const matches = action.inputs.some(i => 
              i.devicePrefix.toLowerCase().startsWith(filter) ||
              (filter === 'js' && i.devicePrefix.toLowerCase().startsWith('js'))
            );
            if (!matches) continue;
          }
          allActions.push({ mapName, action });
        }
      }
    }

    // 1. Pairwise evaluation for collisions, latency buffers, and subsumed redundancies
    for (let i = 0; i < allActions.length; i++) {
      for (let j = i + 1; j < allActions.length; j++) {
        const itemA = allActions[i];
        const itemB = allActions[j];

        const details = this.evaluateActions(
          itemA.mapName,
          itemA.action,
          itemB.mapName,
          itemB.action
        );

        if (details.severity !== ConflictSeverity.None) {
          // If device filter active, ensure sharedInput matches the filter
          if (filter && filter !== 'all') {
            if (!details.sharedInput.toLowerCase().startsWith(filter)) {
              continue;
            }
          }

          report.conflicts.push(details);
          if (details.severity === ConflictSeverity.Fatal) {
            report.fatalCount++;
            report.hasFatalConflicts = true;
          } else if (details.severity === ConflictSeverity.Warning) {
            report.warningCount++;
          } else if (details.severity === ConflictSeverity.Redundant) {
            report.redundantCount++;
          }
        }
      }
    }

    // 2. Rule R2: Check for Deprecated / Obsolete Actions in current Star Citizen version (3.23+ Master Modes)
    const auditedDeprecated = new Set<string>();
    for (const item of allActions) {
      const dep = RedundancyEvaluator.isActionDeprecated(item.action.name);
      if (dep && !auditedDeprecated.has(item.action.name)) {
        auditedDeprecated.add(item.action.name);
        for (const input of item.action.inputs) {
          if (filter && filter !== 'all') {
            if (!input.devicePrefix.toLowerCase().startsWith(filter)) {
              continue;
            }
          }
          report.conflicts.push({
            severity: ConflictSeverity.Redundant,
            conflictType: 'deprecated',
            sourceContext: item.mapName,
            sourceAction: item.action.name,
            targetContext: 'Current Game Version (SC 3.23+)',
            targetAction: 'Obsolete / Superseded',
            sharedInput: input.input,
            reason: `Obsolete Action (${dep.deprecatedSince}): ${dep.reason}`,
            recommendation: dep.replacement
          });
          report.redundantCount++;
        }
      }
    }

    return report;
  }

  /**
   * Checks if two inputs share the exact physical hardware trigger (prefix + key + modifiers)
   */
  private static arePhysicalInputsEqual(a: BindingInput, b: BindingInput): boolean {
    if (a.devicePrefix.toLowerCase() !== b.devicePrefix.toLowerCase()) {
      return false;
    }

    if (a.hardwareKey.toLowerCase() !== b.hardwareKey.toLowerCase()) {
      return false;
    }

    // Check modifiers (e.g. lalt vs ralt vs none)
    const modsA = (a.modifiers || []).map(m => m.toLowerCase()).sort().join('+');
    const modsB = (b.modifiers || []).map(m => m.toLowerCase()).sort().join('+');

    return modsA === modsB;
  }
}
