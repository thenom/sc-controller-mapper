import {
  ActionBinding,
  BindingInput,
  ConflictSeverity
} from '@sc-mapping/shared-types';
import { CatalogManager } from '@sc-mapping/parser';

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
   * Resolves the effective activation mode for an action.
   * Checks the user's custom input first, then queries the game-extracted
   * action catalog (defaultProfile.xml) via CatalogManager, before falling back
   * to textual/naming cues or engine defaults ('press').
   */
  public static resolveEffectiveActivationMode(action: ActionBinding, input: BindingInput): string {
    if (input.activationMode) {
      return input.activationMode.toLowerCase();
    }

    const name = action.name.toLowerCase();

    // 1. Dynamic lookup from master catalog extracted from Star Citizen defaultProfile.xml
    const catalogMode = CatalogManager.getDefaultActivationMode(name);
    if (catalogMode) {
      return catalogMode.toLowerCase();
    }

    const label = (action.label || '').toLowerCase();
    const desc = (action.description || '').toLowerCase();

    // 2. Textual indication of hold in label or description (e.g. "Engage Quantum Drive (Hold)")
    if (
      label.includes('(hold)') ||
      desc.includes('(hold)') ||
      label.includes('long press') ||
      desc.includes('long press')
    ) {
      return 'delayed_press';
    }

    // 3. Programmatic naming suffix conventions
    if (name.endsWith('_hold') || name.endsWith('_long') || name.endsWith('_delayed')) {
      return 'delayed_press';
    }

    // 4. Inherent tap actions
    if (name.endsWith('_tap')) {
      return 'tap';
    }

    return 'press';
  }

  /**
   * Resolves the effective multiTap count for an action.
   * If not explicitly specified on the input, queries the game catalog default.
   */
  public static resolveEffectiveMultiTap(action: ActionBinding, input: BindingInput): number {
    if (input.multiTap != null) {
      return input.multiTap;
    }
    const catalogMultiTap = CatalogManager.getDefaultMultiTap(action.name);
    if (catalogMultiTap != null) {
      return catalogMultiTap;
    }
    return 1;
  }

  private static isHoldMode(mode: string): boolean {
    const m = mode.toLowerCase();
    return m === 'hold' || m.startsWith('delayed_') || m.includes('hold');
  }

  private static isTapMode(mode: string): boolean {
    const m = mode.toLowerCase();
    return m === 'tap' || m === 'tap_quicker';
  }

  /**
   * Evaluates the temporal dynamics of two binding inputs sharing the same physical key inside concurrent contexts.
   */
  public static evaluate(
    actionA: ActionBinding,
    inputA: BindingInput,
    actionB: ActionBinding,
    inputB: BindingInput
  ): TemporalEvaluationResult {
    const actModeA = this.resolveEffectiveActivationMode(actionA, inputA);
    const actModeB = this.resolveEffectiveActivationMode(actionB, inputB);
    const multiTapA = this.resolveEffectiveMultiTap(actionA, inputA);
    const multiTapB = this.resolveEffectiveMultiTap(actionB, inputB);

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

    // Rule C: hold / delayed_press vs tap / press
    const isHoldA = this.isHoldMode(actModeA);
    const isHoldB = this.isHoldMode(actModeB);
    const isTapA = this.isTapMode(actModeA);
    const isTapB = this.isTapMode(actModeB);
    const isPressA = actModeA === 'press';
    const isPressB = actModeB === 'press';

    if ((isHoldA && (isTapB || isPressB)) || (isHoldB && (isTapA || isPressA))) {
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

      // If one action is a clean 'tap' (fires on release) and the other is 'delayed_press' / 'hold',
      // or if either mode is delayed (e.g. delayed_press threshold of ~250ms like v_toggle_qdrive_engagement),
      // Star Citizen cleanly multiplexes tap vs hold without executing the hold on tap:
      const hasTap = isTapA || isTapB;
      const hasDelayed = actModeA.includes('delayed') || actModeB.includes('delayed');

      if (hasTap || hasDelayed) {
        return {
          severity: ConflictSeverity.None,
          reason: `Compatible Tap vs. Hold combination: '${isHoldA ? actionB.name : actionA.name}' triggers on quick tap, while '${isHoldA ? actionA.name : actionB.name}' requires a sustained hold.`
        };
      }

      // Immediate button-down press vs generic hold (potential bleed-through on initial down)
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
