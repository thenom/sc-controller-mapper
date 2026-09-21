/**
 * Redundancy and Version Deprecation Evaluator for Star Citizen
 *
 * Identifies:
 * 1. Subsumed Action Redundancy (Rule R1): When two actions share an input trigger,
 *    but one command functionally subsumes the other (e.g. v_flightready + v_power_set_on).
 * 2. Version Deprecation (Rule R2): Bindings for flight/combat mechanics from older game versions
 *    that were removed, renamed, or superseded in Star Citizen 3.23+ / 4.x Master Modes.
 */

export interface SubsumedEvaluationResult {
  isRedundant: boolean;
  masterAction?: string;
  subsumedAction?: string;
  reason?: string;
  recommendation?: string;
}

export interface DeprecationInfo {
  actionName: string;
  reason: string;
  replacement: string;
  deprecatedSince: string;
}

export class RedundancyEvaluator {
  /**
   * Subsumed action relationships:
   * Key: Master action that performs a comprehensive operation.
   * Value: Set of child actions whose function is already executed by the master action.
   */
  private static readonly SUBSUMED_ACTIONS_MAP: Record<string, ReadonlySet<string>> = {
    // Flight Ready initializes main ship power, engines, and shields
    'v_flightready': new Set([
      'v_power_set_on',
      'v_power_toggle',
      'v_engines_power_set_on',
      'v_shields_power_set_on',
      'v_power_set_shields_on',
      'v_power_set_thrusters_on',
      'v_power_set_weapons_on'
    ]),

    // Opening doors inherently unlocks them
    'v_open_all_doors': new Set([
      'v_unlock_all_doors'
    ]),

    // Closing doors paired with locking
    'v_close_all_doors': new Set([
      'v_lock_all_doors'
    ]),

    // In Star Citizen 3.23+ Master Modes, entering NAV mode automatically spools quantum
    'v_nav_flight_mode_toggle': new Set([
      'v_quantum_spool'
    ])
  };

  /**
   * Registry of actions deprecated, removed, or superseded in Star Citizen 3.23+ / 4.x
   */
  private static readonly DEPRECATED_ACTIONS: Record<string, Omit<DeprecationInfo, 'actionName'>> = {
    'v_ifcs_toggle_cruise_control': {
      reason: 'Cruise control was removed in Star Citizen 3.23 (Master Modes). Throttle management is now integrated with SCM/NAV flight scaling.',
      replacement: 'Reclaim this button for Speed Limiter, Boost, or Countermeasures.',
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_cruise_control': {
      reason: 'Legacy cruise control was removed in Star Citizen 3.23 (Master Modes).',
      replacement: 'Clear binding or rebind to Speed Limiter.',
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_ifcs_speed_limiter_reset_scm': {
      reason: 'SCM speed limiter reset was superseded by Master Modes automatic flight velocity scaling.',
      replacement: 'Use Boost or NAV mode transition to manage top speed.',
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_toggle_quantum_mode': {
      reason: 'Legacy quantum mode toggle was superseded by Master Modes NAV mode toggle (v_nav_flight_mode_toggle).',
      replacement: "Rebind to 'v_nav_flight_mode_toggle' (Master Modes SCM/NAV switch).",
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_toggle_qdrive_engagement': {
      reason: 'Superseded by Master Modes quantum travel engage (v_quantum_travel / spooling in NAV mode).',
      replacement: "Rebind to 'v_quantum_travel' or use primary trigger in NAV mode.",
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_weapon_pip_toggle_lead_lag': {
      reason: 'Target PIP lead/lag toggle is now controlled via Game Options / MFD HUD settings in modern builds.',
      replacement: 'Clear binding to free this button, or rebind to target cycling.',
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_weapon_pip_set_lead': {
      reason: 'PIP lead mode selection moved to Game Options / MFD settings in modern builds.',
      replacement: 'Configure preferred PIP mode in Game Options.',
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_weapon_pip_set_lag': {
      reason: 'PIP lag mode selection moved to Game Options / MFD settings in modern builds.',
      replacement: 'Configure preferred PIP mode in Game Options.',
      deprecatedSince: 'Alpha 3.23.0'
    },
    'v_strafe_longitudinal_abs_rel': {
      reason: 'Legacy longitudinal strafe mode toggle was consolidated into standard IFCS controls.',
      replacement: 'Bind directly to throttle or strafe forward/backward axes.',
      deprecatedSince: 'Alpha 3.20.0'
    }
  };

  /**
   * Evaluates if two actions sharing a trigger are subsumed (one action functionally contains the other).
   */
  public static checkSubsumedPair(actionA: string, actionB: string): SubsumedEvaluationResult {
    const actA = actionA.toLowerCase();
    const actB = actionB.toLowerCase();

    // Check if A subsumes B
    if (this.SUBSUMED_ACTIONS_MAP[actA]?.has(actB)) {
      return {
        isRedundant: true,
        masterAction: actionA,
        subsumedAction: actionB,
        reason: `Subsumed Action Redundancy: '${actionA}' already executes the functionality of '${actionB}'. Both trigger on the same button, making '${actionB}' redundant.`,
        recommendation: `Remove the binding for '${actionB}'; '${actionA}' already handles this system.`
      };
    }

    // Check if B subsumes A
    if (this.SUBSUMED_ACTIONS_MAP[actB]?.has(actA)) {
      return {
        isRedundant: true,
        masterAction: actionB,
        subsumedAction: actionA,
        reason: `Subsumed Action Redundancy: '${actionB}' already executes the functionality of '${actionA}'. Both trigger on the same button, making '${actionA}' redundant.`,
        recommendation: `Remove the binding for '${actionA}'; '${actionB}' already handles this system.`
      };
    }

    return { isRedundant: false };
  }

  /**
   * Checks if an action is deprecated, obsolete, or superseded in current Star Citizen (3.23+ / 4.x).
   */
  public static isActionDeprecated(actionName: string): DeprecationInfo | null {
    const act = actionName.toLowerCase();
    const info = this.DEPRECATED_ACTIONS[act];
    if (!info) return null;

    return {
      actionName,
      reason: info.reason,
      replacement: info.replacement,
      deprecatedSince: info.deprecatedSince
    };
  }

  /**
   * Returns all registered deprecated actions and their deprecation metadata.
   */
  public static getDeprecatedActions(): Record<string, Omit<DeprecationInfo, 'actionName'>> {
    return { ...this.DEPRECATED_ACTIONS };
  }
}
