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

/**
 * Intelligent Conflict Detection Engine for Star Citizen
 * Evaluates contextual mutual exclusivity, Master Flight Modes (SCM vs NAV),
 * and temporal activation mechanics (press, hold, double_tap, multiTap).
 */
export class ConflictResolver {
  /**
   * Evaluates two action bindings and returns a conflict severity score (0 = None, 1 = Warning, 2 = Fatal)
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
          const temporal = TemporalEvaluator.evaluate(actionA, inputA, actionB, inputB);

          if (temporal.severity > highestConflict.severity) {
            highestConflict = {
              severity: temporal.severity,
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
   * 0 = None, 1 = Warning, 2 = Fatal
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
   */
  public static auditDocument(doc: ActionMapsDocument): ConflictReport {
    const report: ConflictReport = {
      hasFatalConflicts: false,
      warningCount: 0,
      fatalCount: 0,
      conflicts: []
    };

    // Flatten all actions into a comparable list
    const allActions: Array<{ mapName: string; action: ActionBinding }> = [];
    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      for (const action of Object.values(group.actions)) {
        if (action.inputs && action.inputs.length > 0) {
          allActions.push({ mapName, action });
        }
      }
    }

    // Pairwise evaluation avoiding duplicate permutations
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
          report.conflicts.push(details);
          if (details.severity === ConflictSeverity.Fatal) {
            report.fatalCount++;
            report.hasFatalConflicts = true;
          } else if (details.severity === ConflictSeverity.Warning) {
            report.warningCount++;
          }
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
