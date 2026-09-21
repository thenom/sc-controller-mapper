import { describe, it, expect } from 'vitest';
import { TemporalEvaluator } from '../TemporalEvaluator';
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

describe('TemporalEvaluator', () => {
  const baseActionA: ActionBinding = { name: 'v_lights', inputs: [] };
  const baseActionB: ActionBinding = { name: 'v_radar', inputs: [] };

  it('should return Fatal collision when activationMode and multiTap are identical', () => {
    const inputA = mockInput('js1_button1', 'rebind', 'press', 1);
    const inputB = mockInput('js1_button1', 'rebind', 'press', 1);

    const result = TemporalEvaluator.evaluate(baseActionA, inputA, baseActionB, inputB);
    expect(result.severity).toBe(ConflictSeverity.Fatal);
    expect(result.reason).toContain('Direct Action Collision');
  });

  it('should detect Warning with latency buffer for multiTap 2 vs 1', () => {
    const inputA = mockInput('js1_button2', 'rebind', undefined, 1);
    const inputB = mockInput('js1_button2', 'rebind', undefined, 2);

    const result = TemporalEvaluator.evaluate(baseActionA, inputA, baseActionB, inputB);
    expect(result.severity).toBe(ConflictSeverity.Warning);
    expect(result.reason).toContain('Input Latency Buffer (~250ms)');
  });

  it('should return Warning for hold vs press on benign non-destructive actions', () => {
    const inputA = mockInput('js1_button3', 'rebind', 'press');
    const inputB = mockInput('js1_button3', 'rebind', 'hold');

    const result = TemporalEvaluator.evaluate(baseActionA, inputA, baseActionB, inputB);
    expect(result.severity).toBe(ConflictSeverity.Warning);
    expect(result.reason).toContain('Contextual Activation Conflict');
  });

  it('should escalate to Fatal if hold vs press involves a destructive action (v_self_destruct)', () => {
    const destructAction: ActionBinding = { name: 'v_self_destruct', inputs: [] };
    const inputA = mockInput('js1_button4', 'rebind', 'hold');
    const inputB = mockInput('js1_button4', 'rebind', 'press');

    const result = TemporalEvaluator.evaluate(destructAction, inputA, baseActionB, inputB);
    expect(result.severity).toBe(ConflictSeverity.Fatal);
    expect(result.reason).toContain('Destructive Action Safety Conflict');
  });
});
