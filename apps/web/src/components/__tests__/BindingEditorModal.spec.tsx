import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BindingEditorModal } from '../BindingEditorModal';
import type { ActionBinding, BindingInput } from '@sc-mapping/shared-types';

const { mockListener } = vi.hoisted(() => ({
  mockListener: vi.fn()
}));

vi.mock('../../hooks/useGamepadListener', () => ({
  useGamepadListener: (args: any) => mockListener(args)
}));

describe('BindingEditorModal Component', () => {
  const sampleAction: ActionBinding = {
    name: 'v_boost',
    label: 'Afterburner Boost',
    description: 'Engage engine afterburners for temporary thrust acceleration',
    inputs: [
      {
        input: 'js1_button4',
        devicePrefix: 'js1',
        hardwareKey: 'button4',
        bindType: 'rebind',
        activationMode: 'press',
        multiTap: undefined
      }
    ]
  };

  beforeEach(() => {
    mockListener.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders action details and inputs when isOpen is true', () => {
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText('spaceship_movement')).toBeDefined();
    expect(screen.getByText('v_boost')).toBeDefined();
    expect(screen.getByText('Afterburner Boost')).toBeDefined();
    expect(screen.getByText(/Engage engine afterburners/i)).toBeDefined();
    expect(screen.getByDisplayValue('js1_button4')).toBeDefined();
  });

  it('displays empty state message when action has no inputs', () => {
    const emptyAction: ActionBinding = {
      name: 'v_unbound_action',
      inputs: []
    };

    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={emptyAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/No hardware inputs currently bound to this action/i)).toBeDefined();
  });

  it('allows adding and removing input bindings', () => {
    const emptyAction: ActionBinding = {
      name: 'v_empty',
      inputs: []
    };

    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={emptyAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    // 1. Add first input (should default to rebind)
    const addBtn = screen.getByText('Add Input Binding');
    fireEvent.click(addBtn);

    expect(screen.getByDisplayValue('js1_button1')).toBeDefined();
    expect(screen.getByDisplayValue('rebind (Primary Override)')).toBeDefined();

    // 2. Add second input (should default to addbind)
    fireEvent.click(addBtn);
    const rebindSelects = screen.getAllByRole('combobox');
    expect(screen.getByDisplayValue('addbind (Additive Concurrent)')).toBeDefined();

    // 3. Remove the first input
    const deleteButtons = screen.getAllByTitle('Delete this binding');
    expect(deleteButtons.length).toBe(2);
    fireEvent.click(deleteButtons[0]);

    expect(screen.getAllByTitle('Delete this binding').length).toBe(1);
  });

  it('updates hardware input code string with prefix parsing', () => {
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const inputField = screen.getByDisplayValue('js1_button4');

    // Case A: formatted with underscore
    fireEvent.change(inputField, { target: { value: 'js2_rotx' } });
    expect(screen.getByDisplayValue('js2_rotx')).toBeDefined();

    // Case B: formatted without underscore
    fireEvent.change(inputField, { target: { value: 'space' } });
    expect(screen.getByDisplayValue('space')).toBeDefined();
  });

  it('updates bindType, activationMode, and multiTap', () => {
    const onSave = vi.fn();
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    // Bind Type
    const bindSelect = screen.getByDisplayValue('rebind (Primary Override)');
    fireEvent.change(bindSelect, { target: { value: 'addbind' } });

    // Activation Mode
    const actSelect = screen.getByDisplayValue('press');
    fireEvent.change(actSelect, { target: { value: 'hold' } });

    // Multi-tap
    const multiSelect = screen.getByDisplayValue('1 (Single Tap)');
    fireEvent.change(multiSelect, { target: { value: '2' } });

    // Save
    fireEvent.click(screen.getByText('Save Changes'));

    expect(onSave).toHaveBeenCalledWith(
      'spaceship_movement',
      'v_boost',
      [
        {
          input: 'js1_button4',
          devicePrefix: 'js1',
          hardwareKey: 'button4',
          bindType: 'addbind',
          activationMode: 'hold',
          multiTap: 2
        }
      ],
      'Afterburner Boost'
    );
  });

  it('handles activationMode set to none and multiTap set to 1', () => {
    const onSave = vi.fn();
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    const actSelect = screen.getByDisplayValue('press');
    fireEvent.change(actSelect, { target: { value: 'none' } });

    const multiSelect = screen.getByDisplayValue('1 (Single Tap)');
    fireEvent.change(multiSelect, { target: { value: '1' } });

    fireEvent.click(screen.getByText('Save Changes'));

    expect(onSave).toHaveBeenCalledWith(
      'spaceship_movement',
      'v_boost',
      [
        expect.objectContaining({
          activationMode: undefined,
          multiTap: undefined
        })
      ],
      'Afterburner Boost'
    );
  });

  it('captures hardware input when capture button is toggled', () => {
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    // Initial render: isListening should be false
    expect(mockListener).toHaveBeenLastCalledWith(
      expect.objectContaining({ isListening: false })
    );

    const captureBtn = screen.getByText('Capture');

    // Click Capture to begin listening
    fireEvent.click(captureBtn);
    expect(screen.getByText('Listening...')).toBeDefined();
    expect(mockListener).toHaveBeenLastCalledWith(
      expect.objectContaining({ isListening: true })
    );

    // Retrieve callback and simulate input detected from hook
    const lastCall = mockListener.mock.calls[mockListener.mock.calls.length - 1][0];
    act(() => {
      lastCall.onInputDetected({
        gamepadIndex: 1,
        logicalDeviceInstance: 2,
        scInputString: 'js2_button10',
        inputType: 'button',
        rawValue: 1.0
      });
    });

    // Input string should be updated and listening finished
    expect(screen.getByDisplayValue('js2_button10')).toBeDefined();
    expect(screen.getByText('Capture')).toBeDefined();
    expect(mockListener).toHaveBeenLastCalledWith(
      expect.objectContaining({ isListening: false })
    );
  });

  it('toggles capture button off if clicked a second time', () => {
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const captureBtn = screen.getByText('Capture');
    fireEvent.click(captureBtn);
    expect(screen.getByText('Listening...')).toBeDefined();

    // Click again to cancel capture
    fireEvent.click(screen.getByText('Listening...'));
    expect(screen.getByText('Capture')).toBeDefined();
  });

  it('triggers onClose when close icon or Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <BindingEditorModal
        mapName="spaceship_movement"
        action={sampleAction}
        isOpen={true}
        onClose={onClose}
        onSave={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
