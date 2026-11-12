import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { ActionMapsParser } from '@sc-mapping/parser';
import { ConflictResolver } from '@sc-mapping/resolver';
import type { ActionMapsDocument, BindingInput, ConflictDetails, JoystickDeviceOption } from '@sc-mapping/shared-types';
import { useWebMCP, ensureModelContextHost, type UseWebMCPOptions } from './useWebMCP';
import { App } from '../App';

const TEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="webmcp_test_profile">
  <options type="joystick" instance="1" Product="VKBsim Gladiator EVO R">
    <invert axis="pitch" val="1"/>
  </options>
  <options type="joystick" instance="2" Product="VKBsim Gladiator EVO L">
  </options>
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
    </action>
    <action name="v_boost">
      <rebind input="js1_button4" activationMode="press"/>
    </action>
    <action name="v_space_brake">
      <rebind input="js1_button4" activationMode="double_tap"/>
    </action>
    <action name="v_eject">
      <rebind input="js1_button5" activationMode="hold"/>
    </action>
    <action name="v_toggle_headlights">
      <rebind input="js1_button5" activationMode="press"/>
    </action>
    <action name="v_ifcs_toggle_cruise_control">
      <rebind input="js1_button3" activationMode="press"/>
    </action>
    <action name="v_master_mode_cycle">
      <rebind input="js1_button3" activationMode="press"/>
    </action>
    <action name="v_custom_noncatalog_action">
      <rebind input="js2_button7" activationMode="press"/>
    </action>
  </actionmap>
