import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BindingTable } from '../BindingTable';
import { ActionMapsParser } from '@sc-mapping/parser';
import type { ConflictReport } from '@sc-mapping/shared-types';
import { ConflictSeverity } from '@sc-mapping/shared-types';

const TEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="dual_vkb_evo_scm">
  <options type="joystick" instance="1" Product="VKBsim Gladiator EVO R"/>
  <options type="joystick" instance="2" Product="VKBsim Gladiator EVO L"/>
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
    </action>
    <action name="v_yaw">
      <rebind input="js1_yaw"/>
    </action>
    <action name="v_boost">
      <rebind input="js1_button4" activationMode="press"/>
    </action>
  </actionmap>
  <actionmap name="spaceship_weapons">
    <action name="v_attack1_group1">
      <rebind input="js1_button1" activationMode="press"/>
    </action>
  </actionmap>
</ActionMaps>`;

describe('BindingTable Component', () => {
  const doc = ActionMapsParser.parseXML(TEST_XML);

  const mockConflictReport: ConflictReport = {
    conflicts: [
      {
        sourceAction: 'v_pitch',
        targetAction: 'v_yaw',
        sourceContext: 'spaceship_movement',
        targetContext: 'spaceship_movement',
        sharedInput: 'js1_y',
        severity: ConflictSeverity.Fatal,
        conflictType: 'direct_collision',
        reason: 'Fatal collision',
        recommendation: 'Rebind'
      }
    ],
    fatalCount: 1,
    warningCount: 0,
    redundantCount: 0,
    scannedActionsCount: 4
  };

  it('renders table headers and bound action rows', () => {
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={vi.fn()}
      />
    );

    expect(screen.getByText('Keybinding Matrix & Rebind Engine')).toBeDefined();
    expect(screen.getAllByText('v_pitch').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('v_yaw').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('v_boost').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('v_attack_group1').length).toBeGreaterThanOrEqual(1);
  });

  it('filters actions by search query', () => {
    const handleSearchChange = vi.fn();
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery="v_pitch"
        onSearchChange={handleSearchChange}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={vi.fn()}
      />
    );

    expect(screen.getAllByText('v_pitch').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('v_boost')).toBeNull();

    // Type in search bar
    const searchInput = screen.getByPlaceholderText(/Search actions, labels/i);
    fireEvent.change(searchInput, { target: { value: 'yaw' } });
    expect(handleSearchChange).toHaveBeenCalledWith('yaw');
  });

  it('filters by category / actionmap select dropdown', () => {
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={vi.fn()}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[0]; // first combobox is action maps

    fireEvent.change(categorySelect, { target: { value: 'spaceship_weapons' } });

    expect(screen.getAllByText('v_attack_group1').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('v_pitch')).toBeNull();
  });

  it('filters by bound vs unbound status', () => {
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={vi.fn()}
      />
    );

    // Switch to unbound
    fireEvent.click(screen.getByText('Unbound'));
    expect(screen.queryByText('v_pitch')).toBeNull();

    // Switch to All
    fireEvent.click(screen.getByText('All'));

    // Switch back to Bound
    fireEvent.click(screen.getByText('Bound'));
    expect(screen.getAllByText('v_pitch').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onEditAction when edit button is clicked', () => {
    const handleEditAction = vi.fn();
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={handleEditAction}
      />
    );

    const editBtns = screen.getAllByTitle('Edit bindings for this action');
    expect(editBtns.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(editBtns[0]);
    expect(handleEditAction).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ name: expect.any(String) })
    );
  });

  it('toggles listening mode via button', () => {
    const handleToggleListening = vi.fn();
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={handleToggleListening}
        lastDetectedInput="js1_button4"
        onEditAction={vi.fn()}
      />
    );

    const listenBtn = screen.getByText('Hardware Listener');
    fireEvent.click(listenBtn);
    expect(handleToggleListening).toHaveBeenCalledTimes(1);
  });

  it('opens and closes custom action modal and help guide', () => {
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={vi.fn()}
      />
    );

    // Add Custom Action button
    fireEvent.click(screen.getByText('+ Custom Action'));
    expect(screen.getByText(/Define an action for new Star Citizen updates/i)).toBeDefined();

    // Add custom action through modal
    const actionInput = screen.getByPlaceholderText(/e\.g\. v_master_mode_switch/i);
    fireEvent.change(actionInput, { target: { value: 'v_custom_thruster' } });
    fireEvent.click(screen.getByText('ADD & BIND INPUT'));

    // Help Guide
    fireEvent.click(screen.getByTitle(/Learn what the Keybinding Matrix does/i));
    expect(screen.getByText(/Keybinding Matrix • Guide/i)).toBeDefined();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/Keybinding Matrix • Guide/i)).toBeNull();
  });

  it('filters actions by device button selection', () => {
    render(
      <BindingTable
        doc={doc}
        conflictReport={mockConflictReport}
        searchQuery=""
        onSearchChange={vi.fn()}
        isListeningMode={false}
        onToggleListening={vi.fn()}
        lastDetectedInput={null}
        onEditAction={vi.fn()}
      />
    );

    // Click JS1 filter button
    const js1Btn = screen.getByRole('button', { name: 'JS1' });
    fireEvent.click(js1Btn);
    expect(screen.getAllByText('v_pitch').length).toBeGreaterThanOrEqual(1);

    // Click JS2 filter button (no bound actions on js2 in test doc)
    const js2Btn = screen.getByRole('button', { name: 'JS2' });
    fireEvent.click(js2Btn);
    expect(screen.queryByText('v_pitch')).toBeNull();

    // Reset to ALL
    const allBtn = screen.getByRole('button', { name: 'ALL' });
    fireEvent.click(allBtn);
    expect(screen.getAllByText('v_pitch').length).toBeGreaterThanOrEqual(1);
  });
});
