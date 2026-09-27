import { describe, it, expect, beforeEach } from 'vitest';
import { LocalizationMerger } from '../LocalizationMerger';
import type { ActionMapsDocument } from '@sc-mapping/shared-types';

describe('LocalizationMerger', () => {
  let merger: LocalizationMerger;

  beforeEach(() => {
    merger = new LocalizationMerger();
  });

  describe('Constructor and loadIni', () => {
    it('initializes with raw INI content in constructor', () => {
      const rawIni = `
# Global Localization File
; Another comment format
ui_spaceship_movement=Flight Movement
@ui_v_pitch=Pitch Up / Down
ui_ci_v_yaw=Yaw Left / Right
      `;
      const instance = new LocalizationMerger(rawIni);
      const meta = instance.resolveActionMetadata('v_pitch', 'spaceship_movement');
      expect(meta.label).toBe('Pitch Up / Down');
    });

    it('handles blank lines, comments (# and ;), and whitespace lines', () => {
      const ini = `
# Header Comment
; Semicolon comment


key1=Value 1
  # Inline styled comment line
key2 = Value 2
@key3=Value 3
invalid_line_without_equal
`;
      merger.loadIni(ini);
      expect(merger.resolveActionMetadata('key1', 'map').label).toBe('Value 1');
      expect(merger.resolveActionMetadata('key2', 'map').label).toBe('Value 2');
      expect(merger.resolveActionMetadata('key3', 'map').label).toBe('Value 3');
    });

    it('strips leading @ symbol from keys and converts keys to lowercase', () => {
      merger.loadIni('@UI_V_FIRE=Fire Primary Weapons\n@ui_v_eject=Emergency Eject');
      expect(merger.resolveActionMetadata('v_fire', 'spaceship_weapons').label).toBe('Fire Primary Weapons');
      expect(merger.resolveActionMetadata('v_eject', 'spaceship_general').label).toBe('Emergency Eject');
    });
  });

  describe('loadDictionary', () => {
    it('loads pre-parsed dictionary objects with and without @ prefixes', () => {
      merger.loadDictionary({
        '@ui_v_boost': 'Engine Afterburner',
        'ui_v_spacebreak': 'Space Brake',
        'UI_SPACESHIP_MINING': 'Mining Operations'
      });

      expect(merger.resolveActionMetadata('v_boost', 'spaceship_movement').label).toBe('Engine Afterburner');
      expect(merger.resolveActionMetadata('v_spacebreak', 'spaceship_movement').label).toBe('Space Brake');
      expect(merger.formatMapCategory('spaceship_mining')).toBe('Mining Operations');
    });
  });

  describe('resolveActionMetadata Heuristics', () => {
    beforeEach(() => {
      merger.loadDictionary({
        'ui_v_pitch': 'Pitch Axis',
        'ui_ci_v_throttle': 'Throttle Axis (CI Spec)',
        'ui_vehicle_driver_v_horn': 'Honk Horn (Contextual)',
        'v_direct_match': 'Direct Token Match'
      });
    });

    it('prioritizes direct ui_ prefix match (heuristic 1)', () => {
      const meta = merger.resolveActionMetadata('v_pitch', 'spaceship_movement');
      expect(meta.label).toBe('Pitch Axis');
      expect(meta.description).toBe('Internal: v_pitch (spaceship_movement)');
      expect(meta.category).toBe('Spaceship Movement');
    });

    it('falls back to ui_ci_ prefix match (heuristic 2)', () => {
      const meta = merger.resolveActionMetadata('v_throttle', 'spaceship_movement');
      expect(meta.label).toBe('Throttle Axis (CI Spec)');
    });

    it('falls back to contextual ui_{mapName}_{actionName} (heuristic 3)', () => {
      const meta = merger.resolveActionMetadata('v_horn', 'vehicle_driver');
      expect(meta.label).toBe('Honk Horn (Contextual)');
    });

    it('falls back to raw exact key match (heuristic 4)', () => {
      const meta = merger.resolveActionMetadata('v_direct_match', 'general');
      expect(meta.label).toBe('Direct Token Match');
    });

    it('falls back to humanizeActionName when no dictionary entry matches', () => {
      const meta = merger.resolveActionMetadata('v_roll_axis_inverted', 'flight_controls');
      expect(meta.label).toBe('Roll Axis Inverted');
      expect(meta.description).toBe('Internal: v_roll_axis_inverted (flight_controls)');
      expect(meta.category).toBe('Flight Controls');
    });
  });

  describe('humanizeActionName and formatMapCategory', () => {
    it('humanizes snake_case action names removing leading v_', () => {
      expect(merger.humanizeActionName('v_attack1_group1')).toBe('Attack1 Group1');
      expect(merger.humanizeActionName('v_strafe_vertical')).toBe('Strafe Vertical');
      expect(merger.humanizeActionName('player_prone_toggle')).toBe('Player Prone Toggle');
    });

    it('formats map categories from dictionary if available', () => {
      merger.loadDictionary({
        'ui_spaceship_weapons': 'Ship Weapons & Ordnance'
      });
      expect(merger.formatMapCategory('spaceship_weapons')).toBe('Ship Weapons & Ordnance');
    });

    it('formats map categories from name when no dictionary entry exists', () => {
      expect(merger.formatMapCategory('ground_vehicle_movement')).toBe('Ground Vehicle Movement');
    });
  });

  describe('enrichDocument', () => {
    it('enriches an entire ActionMapsDocument in place', () => {
      merger.loadDictionary({
        'ui_spaceship_movement': 'Flight Dynamics',
        'ui_v_pitch': 'Pitch Dynamic Control'
      });

      const doc: ActionMapsDocument = {
        options: [],
        modifiers: [],
        actionMaps: {
          spaceship_movement: {
            name: 'spaceship_movement',
            actions: {
              v_pitch: {
                name: 'v_pitch',
                inputs: [{ input: 'js1_pitch', devicePrefix: 'js1', hardwareKey: 'pitch', bindType: 'rebind' }]
              },
              v_yaw: {
                name: 'v_yaw',
                inputs: [{ input: 'js1_yaw', devicePrefix: 'js1', hardwareKey: 'yaw', bindType: 'rebind' }]
              }
            }
          }
        }
      };

      merger.enrichDocument(doc);

      const group = doc.actionMaps['spaceship_movement'];
      expect(group.label).toBe('Flight Dynamics');
      expect(group.actions['v_pitch'].label).toBe('Pitch Dynamic Control');
      expect(group.actions['v_pitch'].description).toBe('Internal: v_pitch (spaceship_movement)');

      // Fallback humanization
      expect(group.actions['v_yaw'].label).toBe('Yaw');
      expect(group.actions['v_yaw'].description).toBe('Internal: v_yaw (spaceship_movement)');
    });
  });
});
