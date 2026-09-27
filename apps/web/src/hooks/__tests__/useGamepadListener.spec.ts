import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamepadListener } from '../useGamepadListener';
import type { GamepadDetectedInput } from '@sc-mapping/shared-types';

describe('useGamepadListener hook', () => {
  let rafCallbacks: Array<FrameRequestCallback> = [];
  let nextRafId = 1;
  let cancelledRafIds: number[] = [];
  let originalGetGamepads: any;

  beforeEach(() => {
    rafCallbacks = [];
    nextRafId = 1;
    cancelledRafIds = [];

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafCallbacks.push(cb);
      return id;
    });

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      cancelledRafIds.push(id);
    });

    originalGetGamepads = navigator.getGamepads;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalGetGamepads) {
      Object.defineProperty(navigator, 'getGamepads', {
        value: originalGetGamepads,
        configurable: true,
        writable: true
      });
    }
  });

  function triggerRaf(time = performance.now()) {
    const currentCallbacks = [...rafCallbacks];
    rafCallbacks = [];
    currentCallbacks.forEach(cb => cb(time));
  }

  function mockGamepads(pads: (Partial<Gamepad> | null)[]) {
    Object.defineProperty(navigator, 'getGamepads', {
      value: vi.fn(() => pads as Gamepad[]),
      configurable: true,
      writable: true
    });
  }

  it('does not poll when isListening is false', () => {
    const onInputDetected = vi.fn();
    const { result } = renderHook(() =>
      useGamepadListener({ isListening: false, onInputDetected })
    );

    expect(result.current.activeDevices).toEqual([]);
    expect(rafCallbacks.length).toBe(0);
    expect(onInputDetected).not.toHaveBeenCalled();
  });

  it('starts polling when isListening is true and cancels on unmount', () => {
    mockGamepads([]);
    const onInputDetected = vi.fn();
    const { unmount } = renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    expect(rafCallbacks.length).toBe(1);
    unmount();
    expect(cancelledRafIds.length).toBeGreaterThanOrEqual(1);
  });

  it('gracefully handles missing navigator.getGamepads', () => {
    Object.defineProperty(navigator, 'getGamepads', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    act(() => {
      triggerRaf();
    });

    expect(onInputDetected).not.toHaveBeenCalled();
  });

  it('ignores disconnected or null gamepads and updates activeDevices', () => {
    const padConnected: Partial<Gamepad> = {
      id: 'VKB Gladiator EVO R (js1)',
      connected: true,
      buttons: [],
      axes: []
    };
    const padDisconnected: Partial<Gamepad> = {
      id: 'Ghost Stick',
      connected: false,
      buttons: [],
      axes: []
    };

    mockGamepads([padConnected, null, padDisconnected]);
    const onInputDetected = vi.fn();

    const { result } = renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    act(() => {
      triggerRaf();
    });

    expect(result.current.activeDevices).toEqual(['VKB Gladiator EVO R (js1)']);
    expect(onInputDetected).not.toHaveBeenCalled();
  });

  it('detects button press on leading edge and does not re-trigger while held', () => {
    let btnState = { pressed: false, value: 0 };
    const pad: Partial<Gamepad> = {
      id: 'VKB Stick',
      connected: true,
      buttons: [btnState as GamepadButton],
      axes: []
    };
    mockGamepads([pad]);

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    // Initial tick with button not pressed
    act(() => { triggerRaf(); });
    expect(onInputDetected).not.toHaveBeenCalled();

    // Press button
    btnState.pressed = true;
    btnState.value = 1.0;
    act(() => { triggerRaf(); });

    expect(onInputDetected).toHaveBeenCalledTimes(1);
    expect(onInputDetected).toHaveBeenCalledWith({
      gamepadIndex: 0,
      logicalDeviceInstance: 1,
      scInputString: 'js1_button1',
      inputType: 'button',
      rawValue: 1.0
    });

    // Hold button - tick again
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Release button
    btnState.pressed = false;
    btnState.value = 0;
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Press button again -> leading edge triggers second event
    btnState.pressed = true;
    btnState.value = 1.0;
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(2);
  });

  it('detects button press via analog value > 0.5', () => {
    const btnState = { pressed: false, value: 0.8 };
    const pad: Partial<Gamepad> = {
      id: 'Throttle',
      connected: true,
      buttons: [{ pressed: false, value: 0 }, btnState as GamepadButton],
      axes: []
    };
    mockGamepads([null, pad]); // Pad index 1 -> js2

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    act(() => { triggerRaf(); });

    expect(onInputDetected).toHaveBeenCalledTimes(1);
    expect(onInputDetected).toHaveBeenCalledWith({
      gamepadIndex: 1,
      logicalDeviceInstance: 2,
      scInputString: 'js2_button2',
      inputType: 'button',
      rawValue: 0.8
    });
  });

  it('detects DirectInput POV Hat resting sentinel and subsequent direction shifts', () => {
    const pad: Partial<Gamepad> = {
      id: 'HOTAS Stick',
      connected: true,
      buttons: [],
      axes: [1.2857] // DirectInput Hat resting sentinel
    };
    mockGamepads([pad]);

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    // Tick 1: Resting sentinel registers axis 0 as hat 1
    act(() => { triggerRaf(); });
    expect(onInputDetected).not.toHaveBeenCalled();

    // Tick 2: Deflect hat to UP (-1.0)
    pad.axes = [-1.0];
    act(() => { triggerRaf(); });

    expect(onInputDetected).toHaveBeenCalledWith(
      expect.objectContaining({
        gamepadIndex: 0,
        logicalDeviceInstance: 1,
        scInputString: 'js1_hat1_up',
        inputType: 'button'
      })
    );

    // Tick 3: Hold hat in UP direction - no new call
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Tick 4: Switch direction directly to RIGHT (-0.42857)
    pad.axes = [-0.42857];
    act(() => { triggerRaf(); });

    expect(onInputDetected).toHaveBeenCalledTimes(2);
    expect(onInputDetected).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scInputString: 'js1_hat1_right',
        inputType: 'button'
      })
    );

    // Tick 5: Center hat (> 1.05 or sentinel)
    pad.axes = [1.2857];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(2);
  });

  it('detects second hat on same gamepad correctly', () => {
    const pad: Partial<Gamepad> = {
      id: 'Dual Hat Stick',
      connected: true,
      buttons: [],
      axes: [1.2857, 1.2857] // Two hat axes at rest
    };
    mockGamepads([pad]);

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    // Register both axes as hats
    act(() => { triggerRaf(); });

    // Deflect second hat (axis 1) to DOWN (0.142857)
    pad.axes = [1.2857, 0.142857];
    act(() => { triggerRaf(); });

    expect(onInputDetected).toHaveBeenCalledWith(
      expect.objectContaining({
        scInputString: 'js1_hat2_down',
        inputType: 'button'
      })
    );
  });

  it('detects standard analog axes with deadzone thresholding', () => {
    const pad: Partial<Gamepad> = {
      id: 'Flight Stick',
      connected: true,
      buttons: [],
      axes: [0.1, -0.8, 0.0, 0.9, 0.0, 0.0, 0.0, 0.0, 0.75]
    };
    mockGamepads([pad]);

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, axisThreshold: 0.65, onInputDetected })
    );

    act(() => { triggerRaf(); });

    // Axis 0 (0.1) is below 0.65 threshold -> ignored
    // Axis 1 (-0.8) is above 0.65 -> 'y' axis
    // Axis 3 (0.9) is above 0.65 -> 'rotx' axis
    // Axis 8 (0.75) is beyond predefined AXIS_NAMES -> 'axis_8'
    expect(onInputDetected).toHaveBeenCalledWith(
      expect.objectContaining({
        scInputString: 'js1_y',
        inputType: 'axis',
        rawValue: -0.8
      })
    );
    expect(onInputDetected).toHaveBeenCalledWith(
      expect.objectContaining({
        scInputString: 'js1_rotx',
        inputType: 'axis',
        rawValue: 0.9
      })
    );
    expect(onInputDetected).toHaveBeenCalledWith(
      expect.objectContaining({
        scInputString: 'js1_axis_8',
        inputType: 'axis',
        rawValue: 0.75
      })
    );
  });

  it('does not repeat axis event while axis remains deflected', () => {
    const pad: Partial<Gamepad> = {
      id: 'Stick',
      connected: true,
      buttons: [],
      axes: [0.0]
    };
    mockGamepads([pad]);

    const onInputDetected = vi.fn();
    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    // Center
    act(() => { triggerRaf(); });
    expect(onInputDetected).not.toHaveBeenCalled();

    // Deflect X
    pad.axes = [0.85];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Hold deflected
    pad.axes = [0.88];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Return to center
    pad.axes = [0.05];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Deflect again
    pad.axes = [0.9];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(2);
  });

  it('cancels polling when isListening toggles from true to false', () => {
    mockGamepads([]);
    const onInputDetected = vi.fn();
    const { rerender } = renderHook(
      ({ isListening }) => useGamepadListener({ isListening, onInputDetected }),
      { initialProps: { isListening: true } }
    );

    expect(rafCallbacks.length).toBe(1);

    // Toggle isListening to false
    rerender({ isListening: false });
    expect(cancelledRafIds.length).toBeGreaterThanOrEqual(1);
  });

  it('handles hat returning to centered rest position without sentinel', () => {
    const pad: Partial<Gamepad> = {
      id: 'Stick with Hat',
      connected: true,
      buttons: [],
      axes: [1.2857] // Sentinel identifies it as hat
    };
    mockGamepads([pad]);
    const onInputDetected = vi.fn();

    renderHook(() =>
      useGamepadListener({ isListening: true, onInputDetected })
    );

    // Tick 1: identify hat
    act(() => { triggerRaf(); });

    // Tick 2: Deflect hat to up (-1.0)
    pad.axes = [-1.0];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(1);

    // Tick 3: Hat direction is null (e.g. out of range or uncentered without direction)
    pad.axes = [-2.0]; // decodeHatAxis returns direction: null
    act(() => { triggerRaf(); });

    // Tick 4: Deflect again to up
    pad.axes = [-1.0];
    act(() => { triggerRaf(); });
    expect(onInputDetected).toHaveBeenCalledTimes(2);
  });
});
