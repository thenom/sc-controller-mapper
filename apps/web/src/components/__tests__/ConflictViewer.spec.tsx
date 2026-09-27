import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictViewer } from '../ConflictViewer';
import type { ConflictReport, ConflictDetails } from '@sc-mapping/shared-types';
import { ConflictSeverity } from '@sc-mapping/shared-types';

describe('ConflictViewer Component', () => {
  const sampleConflicts: ConflictDetails[] = [
    {
      sourceAction: 'v_pitch',
      targetAction: 'v_yaw',
      sourceContext: 'spaceship_movement',
      targetContext: 'spaceship_movement',
      sharedInput: 'js1_y',
      severity: ConflictSeverity.Fatal,
      conflictType: 'direct_collision',
      reason: 'Concurrent flight axis collision on same physical joystick deflection',
      recommendation: 'Rebind pitch or yaw to a distinct axis'
    },
    {
      sourceAction: 'v_boost',
      targetAction: 'v_spacebreak',
      sourceContext: 'spaceship_movement',
      targetContext: 'spaceship_movement',
      sharedInput: 'js1_button4',
      severity: ConflictSeverity.Warning,
      conflictType: 'temporal_overlap',
      reason: 'Single tap vs double tap buffer latency (~250ms)',
      recommendation: 'Acceptable if latency is tolerated'
    },
    {
      sourceAction: 'v_ifcs_toggle_cruise_control',
      targetAction: 'v_speed_limiter_toggle',
      sourceContext: 'spaceship_movement',
      targetContext: 'spaceship_movement',
      sharedInput: 'js1_button12',
      severity: ConflictSeverity.Redundant,
      conflictType: 'obsolete_collision',
      reason: 'Legacy cruise control was removed in Star Citizen 3.23 Master Modes',
      recommendation: 'Remove obsolete binding',
      deprecatedAction: 'v_ifcs_toggle_cruise_control'
    },
    {
      sourceAction: 'v_flightready',
      targetAction: 'v_power_set_on',
      sourceContext: 'spaceship_general',
      targetContext: 'spaceship_general',
      sharedInput: 'js1_button1',
      severity: ConflictSeverity.Redundant,
      conflictType: 'redundancy',
      reason: 'Flight ready automatically encompasses power on',
      recommendation: 'Unbind redundant power on action'
    },
    {
      sourceAction: 'v_legacy_hud_toggle',
      targetAction: '',
      sourceContext: 'spaceship_general',
      targetContext: 'spaceship_general',
      sharedInput: 'js1_button20',
      severity: ConflictSeverity.Redundant,
      conflictType: 'deprecated',
      reason: 'Legacy HUD toggle removed',
      deprecatedAction: 'v_legacy_hud_toggle'
    }
  ];

  const sampleReport: ConflictReport = {
    conflicts: sampleConflicts,
    fatalCount: 1,
    warningCount: 1,
    redundantCount: 3,
    scannedActionsCount: 40
  };

  it('renders nothing when report is null', () => {
    const { container } = render(
      <ConflictViewer
        report={null}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders optimal state when there are 0 conflicts', () => {
    const emptyReport: ConflictReport = {
      conflicts: [],
      fatalCount: 0,
      warningCount: 0,
      redundantCount: 0,
      scannedActionsCount: 25
    };

    render(
      <ConflictViewer
        report={emptyReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getByText(/Optimal \(0 Conflicts\)/i)).toBeDefined();
    expect(screen.getByText(/No Input Conflicts Detected/i)).toBeDefined();
    expect(screen.queryByPlaceholderText(/Search conflicting actions/i)).toBeNull();
  });

  it('renders conflict metrics and lists all conflicts by default', () => {
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getByText(/5 Detected/i)).toBeDefined();
    expect(screen.getByText('All (5)')).toBeDefined();
    expect(screen.getByText(/Fatal \(1\)/i)).toBeDefined();
    expect(screen.getByText(/Warnings \(1\)/i)).toBeDefined();
    expect(screen.getByText(/Redundant \(3\)/i)).toBeDefined();

    // Check presence of conflict actions
    expect(screen.getByText('v_pitch')).toBeDefined();
    expect(screen.getByText('v_boost')).toBeDefined();
    expect(screen.getByText('v_ifcs_toggle_cruise_control')).toBeDefined();
  });

  it('filters conflicts by severity badges', () => {
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    // 1. Filter Fatal
    fireEvent.click(screen.getByText(/Fatal \(1\)/i));
    expect(screen.getByText('v_pitch')).toBeDefined();
    expect(screen.queryByText('v_boost')).toBeNull();
    expect(screen.queryByText('v_ifcs_toggle_cruise_control')).toBeNull();

    // 2. Filter Warning
    fireEvent.click(screen.getByText(/Warnings \(1\)/i));
    expect(screen.queryByText('v_pitch')).toBeNull();
    expect(screen.getByText('v_boost')).toBeDefined();

    // 3. Filter Redundant
    fireEvent.click(screen.getByText(/Redundant \(3\)/i));
    expect(screen.queryByText('v_pitch')).toBeNull();
    expect(screen.getByText('v_ifcs_toggle_cruise_control')).toBeDefined();

    // 4. Return to All
    fireEvent.click(screen.getByText('All (5)'));
    expect(screen.getByText('v_pitch')).toBeDefined();
    expect(screen.getByText('v_boost')).toBeDefined();
  });

  it('filters conflicts by search query and shows empty message when no match', () => {
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search conflicting actions/i);

    // Search by input name
    fireEvent.change(searchInput, { target: { value: 'js1_button4' } });
    expect(screen.getByText('v_boost')).toBeDefined();
    expect(screen.queryByText('v_pitch')).toBeNull();

    // Search by reason keyword
    fireEvent.change(searchInput, { target: { value: 'Master Modes' } });
    expect(screen.getByText('v_ifcs_toggle_cruise_control')).toBeDefined();
    expect(screen.queryByText('v_boost')).toBeNull();

    // Non-matching search
    fireEvent.change(searchInput, { target: { value: 'xyz_nonexistent' } });
    expect(screen.getByText(/No conflicts match the selected filter or query/i)).toBeDefined();
  });

  it('renders obsolete collision root cause banner and triggers onAutoFix', () => {
    const handleAutoFix = vi.fn();
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
        onAutoFix={handleAutoFix}
      />
    );

    // Banner check
    expect(screen.getByText(/Root-Cause Diagnostic: 1 collision is caused by legacy/i)).toBeDefined();

    // Auto fix button
    const fixButton = screen.getByText(/Remove Obsolete Action \(v_ifcs_toggle_cruise_control\)/i);
    expect(fixButton).toBeDefined();

    fireEvent.click(fixButton);
    expect(handleAutoFix).toHaveBeenCalledWith(sampleConflicts[2]);
  });

  it('triggers onSelectAction callback when action buttons are clicked', () => {
    const handleSelectAction = vi.fn();
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={handleSelectAction}
      />
    );

    fireEvent.click(screen.getByText('v_pitch'));
    expect(handleSelectAction).toHaveBeenCalledWith('v_pitch');

    fireEvent.click(screen.getByText('v_yaw'));
    expect(handleSelectAction).toHaveBeenCalledWith('v_yaw');
  });

  it('triggers onDeviceScopeChange when device scope buttons are clicked', () => {
    const handleScopeChange = vi.fn();
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={handleScopeChange}
        onSelectAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Joysticks (HOTAS/HOSAS)'));
    expect(handleScopeChange).toHaveBeenCalledWith('js');

    fireEvent.click(screen.getByText('Keyboard'));
    expect(handleScopeChange).toHaveBeenCalledWith('kb');
  });

  it('opens and closes the "What\'s this?" architecture guide modal', () => {
    render(
      <ConflictViewer
        report={sampleReport}
        deviceScope="all"
        onDeviceScopeChange={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    const helpBtn = screen.getByTitle(/Learn how Conflict Diagnostics works/i);
    fireEvent.click(helpBtn);

    expect(screen.getByText(/Conflict Diagnostics • Architecture Guide/i)).toBeDefined();
    expect(screen.getByText(/Severity 0 \(Optimal \/ Clear\):/i)).toBeDefined();
    expect(screen.getByText(/Severity 1 \(Warning\):/i)).toBeDefined();
    expect(screen.getByText(/Severity 2 \(Fatal\):/i)).toBeDefined();
    expect(screen.getByText(/Severity 3 \(Redundant \/ Obsolete\):/i)).toBeDefined();

    // Close via Close button
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/Conflict Diagnostics • Architecture Guide/i)).toBeNull();

    // Open again and close via X button
    fireEvent.click(helpBtn);
    expect(screen.getByText(/Conflict Diagnostics • Architecture Guide/i)).toBeDefined();
    const closeIconBtn = screen.getByRole('button', { name: '' });
    // In ConflictViewer: <button onClick={() => setIsHelpOpen(false)} className="text-[#94a3b8] hover:text-white p-1"><X className="w-5 h-5" /></button>
    const buttonsInModal = screen.getAllByRole('button');
    const xBtn = buttonsInModal.find(b => b.className.includes('p-1') && !b.textContent);
    if (xBtn) fireEvent.click(xBtn);
    expect(screen.queryByText(/Conflict Diagnostics • Architecture Guide/i)).toBeNull();
  });
});
