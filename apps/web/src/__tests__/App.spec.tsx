import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App';

describe('App Main Component', () => {
  let originalCreateObjectURL: any;
  let originalRevokeObjectURL: any;
  let originalFetch: any;

  beforeEach(() => {
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    originalFetch = global.fetch;

    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              game_version: '12660092',
              game_branch: 'sc-alpha-4.10.1',
              game_build_date: 'Thu Sep 24 2026'
            })
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders top HUD header, device rack, and active tab by default', () => {
    render(<App />);

    expect(screen.getByText('STAR CITIZEN KEYBINDING ARCHITECT')).toBeDefined();
    expect(screen.getByRole('button', { name: /Keybinding Matrix/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Device Inspector & Live HUD/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Conflict Diagnostics/i })).toBeDefined();
    expect(screen.getByText('Hardware Device Rack & Logical Instance Remapper')).toBeDefined();
  });

  it('switches between Matrix, Inspector, and Conflict Diagnostics tabs', () => {
    render(<App />);

    // 1. Switch to Hardware Inspector
    fireEvent.click(screen.getByRole('button', { name: /Device Inspector & Live HUD/i }));
    expect(screen.getByText(/Physical Button Matrix/i)).toBeDefined();

    // 2. Switch to Conflict Diagnostics
    fireEvent.click(screen.getByRole('button', { name: /Conflict Diagnostics/i }));
    expect(screen.getByText('Conflict Diagnostics Engine')).toBeDefined();

    // 3. Switch back to Matrix
    fireEvent.click(screen.getByRole('button', { name: /Keybinding Matrix/i }));
    expect(screen.getByText('Keybinding Matrix & Rebind Engine')).toBeDefined();
  });

  it('toggles Hardware Listening mode from top HUD', () => {
    render(<App />);

    const listenBtn = screen.getByTitle(/Listen to physical joystick\/gamepad presses to jump to binding/i);
    fireEvent.click(listenBtn);

    expect(screen.getByText(/Hardware Listening Mode active/i)).toBeDefined();

    // Toggle off
    fireEvent.click(listenBtn);
    expect(screen.queryByText(/Hardware Listening Mode active/i)).toBeNull();
  });

  it('exports actionmaps XML when Export XML button is clicked', () => {
    render(<App />);

    const exportBtn = screen.getByText('Export XML');
    fireEvent.click(exportBtn);

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('handles XML file upload from user computer', async () => {
    const customXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="uploaded_custom">
  <options type="joystick" instance="1" Product="Custom VKB Stick"/>
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
    </action>
  </actionmap>
</ActionMaps>`;

    class MockFileReader {
      onload: any;
      readAsText() {
        if (this.onload) {
          this.onload({ target: { result: customXml } });
        }
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const { container } = render(<App />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    const file = new File([customXml], 'layout_custom_exported.xml', { type: 'text/xml' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Custom VKB Stick')).toBeDefined();
    });
  });

  it('opens and closes version info modal', () => {
    render(<App />);

    const versionBtn = screen.getByTitle('Click to view Star Citizen Game Version Compatibility details');
    fireEvent.click(versionBtn);

    expect(screen.getByText('Game Version Compatibility & Architecture')).toBeDefined();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Game Version Compatibility & Architecture')).toBeNull();
  });

  it('opens and closes contributor tools modal', () => {
    render(<App />);

    const toolsBtn = screen.getByText('Contributor Tools');
    fireEvent.click(toolsBtn);

    expect(screen.getByText(/Contributor Hub & Extraction Daemon/i)).toBeDefined();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Contributor Hub & Extraction Daemon/i)).toBeNull();
  });

  it('dismisses top disclaimer alert banner', () => {
    render(<App />);

    expect(screen.getByText(/Early Development Pilot Advisory:/i)).toBeDefined();

    const dismissBtn = screen.getByTitle('Dismiss advisory');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/Early Development Pilot Advisory:/i)).toBeNull();
  });

  it('opens and closes Hardware Studio from Device Rack', () => {
    render(<App />);

    const studioBtn = screen.getByText('Hardware Studio & Presets');
    fireEvent.click(studioBtn);

    expect(screen.getByText(/HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR/i)).toBeDefined();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR/i)).toBeNull();
  });

  it('opens Binding Editor modal from Matrix and saves updated inputs', () => {
    render(<App />);

    const editBtns = screen.getAllByTitle('Edit bindings for this action');
    fireEvent.click(editBtns[0]);

    expect(screen.getByText('Save Changes')).toBeDefined();

    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.queryByText('Save Changes')).toBeNull();
  });

  it('switches device scope to keyboard and all devices', () => {
    render(<App />);

    // Switch to Conflict Diagnostics tab
    fireEvent.click(screen.getByRole('button', { name: /Conflict Diagnostics/i }));

    // Click All Devices scope
    fireEvent.click(screen.getByText('All Devices'));

    // Click Keyboard scope
    fireEvent.click(screen.getByText('Keyboard'));

    // Switch back to Joysticks
    fireEvent.click(screen.getByText('Joysticks (HOTAS/HOSAS)'));
  });

  it('opens Hardware Studio from the top toolbar Hardware Studio button', () => {
    render(<App />);

    // The toolbar button text says "Hardware Studio" not "Hardware Studio & Presets"
    const studioToolbarBtns = screen.getAllByText(/Hardware Studio/i);
    // There are two: one in toolbar, one in DeviceRack. Click the toolbar one
    fireEvent.click(studioToolbarBtns[0]);

    expect(screen.getByText(/HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR/i)).toBeDefined();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
  });

  it('loads a sample preset XML successfully', async () => {
    const sampleXml = `<?xml version="1.0"?>
<ActionMaps version="1" profileName="sample_preset">
  <options type="joystick" instance="1" Product="Sample Stick"/>
  <actionmap name="spaceship_movement">
    <action name="v_pitch"><rebind input="js1_pitch"/></action>
  </actionmap>
</ActionMaps>`;

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ game_version: '12660092', game_branch: 'sc-alpha-4.10.1' }) });
      }
      if (url.includes('/samples/')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(sampleXml) });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<App />);

    const presetBtn = screen.getByText('Dual VKB EVO (HOSAS)');
    fireEvent.click(presetBtn);

    await waitFor(() => {
      expect(screen.getByText('Sample Stick')).toBeDefined();
    });
  });

  it('shows alert on sample preset fetch failure', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: false });
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    const presetBtn = screen.getByText('Thrustmaster T.16000M (HOTAS)');
    fireEvent.click(presetBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/Error loading preset/));
    });
    alertSpy.mockRestore();
  });

  it('loads live game data from /game-data.json via Load Live Data button', async () => {
    const liveXml = `<?xml version="1.0"?>
<ActionMaps version="1" profileName="live_game">
  <options type="joystick" instance="1" Product="Live Stick"/>
  <actionmap name="spaceship_movement">
    <action name="v_pitch"><rebind input="js1_pitch"/></action>
  </actionmap>
</ActionMaps>`;

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            game_version: '99999999',
            game_branch: 'sc-alpha-9.9.9',
            game_build_date: 'Mon Jan 1 2099',
            default_profile_xml: liveXml
          })
        });
      }
      return Promise.reject(new Error('Unknown'));
    });

    render(<App />);

    // Open contributor tools to access Load Live Data button
    fireEvent.click(screen.getByText('Contributor Tools'));
    expect(screen.getByText(/Contributor Hub/i)).toBeDefined();

    const loadBtn = screen.getByText('Preview Bundled LIVE Data');
    fireEvent.click(loadBtn);

    await waitFor(() => {
      expect(screen.getByText('Live Stick')).toBeDefined();
    });
  });

  it('shows alert and sets status on live data load with missing profile', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ game_version: '12660092', game_branch: 'sc-alpha-4.10.1' })
        });
      }
      return Promise.reject(new Error('Unknown'));
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    fireEvent.click(screen.getByText('Contributor Tools'));
    fireEvent.click(screen.getByText('Preview Bundled LIVE Data'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/Error loading LIVE/));
    });
    alertSpy.mockRestore();
  });

  it('syncs from daemon successfully', async () => {
    const daemonXml = `<?xml version="1.0"?>
<ActionMaps version="1" profileName="daemon_profile">
  <options type="joystick" instance="1" Product="Daemon Stick"/>
  <actionmap name="spaceship_movement">
    <action name="v_pitch"><rebind input="js1_pitch"/></action>
  </actionmap>
</ActionMaps>`;

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') {
        return Promise.resolve({ ok: false });
      }
      if (url.includes('127.0.0.1:8765')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            game_version: '55555555',
            game_branch: 'sc-alpha-5.0.0',
            default_profile_xml: daemonXml
          })
        });
      }
      return Promise.reject(new Error('Unknown'));
    });

    render(<App />);

    fireEvent.click(screen.getByText('Contributor Tools'));
    const syncBtn = screen.getByText('Local Dev Sync (127.0.0.1:8765)');
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(screen.getByText('Daemon Stick')).toBeDefined();
    });
  });

  it('shows alert when daemon is offline', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/game-data.json') return Promise.resolve({ ok: false });
      return Promise.reject(new Error('Connection refused'));
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);

    fireEvent.click(screen.getByText('Contributor Tools'));
    fireEvent.click(screen.getByText('Local Dev Sync (127.0.0.1:8765)'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/sc-daemon/));
    });
    alertSpy.mockRestore();
  });

  it('handles JSON game-data file upload', async () => {
    const jsonContent = JSON.stringify({
      game_version: '77777777',
      game_branch: 'sc-alpha-7.7.7',
      default_profile_xml: `<?xml version="1.0"?>
<ActionMaps version="1" profileName="json_upload">
  <options type="joystick" instance="1" Product="JSON Uploaded Stick"/>
  <actionmap name="spaceship_movement">
    <action name="v_pitch"><rebind input="js1_pitch"/></action>
  </actionmap>
</ActionMaps>`
    });

    class MockFileReader {
      onload: any;
      readAsText() {
        if (this.onload) this.onload({ target: { result: jsonContent } });
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const { container } = render(<App />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([jsonContent], 'game-data.json', { type: 'application/json' });
    Object.defineProperty(file, 'name', { value: 'game-data.json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('JSON Uploaded Stick')).toBeDefined();
    });
  });

  it('shows alert on file parse error', async () => {
    class MockFileReader {
      onload: any;
      readAsText() {
        if (this.onload) this.onload({ target: { result: '<<<invalid xml' } });
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<App />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['<<<invalid'], 'bad.xml', { type: 'text/xml' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/Error parsing file/));
    });
    alertSpy.mockRestore();
  });

  it('triggers handleAutoFix when removing an obsolete action from Conflict Diagnostics', async () => {
    const xmlWithDeprecated = `<?xml version="1.0"?>
<ActionMaps version="1" profileName="autofix_test">
  <options type="joystick" instance="1" Product="VKB Stick"/>
  <actionmap name="spaceship_movement">
    <action name="v_ifcs_toggle_cruise_control">
      <rebind input="js1_button2"/>
    </action>
    <action name="v_boost">
      <rebind input="js1_button2"/>
    </action>
  </actionmap>
</ActionMaps>`;

    class MockFileReader {
      onload: any;
      readAsText() {
        if (this.onload) this.onload({ target: { result: xmlWithDeprecated } });
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const { container } = render(<App />);

    // Upload custom profile with obsolete action collision
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([xmlWithDeprecated], 'autofix.xml', { type: 'text/xml' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Navigate to Conflict Diagnostics tab
    const conflictTabBtn = screen.getByRole('button', { name: /Conflict Diagnostics/i });
    fireEvent.click(conflictTabBtn);

    // Verify obsolete action warning is displayed
    await waitFor(() => {
      expect(screen.getByText(/Remove Obsolete Action \(v_ifcs_toggle_cruise_control\)/i)).toBeDefined();
    });

    // Click the Auto Fix button
    const autoFixBtn = screen.getByRole('button', {
      name: /Remove Obsolete Action \(v_ifcs_toggle_cruise_control\)/i
    });
    fireEvent.click(autoFixBtn);

    // The obsolete collision should now be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Remove Obsolete Action \(v_ifcs_toggle_cruise_control\)/i)).toBeNull();
    });
  });
});
