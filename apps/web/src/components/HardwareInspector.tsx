import React, { useState, useEffect, useRef } from 'react';
import type { ActionMapsDocument, ActionBinding, JoystickDeviceOption } from '@sc-mapping/shared-types';
import {
  Gamepad2,
  Activity,
  ExternalLink,
  Sliders,
  Radio,
  CheckCircle2,
  Crosshair,
  HelpCircle,
  Zap,
  Info,
  X,
  Compass
} from 'lucide-react';
import { decodeHatAxis, isHatRestSentinel, HatDirection } from '../utils/gamepadHatDecoder';

export interface HardwareInspectorProps {
  doc: ActionMapsDocument | null;
  onSelectAction: (actionName: string) => void;
  onEditAction?: (mapName: string, action: ActionBinding) => void;
  selectedDeviceIndex?: number;
  onSelectDeviceIndex?: (index: number) => void;
  selectedInput?: string | null;
  onSelectInput?: (input: string | null) => void;
}

interface DetectedInputState {
  deviceIndex: number;
  deviceName: string;
  scDevicePrefix: string;
  activeButtons: number[]; // 1-based indices (Button 1, Button 2...)
  activeAxes: Array<{ index: number; name: string; value: number; scName: string }>;
  activeHats: Array<{ hatNumber: number; direction: HatDirection; scName: string; angleDeg: number }>;
  lastInputString: string | null;
}

const AXIS_NAMES = ['x', 'y', 'z', 'rotx', 'roty', 'rotz', 'slider1', 'slider2'];

