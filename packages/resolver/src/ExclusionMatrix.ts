import type { MasterFlightMode } from '@sc-mapping/shared-types';
import { CatalogManager } from '@sc-mapping/parser';

/**
 * Operational Context Matrix
 * Enforces mutual exclusivity across game states and Star Citizen 3.23+ Master Modes (SCM vs NAV).
 */
export class ExclusionMatrix {
  /**
   * Domain classifications for Star Citizen action maps
   */
  private static readonly DOMAIN_MAPPINGS: Record<string, string> = {
    // Spaceship / Cockpit flight domains
    'seat_general': 'spaceship',
    'seat_pilot': 'spaceship',
    'seat_operator': 'spaceship',
    'spaceship_general': 'spaceship',
    'spaceship_view': 'spaceship',
    'spaceship_movement': 'spaceship',
    'spaceship_quantum': 'spaceship',
    'spaceship_docking': 'spaceship',
    'spaceship_targeting': 'spaceship',
    'spaceship_targeting_advanced': 'spaceship',
    'spaceship_target_hailing': 'spaceship',
    'spaceship_radar': 'spaceship',
    'spaceship_scanning': 'spaceship',
    'ship_scanning': 'spaceship',
    'spaceship_mining': 'spaceship',
    'spaceship_salvage': 'spaceship',
    'spaceship_weapons': 'spaceship',
    'spaceship_missiles': 'spaceship',
    'spaceship_defensive': 'spaceship',
    'spaceship_auto_weapons': 'spaceship',
    'spaceship_power': 'spaceship',
    'spaceship_hud': 'spaceship',
    'ifcs_controls': 'spaceship',
    'lights_controller': 'spaceship',
    'vehicle_mfd': 'spaceship',

    // On-Foot infantry domains
    'player': 'onfoot',
    'player_input_onfoot': 'onfoot',
    'player_choice': 'onfoot',
    'player_emotes': 'onfoot',
    'player_input_optical_tracking': 'onfoot',
    'prone': 'onfoot',
    'tractor_beam': 'onfoot',
    'mining': 'onfoot',
    'incapacitated': 'onfoot',
    'stopwatch': 'onfoot',

    // Zero-G / EVA domains
    'zero_gravity_eva': 'eva',
    'zero_gravity_traversal': 'eva',
    'eva': 'eva',

    // Ground vehicle domains
    'vehicle_general': 'ground_vehicle',
    'vehicle_driver': 'ground_vehicle',
    'vehicle_gunner': 'ground_vehicle',
    'ground_vehicle': 'ground_vehicle',
    'ground_vehicle_movement': 'ground_vehicle',

    // Turret gunner domain
    'turret': 'turret',
    'turret_movement': 'turret',
    'turret_advanced': 'turret',

    // Screen / UI / Menu domains (independent UI layers)
    'vehicle_mobiglas': 'screen_ui',
    'mapui': 'screen_ui',
    'hacking': 'screen_ui',
    'ui_textfield': 'screen_ui',
    'ui_notification': 'screen_ui',
    'character_customizer': 'menu',

    // Spectator & Camera director domains
    'spectator': 'spectator',
    'flycam': 'camera_mode',
    'view_director_mode': 'camera_mode',

    // Internal / Debugging domains
    'default': 'internal_debug',
    'debug': 'internal_debug',
    'server_renderer': 'internal_debug',
    'remoterigidentitycontroller': 'internal_debug'
  };

  /**
   * Mutually exclusive operational domains.
   * Actions in two different mutually exclusive domains cannot execute concurrently.
   */
  private static readonly INCOMPATIBLE_DOMAINS: ReadonlyArray<ReadonlySet<string>> = [
    new Set([
      'spaceship',
      'onfoot',
      'eva',
      'ground_vehicle',
      'turret',
      'screen_ui',
      'menu',
      'spectator',
      'camera_mode',
      'internal_debug'
    ])
  ];


  /**
   * Star Citizen Cockpit Operator Modes.
   * Inside a spaceship, these operator modes are mutually exclusive stances.
   * E.g. while in Mining mode, Weapons, Missiles, Salvage, and Scanning are inactive.
   */
  private static readonly OPERATOR_MODES: ReadonlySet<string> = new Set([
    'spaceship_weapons',
    'spaceship_missiles',
    'spaceship_mining',
    'spaceship_salvage',
    'spaceship_scanning',
    'ship_scanning'
  ]);

