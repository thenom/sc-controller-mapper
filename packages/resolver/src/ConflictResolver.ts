import {
  ActionBinding,
  BindingInput,
  ConflictSeverity,
  ConflictDetails,
  ConflictReport,
  ActionMapsDocument,
  ConflictType
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
            let conflictType: ConflictType = temporal.severity === ConflictSeverity.Fatal ? 'collision' : 'latency';
            let reason = temporal.reason;
            let recommendation = temporal.recommendation;
            let deprecatedAction: string | undefined;
            let rootCauseAction: string | undefined;

            // Check if either colliding action is deprecated in modern Star Citizen (Rule R2)
            const depA = RedundancyEvaluator.isActionDeprecated(actionA.name);
            const depB = RedundancyEvaluator.isActionDeprecated(actionB.name);

            if (depA && !depB) {
              conflictType = 'obsolete_collision';
              deprecatedAction = actionA.name;
              rootCauseAction = actionA.name;
              reason = `Collision with Obsolete Action: '${actionA.name}' (${depA.deprecatedSince}) shares a physical trigger with modern action '${actionB.name}'.`;
              recommendation = `Remove '${actionA.name}' from your profile (${depA.reason}). It is obsolete in modern Star Citizen and clearing it eliminates this collision without changing '${actionB.name}'.`;
            } else if (!depA && depB) {
              conflictType = 'obsolete_collision';
              deprecatedAction = actionB.name;
              rootCauseAction = actionB.name;
              reason = `Collision with Obsolete Action: '${actionB.name}' (${depB.deprecatedSince}) shares a physical trigger with modern action '${actionA.name}'.`;
              recommendation = `Remove '${actionB.name}' from your profile (${depB.reason}). It is obsolete in modern Star Citizen and clearing it eliminates this collision without changing '${actionA.name}'.`;
            } else if (depA && depB) {
              conflictType = 'obsolete_collision';
              deprecatedAction = `${actionA.name}, ${actionB.name}`;
              reason = `Dual Obsolete Action Collision: Both '${actionA.name}' (${depA.deprecatedSince}) and '${actionB.name}' (${depB.deprecatedSince}) are legacy actions sharing an input.`;
              recommendation = `Remove both '${actionA.name}' and '${actionB.name}' from your profile. Both commands were removed or superseded in modern Star Citizen builds.`;
            }

            highestConflict = {
              severity: temporal.severity,
              conflictType,
              sourceContext: mapA,
              sourceAction: actionA.name,
              targetContext: mapB,
              targetAction: actionB.name,
              sharedInput: inputA.input,
              reason,
              recommendation,
              deprecatedAction,
              rootCauseAction
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
        // Filter out unbound placeholders (e.g. 'js1_', 'js2_', '') so they don't enter pairwise comparison
        const physicalInputs = (action.inputs || []).filter(i => !this.isUnboundPlaceholder(i));
        if (physicalInputs.length > 0) {
          // If deviceFilter is specified, only include actions containing that device prefix
          if (filter && filter !== 'all') {
            const matches = physicalInputs.some(i =>
              i.devicePrefix.toLowerCase().startsWith(filter) ||
              (filter === 'js' && i.devicePrefix.toLowerCase().startsWith('js'))
            );
            if (!matches) continue;
          }
          allActions.push({ mapName, action: { ...action, inputs: physicalInputs } });
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
    // Collect (actionName + ':' + input) already covered in obsolete_collision to avoid duplicate diagnostic noise
    const coveredDeprecatedInputs = new Set<string>();
    for (const c of report.conflicts) {
      if (c.conflictType === 'obsolete_collision' && c.deprecatedAction) {
        const acts = c.deprecatedAction.split(',').map(s => s.trim().toLowerCase());
        for (const act of acts) {
          coveredDeprecatedInputs.add(`${act}:${c.sharedInput.toLowerCase()}`);
        }
      }
    }

    const auditedDeprecatedInputs = new Set<string>();
    for (const item of allActions) {
      const dep = RedundancyEvaluator.isActionDeprecated(item.action.name);
      if (dep) {
        for (const input of item.action.inputs) {
          if (filter && filter !== 'all') {
            if (!input.devicePrefix.toLowerCase().startsWith(filter)) {
              continue;
            }
          }
          const inputKey = `${item.action.name.toLowerCase()}:${input.input.toLowerCase()}`;
          if (coveredDeprecatedInputs.has(inputKey) || auditedDeprecatedInputs.has(inputKey)) {
            continue;
          }
          auditedDeprecatedInputs.add(inputKey);

          report.conflicts.push({
            severity: ConflictSeverity.Redundant,
            conflictType: 'deprecated',
            sourceContext: item.mapName,
            sourceAction: item.action.name,
            targetContext: 'Current Game Version (SC 3.23+)',
            targetAction: 'Obsolete / Superseded',
            sharedInput: input.input,
            reason: `Obsolete Action (${dep.deprecatedSince}): ${dep.reason}`,
            recommendation: dep.replacement,
            deprecatedAction: item.action.name,
            rootCauseAction: item.action.name
          });
          report.redundantCount++;
        }
      }
    }

    // Sort hierarchy:
    // 1. Obsolete action collisions first (clear root-cause fixes)
    // 2. Fatal collisions
    // 3. Warnings
    // 4. Redundancies / Deprecated
    report.conflicts.sort((a, b) => {
      const aIsObsCol = a.conflictType === 'obsolete_collision';
      const bIsObsCol = b.conflictType === 'obsolete_collision';
      if (aIsObsCol && !bIsObsCol) return -1;
      if (!aIsObsCol && bIsObsCol) return 1;

      const rank = (s: ConflictSeverity) => {
        if (s === ConflictSeverity.Fatal) return 0;
        if (s === ConflictSeverity.Warning) return 1;
        return 2;
      };
      return rank(a.severity) - rank(b.severity);
    });

    return report;
  }

  /**
   * Determines whether an input descriptor is an unbound placeholder rather than a physical hardware binding.
   * Star Citizen writes '<rebind input="js1_ "/>' or '<rebind input="js1_"/>' or '' when an action is unbound
   * for a specific controller. These placeholders have no hardware key and can never physically conflict.
   */
  public static isUnboundPlaceholder(input?: BindingInput): boolean {
    if (!input || !input.input) return true;
    const trimmed = input.input.trim().toLowerCase();
    if (trimmed === '' || trimmed === 'none') return true;
    if (trimmed.endsWith('_')) return true; // e.g. 'js1_', 'js2_', 'kb1_'
    if (!input.hardwareKey || input.hardwareKey.trim() === '') return true;
    return false;
  }

  /**
   * Checks if two inputs share the exact physical hardware trigger (prefix + key + modifiers)
   */
  private static arePhysicalInputsEqual(a: BindingInput, b: BindingInput): boolean {
    // Unbound placeholders (e.g. 'js1_', 'js2_', '') can never conflict with anything
    if (this.isUnboundPlaceholder(a) || this.isUnboundPlaceholder(b)) {
      return false;
    }

    // If inputs are identical strings, they match immediately
    if (a.input && b.input && a.input.toLowerCase() === b.input.toLowerCase()) {
      return true;
    }

    const prefixA = a.devicePrefix || (a.input && a.input.includes('_') ? a.input.split('_')[0] : '');
    const prefixB = b.devicePrefix || (b.input && b.input.includes('_') ? b.input.split('_')[0] : '');
    if (prefixA.toLowerCase() !== prefixB.toLowerCase()) {
      return false;
    }

    const keyA = a.hardwareKey || (a.input && a.input.includes('_') ? a.input.split('_').slice(1).join('_') : a.input || '');
    const keyB = b.hardwareKey || (b.input && b.input.includes('_') ? b.input.split('_').slice(1).join('_') : b.input || '');
    if (keyA.toLowerCase() !== keyB.toLowerCase()) {
      return false;
    }

    // Check modifiers (e.g. lalt vs ralt vs none)
    const modsA = (a.modifiers || []).map(m => m.toLowerCase()).sort().join('+');
    const modsB = (b.modifiers || []).map(m => m.toLowerCase()).sort().join('+');

    return modsA === modsB;
  }
}
