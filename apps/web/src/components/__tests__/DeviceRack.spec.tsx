import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceRack } from '../DeviceRack';
import type { JoystickDeviceOption } from '@sc-mapping/shared-types';

describe('DeviceRack Component', () => {
  const sampleDevices: JoystickDeviceOption[] = [
    {
      type: 'joystick',
      instance: 1,
      productName: 'VKBsim Gladiator EVO R',
      productGuid: '0200231D-0000-0000-0000-504944564944',
      inversions: { pitch: true }
    },
    {
      type: 'joystick',
      instance: 2,
      productName: 'VKBsim Gladiator EVO L OTA',
      productGuid: '0201231D-0000-0000-0000-504944564944',
      inversions: { strafe_up: true, strafe_forward: true }
    }
  ];

  it('renders empty state message when no joystick devices are loaded', () => {
    render(
      <DeviceRack
        devices={[]}
        mapping={new Map()}
        onMappingChange={vi.fn()}
        activeGamepadIds={[]}
      />
    );

    expect(screen.getByText(/No joystick devices loaded/i)).toBeDefined();
  });

  it('renders joystick devices with product name, GUID, and inversions', () => {
    const mapping = new Map([[1, 1], [2, 2]]);

    render(
      <DeviceRack
        devices={sampleDevices}
        mapping={mapping}
        onMappingChange={vi.fn()}
        activeGamepadIds={['VKBsim Gladiator EVO R']}
      />
    );

    expect(screen.getByText('XML ID: js1')).toBeDefined();
    expect(screen.getByText('VKBsim Gladiator EVO R')).toBeDefined();
    expect(screen.getByText('Inversions: 1')).toBeDefined();
    expect(screen.getByText(/GUID: 0200231D/i)).toBeDefined();

    expect(screen.getByText('XML ID: js2')).toBeDefined();
    expect(screen.getByText('VKBsim Gladiator EVO L OTA')).toBeDefined();
    expect(screen.getByText('Inversions: 2')).toBeDefined();
  });

  it('highlights swapped logical instances with export indicators', () => {
    // js1 -> js2, js2 -> js1
    const swappedMapping = new Map([[1, 2], [2, 1]]);

    render(
      <DeviceRack
        devices={sampleDevices}
        mapping={swappedMapping}
        onMappingChange={vi.fn()}
        activeGamepadIds={[]}
      />
    );

    expect(screen.getByText('→ Export: js2')).toBeDefined();
    expect(screen.getByText('→ Export: js1')).toBeDefined();
  });

  it('handles drag-and-drop to swap device instances', () => {
    const handleMappingChange = vi.fn();
    const initialMapping = new Map([[1, 1], [2, 2]]);

    const { container } = render(
      <DeviceRack
        devices={sampleDevices}
        mapping={initialMapping}
        onMappingChange={handleMappingChange}
        activeGamepadIds={[]}
      />
    );

    const cards = container.querySelectorAll('[draggable="true"]');
    expect(cards.length).toBe(2);

    const card1 = cards[0];
    const card2 = cards[1];

    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn()
    };

    // 1. Drag start on card 1 (instance 1)
    fireEvent.dragStart(card1, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '1');

    // 2. Drag over card 2
    fireEvent.dragOver(card2);

    // 3. Drop on card 2 (target instance 2)
    fireEvent.drop(card2, { dataTransfer });

    expect(handleMappingChange).toHaveBeenCalledTimes(1);
    const updatedMap: Map<number, number> = handleMappingChange.mock.calls[0][0];
    expect(updatedMap.get(1)).toBe(2);
    expect(updatedMap.get(2)).toBe(1);
  });

  it('ignores drop on the same device instance or when no drag occurred', () => {
    const handleMappingChange = vi.fn();
    const initialMapping = new Map([[1, 1], [2, 2]]);

    const { container } = render(
      <DeviceRack
        devices={sampleDevices}
        mapping={initialMapping}
        onMappingChange={handleMappingChange}
        activeGamepadIds={[]}
      />
    );

    const cards = container.querySelectorAll('[draggable="true"]');
    const card1 = cards[0];

    // Drop without dragStart
    fireEvent.drop(card1);
    expect(handleMappingChange).not.toHaveBeenCalled();

    // Drag and drop onto self
    const dataTransfer = { setData: vi.fn() };
    fireEvent.dragStart(card1, { dataTransfer });
    fireEvent.drop(card1);
    expect(handleMappingChange).not.toHaveBeenCalled();
  });

  it('resets device mapping to 1:1 identity when Reset Mapping is clicked', () => {
    const handleMappingChange = vi.fn();
    const swappedMapping = new Map([[1, 2], [2, 1]]);

    render(
      <DeviceRack
        devices={sampleDevices}
        mapping={swappedMapping}
        onMappingChange={handleMappingChange}
        activeGamepadIds={[]}
      />
    );

    fireEvent.click(screen.getByText('Reset Mapping'));

    expect(handleMappingChange).toHaveBeenCalledTimes(1);
    const resetMap: Map<number, number> = handleMappingChange.mock.calls[0][0];
    expect(resetMap.get(1)).toBe(1);
    expect(resetMap.get(2)).toBe(2);
  });

  it('calls onOpenHardwareStudio when button is clicked', () => {
    const handleOpenStudio = vi.fn();

    render(
      <DeviceRack
        devices={sampleDevices}
        mapping={new Map()}
        onMappingChange={vi.fn()}
        activeGamepadIds={[]}
        onOpenHardwareStudio={handleOpenStudio}
      />
    );

    const studioBtn = screen.getByText('Hardware Studio & Presets');
    expect(studioBtn).toBeDefined();

    fireEvent.click(studioBtn);
    expect(handleOpenStudio).toHaveBeenCalledTimes(1);
  });

  it('opens and closes the Device Rack help modal', () => {
    render(
      <DeviceRack
        devices={sampleDevices}
        mapping={new Map()}
        onMappingChange={vi.fn()}
        activeGamepadIds={[]}
      />
    );

    const helpBtn = screen.getByTitle(/Learn what the Device Rack does/i);
    fireEvent.click(helpBtn);

    expect(screen.getByText('Device Rack & Logical Instance Remapping')).toBeDefined();
    expect(screen.getByText(/The Broken In-Game Command:/i)).toBeDefined();

    // Close modal via button
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/The Broken In-Game Command:/i)).toBeNull();

    // Open and close via X button
    fireEvent.click(helpBtn);
    const buttons = screen.getAllByRole('button');
    const xBtn = buttons.find(b => b.className.includes('hover:text-white transition-colors'));
    if (xBtn) fireEvent.click(xBtn);
    expect(screen.queryByText(/The Broken In-Game Command:/i)).toBeNull();
  });
});