  /**
   * Mutually exclusive action pairs across vehicle roles, state machines, or UI lifecycles.
   */
  private static readonly MUTUALLY_EXCLUSIVE_ROLE_TOGGLES: ReadonlySet<string> = new Set([
    'v_toggle_mining_mode',
    'v_toggle_salvage_mode'
  ]);

  private static readonly UI_LIFECYCLE_ACTIONS: ReadonlySet<string> = new Set([
    'ready',
    'respawn',
    'retry',
    'flashui_return',
    'ui_hide_hint'
  ]);

  /**
   * Star Citizen 3.23+ Master Modes Action Registry
   * Maps specific actions to their operational flight mode (SCM vs NAV).
   */
  private static readonly ACTION_MASTER_MODES: Record<string, MasterFlightMode> = {
    // SCM Mode (Standard Control Model / Weapons active, shields up, speed capped)
    'v_attack_all': 'SCM',
    'v_attack_group1': 'SCM',
    'v_attack_group2': 'SCM',
    'v_attack1_group1': 'SCM',
    'v_attack1_group2': 'SCM',
    'v_target_lock_selected': 'SCM',
    'v_target_cycle_pinned_all': 'SCM',
    'v_target_cycle_pinned': 'SCM',
    'v_missile_fire': 'SCM',
    'v_missile_launch': 'SCM',
    'v_toggle_missile_mode': 'SCM',
    'v_weapon_pip_toggle_lead_lag': 'SCM',
    'v_weapon_pip_type_toggle': 'SCM',

    // NAV Mode (Quantum spooling / High-speed flight / Guns & Shields offline)
    'v_toggle_quantum_mode': 'NAV',
    'v_toggle_qdrive_engagement': 'NAV',
    'v_master_mode_set_nav': 'NAV',
    'v_master_mode_cycle_long': 'NAV',
    'v_nav_flt_speed_boost': 'NAV'
  };

  /**
   * Checks whether two actionmaps can ever be active simultaneously in the engine.
   * Returns false if the actionmaps belong to mutually exclusive domains or operator modes.
   */
  public static areContextsConcurrent(mapA: string, mapB: string): boolean {
    const lowerA = mapA.toLowerCase();
    const lowerB = mapB.toLowerCase();

    // Inside the exact same actionmap, contexts are concurrent
    if (lowerA === lowerB) {
      return true;
    }

    // 1. Check Operator Mode mutual exclusivity:
    // spaceship_weapons, spaceship_missiles, spaceship_mining, spaceship_salvage, spaceship_scanning, ship_scanning
    // are mutually exclusive cockpit operator stances.
    if (this.OPERATOR_MODES.has(lowerA) && this.OPERATOR_MODES.has(lowerB)) {
      return false; // Mutually exclusive Operator Modes!
    }

    // 2. Check Dedicated Operator Modes (Mining, Salvage, Missiles, Scanning) vs Combat Sub-targeting:
    // When in Mining, Salvage, Missile, or Scanning operator modes, specialized operator
    // sub-controls (scan focus/angle, consumables, beam modifiers, missile cycling) supersede combat targeting
    const isTargetingA = lowerA === 'spaceship_targeting_advanced' || lowerA === 'spaceship_targeting';
    const isTargetingB = lowerB === 'spaceship_targeting_advanced' || lowerB === 'spaceship_targeting';
    const isOperatorA =
      lowerA === 'spaceship_mining' ||
      lowerA === 'spaceship_salvage' ||
      lowerA === 'spaceship_missiles' ||
      lowerA === 'spaceship_scanning' ||
      lowerA === 'ship_scanning';
    const isOperatorB =
      lowerB === 'spaceship_mining' ||
      lowerB === 'spaceship_salvage' ||
      lowerB === 'spaceship_missiles' ||
      lowerB === 'spaceship_scanning' ||
      lowerB === 'ship_scanning';

    if ((isTargetingA && isOperatorB) || (isTargetingB && isOperatorA)) {
      return false;
    }

    const domainA = this.resolveDomain(lowerA);
    const domainB = this.resolveDomain(lowerB);

    // If both belong to distinct, known domains, check incompatibility
    if (domainA && domainB && domainA !== domainB) {
      for (const set of this.INCOMPATIBLE_DOMAINS) {
        if (set.has(domainA) && set.has(domainB)) {
          return false; // Mutually exclusive domain: NO CONFLICT possible
        }
      }
    }

    // Global ambient actionmaps (e.g. 'seat_general', 'view') overlap with active modes
    return true;
  }