</ActionMaps>`;

function createMockOptions(docOverride?: ActionMapsDocument | null): {
  options: UseWebMCPOptions;
  spies: {
    onSetActiveTab: ReturnType<typeof vi.fn>;
    onSetSearchQuery: ReturnType<typeof vi.fn>;
    onSetDeviceScope: ReturnType<typeof vi.fn>;
    onSetHardwareMapping: ReturnType<typeof vi.fn>;
    onApplyDeviceOptions: ReturnType<typeof vi.fn>;
    onSaveActionInputs: ReturnType<typeof vi.fn>;
    onAutoFixConflict: ReturnType<typeof vi.fn>;
    onLoadSamplePreset: ReturnType<typeof vi.fn>;
  };
} {
  const doc = docOverride === undefined ? ActionMapsParser.parseXML(TEST_XML) : docOverride;
  const conflictReport = doc ? ConflictResolver.auditDocument(doc, { deviceFilter: 'js' }) : null;
  const hardwareMapping = new Map<number, number>([
    [1, 1],
    [2, 2]
  ]);

  const spies = {
    onSetActiveTab: vi.fn(),
    onSetSearchQuery: vi.fn(),
    onSetDeviceScope: vi.fn(),
    onSetHardwareMapping: vi.fn(),
    onApplyDeviceOptions: vi.fn(),
    onSaveActionInputs: vi.fn(),
    onAutoFixConflict: vi.fn(),
    onLoadSamplePreset: vi.fn().mockResolvedValue(undefined)
  };

  return {
    options: {
      doc,
      activePreset: 'Test Preset',
      gameVersion: '4.10.200.58746',
      gameBranch: 'sc-alpha-4.10.3',
      gameBuildDate: '2026-11-12',
      suiteVersion: '1.0.0',
      hardwareMapping,
      conflictReport,
      deviceScope: 'js',
      activeTab: 'matrix',
      searchQuery: '',
      ...spies
    },
    spies
  };
}

describe('WebMCP Browser AI Agent Integration (useWebMCP)', () => {
  beforeEach(() => {
    delete (document as any).modelContext;
    delete (navigator as any).modelContext;
  });

  it('initializes document.modelContext and navigator.modelContext polyfill container and validates tool registration', async () => {
    const host = ensureModelContextHost();
    expect(document.modelContext).toBeDefined();
    expect(navigator.modelContext).toBeDefined();
    expect(host.__isPolyfill).toBe(true);

    // Calling ensureModelContextHost a second time returns the existing host
    const hostAgain = ensureModelContextHost();
    expect(hostAgain).toBe(host);

    // Invalid tool throws
    await expect(host.registerTool({ name: '', description: 'bad', inputSchema: { type: 'object', properties: {} }, execute: null as any })).rejects.toThrow(
      /Invalid WebMCP tool definition/i
    );

    // Executing unknown tool throws
    await expect(host.executeTool('non_existent_tool')).rejects.toThrow(/WebMCP tool not found/i);

    // provideContext replaces registered tools
    await host.provideContext!({
      tools: [
        {
          name: 'ping_tool',
          description: 'Ping test',
          inputSchema: { type: 'object', properties: {} },
          execute: () => ({ pong: true })
        }
      ]
    });
    expect(host.getTools().map(t => t.name)).toEqual(['ping_tool']);
    expect(await host.executeTool('ping_tool')).toEqual({ pong: true });
  });

  it('registers all 9 Star Citizen keybinding tools and executes get_profile_summary', async () => {
    const { options } = createMockOptions();
    const { result, unmount } = renderHook(() => useWebMCP(options));

    expect(result.current.registeredTools).toHaveLength(9);
    const toolNames = result.current.registeredTools.map(t => t.name);
    expect(toolNames).toEqual([
      'get_profile_summary',
      'audit_conflicts',
      'search_bindings_and_catalog',
      'find_unused_joystick_inputs',
      'set_action_binding',
      'auto_fix_obsolete_conflicts',
      'remap_joystick_instances',
      'configure_joystick_options',
      'workspace_control'
    ]);

    let summary: any;
    await act(async () => {
      summary = await result.current.executeRegisteredTool('get_profile_summary');
    });

    expect(summary.profileLoaded).toBe(true);
    expect(summary.profileName).toBe('webmcp_test_profile');
    expect(summary.targetGame.branch).toBe('sc-alpha-4.10.3');
    expect(summary.joystickDevices).toHaveLength(2);
    expect(summary.joystickDevices[0].productName).toBe('VKBsim Gladiator EVO R');
    expect(summary.conflictSummary.totalConflicts).toBeGreaterThan(0);
    expect(result.current.lastToolCall?.toolName).toBe('get_profile_summary');
    expect(result.current.lastToolCall?.status).toBe('ok');

    unmount();
    expect(document.modelContext?.getTools()).toHaveLength(0);
  });

  it('executes audit_conflicts with severity and scope filters and handles null document', async () => {
    const { options } = createMockOptions();
    const { result } = renderHook(() => useWebMCP(options));

    let allAudit: any;
    await act(async () => {
      allAudit = await result.current.executeRegisteredTool('audit_conflicts', {
        deviceScope: 'js',
        severity: 'all',
        limit: 10
      });
    });
    expect(allAudit.counts.total).toBeGreaterThan(0);
    expect(allAudit.conflicts.length).toBeGreaterThan(0);

    let fatalOnly: any;
    await act(async () => {
      fatalOnly = await result.current.executeRegisteredTool('audit_conflicts', {
        deviceScope: 'js',
        severity: 'Fatal',
        limit: 5
      });
    });
    for (const c of fatalOnly.conflicts) {
      expect(c.severity).toBe('Fatal');
    }

    // Null doc case
    const { options: nullOpts } = createMockOptions(null);
    const { result: nullResult } = renderHook(() => useWebMCP(nullOpts));
    let emptyAudit: any;
    await act(async () => {
      emptyAudit = await nullResult.current.executeRegisteredTool('audit_conflicts', {});
    });
    expect(emptyAudit.error).toMatch(/No keybinding profile/i);
  });

  it('searches catalog and custom bindings via search_bindings_and_catalog', async () => {
    const { options } = createMockOptions();
    const { result } = renderHook(() => useWebMCP(options));

    // Search for bound action by query
    let ejectSearch: any;
    await act(async () => {
      ejectSearch = await result.current.executeRegisteredTool('search_bindings_and_catalog', {
        query: 'v_eject',
        bindingState: 'bound',
        limit: 10
      });
    });
    expect(ejectSearch.totalReturned).toBeGreaterThanOrEqual(1);
    expect(ejectSearch.results[0].actionName).toBe('v_eject');
    expect(ejectSearch.results[0].isBound).toBe(true);

    // Search for custom action not in canonical catalog
    let customSearch: any;
    await act(async () => {
      customSearch = await result.current.executeRegisteredTool('search_bindings_and_catalog', {
        query: 'v_custom_noncatalog_action',
        mapName: 'spaceship_movement',
        bindingState: 'bound'
      });
    });
    expect(customSearch.results.some((r: any) => r.actionName === 'v_custom_noncatalog_action')).toBe(true);

    // Search unbound actions with SCM filter
    let unboundScm: any;
    await act(async () => {
      unboundScm = await result.current.executeRegisteredTool('search_bindings_and_catalog', {
        masterFlightMode: 'SCM',
        bindingState: 'unbound',
        limit: 5
      });
    });
    expect(unboundScm.results.length).toBeLessThanOrEqual(5);
    for (const item of unboundScm.results) {
      expect(item.isBound).toBe(false);
      expect(item.masterFlightMode).toBe('SCM');
    }
  });

  it('identifies unused and used buttons on a joystick via find_unused_joystick_inputs', async () => {
    const { options } = createMockOptions();
    const { result } = renderHook(() => useWebMCP(options));

    let stickReport: any;
    await act(async () => {
      stickReport = await result.current.executeRegisteredTool('find_unused_joystick_inputs', {
        deviceInstance: 1,
        maxButtons: 8,
        mapName: 'spaceship_movement'
      });
    });

    expect(stickReport.devicePrefix).toBe('js1');
    expect(stickReport.usedButtons.some((u: any) => u.input === 'js1_button4')).toBe(true);
    expect(stickReport.usedButtons.some((u: any) => u.input === 'js1_button5')).toBe(true);
    expect(stickReport.unusedButtons).toContain('js1_button1');
    expect(stickReport.unusedButtons).toContain('js1_button2');
  });

  it('updates bindings, enforces unbind invariant, and checks conflicts via set_action_binding', async () => {
    const { options, spies } = createMockOptions();
    const { result } = renderHook(() => useWebMCP(options));

    // 1. Bind action to a colliding input (js1_button4 is used by v_boost and v_space_brake)
    let bindRes: any;
    await act(async () => {
      bindRes = await result.current.executeRegisteredTool('set_action_binding', {
        mapName: 'spaceship_movement',
        actionName: 'v_yaw',
        inputs: [
          { input: 'js1_button4', activationMode: 'press' },
          { input: 'lalt+js2_button9', activationMode: 'hold', multiTap: 2 }
        ]
      });
    });

    expect(spies.onSaveActionInputs).toHaveBeenCalledTimes(1);
    expect(bindRes.status).toBe('updated');
    expect(bindRes.unbindEmittedOnExport).toBe(false);
    expect(bindRes.inputs).toHaveLength(2);
    expect(bindRes.inputs[0].bindType).toBe('rebind');
    expect(bindRes.inputs[1].bindType).toBe('addbind');
    expect(bindRes.inputs[1].modifiers).toEqual(['lalt']);
    expect(bindRes.conflictsWithNewBinding.length).toBeGreaterThan(0);

    // 2. Clear action inputs (Unbind invariant -> empty array triggers explicit <rebind input=""/> on export)
    let clearRes: any;
    await act(async () => {
      clearRes = await result.current.executeRegisteredTool('set_action_binding', {
        mapName: 'spaceship_movement',
        actionName: 'v_yaw',
        inputs: []
      });
    });
    expect(clearRes.unbindEmittedOnExport).toBe(true);
    expect(clearRes.inputs).toEqual([]);

    // 3. Missing required parameters throws error and records error status
    await act(async () => {
      await expect(
        result.current.executeRegisteredTool('set_action_binding', {
          mapName: '',
          actionName: '',
          inputs: []
        })
      ).rejects.toThrow(/Both mapName and actionName are required/i);
    });
  });

  it('auto-fixes obsolete conflicts, remaps joysticks, configures device options, and controls workspace', async () => {
    const { options, spies } = createMockOptions();
    const { result } = renderHook(() => useWebMCP(options));

    // 1. Auto-fix obsolete conflicts (v_ifcs_toggle_cruise_control colliding with v_master_mode_cycle)
    let fixRes: any;
    await act(async () => {
      fixRes = await result.current.executeRegisteredTool('auto_fix_obsolete_conflicts', {});
    });
    expect(fixRes.fixedCount).toBeGreaterThanOrEqual(1);
    expect(spies.onAutoFixConflict).toHaveBeenCalled();

    // 2. Remap joystick instances (js1 -> js2, js2 -> js1)
    let remapRes: any;
    await act(async () => {
      remapRes = await result.current.executeRegisteredTool('remap_joystick_instances', {
        mapping: { js1: 2, '2': 1 }
      });
    });
    expect(remapRes.status).toBe('remapped');
    expect(remapRes.hardwareMapping).toEqual({ js1: 'js2', js2: 'js1' });
    expect(spies.onSetHardwareMapping).toHaveBeenCalled();

    // Reset joystick instances
    let resetRes: any;
    await act(async () => {
      resetRes = await result.current.executeRegisteredTool('remap_joystick_instances', {
        reset: true
      });
    });
    expect(resetRes.status).toBe('reset');
    expect(resetRes.hardwareMapping).toEqual({ js1: 'js1', js2: 'js2' });

    // 3. Configure joystick options (inversions, deadzones, sensitivities)
    let optRes: any;
    await act(async () => {
      optRes = await result.current.executeRegisteredTool('configure_joystick_options', {
        instance: 2,
        productName: 'VKBsim Gladiator EVO L OTA',
        inversions: { flight_move_strafe_longitudinal: true },
        deadzones: { x: 0.04, y: 0.04 },
        sensitivities: { x: 1.15 }
      });
    });
    expect(optRes.status).toBe('configured');
    expect(optRes.device.productName).toBe('VKBsim Gladiator EVO L OTA');
    expect(spies.onApplyDeviceOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        instance: 2,
        inversions: { flight_move_strafe_longitudinal: true }
      })
    );

    // 4. Workspace control: switch tab, filter search, load preset, and export XML
    let wsRes: any;
    await act(async () => {
      wsRes = await result.current.executeRegisteredTool('workspace_control', {
        activeTab: 'conflicts',
        searchQuery: 'v_pitch',
        deviceScope: 'all',
        loadPreset: 'vkb_omni',
        exportXml: true
      });
    });
    expect(spies.onLoadSamplePreset).toHaveBeenCalledWith(
      'vkb_evo_hosas_omni.xml',
      'Dual VKB (Right + Omni Left)'
    );
    expect(spies.onSetActiveTab).toHaveBeenCalledWith('conflicts');
    expect(spies.onSetSearchQuery).toHaveBeenCalledWith('v_pitch');
    expect(spies.onSetDeviceScope).toHaveBeenCalledWith('all');
    expect(wsRes.exportedXml).toContain('<ActionMaps');
    expect(wsRes.exportedXml).toContain('profileName="webmcp_test_profile"');
  });

  it('renders WebMCP header badge and WebMCP Bridge diagnostic panel in App', async () => {
    render(<App />);

    const headerBadge = screen.getByTestId('webmcp-header-badge');
    expect(headerBadge).toBeTruthy();
    expect(headerBadge.textContent).toContain('WebMCP: 9 AI Tools');

    fireEvent.click(headerBadge);

    const bridgePanel = await screen.findByTestId('webmcp-bridge-panel');
    expect(bridgePanel).toBeTruthy();
    expect(bridgePanel.textContent).toContain('9 Tools Ready');

    const runBtn = screen.getByRole('button', { name: /Run Tool/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      const output = screen.getByTestId('webmcp-test-output');
      expect(output.textContent).toContain('"profileName": "dual_vkb_evo_scm"');
    });
  });
});
