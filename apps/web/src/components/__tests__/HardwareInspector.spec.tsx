import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
  </actionmap>
</ActionMaps>
`;

describe('HardwareInspector Component', () => {
  const doc = ActionMapsParser.parseXML(TEST_XML);

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
});
