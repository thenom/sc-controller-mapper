import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HardwareInspector } from '../HardwareInspector';
import { ActionMapsParser } from '@sc-mapping/parser';

const TEST_XML = `
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="test">
  <options type="joystick" instance="1" Product="VKB Gladiator Right (js1)">
  </options>
  <options type="joystick" instance="2" Product="VKB Gladiator Left (js2)">
  </options>
  <actionmap name="spaceship_general">
    <action name="v_boost">
      <rebind input="js1_button4"/>
    </action>
    <action name="v_strafe_up">
      <rebind input="js2_button2"/>
    </action>
    <action name="v_target_cycle">
      <rebind input="js1_hat1_up"/>
    </action>
    <action name="v_pitch_axis">
      <rebind input="js1_y"/>
    </action>
    <action name="v_chord_action">
      <rebind input="lalt+js1_button5"/>
    </action>
  </actionmap>
</ActionMaps>
`;

describe('HardwareInspector Component', () => {
  const doc = ActionMapsParser.parseXML(TEST_XML);
  let rafCallback: FrameRequestCallback | null = null;
  let rafIdCounter = 0;

  beforeEach(() => {
    rafCallback = null;
    rafIdCounter = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return ++rafIdCounter;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stepFrame() {
    act(() => {
      const cb = rafCallback;
      if (cb) {
        cb(performance.now());
      }
    });
  }

  it('renders with js1 active when selectedDeviceIndex is 0', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectDeviceIndex={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getByText(/DirectInput ID: js1/i)).toBeDefined();
    expect(screen.getAllByText(/VKB Gladiator Right/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders with js2 active when selectedDeviceIndex is 1', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={1}
        onSelectDeviceIndex={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getByText(/DirectInput ID: js2/i)).toBeDefined();
    expect(screen.getAllByText(/VKB Gladiator Left/i).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectDeviceIndex when user selects a different device from the dropdown', () => {
    const handleSelectDevice = vi.fn();
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectDeviceIndex={handleSelectDevice}
        onSelectAction={vi.fn()}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    expect(handleSelectDevice).toHaveBeenCalledWith(1);
  });

  it('preserves selected trigger and displays bound action for js2', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={1}
        selectedInput="js2_button2"
        onSelectDeviceIndex={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getByText(/DirectInput ID: js2/i)).toBeDefined();
    expect(screen.getByText(/Inspected Hardware Trigger/i)).toBeDefined();
    expect(screen.getAllByText(/js2_button2/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/v_strafe_up/i).length).toBeGreaterThanOrEqual(1);
  });

  it('selects button from physical button matrix, displays bound action, and triggers onSelectAction', () => {
    const handleSelectAction = vi.fn();

    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectDeviceIndex={vi.fn()}
        onSelectAction={handleSelectAction}
      />
    );

    // Click Physical Button 4 (bound to v_boost in test doc)
    const btn4 = screen.getByTitle('Physical Button 4 (XML: js1_button4)');
    fireEvent.click(btn4);

    expect(screen.getAllByText('js1_button4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('v_boost').length).toBeGreaterThanOrEqual(1);

    // Click Jump to Action button
    const jumpBtn = screen.getByTitle('Jump to action in keybinding matrix');
    fireEvent.click(jumpBtn);
    expect(handleSelectAction).toHaveBeenCalledWith('v_boost');
  });

  it('shows unassigned trigger state when clicking an unbound physical button', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectDeviceIndex={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    const btn10 = screen.getByTitle('Physical Button 10 (XML: js1_button10)');
    fireEvent.click(btn10);

    expect(screen.getByText(/No game actions are currently mapped to/i)).toBeDefined();
  });

  it('supports uncontrolled device and input state when callbacks are not provided', () => {
    render(<HardwareInspector doc={doc} onSelectAction={vi.fn()} />);

    expect(screen.getByText(/DirectInput ID: js1/i)).toBeDefined();

    // Select second device via dropdown in uncontrolled mode
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    expect(screen.getByText(/DirectInput ID: js2/i)).toBeDefined();

    // Click button 2 on js2 in uncontrolled mode
    const btn2 = screen.getByTitle('Physical Button 2 (XML: js2_button2)');
    fireEvent.click(btn2);
    expect(screen.getAllByText('js2_button2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('v_strafe_up').length).toBeGreaterThanOrEqual(1);
  });

  it('triggers onSelectInput when controlled onSelectInput callback is provided', () => {
    const handleSelectInput = vi.fn();
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectInput={handleSelectInput}
        onSelectAction={vi.fn()}
      />
    );

    const btn3 = screen.getByTitle('Physical Button 3 (XML: js1_button3)');
    fireEvent.click(btn3);
    expect(handleSelectInput).toHaveBeenCalledWith('js1_button3');
  });

  it('detects chorded actions where the inspected button is one of the inputs', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        selectedInput="js1_button5"
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getAllByText('v_chord_action').length).toBeGreaterThanOrEqual(1);
  });

  it('inspects POV hat switches for all 8 cardinal and diagonal directions', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectAction={vi.fn()}
      />
    );

    const directions = [
      { titleRegex: /Up \(0°\)/, code: 'js1_hat1_up' },
      { titleRegex: /Up-Right \(45°\)/, code: 'js1_hat1_up_right' },
      { titleRegex: /Right \(90°\)/, code: 'js1_hat1_right' },
      { titleRegex: /Down-Right \(135°\)/, code: 'js1_hat1_down_right' },
      { titleRegex: /Down \(180°\)/, code: 'js1_hat1_down' },
      { titleRegex: /Down-Left \(225°\)/, code: 'js1_hat1_down_left' },
      { titleRegex: /Left \(270°\)/, code: 'js1_hat1_left' },
      { titleRegex: /Up-Left \(315°\)/, code: 'js1_hat1_up_left' }
    ];

    for (const dir of directions) {
      const btn = screen.getByTitle(dir.titleRegex);
      fireEvent.click(btn);
      expect(screen.getAllByText(dir.code).length).toBeGreaterThanOrEqual(1);
    }

    // js1_hat1_up is bound to v_target_cycle in TEST_XML
    const hatUp = screen.getByTitle(/Up \(0°\)/);
    fireEvent.click(hatUp);
    expect(screen.getAllByText('v_target_cycle').length).toBeGreaterThanOrEqual(1);
  });

  it('inspects analog axis deflection meters and displays bound actions', () => {
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectAction={vi.fn()}
      />
    );

    // Click Y axis container (bound to v_pitch_axis)
    const yAxisLabel = screen.getByText('Y');
    const axisContainer = yAxisLabel.closest('.cursor-pointer');
    expect(axisContainer).not.toBeNull();
    fireEvent.click(axisContainer!);

    expect(screen.getAllByText('js1_y').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('v_pitch_axis').length).toBeGreaterThanOrEqual(1);
  });

  it('renders fallback device list when doc is null or has no joysticks', () => {
    render(<HardwareInspector doc={null} onSelectAction={vi.fn()} />);

    expect(screen.getByText(/Joystick 1 \(Primary Flight Stick\)/i)).toBeDefined();
    expect(screen.getByText(/DirectInput ID: js1/i)).toBeDefined();
  });

  it('resets selectedDeviceIndex to 0 if out of range', () => {
    const handleSelectDevice = vi.fn();
    render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={99}
        onSelectDeviceIndex={handleSelectDevice}
        onSelectAction={vi.fn()}
      />
    );

    expect(handleSelectDevice).toHaveBeenCalledWith(0);
  });

  it('opens and closes hardware inspector help guide modal via close button and X icon', () => {
    const { container } = render(
      <HardwareInspector
        doc={doc}
        selectedDeviceIndex={0}
        onSelectDeviceIndex={vi.fn()}
        onSelectAction={vi.fn()}
      />
    );

    expect(screen.getAllByText('Hardware Device Inspector & Live Controller HUD').length).toBe(1);

    const helpBtn = screen.getByTitle('Learn how the Hardware Inspector works');
    fireEvent.click(helpBtn);

    expect(screen.getAllByText('Hardware Device Inspector & Live Controller HUD').length).toBe(2);

    // Close via Close button
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(screen.getAllByText('Hardware Device Inspector & Live Controller HUD').length).toBe(1);

    // Reopen and close via X button
    fireEvent.click(helpBtn);
    expect(screen.getAllByText('Hardware Device Inspector & Live Controller HUD').length).toBe(2);
    const xButton = container.querySelector('.lucide-x')?.closest('button');
    expect(xButton).not.toBeNull();
    fireEvent.click(xButton!);
    expect(screen.getAllByText('Hardware Device Inspector & Live Controller HUD').length).toBe(1);
  });

  it('polls Gamepad API: detects live gamepad, active buttons, axes, and POV hats', () => {
    const mockGamepad: any = {
      index: 0,
      id: 'Live Flight Stick (js1)',
      connected: true,
      buttons: [
        { pressed: false, value: 0.0 }, // No button pressed initially
        { pressed: false, value: 0.0 }
      ],
      axes: [
        0.75,   // Axis 0 (X) deflected > 0.5 -> sets latestInput = js1_x (line 216)
        0.05,   // Axis 1 (Y) below deadzone 0.15
        1.2857  // Axis 2 hat resting sentinel (> 1.05)
      ]
    };

    vi.stubGlobal('navigator', {
      ...navigator,
      getGamepads: () => [mockGamepad]
    });

    render(<HardwareInspector doc={doc} onSelectAction={vi.fn()} />);

    // Step animation frame to run poll loop
    stepFrame();

    // Verify live controller badge
    expect(screen.getByText(/Live Hardware Connected/i)).toBeDefined();

    // Latest input should automatically reflect active axis input (js1_x)
    expect(screen.getAllByText('js1_x').length).toBeGreaterThanOrEqual(1);

    // Frame 1b: Press button 1
    mockGamepad.buttons[0].pressed = true;
    mockGamepad.buttons[0].value = 1.0;
    stepFrame();
    expect(screen.getAllByText('js1_button1').length).toBeGreaterThanOrEqual(1);

    // Frame 2: Hat deflected to Up (-1.0), release button and reset axis 0 so latestInput comes from hat
    mockGamepad.axes[0] = 0.0;
    mockGamepad.axes[2] = -1.0;
    // Add second hat axis at rest to exercise hat enumeration (line 183)
    mockGamepad.axes.push(1.2857);
    mockGamepad.buttons[0].pressed = false;
    mockGamepad.buttons[0].value = 0.0;

    stepFrame();

    // Active hat HUD should show UP
    expect(screen.getByText(/ACTIVE: UP/i)).toBeDefined();
    expect(screen.getAllByText('js1_hat1_up').length).toBeGreaterThanOrEqual(1);

    // Frame 3: Disconnect gamepad
    mockGamepad.connected = false;
    stepFrame();

    expect(screen.getByText(/Profile Simulation Mode/i)).toBeDefined();
  });

  it('cancels animation frame on unmount', () => {
    const cancelMock = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancelMock);

    const { unmount } = render(
      <HardwareInspector doc={doc} onSelectAction={vi.fn()} />
    );

    unmount();
    expect(cancelMock).toHaveBeenCalled();
  });
});
