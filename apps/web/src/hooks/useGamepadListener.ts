import { useEffect, useRef, useState, useCallback } from 'react';
import type { GamepadDetectedInput } from '@sc-mapping/shared-types';

interface UseGamepadListenerOptions {
  isListening: boolean;
  axisThreshold?: number; // Default 0.65
  onInputDetected: (input: GamepadDetectedInput) => void;
}

/**
 * HTML5 Gamepad API "Listening Mode" Hook
 * Listens for hardware button presses and axis deflections on connected HOTAS / Gamepads
 * and translates raw signals to Star Citizen input codes (e.g. js1_button3, js2_rotx).
 */
export function useGamepadListener({
  isListening,
  axisThreshold = 0.65,
  onInputDetected
}: UseGamepadListenerOptions) {
  const [activeDevices, setActiveDevices] = useState<string[]>([]);
  const animFrameId = useRef<number | null>(null);
  
  // Track button state to trigger only on leading-edge (press down)
  const prevButtonStates = useRef<Map<string, boolean>>(new Map());
  // Track axis state to prevent rapid repeating triggers while holding an axis deflected
  const prevAxisStates = useRef<Map<string, boolean>>(new Map());

  // Axis naming conventions matching CryEngine / Star Citizen mapping
  const AXIS_NAMES = ['x', 'y', 'z', 'rotx', 'roty', 'rotz', 'slider1', 'slider2'];

  const pollGamepads = useCallback(() => {
    if (!navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();
    const detectedNames: string[] = [];

    for (let gIdx = 0; gIdx < gamepads.length; gIdx++) {
      const gp = gamepads[gIdx];
      if (!gp || !gp.connected) continue;

      detectedNames.push(gp.id);
      const logicalInstance = gIdx + 1; // Star Citizen convention: js1, js2...

      // 1. Sample Buttons
      for (let bIdx = 0; bIdx < gp.buttons.length; bIdx++) {
        const btn = gp.buttons[bIdx];
        const stateKey = `gp_${gIdx}_btn_${bIdx}`;
        const isPressed = btn.pressed || btn.value > 0.5;
        const wasPressed = prevButtonStates.current.get(stateKey) || false;

        // Trigger on leading edge (key-down)
        if (isPressed && !wasPressed) {
          onInputDetected({
            gamepadIndex: gIdx,
            logicalDeviceInstance: logicalInstance,
            scInputString: `js${logicalInstance}_button${bIdx + 1}`,
            inputType: 'button',
            rawValue: btn.value
          });
        }
        prevButtonStates.current.set(stateKey, isPressed);
      }

      // 2. Sample Axes with Deadzone Thresholding
      for (let aIdx = 0; aIdx < gp.axes.length; aIdx++) {
        const val = gp.axes[aIdx];
        const stateKey = `gp_${gIdx}_axis_${aIdx}`;
        const isDeflected = Math.abs(val) > axisThreshold;
        const wasDeflected = prevAxisStates.current.get(stateKey) || false;

        if (isDeflected && !wasDeflected) {
          const axisName = AXIS_NAMES[aIdx] || `axis${aIdx + 1}`;
          onInputDetected({
            gamepadIndex: gIdx,
            logicalDeviceInstance: logicalInstance,
            scInputString: `js${logicalInstance}_${axisName}`,
            inputType: 'axis',
            rawValue: val
          });
        }
        prevAxisStates.current.set(stateKey, isDeflected);
      }
    }

    setActiveDevices(detectedNames);
    animFrameId.current = requestAnimationFrame(pollGamepads);
  }, [axisThreshold, onInputDetected]);

  useEffect(() => {
    if (!isListening) {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      return;
    }

    animFrameId.current = requestAnimationFrame(pollGamepads);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    };
  }, [isListening, pollGamepads]);

  return { activeDevices };
}