  /**
   * Checks whether two specific actions are mutually exclusive by vehicle specialization,
   * state machine sequencing (e.g. quantum spool vs engage), or UI screen lifecycle.
   */
  public static areActionsMutuallyExclusive(
    mapA: string,
    actionA: string,
    mapB: string,
    actionB: string
  ): boolean {
    const actA = actionA.toLowerCase();
    const actB = actionB.toLowerCase();
    const mA = mapA.toLowerCase();
    const mB = mapB.toLowerCase();

    // 1. Vehicle specialization mode toggles (Mining vs Salvage)
    if (this.MUTUALLY_EXCLUSIVE_ROLE_TOGGLES.has(actA) && this.MUTUALLY_EXCLUSIVE_ROLE_TOGGLES.has(actB)) {
      return true;
    }

    // 2. UI screen lifecycle states in 'default' or screen UI (e.g. Arena Commander ready vs respawn vs retry)
    if ((mA === 'default' && mB === 'default') || (mA.includes('ui') && mB.includes('ui'))) {
      if (this.UI_LIFECYCLE_ACTIONS.has(actA) && this.UI_LIFECYCLE_ACTIONS.has(actB)) {
        return true;
      }
    }

    // 3. Sequential quantum travel & Master Mode state machine: mode cycling vs engaging quantum drive
    // In Star Citizen, cycling/setting Master Modes or NAV sub-modes ('v_master_mode_cycle',
    // 'v_master_mode_cycle_long', 'v_master_mode_set_nav', 'v_toggle_quantum_mode') and engaging
    // the quantum drive ('v_toggle_qdrive_engagement') are sequentially gated. Drive engagement
    // can only occur after entering NAV mode and completing spooling/calibration.
    const isMasterModeAction = (act: string) =>
      act === 'v_master_mode_cycle' ||
      act === 'v_master_mode_cycle_long' ||
      act === 'v_master_mode_set_nav' ||
      act === 'v_toggle_quantum_mode';

    if (
      (isMasterModeAction(actA) && actB === 'v_toggle_qdrive_engagement') ||
      (isMasterModeAction(actB) && actA === 'v_toggle_qdrive_engagement')
    ) {
      return true;
    }

    // 4. Operator mode entry toggle vs actions inside other operator modes
    // (e.g. entering missile mode vs toggling mining laser type)
    if (
      (actA === 'v_toggle_missile_mode' && (mB === 'spaceship_mining' || mB === 'spaceship_salvage')) ||
      (actB === 'v_toggle_missile_mode' && (mA === 'spaceship_mining' || mA === 'spaceship_salvage'))
    ) {
      return true;
    }

    // 5. Operator mode toggle vs hold action inside the same operator mode
    // (e.g. tapping to toggle missile mode vs holding for bombing impact point)
    if (
      (actA === 'v_toggle_missile_mode' && actB === 'v_weapon_bombing_toggle_desired_impact_point_hold') ||
      (actB === 'v_toggle_missile_mode' && actA === 'v_weapon_bombing_toggle_desired_impact_point_hold')
    ) {
      return true;
    }

    return false;
  }

  private static resolveDomain(mapName: string): string | undefined {
    const lower = mapName.toLowerCase();
    if (this.DOMAIN_MAPPINGS[lower]) {
      return this.DOMAIN_MAPPINGS[lower];
    }
    // Prefix fallback heuristics:
    if (lower === 'player' || lower.startsWith('player_')) return 'onfoot';
    if (lower.startsWith('spaceship_') || lower.startsWith('seat_')) return 'spaceship';
    if (lower.startsWith('vehicle_')) return 'ground_vehicle';
    if (lower.startsWith('turret')) return 'turret';
    if (lower.startsWith('zero_gravity_')) return 'eva';
    return undefined;
  }

  /**
   * Determines if two actions within concurrent flight contexts are separated by Master Modes (SCM vs NAV).
   * Returns true if they CAN run concurrently (i.e. potential conflict exists),
   * or false if they are conditionally isolated by active Master Mode.
   */
  public static areMasterModesConcurrent(actionA: string, actionB: string): boolean {
    const modeA = CatalogManager.getMasterFlightMode(actionA) || this.ACTION_MASTER_MODES[actionA] || 'ANY';
    const modeB = CatalogManager.getMasterFlightMode(actionB) || this.ACTION_MASTER_MODES[actionB] || 'ANY';

    // If one is explicitly SCM and the other is explicitly NAV, they are mutually exclusive!
    if ((modeA === 'SCM' && modeB === 'NAV') || (modeA === 'NAV' && modeB === 'SCM')) {
      return false; // Mode-isolated: safe to share physical binding without conflict
    }

    return true;
  }
}
