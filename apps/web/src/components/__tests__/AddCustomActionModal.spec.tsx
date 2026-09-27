import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddCustomActionModal } from '../AddCustomActionModal';

describe('AddCustomActionModal Component', () => {
  const sampleMaps = ['spaceship_movement', 'spaceship_weapons', 'player_actions'];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AddCustomActionModal
        isOpen={false}
        onClose={vi.fn()}
        onAddAction={vi.fn()}
        knownActionMaps={sampleMaps}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with target action map select and inputs when isOpen is true', () => {
    render(
      <AddCustomActionModal
        isOpen={true}
        onClose={vi.fn()}
        onAddAction={vi.fn()}
        knownActionMaps={sampleMaps}
      />
    );

    expect(screen.getByText('Add Custom Action')).toBeDefined();
    expect(screen.getByText('Target Action Map (Category)')).toBeDefined();
    expect(screen.getByText('Programmatic Action Identifier')).toBeDefined();
    const select = screen.getByDisplayValue('spaceship_movement');
    expect(select).toBeDefined();

    fireEvent.change(select, { target: { value: 'spaceship_weapons' } });
    expect(screen.getByDisplayValue('spaceship_weapons')).toBeDefined();
  });

  it('switches to custom map name input and back to select', () => {
    render(
      <AddCustomActionModal
        isOpen={true}
        onClose={vi.fn()}
        onAddAction={vi.fn()}
        knownActionMaps={sampleMaps}
      />
    );

    // Switch to custom map input
    fireEvent.click(screen.getByText('+ New Map'));
    expect(screen.getByPlaceholderText(/e\.g\. spaceship_movement or player_actions/i)).toBeDefined();

    // Switch back to select
    fireEvent.click(screen.getByText('Select Existing'));
    expect(screen.getByDisplayValue('spaceship_movement')).toBeDefined();
  });

  it('validates required fields on submission', () => {
    const { container } = render(
      <AddCustomActionModal
        isOpen={true}
        onClose={vi.fn()}
        onAddAction={vi.fn()}
        knownActionMaps={[]}
      />
    );

    const form = container.querySelector('form')!;

    // 1. Submit with custom map enabled but empty custom map name
    fireEvent.click(screen.getByText('+ New Map'));
    fireEvent.submit(form);

    expect(screen.getByText(/Please select or enter an Action Map name/i)).toBeDefined();

    // 2. Enter map name but keep action name empty
    const mapInput = screen.getByPlaceholderText(/e\.g\. spaceship_movement/i);
    fireEvent.change(mapInput, { target: { value: 'custom_flight' } });
    fireEvent.submit(form);

    expect(screen.getByText(/Please enter a programmatic Action identifier/i)).toBeDefined();
  });

  it('auto-generates human label from action identifier when label is omitted', () => {
    const handleAddAction = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddCustomActionModal
        isOpen={true}
        onClose={handleClose}
        onAddAction={handleAddAction}
        knownActionMaps={sampleMaps}
      />
    );

    const actionInput = screen.getByPlaceholderText(/e\.g\. v_master_mode_switch/i);
    fireEvent.change(actionInput, { target: { value: 'v_master_mode_switch' } });

    fireEvent.click(screen.getByText('ADD & BIND INPUT'));

    expect(handleAddAction).toHaveBeenCalledWith(
      'spaceship_movement',
      'v_master_mode_switch',
      'Master Mode Switch'
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('submits with custom map name and explicit human label', () => {
    const handleAddAction = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddCustomActionModal
        isOpen={true}
        onClose={handleClose}
        onAddAction={handleAddAction}
        knownActionMaps={sampleMaps}
      />
    );

    // Switch to new map
    fireEvent.click(screen.getByText('+ New Map'));
    const mapInput = screen.getByPlaceholderText(/e\.g\. spaceship_movement/i);
    fireEvent.change(mapInput, { target: { value: 'engineering_reactor' } });

    const actionInput = screen.getByPlaceholderText(/e\.g\. v_master_mode_switch/i);
    fireEvent.change(actionInput, { target: { value: 'v_scram_reactor' } });

    const labelInput = screen.getByPlaceholderText(/e\.g\. Master Mode Switch/i);
    fireEvent.change(labelInput, { target: { value: 'Emergency Reactor SCRAM' } });

    fireEvent.click(screen.getByText('ADD & BIND INPUT'));

    expect(handleAddAction).toHaveBeenCalledWith(
      'engineering_reactor',
      'v_scram_reactor',
      'Emergency Reactor SCRAM'
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when CANCEL or close icon is clicked', () => {
    const handleClose = vi.fn();

    render(
      <AddCustomActionModal
        isOpen={true}
        onClose={handleClose}
        onAddAction={vi.fn()}
        knownActionMaps={sampleMaps}
      />
    );

    fireEvent.click(screen.getByText('CANCEL'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
