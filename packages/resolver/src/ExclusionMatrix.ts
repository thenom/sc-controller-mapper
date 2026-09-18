import type { MasterFlightMode } from '@sc-mapping/shared-types';

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
    'spaceship_movement': 'spaceship',
    'spaceship_weapons': 'spaceship',
    'spaceship_target_locking': 'spaceship',
    'spaceship_general': 'spaceship',
    'spaceship_power': 'spaceship',
    'spaceship_view': 'spaceship',
    'spaceship_quantum': 'spaceship',
    'spaceship_radar': 'spaceship',
    'spaceship_hud': 'spaceship',
    'seat_pilot': 'spaceship',
    'seat_operator': 'spaceship',

    // On-Foot infantry domains
    'player_input_onfoot': 'onfoot',
    'player_choice': 'onfoot',
    'prone': 'onfoot',
    'zero_gravity_eva': 'eva',
    'eva': 'eva',

    // Ground vehicle domains
    'vehicle_driver': 'ground_vehicle',
    'vehicle_gunner': 'ground_vehicle',

    // Turret gunner domain
    'turret': 'turret',

    // Spectator domain
    'spectator': 'spectator'
  };

  /**
   * Mutually exclusive operational domains.
   * Actions in two different mutually exclusive domains cannot execute concurrently.
   */
  private static readonly INCOMPATIBLE_DOMAINS: ReadonlyArray<ReadonlySet<string>> = [
    // Spaceship vs On-Foot vs EVA vs Ground Vehicle vs Turret vs Spectator
    new Set(['spaceship', 'onfoot', 'eva', 'ground_vehicle', 'turret', 'spectator'])
  ];


  /**
   * Star Citizen 3.23+ Master Modes Action Registry
   * Maps specific actions to their operational flight mode (SCM vs NAV).
   */
  private static readonly ACTION_MASTER_MODES: Record<string, MasterFlightMode> = {
    // SCM Mode (Standard Control Model / Weapons active, shields up, speed capped)
    'v_attack1_group1': 'SCM',
    'v_attack1_group2': 'SCM',
    'v_target_lock_selected': 'SCM',
    'v_target_cycle_pinned': 'SCM',
    'v_missile_launch': 'SCM',
    'v_weapon_pip_type_toggle': 'SCM',

    // NAV Mode (Quantum spooling / High-speed flight / Guns & Shields offline)
    'v_quantum_spool': 'NAV',
    'v_quantum_travel': 'NAV',
    'v_nav_flight_mode_toggle': 'NAV',
    'v_nav_flt_speed_boost': 'NAV'
  };

  /**
   * Checks whether two actionmaps can ever be active simultaneously in the engine.
   * Returns false if the actionmaps belong to mutually exclusive domains.
   */
  public static areContextsConcurrent(mapA: string, mapB: string): boolean {
    const lowerA = mapA.toLowerCase();
    const lowerB = mapB.toLowerCase();

    // Inside the exact same actionmap, contexts are concurrent
    if (lowerA === lowerB) {
      return true;
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

  private static resolveDomain(mapName: string): string | undefined {
    if (this.DOMAIN_MAPPINGS[mapName]) {
      return this.DOMAIN_MAPPINGS[mapName];
    }
    // Prefix fallback heuristics:
    if (mapName.startsWith('spaceship_')) return 'spaceship';
    if (mapName.startsWith('player_')) return 'onfoot';
    if (mapName.startsWith('vehicle_')) return 'ground_vehicle';
    return undefined;
  }

  /**
   * Determines if two actions within concurrent flight contexts are separated by Master Modes (SCM vs NAV).
   * Returns true if they CAN run concurrently (i.e. potential conflict exists),
   * or false if they are conditionally isolated by active Master Mode.
   */
  public static areMasterModesConcurrent(actionA: string, actionB: string): boolean {
    const modeA = this.ACTION_MASTER_MODES[actionA] || 'ANY';
    const modeB = this.ACTION_MASTER_MODES[actionB] || 'ANY';

    // If one is explicitly SCM and the other is explicitly NAV, they are mutually exclusive!
    if ((modeA === 'SCM' && modeB === 'NAV') || (modeA === 'NAV' && modeB === 'SCM')) {
      return false; // Mode-isolated: safe to share physical binding without conflict
    }

    return true;
  }
}
