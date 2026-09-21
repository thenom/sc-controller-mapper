import {
  ActionBinding,
  BindingInput,
  ConflictSeverity
} from '@sc-mapping/shared-types';

export interface TemporalEvaluationResult {
  severity: ConflictSeverity;
  reason: string;
  recommendation?: string;
}

/**
 * Temporal State Machine Evaluator
 * Analyzes multiTap and activationMode attributes to differentiate between
 * fatal concurrent execution and intentional chording/latency penalties.
 */
export class TemporalEvaluator {
  /**
   * Set of known destructive or high-consequence actions where hold-vs-tap overlaps
   * create unacceptable risk of accidental death, ejection, or vehicle loss.
   */
  private static readonly DESTRUCTIVE_ACTIONS: ReadonlySet<string> = new Set([
    'v_eject',
    'v_self_destruct',
    'v_jettison_cargo',
    'v_power_toggle',
    'player_suicide'
  ]);

  /**
   * Evaluates the temporal dynamics of two binding inputs sharing the same physical key inside concurrent contexts.
   */
  public static evaluate(
    actionA: ActionBinding,
    inputA: BindingInput,
    actionB: ActionBinding,
    inputB: BindingInput
  ): TemporalEvaluationResult {
    const actModeA = inputA.activationMode || 'press';
    const actModeB = inputB.activationMode || 'press';
    const multiTapA = inputA.multiTap ?? 1;
    const multiTapB = inputB.multiTap ?? 1;

    // Rule B: multiTap="2" (double tap) vs. single tap (multiTap="1") = Warning (Latency buffer)
    // In Star Citizen / CryEngine, binding multiTap="2" alongside a single-tap action opens a ~250ms
    // tap buffer window. If a second tap registers within that window, the double-tap action fires.
    // The single-tap action fires only after the buffer window expires without a second tap.
    if ((multiTapA === 2 && multiTapB === 1) || (multiTapB === 2 && multiTapA === 1)) {
      return {
        severity: ConflictSeverity.Warning,
        reason: 'Input Latency Buffer (~250ms): Pairing multiTap="2" (double-tap) with a single-tap binding delays single-tap execution by ~250ms while the engine buffers for a potential second tap.',
        recommendation: 'Standard Star Citizen double-tap pattern (e.g. ATC Request on double-tap + Landing Gear on single-tap). Compatible, but avoid putting time-critical emergency reflex commands on the single-tap action.'
      };
    }

    // Direct Exact Collision: Same activationMode AND same multiTap count
    if (actModeA === actModeB && multiTapA === multiTapB) {
      return {
        severity: ConflictSeverity.Fatal,
        reason: `Direct Action Collision: Both '${actionA.name}' and '${actionB.name}' trigger simultaneously on ${actModeA} (tap: ${multiTapA}).`,
        recommendation: 'Rebind one of the actions to another key, add a modifier, or differentiate via hold vs press.'
      };
    }

    // Rule A: activationMode="double_tap" vs single tap = Warning (Latency penalty)
    // In CryEngine, a double_tap binding forces the input engine to buffer the first tap
    // for ~250ms to determine if a second tap occurs. The single tap action still fires,
    // but suffers an unavoidable response delay.
    if (
      (actModeA === 'double_tap' && actModeB === 'press') ||
      (actModeB === 'double_tap' && actModeA === 'press')
    ) {
      return {
        severity: ConflictSeverity.Warning,
        reason: 'Input Latency Penalty (~250ms): The engine delays single-tap execution to wait for a potential second tap window.',
        recommendation: 'Do not pair time-critical reflex actions (e.g., Countermeasures, Boost, Fire) on the single-tap when paired with double_tap.'
      };
    }

    // Rule C: activationMode="hold" vs single tap = Contextual Conflict (Destructive vs Non-destructive)
    // When a button mapped to both 'hold' and 'press' is pressed, the single-press action
    // triggers on key-down unless guarded by delayed_press. If the hold action is destructive,
    // or if the press action ruins flight stability, severe consequences occur.
    if (
      (actModeA === 'hold' && actModeB === 'press') ||
      (actModeB === 'hold' && actModeA === 'press')
    ) {
      const isDestructive =
        this.DESTRUCTIVE_ACTIONS.has(actionA.name) ||
        this.DESTRUCTIVE_ACTIONS.has(actionB.name);

      if (isDestructive) {
        return {
          severity: ConflictSeverity.Fatal,
          reason: 'Destructive Action Safety Conflict: A lethal or destructive command (e.g. Eject, Self-Destruct) shares an input with a single-tap action.',
          recommendation: 'Move the destructive action to a dedicated modifier chord (e.g. RAlt+Backspace).'
        };
      }

      return {
        severity: ConflictSeverity.Warning,
        reason: 'Contextual Activation Conflict: Pressing and holding will trigger the single-press action on button down before the hold threshold is reached.',
        recommendation: 'Set the tap action to activationMode="delayed_press" or separate to dedicated controls.'
      };
    }

    // If different activation modes that do not interfere
    return {
      severity: ConflictSeverity.None,
      reason: 'Compatible temporal activation modes.'
    };
  }
}
