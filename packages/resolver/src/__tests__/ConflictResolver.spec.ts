import { describe, it, expect } from 'vitest';
import { ConflictResolver } from '../ConflictResolver';
import { ConflictSeverity } from '@sc-mapping/shared-types';
import type { ActionBinding, BindingInput } from '@sc-mapping/shared-types';

function mockInput(
  input: string,
  bindType: 'rebind' | 'addbind' = 'rebind',
  activationMode?: 'press' | 'hold' | 'double_tap' | 'delayed_press' | 'smart_toggle',
  multiTap?: number
): BindingInput {
  const prefixMatch = input.match(/^([a-z0-9]+)_(.*)$/i);
  return {
    input,
    devicePrefix: (prefixMatch ? prefixMatch[1].toLowerCase() : 'js1') as any,
    hardwareKey: prefixMatch ? prefixMatch[2] : input,
    bindType,
    activationMode,
    multiTap
  };
}

describe('ConflictResolver', () => {
  it('should return Severity 0 (None) for mutually exclusive contexts (flight vs on-foot)', () => {
    const flightFire: ActionBinding = {
      name: 'v_attack1_group1',
      inputs: [mockInput('js1_button1', 'rebind', 'press')]
    };
    const onFootFire: ActionBinding = {
      name: 'fire',
      inputs: [mockInput('js1_button1', 'rebind', 'press')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_weapons',
      flightFire,
      'player_input_onfoot',
      onFootFire
    );

    expect(result.severity).toBe(ConflictSeverity.None);
    expect(result.reason).toContain('Mutually exclusive');
  });

  it('should return Severity 1 (Warning) for double_tap vs press due to ~250ms buffer latency', () => {
    const boostAction: ActionBinding = {
      name: 'v_boost',
      inputs: [mockInput('js1_button4', 'rebind', 'press')]
    };
    const spaceBreakAction: ActionBinding = {
      name: 'v_spacebreak',
      inputs: [mockInput('js1_button4', 'rebind', 'double_tap')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_movement',
      boostAction,
      'spaceship_movement',
      spaceBreakAction
    );

    expect(result.severity).toBe(ConflictSeverity.Warning);
    expect(result.reason).toContain('Input Latency Penalty');
  });

  it('should return Severity 2 (Fatal) for identical inputs in concurrent flight contexts', () => {
    const pitchAction: ActionBinding = {
      name: 'v_pitch',
      inputs: [mockInput('js1_pitch', 'rebind')]
    };
    const yawAction: ActionBinding = {
      name: 'v_yaw',
      inputs: [mockInput('js1_pitch', 'rebind')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_movement',
      pitchAction,
      'spaceship_movement',
      yawAction
    );

    expect(result.severity).toBe(ConflictSeverity.Fatal);
    expect(result.reason).toContain('Direct Action Collision');
  });

  it('should escalate hold vs press to Severity 2 (Fatal) when a command is destructive (v_eject)', () => {
    const ejectAction: ActionBinding = {
      name: 'v_eject',
      inputs: [mockInput('js1_button5', 'rebind', 'hold')]
    };
    const lightsAction: ActionBinding = {
      name: 'v_lights_toggle',
      inputs: [mockInput('js1_button5', 'rebind', 'press')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_movement',
      ejectAction,
      'spaceship_movement',
      lightsAction
    );

    expect(result.severity).toBe(ConflictSeverity.Fatal);
    expect(result.reason).toContain('Destructive Action Safety Conflict');
  });

  it('should detect Severity 3 (Redundant) for subsumed actions sharing an input', () => {
    const flightReady: ActionBinding = {
      name: 'v_flightready',
      inputs: [mockInput('js1_button6', 'rebind', 'press')]
    };
    const powerOn: ActionBinding = {
      name: 'v_power_set_on',
      inputs: [mockInput('js1_button6', 'rebind', 'press')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_general',
      flightReady,
      'spaceship_general',
      powerOn
    );

    expect(result.severity).toBe(ConflictSeverity.Redundant);
    expect(result.reason).toContain('Subsumed');
  });

  it('should ignore unbound controller placeholders (e.g. js1_, js2_) and not report false positive conflicts', () => {
    const unboundA: ActionBinding = {
      name: 'v_pitch',
      inputs: [{ input: 'js1_', devicePrefix: 'js1', hardwareKey: '', bindType: 'rebind' }]
    };
    const unboundB: ActionBinding = {
      name: 'v_yaw',
      inputs: [{ input: 'js1_', devicePrefix: 'js1', hardwareKey: '', bindType: 'rebind' }]
    };

    const directEval = ConflictResolver.evaluateActions(
      'spaceship_movement',
      unboundA,
      'spaceship_movement',
      unboundB
    );
    expect(directEval.severity).toBe(ConflictSeverity.None);

    const doc = {
      profileName: 'unbound_test',
      devices: [],
      actionMaps: {
        spaceship_movement: {
          name: 'spaceship_movement',
          actions: {
            v_pitch: unboundA,
            v_yaw: unboundB,
            v_roll: {
              name: 'v_roll',
              inputs: [{ input: 'js1_', devicePrefix: 'js1', hardwareKey: '', bindType: 'rebind' }]
            }
          }
        }
      }
    };

    const report = ConflictResolver.auditDocument(doc);
    expect(report.hasFatalConflicts).toBe(false);
    expect(report.fatalCount).toBe(0);
    expect(report.conflicts).toHaveLength(0);
  });
});
