import { describe, it, expect } from 'vitest';
import { ExclusionMatrix } from '../ExclusionMatrix';

describe('ExclusionMatrix', () => {
  describe('areContextsConcurrent', () => {
    it('returns true for identical action maps', () => {
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_movement', 'spaceship_movement')).toBe(true);
    });

    it('returns false for mutually exclusive cockpit operator modes', () => {
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_weapons', 'spaceship_missiles')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_mining', 'spaceship_salvage')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_scanning', 'spaceship_weapons')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('ship_scanning', 'spaceship_missiles')).toBe(false);
    });

    it('returns false when specialized operator mode is paired with targeting', () => {
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_mining', 'spaceship_targeting')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_targeting_advanced', 'spaceship_salvage')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_missiles', 'spaceship_targeting')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_targeting', 'spaceship_scanning')).toBe(false);
    });

    it('returns false for incompatible operational domains', () => {
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_movement', 'player_input_onfoot')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('spaceship_movement', 'vehicle_driver')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('player_input_onfoot', 'zero_gravity_eva')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('turret', 'spaceship_movement')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('vehicle_mobiglas', 'spaceship_movement')).toBe(false);
    });

    it('resolves fallback domain prefixes correctly', () => {
      expect(ExclusionMatrix.areContextsConcurrent('player_custom_map', 'spaceship_custom_sub')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('vehicle_custom_map', 'zero_gravity_custom_eva')).toBe(false);
      expect(ExclusionMatrix.areContextsConcurrent('turret_custom', 'player_custom')).toBe(false);
    });

    it('returns true for ambient maps overlapping with active modes or unknown domains', () => {
      expect(ExclusionMatrix.areContextsConcurrent('seat_general', 'spaceship_movement')).toBe(true);
      expect(ExclusionMatrix.areContextsConcurrent('unknown_map_1', 'unknown_map_2')).toBe(true);
    });
  });

  describe('areActionsMutuallyExclusive', () => {
    it('recognizes mutually exclusive vehicle role toggles', () => {
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_general',
          'v_toggle_mining_mode',
          'spaceship_general',
          'v_toggle_salvage_mode'
        )
      ).toBe(true);
    });

    it('recognizes UI lifecycle action exclusivity', () => {
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive('default', 'ready', 'default', 'respawn')
      ).toBe(true);
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive('ui_screen', 'retry', 'ui_screen', 'ready')
      ).toBe(true);
    });

    it('recognizes sequential Master Mode and Quantum Drive sequencing', () => {
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_quantum',
          'v_master_mode_cycle',
          'spaceship_quantum',
          'v_toggle_qdrive_engagement'
        )
      ).toBe(true);
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_quantum',
          'v_toggle_qdrive_engagement',
          'spaceship_quantum',
          'v_master_mode_set_nav'
        )
      ).toBe(true);
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_quantum',
          'v_toggle_quantum_mode',
          'spaceship_quantum',
          'v_toggle_qdrive_engagement'
        )
      ).toBe(true);
    });

    it('recognizes missile mode entry toggle vs actions in other operator modes', () => {
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_missiles',
          'v_toggle_missile_mode',
          'spaceship_mining',
          'v_mining_laser_toggle'
        )
      ).toBe(true);
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_salvage',
          'v_salvage_beam_toggle',
          'spaceship_missiles',
          'v_toggle_missile_mode'
        )
      ).toBe(true);
    });

    it('recognizes missile mode toggle vs bombing impact point hold action', () => {
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_missiles',
          'v_toggle_missile_mode',
          'spaceship_missiles',
          'v_weapon_bombing_toggle_desired_impact_point_hold'
        )
      ).toBe(true);
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_missiles',
          'v_weapon_bombing_toggle_desired_impact_point_hold',
          'spaceship_missiles',
          'v_toggle_missile_mode'
        )
      ).toBe(true);
    });

    it('returns false for unrelated actions', () => {
      expect(
        ExclusionMatrix.areActionsMutuallyExclusive(
          'spaceship_movement',
          'v_pitch',
          'spaceship_movement',
          'v_yaw'
        )
      ).toBe(false);
    });
  });

  describe('areMasterModesConcurrent', () => {
    it('identifies SCM vs NAV isolation', () => {
      expect(ExclusionMatrix.areMasterModesConcurrent('v_attack_all', 'v_toggle_quantum_mode')).toBe(false);
      expect(ExclusionMatrix.areMasterModesConcurrent('v_toggle_qdrive_engagement', 'v_missile_fire')).toBe(false);
    });

    it('identifies concurrent actions within same Master Mode', () => {
      expect(ExclusionMatrix.areMasterModesConcurrent('v_attack_all', 'v_attack_group1')).toBe(true);
      expect(ExclusionMatrix.areMasterModesConcurrent('v_toggle_quantum_mode', 'v_master_mode_set_nav')).toBe(true);
    });

    it('identifies ANY mode compatibility with SCM or NAV', () => {
      expect(ExclusionMatrix.areMasterModesConcurrent('v_pitch', 'v_attack_all')).toBe(true);
      expect(ExclusionMatrix.areMasterModesConcurrent('v_pitch', 'v_toggle_quantum_mode')).toBe(true);
    });
  });
});
