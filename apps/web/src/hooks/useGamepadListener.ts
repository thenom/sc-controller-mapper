import { useEffect, useRef, useState, useCallback } from 'react';
import type { GamepadDetectedInput } from '@sc-mapping/shared-types';
import { decodeHatAxis, isHatRestSentinel } from '../utils/gamepadHatDecoder';

interface UseGamepadListenerOptions {
  isListening: boolean;
  axisThreshold?: number; // Default 0.65
  onInputDetected: (input: GamepadDetectedInput) => void;
}

/**
 * HTML5 Gamepad API "Listening Mode" Hook
 * Listens for hardware button presses, POV hat shifts, and axis deflections on connected HOTAS / Gamepads
 * and translates raw signals to Star Citizen input codes (e.g. js1_button3, js1_hat1_up, js2_rotx).
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
  // Track detected hat axes: key = `gp_${gIdx}_axis_${aIdx}` -> hatNumber (1, 2, ...)
  const knownHatAxes = useRef<Map<string, number>>(new Map());
  // Track previous hat direction to detect leading-edge direction switches
  const prevHatStates = useRef<Map<string, string | null>>(new Map());

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

      // 2. Sample Axes & DirectInput POV Hats
      for (let aIdx = 0; aIdx < gp.axes.length; aIdx++) {
        const val = gp.axes[aIdx];
        const axisKey = `gp_${gIdx}_axis_${aIdx}`;

        // DirectInput Hat Sentinel Detection (~1.2857 / > 1.05)
        if (isHatRestSentinel(val) || val > 1.05) {
          if (!knownHatAxes.current.has(axisKey)) {
            let hatCount = 0;
            for (const [k] of knownHatAxes.current) {
              if (k.startsWith(`gp_${gIdx}_`)) hatCount++;
            }
            knownHatAxes.current.set(axisKey, hatCount + 1);
          }
          // Hat is at rest / centered -> clear any active deflection
          prevHatStates.current.set(axisKey, null);
          prevAxisStates.current.set(axisKey, false);
          continue;
        }

        // If this axis was previously identified as a hat axis
        if (knownHatAxes.current.has(axisKey)) {
          const hatNumber = knownHatAxes.current.get(axisKey) || 1;
          const decoded = decodeHatAxis(val, hatNumber);

          if (decoded.isCentered || !decoded.direction) {
            prevHatStates.current.set(axisKey, null);
          } else {
            const currentDir = decoded.direction;
            const prevDir = prevHatStates.current.get(axisKey);

            if (currentDir !== prevDir) {
              // Trigger on leading edge of hat direction shift
              onInputDetected({
                gamepadIndex: gIdx,
                logicalDeviceInstance: logicalInstance,
                scInputString: `js${logicalInstance}_${decoded.scInputSuffix}`,
                inputType: 'button',
                rawValue: val
              });
              prevHatStates.current.set(axisKey, currentDir);
            }
          }
          continue;
        }

        // Standard Analog Axis with Deadzone Thresholding
        // (Note: Any val > 1.05 was already caught above as a hat resting sentinel)
        const isDeflected = Math.abs(val) > axisThreshold;
        const wasDeflected = prevAxisStates.current.get(axisKey) || false;

        if (isDeflected && !wasDeflected) {
          const axisName = AXIS_NAMES[aIdx] || `axis_${aIdx}`;
          onInputDetected({
            gamepadIndex: gIdx,
            logicalDeviceInstance: logicalInstance,
            scInputString: `js${logicalInstance}_${axisName}`,
            inputType: 'axis',
            rawValue: val
          });
        }
        prevAxisStates.current.set(axisKey, isDeflected);
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
