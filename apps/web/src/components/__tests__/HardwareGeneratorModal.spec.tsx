import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HardwareGeneratorModal } from '../HardwareGeneratorModal';

describe('HardwareGeneratorModal Component', () => {
  let originalGetGamepads: any;
  let originalClipboard: any;
  let originalCreateObjectURL: any;
  let originalRevokeObjectURL: any;

  beforeEach(() => {
    vi.useFakeTimers();

    originalGetGamepads = navigator.getGamepads;
    originalClipboard = navigator.clipboard;
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      configurable: true,
      writable: true
    });

    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();

    if (originalGetGamepads) {
      Object.defineProperty(navigator, 'getGamepads', {
        value: originalGetGamepads,
        configurable: true,
        writable: true
      });
    }
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
        writable: true
      });
    }
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  function mockGamepads(pads: (Partial<Gamepad> | null)[]) {
    Object.defineProperty(navigator, 'getGamepads', {
      value: vi.fn(() => pads as Gamepad[]),
      configurable: true,
      writable: true
    });
  }

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <HardwareGeneratorModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with default VKB Omni-Throttle preset when isOpen is true', () => {
    mockGamepads([]);
    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR/i)).toBeDefined();
    expect(screen.getByDisplayValue('VKBsim Gladiator EVO L OTA')).toBeDefined();
    expect(screen.getByDisplayValue('VKB')).toBeDefined();
  });

  it('switches hardware preset template and updates parameters', () => {
    mockGamepads([]);
    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const templateSelect = screen.getByDisplayValue(/VKB Gladiator EVO Omni-Throttle OTA/i);
    fireEvent.change(templateSelect, {
      target: { value: 'Thrustmaster T.16000M FCS Stick' }
    });

    expect(screen.getByDisplayValue('T.16000M')).toBeDefined();
    expect(screen.getByDisplayValue('Thrustmaster')).toBeDefined();
    expect(screen.getByDisplayValue('B10A044F-0000-0000-0000-504944564944')).toBeDefined();
  });

  it('allows manual modification of hardware parameters and toggling inversions', () => {
    mockGamepads([]);
    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Change Product String
    const productInput = screen.getByDisplayValue('VKBsim Gladiator EVO L OTA');
    fireEvent.change(productInput, { target: { value: 'Custom Flight Stick Pro' } });
    expect(screen.getByDisplayValue('Custom Flight Stick Pro')).toBeDefined();

    // Change Manufacturer
    const mfgInput = screen.getByDisplayValue('VKB');
    fireEvent.change(mfgInput, { target: { value: 'Virpil' } });
    expect(screen.getByDisplayValue('Virpil')).toBeDefined();

    // Change GUID
    const guidInput = screen.getByDisplayValue('0201231D-0000-0000-0000-504944564944');
    fireEvent.change(guidInput, { target: { value: '11112222-0000-0000-0000-504944564944' } });
    expect(screen.getByDisplayValue('11112222-0000-0000-0000-504944564944')).toBeDefined();

    // Change Role
    const roleSelect = screen.getByDisplayValue('Left Omni-Throttle (6DOF)');
    fireEvent.change(roleSelect, { target: { value: 'flight_stick_right' } });

    // Change Axis and Button Counts
    const axisInput = screen.getByDisplayValue('4');
    fireEvent.change(axisInput, { target: { value: '6' } });

    const btnInput = screen.getByDisplayValue('29');
    fireEvent.change(btnInput, { target: { value: '32' } });

    // Change Logical Instance
    const instanceSelect = screen.getByDisplayValue('js2 (Joystick #2)');
    fireEvent.change(instanceSelect, { target: { value: '3' } });
    expect(screen.getByDisplayValue('js3 (Joystick #3)')).toBeDefined();

    // Toggle pitch inversion
    const pitchCheckbox = screen.getByLabelText(/pitch/i);
    fireEvent.click(pitchCheckbox);
    expect((pitchCheckbox as HTMLInputElement).checked).toBe(true);

    // Verify generated XML options block reflects changes
    expect(screen.getByText(/instance="3"/)).toBeDefined();
    expect(screen.getByText(/Product="Custom Flight Stick Pro/)).toBeDefined();
    expect(screen.getByText(/invert axis="pitch" val="1"/)).toBeDefined();
  });

  it('sniffs connected gamepads and adopts hardware settings', () => {
    const mockPad: Partial<Gamepad> = {
      id: 'VKB Gladiator EVO (Vendor: 231d Product: 0200)',
      connected: true,
      buttons: [
        { pressed: false, value: 0 },
        { pressed: false, value: 0 },
        { pressed: false, value: 0 }
      ],
      axes: [0, 0, 0, 0]
    };

    mockGamepads([mockPad]);

    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Advance 100ms interval for gamepad polling
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText(/1 Detected/i)).toBeDefined();
    expect(screen.getByText(/js1 — VKB Gladiator EVO/i)).toBeDefined();

    // Simulate pressing Button 2
    mockPad.buttons![1] = { pressed: true, value: 1.0 };
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByText(/Button 2 pressed/i)).toBeDefined();

    // Click Adopt button
    fireEvent.click(screen.getByText('Adopt'));

    expect(screen.getByDisplayValue('VKB Gladiator EVO')).toBeDefined();
    expect(screen.getByDisplayValue('0200231D-0000-0000-0000-504944564944')).toBeDefined();
  });

  it('switches between artifact output tabs', () => {
    mockGamepads([]);
    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // 1. Hardware JSON tab
    fireEvent.click(screen.getByText('Hardware JSON'));
    expect(screen.getByText(/Standard JSON hardware definition format/i)).toBeDefined();
    expect(screen.getByText(/"manufacturer": "VKB"/i)).toBeDefined();

    // 2. Starter Profile XML tab
    fireEvent.click(screen.getByText('Starter Profile XML'));
    expect(screen.getByText(/Complete ready-to-load Star Citizen XML layout/i)).toBeDefined();
    expect(screen.getByText(/<ActionMaps version="1"/i)).toBeDefined();

    // 3. Community PR Template tab
    fireEvent.click(screen.getByText('Community PR Template'));
    expect(screen.getByText(/Formatted Markdown template to paste into a GitHub Issue/i)).toBeDefined();
    expect(screen.getByText(/🎮 Hardware Device Definition Contribution/i)).toBeDefined();

    // 4. Back to Options Block tab
    fireEvent.click(screen.getByText('<options> Block'));
    expect(screen.getByText(/Paste this directly into your Star Citizen/i)).toBeDefined();
  });

  it('copies generated artifact to clipboard with feedback', async () => {
    mockGamepads([]);
    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const copyBtn = screen.getByText('Copy XML');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(screen.getByText('Copied!')).toBeDefined();

    // Feedback resets after timer
    act(() => {
      vi.advanceTimersByTime(2600);
    });
    expect(screen.queryByText('Copied!')).toBeNull();
  });

  it('downloads file for each tab format', () => {
    mockGamepads([]);
    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Download XML
    fireEvent.click(screen.getByText('Download File'));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    // Download JSON
    fireEvent.click(screen.getByText('Hardware JSON'));
    fireEvent.click(screen.getByText('Download File'));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);

    // Download Layout
    fireEvent.click(screen.getByText('Starter Profile XML'));
    fireEvent.click(screen.getByText('Download File'));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(3);

    // Download Submission Markdown
    fireEvent.click(screen.getByText('Community PR Template'));
    fireEvent.click(screen.getByText('Download File'));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(4);
  });

  it('applies options to active profile and closes modal', () => {
    mockGamepads([]);
    const handleApplyOptions = vi.fn();
    const handleClose = vi.fn();

    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={handleClose}
        onApplyOptions={handleApplyOptions}
      />
    );

    const applyBtn = screen.getByText(/Apply <options> to Active Profile/i);
    fireEvent.click(applyBtn);

    expect(handleApplyOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'joystick',
        instance: 2,
        productName: 'VKBsim Gladiator EVO L OTA',
        productGuid: '0201231D-0000-0000-0000-504944564944',
        inversions: { strafe_up: true }
      })
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal on close buttons', () => {
    mockGamepads([]);
    const handleClose = vi.fn();

    render(
      <HardwareGeneratorModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