export const HardwareInspector: React.FC<HardwareInspectorProps> = ({
  doc,
  onSelectAction,
  onEditAction,
  selectedDeviceIndex: controlledDeviceIndex,
  onSelectDeviceIndex,
  selectedInput: controlledSelectedInput,
  onSelectInput
}) => {
  const [internalDeviceIndex, setInternalDeviceIndex] = useState<number>(0);
  const [internalPersistentPressed, setInternalPersistentPressed] = useState<string | null>(null);

  const selectedDeviceIndex = controlledDeviceIndex !== undefined ? controlledDeviceIndex : internalDeviceIndex;
  const setSelectedDeviceIndex = (idx: number) => {
    if (onSelectDeviceIndex) {
      onSelectDeviceIndex(idx);
    } else {
      setInternalDeviceIndex(idx);
    }
  };

  const persistentPressed = controlledSelectedInput !== undefined ? controlledSelectedInput : internalPersistentPressed;
  const setPersistentPressed = (input: string | null) => {
    if (onSelectInput) {
      onSelectInput(input);
    } else {
      setInternalPersistentPressed(input);
    }
  };

  const persistentPressedRef = useRef<string | null>(persistentPressed);
  useEffect(() => {
    persistentPressedRef.current = persistentPressed;
  }, [persistentPressed]);

  const [connectedDevices, setConnectedDevices] = useState<Array<{ index: number; id: string; buttons: number; axes: number }>>([]);
  const [inputState, setInputState] = useState<DetectedInputState | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const reqRef = useRef<number | null>(null);
  // Track detected hat axes: key = `gp_${deviceIndex}_axis_${axisIndex}` -> hatNumber (1, 2, ...)
  const knownHatAxesRef = useRef<Map<string, number>>(new Map());

  // Extract XML devices from loaded profile
  const xmlJoysticks = React.useMemo(() => {
    if (!doc) return [];
    return doc.devices.filter((d): d is JoystickDeviceOption => d.type === 'joystick');
  }, [doc]);

  // Comprehensive device list: live connected gamepads OR XML profile devices
  const availableDevices = React.useMemo(() => {
    if (connectedDevices.length > 0) {
      return connectedDevices.map(d => ({
        index: d.index,
        jsNumber: d.index + 1,
        name: d.id,
        buttons: Math.max(d.buttons, 32),
        axes: Math.max(d.axes, 8),
        isLive: true
      }));
    }

    if (xmlJoysticks.length > 0) {
      return xmlJoysticks.map(d => ({
        index: d.instance - 1,
        jsNumber: d.instance,
        name: d.productName,
        buttons: 32,
        axes: 8,
        isLive: false
      }));
    }

    return [
      { index: 0, jsNumber: 1, name: 'Joystick 1 (Primary Flight Stick)', buttons: 32, axes: 8, isLive: false },
      { index: 1, jsNumber: 2, name: 'Joystick 2 (Secondary Throttle/Stick)', buttons: 32, axes: 8, isLive: false }
    ];
  }, [connectedDevices, xmlJoysticks]);

  const safeDeviceIndex = availableDevices.length > 0
    ? Math.min(Math.max(0, selectedDeviceIndex), availableDevices.length - 1)
    : 0;

  useEffect(() => {
    if (availableDevices.length > 0 && selectedDeviceIndex >= availableDevices.length) {
      setSelectedDeviceIndex(0);
    }
  }, [availableDevices.length, selectedDeviceIndex]);

  // Poll Gamepad API
  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const validGps: Array<{ index: number; id: string; buttons: number; axes: number }> = [];

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          validGps.push({
            index: i,
            id: gp.id,
            buttons: gp.buttons.length,
            axes: gp.axes.length
          });
        }
      }
      setConnectedDevices(validGps);

      let targetGp: Gamepad | null = null;
      if (validGps.length > 0) {
        const targetValidGp = validGps[safeDeviceIndex] || validGps[0];
        targetGp = targetValidGp ? gamepads[targetValidGp.index] : null;
      }

      if (targetGp && targetGp.connected) {
        const jsNumber = targetGp.index + 1;
        const scPrefix = `js${jsNumber}`;
        const activeButtons: number[] = [];
        const activeAxes: Array<{ index: number; name: string; value: number; scName: string }> = [];
        const activeHats: Array<{ hatNumber: number; direction: HatDirection; scName: string; angleDeg: number }> = [];
        let latestInput: string | null = null;

        // Sample buttons
        for (let b = 0; b < targetGp.buttons.length; b++) {
          const btn = targetGp.buttons[b];
          if (btn.pressed || btn.value > 0.5) {
            const btnNumber = b + 1;
            activeButtons.push(btnNumber);
            latestInput = `${scPrefix}_button${btnNumber}`;
          }
        }

        // Sample axes & DirectInput POV hats
        for (let a = 0; a < targetGp.axes.length; a++) {
          const val = targetGp.axes[a];
          const axisKey = `gp_${targetGp.index}_axis_${a}`;

          // DirectInput Hat Sentinel (~1.2857 / > 1.05) denotes Center / At Rest
          if (isHatRestSentinel(val) || val > 1.05) {
            if (!knownHatAxesRef.current.has(axisKey)) {
              let count = 0;
              for (const [k] of knownHatAxesRef.current) {
                if (k.startsWith(`gp_${targetGp.index}_`)) count++;
              }
              knownHatAxesRef.current.set(axisKey, count + 1);
            }
            // Centered at rest: do not record as active analog axis or latest input
            continue;
          }

          // If axis is recognized as a POV hat
          if (knownHatAxesRef.current.has(axisKey)) {
            const hatNum = knownHatAxesRef.current.get(axisKey) || 1;
            const decoded = decodeHatAxis(val, hatNum);
            if (!decoded.isCentered && decoded.direction && decoded.scInputSuffix) {
              const scName = `${scPrefix}_${decoded.scInputSuffix}`;
              activeHats.push({
                hatNumber: hatNum,
                direction: decoded.direction,
                scName,
                angleDeg: decoded.angleDeg ?? 0
              });
              if (!latestInput) {
                latestInput = scName;
              }
            }
            continue;
          }

          // Standard Analog Axis with Deadzone Thresholding
          const axisName = AXIS_NAMES[a] || `axis_${a}`;
          const scName = `${scPrefix}_${axisName}`;
          if (Math.abs(val) > 0.15) {
            activeAxes.push({ index: a, name: axisName, value: val, scName });
            if (Math.abs(val) > 0.5 && !latestInput) {
              latestInput = scName;
            }
          }
        }

        if (latestInput && latestInput !== persistentPressedRef.current) {
          persistentPressedRef.current = latestInput;
          setPersistentPressed(latestInput);
        }

        setInputState({
          deviceIndex: targetGp.index,
          deviceName: targetGp.id,
          scDevicePrefix: scPrefix,
          activeButtons,
          activeAxes,
          activeHats,
          lastInputString: latestInput
        });
      } else {
        setInputState(null);
      }

      reqRef.current = requestAnimationFrame(poll);
    };

    reqRef.current = requestAnimationFrame(poll);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [safeDeviceIndex]);

  const activeDevice = availableDevices[safeDeviceIndex] || availableDevices[0];
  const activeJsNumber = activeDevice ? activeDevice.jsNumber : 1;
  const activePrefix = `js${activeJsNumber}`;

  // Find all bindings mapped to the currently inspected trigger
  const boundActions = React.useMemo(() => {
    if (!doc || !persistentPressed) return [];
    const hits: Array<{ mapName: string; action: ActionBinding; input: string }> = [];

    const target = persistentPressed.toLowerCase();
    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      for (const action of Object.values(group.actions)) {
        for (const inp of action.inputs) {
          const inpLower = inp.input.toLowerCase();
          const tokens = inpLower.split('+');
          if (inpLower === target || tokens.includes(target)) {
            hits.push({ mapName, action, input: inp.input });
          }
        }
      }
    }
    return hits;
  }, [doc, persistentPressed]);

  return (
    <div className="glass-panel p-6 mb-8 border-[#00f0ff]/40 shadow-[0_0_30px_rgba(0,240,255,0.08)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2d415f] mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[rgba(0,240,255,0.1)] border border-[#00f0ff]/40 text-[#00f0ff]">
            <Crosshair className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg text-white font-bold tracking-wider flex items-center gap-2 flex-wrap">
                Hardware Device Inspector & Live Controller HUD
                {activeDevice?.isLive ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[rgba(0,255,136,0.15)] text-[#00ff88] font-mono font-bold border border-[rgba(0,255,136,0.3)] flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Live Hardware Connected
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[rgba(255,183,0,0.15)] text-[#ffb700] font-mono font-bold border border-[rgba(255,183,0,0.3)] flex items-center gap-1">
                    <Info className="w-3 h-3" /> Profile Simulation Mode
                  </span>
                )}
              </h2>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="btn-help"
                title="Learn how the Hardware Inspector works"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>What's this?</span>
              </button>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Press any physical button on your stick, or click any button in the grid below to see its exact Star Citizen code and mapped actions.
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-[#00f0ff]" />
          <select
            value={safeDeviceIndex}
            onChange={(e) => {
              const newIdx = parseInt(e.target.value, 10);
              setSelectedDeviceIndex(newIdx);
              if (newIdx !== safeDeviceIndex) {
                setPersistentPressed(null);
              }
            }}
            className="text-xs font-mono bg-[#090d15] border border-[#2d415f] rounded px-3 py-2 text-white focus:border-[#00f0ff] focus:outline-none"
          >
            {availableDevices.map((dev, idx) => (
              <option key={idx} value={idx}>
                js{dev.jsNumber}: {dev.name.slice(0, 32)}... {dev.isLive ? '(Live)' : '(XML)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Button Matrix & Axes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Device Info Box */}
          <div className="p-4 rounded-lg bg-[#090d15] border border-[#2d415f]">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#94a3b8]">Target Device:</span>
              <span className="text-[#00f0ff] font-bold px-2.5 py-0.5 rounded bg-[rgba(0,240,255,0.15)] border border-[#00f0ff]/30">
                DirectInput ID: {activePrefix}
              </span>
            </div>
            <div className="text-sm font-semibold text-white truncate" title={activeDevice?.name}>
              {activeDevice?.name}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#94a3b8] mt-2">
              <span>Buttons: <strong className="text-white">{activeDevice?.buttons || 32}</strong></span>
              <span>•</span>
              <span>Axes: <strong className="text-white">{activeDevice?.axes || 8}</strong></span>
              <span>•</span>
              <span>Status: <strong className={activeDevice?.isLive ? 'text-[#00ff88]' : 'text-[#ffb700]'}>
                {activeDevice?.isLive ? 'Online (Physical Input Active)' : 'Offline / Standalone Profile'}
              </strong></span>
            </div>
          </div>

          {/* Interactive Physical Button Grid */}
          <div className="p-4 rounded-lg bg-[#090d15] border border-[#2d415f]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
                Physical Button Matrix (Buttons 1 - {activeDevice?.buttons || 32})
              </h4>
              <span className="text-[11px] font-mono text-[#94a3b8]">
                Click or press any button to inspect
              </span>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
              {Array.from({ length: activeDevice?.buttons || 32 }, (_, i) => i + 1).map(bNum => {
                const isPhysicallyPressed = inputState?.activeButtons.includes(bNum) || false;
                const buttonCode = `${activePrefix}_button${bNum}`;
                const isSelected = persistentPressed === buttonCode;

                return (
                  <button
                    key={bNum}
                    onClick={() => setPersistentPressed(buttonCode)}
                    className={`h-9 text-xs font-mono font-bold rounded flex flex-col items-center justify-center transition-all ${
                      isPhysicallyPressed
                        ? 'bg-[#00f0ff] text-black shadow-[0_0_16px_rgba(0,240,255,0.8)] scale-105 border border-white'
                        : isSelected
                        ? 'bg-[rgba(0,240,255,0.25)] text-[#00f0ff] border-2 border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                        : 'bg-[#06080d] text-[#94a3b8] border border-[#1e293b] hover:border-[#00f0ff]/60 hover:text-white'
                    }`}
                    title={`Physical Button ${bNum} (XML: ${buttonCode})`}
                  >
                    <span className="text-[9px] opacity-60">B</span>
                    <span>{bNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* POV Hat Switch Widget (Hat 1 • 8-Way Compass) */}
          <div className="p-4 rounded-lg bg-[#090d15] border border-[#2d415f]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#00f0ff]" />
                POV Hat Switch (Hat 1 • 8-Way Compass)
              </h4>
              <span className="text-[11px] font-mono">
                {inputState?.activeHats && inputState.activeHats.length > 0 ? (
                  <span className="text-[#00f0ff] font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    ACTIVE: {inputState.activeHats[0].direction.toUpperCase()} ({inputState.activeHats[0].scName})
                  </span>
                ) : (
                  <span className="text-[#64748b] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#334155]" />
                    Centered / At Rest
                  </span>
                )}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
              {/* 3x3 Compass D-Pad Grid */}
              <div className="grid grid-cols-3 gap-1.5 w-full max-w-[280px]">
                {/* Row 1: NW, N, NE */}
                {(() => {
                  const renderHatBtn = (dir: HatDirection, label: string, suffix: string, desc: string) => {
                    const isPhysicallyPressed = inputState?.activeHats?.some(h => h.direction === dir) || false;
                    const buttonCode = `${activePrefix}_${suffix}`;
                    const isSelected = persistentPressed === buttonCode;

                    return (
                      <button
                        key={dir}
                        onClick={() => setPersistentPressed(buttonCode)}
                        className={`h-10 text-xs font-mono font-bold rounded flex flex-col items-center justify-center transition-all ${
                          isPhysicallyPressed
                            ? 'bg-[#00f0ff] text-black shadow-[0_0_16px_rgba(0,240,255,0.8)] scale-105 border border-white'
                            : isSelected
                            ? 'bg-[rgba(0,240,255,0.25)] text-[#00f0ff] border-2 border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-[#06080d] text-[#94a3b8] border border-[#1e293b] hover:border-[#00f0ff]/60 hover:text-white'
                        }`}
                        title={`${desc} (XML: ${buttonCode})`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  };

                  return (
                    <>
                      {renderHatBtn('up_left', '↖ NW', 'hat1_up_left', 'Up-Left (315°)')}
                      {renderHatBtn('up', '▲ N', 'hat1_up', 'Up (0°)')}
                      {renderHatBtn('up_right', '↗ NE', 'hat1_up_right', 'Up-Right (45°)')}

                      {renderHatBtn('left', '◀ W', 'hat1_left', 'Left (270°)')}
                      <div className="h-10 rounded bg-[#030712] border border-[#1e293b] flex flex-col items-center justify-center text-[10px] font-mono text-[#64748b]">
                        <span className="text-[#00f0ff] font-bold">HAT 1</span>
                        <span>POV</span>
                      </div>
                      {renderHatBtn('right', '▶ E', 'hat1_right', 'Right (90°)')}

                      {renderHatBtn('down_left', '↙ SW', 'hat1_down_left', 'Down-Left (225°)')}
                      {renderHatBtn('down', '▼ S', 'hat1_down', 'Down (180°)')}
                      {renderHatBtn('down_right', '↘ SE', 'hat1_down_right', 'Down-Right (135°)')}
                    </>
                  );
                })()}
              </div>

              {/* Direction Guide & Active Quick Info */}
              <div className="text-xs text-[#94a3b8] space-y-2 max-w-[240px]">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>Digital 8-Way Hat Mode</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#64748b]">
                  Click any direction or tilt your physical stick hat to inspect mapped ship actions.
                </p>
                <div className="pt-1 flex flex-wrap gap-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#cbd5e1]">
                    {activePrefix}_hat1_up
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#cbd5e1]">
                    {activePrefix}_hat1_right
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analog Axis Deflection Meters */}
          <div className="p-4 rounded-lg bg-[#090d15] border border-[#2d415f]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#ffb700]" />
              Analog Axis Meters & Deflection
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: activeDevice?.axes || 8 }, (_, aIdx) => aIdx)
                .filter(aIdx => !knownHatAxesRef.current.has(`gp_${activeDevice?.index}_axis_${aIdx}`))
                .map(aIdx => {
                  const axisName = AXIS_NAMES[aIdx] || `axis_${aIdx}`;
                  const scName = `${activePrefix}_${axisName}`;
                  const currentAxis = inputState?.activeAxes.find(a => a.index === aIdx);
                  const val = currentAxis ? currentAxis.value : 0;
                  const percent = Math.round(((val + 1) / 2) * 100);

                  return (
                    <div
                      key={aIdx}
                      onClick={() => setPersistentPressed(scName)}
                      className="p-2.5 rounded bg-[#06080d] border border-[#1e293b] hover:border-[#00f0ff] cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-white font-bold">{axisName.toUpperCase()}</span>
                        <span className="text-[#94a3b8]">{scName}</span>
                        <span className={Math.abs(val) > 0.1 ? 'text-[#00f0ff] font-bold' : 'text-[#64748b]'}>
                          {val.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-[#1e293b] h-2 rounded overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-75 ${
                            Math.abs(val) > 0.15 ? 'bg-[#00f0ff]' : 'bg-[#64748b]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: "Show What It Sees" Inspector HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-lg bg-[#090d15] border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.15)]">
            <div className="text-xs font-mono text-[#00f0ff] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Radio className="w-4 h-4 animate-pulse" />
              Inspected Hardware Trigger
            </div>

            {persistentPressed ? (
              <div>
                <div className="text-2xl font-mono font-extrabold text-white mb-2 bg-[#06080d] p-3 rounded border border-[#2d415f] flex items-center justify-between">
                  <span className="text-[#00f0ff]">{persistentPressed}</span>
                  <span className="text-xs font-sans font-normal px-2.5 py-1 rounded bg-[rgba(0,240,255,0.15)] text-[#00f0ff] border border-[#00f0ff]/30">
                    DirectInput Code
                  </span>
                </div>

                <p className="text-xs text-[#94a3b8] mb-4">
                  Star Citizen XML Key: <code className="text-[#00f0ff] font-bold">{persistentPressed}</code>
                </p>

                {/* Actions Bound to this trigger */}
                <div className="border-t border-[#2d415f] pt-4">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Actions Mapped to this Trigger</span>
                    <span className="text-[#00ff88] font-mono">({boundActions.length})</span>
                  </h5>

                  {boundActions.length === 0 ? (
                    <div className="p-4 text-center rounded bg-[#06080d] border border-dashed border-[#2d415f] text-xs text-[#94a3b8]">
                      No game actions are currently mapped to <code className="text-white">{persistentPressed}</code>.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {boundActions.map(({ mapName, action }, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded bg-[#06080d] border border-[#1e293b] hover:border-[#00f0ff] transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {action.label || action.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono text-[#94a3b8]">
                                <span className="text-[#00f0ff]">{mapName}</span>
                                <span>•</span>
                                <span>{action.name}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => onSelectAction(action.name)}
                              className="px-2.5 py-1 text-xs font-mono rounded bg-[rgba(0,240,255,0.15)] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-colors flex items-center gap-1 shrink-0"
                              title="Jump to action in keybinding matrix"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#94a3b8]">
                <HelpCircle className="w-10 h-10 text-[#2d415f] mx-auto mb-2" />
                <p className="text-sm font-semibold text-white mb-1">Click Any Button in the Grid</p>
                <p className="max-w-xs mx-auto">
                  Click button 12 (or press physical button 12 on your device) to immediately inspect what action it controls!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-xl p-6 border-[#00f0ff]/50 shadow-[0_0_30px_rgba(0,240,255,0.2)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2 text-[#00f0ff]">
                <Crosshair className="w-5 h-5" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Hardware Device Inspector & Live Controller HUD
                </h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-[#94a3b8] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#cbd5e1] leading-relaxed">
              <p>
                <strong>What does this section do?</strong> It bridges physical controller hardware to Star Citizen's binding terminology, helping you instantly identify which physical button or axis corresponds to what XML input ID.
              </p>
              <ul className="space-y-2 list-disc pl-4 text-[11px] text-[#94a3b8]">
                <li>
                  <strong className="text-white">Live Controller Detection:</strong> Connect any USB joystick, throttle, or gamepad. The inspector uses the HTML5 Gamepad API to monitor live button presses and deflection axes in real time.
                </li>
                <li>
                  <strong className="text-white">1-Based Button Mapping:</strong> DirectInput internal indices start at 0, while Star Citizen uses 1-based indices (<code className="text-[#00f0ff]">js1_button1</code> is DirectInput button 0). The inspector handles this translation automatically so you always see the exact game code.
                </li>
                <li>
                  <strong className="text-white">POV Hat Auto-Decoding:</strong> Star Citizen binds hat switches using discrete directional codes (<code className="text-[#00f0ff]">js1_hat1_up</code>, etc.). On Windows, DirectInput flight sticks (VKB, Virpil, Thrustmaster) report hat switches as analog axes with resting sentinel values (~1.29). The inspector automatically isolates and decodes these into an 8-way directional compass HUD.
                </li>
                <li>
                  <strong className="text-white">Profile Simulation Mode:</strong> If your physical controllers are not currently plugged in, you can click any button or axis in the matrix to simulate pressing it and view all bound ship commands.
                </li>
                <li>
                  <strong className="text-white">Quick Jump to Matrix:</strong> Click <em>View</em> next to any bound command to jump directly to it in the Keybinding Matrix for immediate editing.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
