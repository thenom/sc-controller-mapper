import { describe, it, expect } from 'vitest';
import { ConflictResolver } from '../ConflictResolver';
import { ConflictSeverity } from '@sc-mapping/shared-types';
import type { ActionBinding, BindingInput, ActionMapsDocument } from '@sc-mapping/shared-types';

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

describe('Obsolete Action Collision & Diagnostic Hierarchy', () => {
  it('should classify collision as obsolete_collision when paired with deprecated v_toggle_quantum_mode', () => {
    const legacyQT: ActionBinding = {
      name: 'v_toggle_quantum_mode',
      inputs: [mockInput('js1_button4', 'rebind', 'press')]
    };
    const masterModeCycle: ActionBinding = {
      name: 'v_master_mode_cycle',
      inputs: [mockInput('js1_button4', 'rebind', 'press')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_movement',
      legacyQT,
      'spaceship_movement',
      masterModeCycle
    );

    expect(result.severity).toBe(ConflictSeverity.Fatal);
    expect(result.conflictType).toBe('obsolete_collision');
    expect(result.deprecatedAction).toBe('v_toggle_quantum_mode');
    expect(result.rootCauseAction).toBe('v_toggle_quantum_mode');
    expect(result.reason).toContain("Collision with Obsolete Action: 'v_toggle_quantum_mode'");
    expect(result.reason).toContain('Alpha 3.23.0');
    expect(result.recommendation).toContain("Remove 'v_toggle_quantum_mode' from your profile");
    expect(result.recommendation).toContain("without changing 'v_master_mode_cycle'");
  });

  it('should identify obsolete cruise control in collision with speed limiter or boost', () => {
    const legacyCruise: ActionBinding = {
      name: 'v_ifcs_toggle_cruise_control',
      inputs: [mockInput('js1_button2', 'rebind', 'press')]
    };
    const boost: ActionBinding = {
      name: 'v_boost',
      inputs: [mockInput('js1_button2', 'rebind', 'press')]
    };

    const result = ConflictResolver.evaluateActions(
      'spaceship_movement',
      boost,
      'spaceship_movement',
      legacyCruise
    );

    expect(result.severity).toBe(ConflictSeverity.Fatal);
    expect(result.conflictType).toBe('obsolete_collision');
    expect(result.deprecatedAction).toBe('v_ifcs_toggle_cruise_control');
    expect(result.rootCauseAction).toBe('v_ifcs_toggle_cruise_control');
    expect(result.recommendation).toContain("Remove 'v_ifcs_toggle_cruise_control'");
  });

  it('should prioritize obsolete_collision at the top of auditDocument and suppress duplicate R2 redundancy for the same input', () => {
    const doc: ActionMapsDocument = {
      profileName: 'obsolete_hierarchy_test',
      devices: [],
      actionMaps: {
        spaceship_movement: {
          name: 'spaceship_movement',
          actions: {
            v_toggle_quantum_mode: {
              name: 'v_toggle_quantum_mode',
              inputs: [mockInput('js1_button4', 'rebind', 'press')]
            },
            v_master_mode_cycle: {
              name: 'v_master_mode_cycle',
              inputs: [mockInput('js1_button4', 'rebind', 'press')]
            },
            v_pitch: {
              name: 'v_pitch',
              inputs: [mockInput('js1_pitch', 'rebind')]
            },
            v_yaw: {
              name: 'v_yaw',
              inputs: [mockInput('js1_pitch', 'rebind')]
            },
            v_cruise_control: {
              name: 'v_cruise_control',
              inputs: [mockInput('js1_button9', 'rebind', 'press')]
            }
          }
        }
      }
    };

    const report = ConflictResolver.auditDocument(doc);

    expect(report.conflicts.length).toBeGreaterThan(0);

    // 1. The first item in conflicts MUST be the obsolete collision
    expect(report.conflicts[0].conflictType).toBe('obsolete_collision');
    expect(report.conflicts[0].deprecatedAction).toBe('v_toggle_quantum_mode');

    // 2. v_toggle_quantum_mode on js1_button4 should NOT be duplicated as a generic deprecated redundancy
    const duplicateR2 = report.conflicts.filter(
      c => c.conflictType === 'deprecated' && c.sourceAction === 'v_toggle_quantum_mode' && c.sharedInput === 'js1_button4'
    );
    expect(duplicateR2).toHaveLength(0);

    // 3. v_cruise_control on js1_button9 (which has no collision) SHOULD be reported under deprecated
    const standaloneDeprecated = report.conflicts.find(
      c => c.conflictType === 'deprecated' && c.sourceAction === 'v_cruise_control'
    );
    expect(standaloneDeprecated).toBeDefined();
    expect(standaloneDeprecated?.sharedInput).toBe('js1_button9');
  });
});
