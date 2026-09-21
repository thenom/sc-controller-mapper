import React, { useState, useEffect, useRef } from 'react';
import type { JoystickDeviceOption, HardwareDeviceDefinition } from '@sc-mapping/shared-types';
import { 
  X, 
  Gamepad2, 
  Download, 
  Copy, 
  Check, 
  Cpu, 
  Sliders, 
  Layers, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  RefreshCw,
  Info
} from 'lucide-react';

interface HardwareGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOptions?: (device: JoystickDeviceOption) => void;
}

interface HardwarePreset {
  name: string;
  manufacturer: string;
  productName: string;
  defaultGuid: string;
  role: 'flight_stick_right' | 'omni_throttle_left' | 'throttle_quadrant' | 'pedals' | 'button_box' | 'custom';
  instance: number;
  axisCount: number;
  buttonCount: number;
  inversions: Record<string, number>;
  features: string[];
}

const HARDWARE_PRESETS: HardwarePreset[] = [
  {
    name: "VKB Gladiator EVO (Right Stick)",
    manufacturer: "VKB",
    productName: "VKBsim Gladiator EVO R",
    defaultGuid: "0200231D-0000-0000-0000-504944564944",
    role: "flight_stick_right",
    instance: 1,
    axisCount: 4,
    buttonCount: 29,
    inversions: { pitch: 1, yaw: 0, roll: 0 },
    features: ["Dual-stage trigger", "Rapid-fire trigger", "3x 8-way hat switches", "Analog thumb ministick", "Rotary wheel encoders"]
  },
  {
    name: "VKB Gladiator EVO Omni-Throttle OTA (Left 6DOF)",
    manufacturer: "VKB",
    productName: "VKBsim Gladiator EVO L OTA",
    defaultGuid: "0201231D-0000-0000-0000-504944564944",
    role: "omni_throttle_left",
    instance: 2,
    axisCount: 4,
    buttonCount: 29,
    inversions: { strafe_up: 1, strafe_forward: 0, strafe_lateral: 0, throttle: 0 },
    features: ["Omni-Throttle Angled Adapter (OTA)", "6DOF Strafe (Push=Fwd, Tilt=Lat, Twist=Vert)", "Rapid trigger brake", "Rotary limiter encoders"]
  },
  {
    name: "Virpil Constellation Alpha Prime (Right)",
    manufacturer: "Virpil Controls",
    productName: "VPC Constellation Alpha Prime R",
    defaultGuid: "01343344-0000-0000-0000-504944564944",
    role: "flight_stick_right",
    instance: 1,
    axisCount: 5,
    buttonCount: 32,
    inversions: { pitch: 1, yaw: 0, roll: 0 },
    features: ["Dual-stage metal trigger", "Metal scroll wheel", "5x 8-way hats", "Analog thumbstick", "RGB LED status"]
  },
  {
    name: "Virpil Constellation Alpha Prime (Left)",
    manufacturer: "Virpil Controls",
    productName: "VPC Constellation Alpha Prime L",
    defaultGuid: "01353344-0000-0000-0000-504944564944",
    role: "omni_throttle_left",
    instance: 2,
    axisCount: 5,
    buttonCount: 32,
    inversions: { strafe_up: 1, strafe_forward: 0, throttle: 0 },
    features: ["Left-handed grip", "6DOF strafe translation", "Metal scroll wheel", "Analog thumbstick"]
  },
  {
    name: "Thrustmaster T.16000M FCS Stick",
    manufacturer: "Thrustmaster",
    productName: "T.16000M",
    defaultGuid: "B10A044F-0000-0000-0000-504944564944",
    role: "flight_stick_right",
    instance: 1,
    axisCount: 4,
    buttonCount: 16,
    inversions: { pitch: 1, yaw: 0, roll: 0 },
    features: ["H.E.A.R.T 16-bit magnetic sensors", "Reversible ambidextrous grip", "12 base buttons", "POV Hat"]
  },
  {
    name: "Thrustmaster TWCS Throttle",
    manufacturer: "Thrustmaster",
    productName: "TWCS Throttle",
    defaultGuid: "B687044F-0000-0000-0000-504944564944",
    role: "throttle_quadrant",
    instance: 2,
    axisCount: 5,
    buttonCount: 14,
    inversions: { throttle: 0, strafe_up: 1 },
    features: ["S.M.A.R.T sliding throttle rails", "Rudder antenna paddle", "Mini analog stick for strafe"]
  },
  {
    name: "Thrustmaster TPR / TFRP Rudder Pedals",
    manufacturer: "Thrustmaster",
    productName: "T-Rudder / TPR Pedals",
    defaultGuid: "B679044F-0000-0000-0000-504944564944",
    role: "pedals",
    instance: 3,
    axisCount: 3,
    buttonCount: 0,
    inversions: { yaw: 0 },
    features: ["Independent left & right toe brakes", "Differential braking", "High-precision rudder axis"]
  }
];

export const HardwareGeneratorModal: React.FC<HardwareGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyOptions
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(HARDWARE_PRESETS[1].name); // Default to VKB EVO Omni-Throttle
  const [manufacturer, setManufacturer] = useState<string>("VKB");
  const [productName, setProductName] = useState<string>("VKBsim Gladiator EVO L OTA");
  const [guid, setGuid] = useState<string>("0201231D-0000-0000-0000-504944564944");
  const [instance, setInstance] = useState<number>(2);
  const [role, setRole] = useState<string>("omni_throttle_left");
  const [buttonCount, setButtonCount] = useState<number>(29);
  const [axisCount, setAxisCount] = useState<number>(4);
  const [deadzone, setDeadzone] = useState<number>(0.02);

  // Inversions
  const [inversions, setInversions] = useState<Record<string, boolean>>({
    pitch: false,
    strafe_up: true,
    strafe_forward: false,
    strafe_lateral: false,
    yaw: false,
    roll: false,
    throttle: false
  });

  // Active Output Tab
  const [outputTab, setOutputTab] = useState<'xml' | 'json' | 'layout' | 'submission'>('xml');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Live Detected Gamepads from Web API
  const [detectedGamepads, setDetectedGamepads] = useState<Gamepad[]>([]);
  // Track which gamepad last had activity for physical identification
  const [lastActiveGamepadIdx, setLastActiveGamepadIdx] = useState<number | null>(null);
  const [lastActiveBtn, setLastActiveBtn] = useState<string | null>(null);
  const prevBtnStates = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!isOpen) return;

    const pollGamepads = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const pads = Array.from(navigator.getGamepads()).filter((p): p is Gamepad => !!p);
        setDetectedGamepads(pads);
      }
    };

    pollGamepads();
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const pads = Array.from(navigator.getGamepads()).filter((p): p is Gamepad => !!p);
        setDetectedGamepads(pads);

        // Detect button presses for physical identification
        for (let gIdx = 0; gIdx < pads.length; gIdx++) {
          const pad = pads[gIdx];
          for (let bIdx = 0; bIdx < pad.buttons.length; bIdx++) {
            const key = `${gIdx}_${bIdx}`;
            const pressed = pad.buttons[bIdx].pressed || pad.buttons[bIdx].value > 0.5;
            const was = prevBtnStates.current.get(key) || false;
            if (pressed && !was) {
              setLastActiveGamepadIdx(gIdx);
              setLastActiveBtn(`Button ${bIdx + 1}`);
            }
            prevBtnStates.current.set(key, pressed);
          }
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (presetName: string) => {
    const preset = HARDWARE_PRESETS.find(p => p.name === presetName);
    if (!preset) return;
    setSelectedTemplate(preset.name);
    setManufacturer(preset.manufacturer);
    setProductName(preset.productName);
    setGuid(preset.defaultGuid);
    setRole(preset.role);
    setInstance(preset.instance);
    setButtonCount(preset.buttonCount);
    setAxisCount(preset.axisCount);

    const nextInversions: Record<string, boolean> = {
      pitch: false,
      strafe_up: false,
      strafe_forward: false,
      strafe_lateral: false,
      yaw: false,
      roll: false,
      throttle: false
    };
    for (const [k, v] of Object.entries(preset.inversions)) {
      nextInversions[k] = v === 1;
    }
    setInversions(nextInversions);
  };

  const handleAdoptConnectedGamepad = (pad: Gamepad) => {
    setProductName(pad.id.split('(')[0].trim() || pad.id);
    setButtonCount(pad.buttons.length);
    setAxisCount(pad.axes.length);
    // Extract GUID or Vendor/Product if available
    const match = pad.id.match(/Vendor:\s*([0-9a-fA-F]+)\s*Product:\s*([0-9a-fA-F]+)/);
    if (match) {
      setGuid(`${match[2].toUpperCase().padStart(4, '0')}${match[1].toUpperCase().padStart(4, '0')}-0000-0000-0000-504944564944`);
    }
  };

  const toggleInversion = (axis: string) => {
    setInversions(prev => ({ ...prev, [axis]: !prev[axis] }));
  };

  // Generate XML Options Block
  const generatedOptionsXML = `  <options type="joystick" instance="${instance}" Product="${productName}${guid ? ` {${guid}}` : ''}">
${Object.entries(inversions)
  .filter(([_, inv]) => inv)
  .map(([axis]) => `    <invert axis="${axis}" val="1"/>`)
  .join('\n')}
  </options>`;

  // Generate Hardware Definition JSON
  const generatedHardwareJSON: HardwareDeviceDefinition = {
    id: productName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
    manufacturer,
    productName,
    guid: guid || undefined,
    role: role as any,
    axisCount,
    buttonCount,
    recommendedInversions: Object.fromEntries(
      Object.entries(inversions).filter(([_, v]) => v).map(([k]) => [k, 1])
    ),
    recommendedDeadzones: {
      default: deadzone
    },
    hardwareFeatures: HARDWARE_PRESETS.find(p => p.productName === productName)?.features || [
      `${axisCount} Physical Analog Axes`,
      `${buttonCount} Physical Digital Buttons`,
      `DirectInput / Star Citizen compatible`
    ]
  };

  // Generate Complete Starter Profile XML
  const generatedStarterXML = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="${productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_starter">
${generatedOptionsXML}
  <options type="keyboard" instance="1"/>
  <options type="mouse" instance="1"/>

  <actionmap name="spaceship_movement">
    <!-- Generated base flight bindings for js${instance} -->
    <action name="v_pitch">
      <rebind input="js${instance}_pitch"/>
    </action>
    <action name="v_yaw">
      <rebind input="js${instance}_yaw"/>
    </action>
    <action name="v_roll">
      <rebind input="js${instance}_roll"/>
    </action>
    <action name="v_strafe_forward">
      <rebind input="js${instance}_y"/>
    </action>
    <action name="v_strafe_lateral">
      <rebind input="js${instance}_x"/>
    </action>
    <action name="v_strafe_vertical">
      <rebind input="js${instance}_z"/>
    </action>
    <action name="v_boost">
      <rebind input="js${instance}_button4" activationMode="press"/>
    </action>
    <action name="v_spacebreak">
      <rebind input="js${instance}_button4" activationMode="double_tap"/>
    </action>
  </actionmap>
</ActionMaps>`;

  // Generate GitHub PR / Issue Community Submission Markdown
  const generatedSubmissionMarkdown = `### 🎮 Hardware Device Definition Contribution

**Device Model:** ${productName}  
**Manufacturer:** ${manufacturer}  
**Role:** ${role} (Recommended logical instance: \`js${instance}\`)  
**Product GUID:** \`${guid || 'Auto-generated'}\`  
**Physical Inputs:** ${axisCount} Axes, ${buttonCount} Buttons  

#### Recommended Star Citizen \`<options>\` Configuration:
\`\`\`xml
${generatedOptionsXML}
\`\`\`

#### Hardware Definition JSON:
\`\`\`json
${JSON.stringify(generatedHardwareJSON, null, 2)}
\`\`\`

*Generated via Star Citizen Keybinding Management Suite Hardware Studio.*`;

  const copyToClipboard = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyToActiveProfile = () => {
    if (!onApplyOptions) return;
    const invMap: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(inversions)) {
      if (v) invMap[k] = true;
    }
    const deviceOpt: JoystickDeviceOption = {
      type: 'joystick',
      instance,
      productName,
      productGuid: guid || undefined,
      inversions: invMap
    };
    onApplyOptions(deviceOpt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel hw-studio-modal flex flex-col shadow-2xl border border-[#00f0ff]/30 rounded-lg overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[rgba(10,17,28,0.95)] border-b border-[#2d415f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[rgba(0,240,255,0.1)] border border-[#00f0ff]/40 text-[#00f0ff]">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
                HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
                  NEW HARDWARE
                </span>
              </h2>
              <p className="text-xs text-[#94a3b8] font-mono">
                Generate CryEngine &lt;options&gt; blocks, presets, and community definitions for new HOTAS/HOSAS/Pedals hardware.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-12 gap-6 text-xs">
          {/* Left Column: Device Configuration Form (5 cols) */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            {/* Live Controller Sniffer */}
            <div className="glass-panel p-3.5 border border-[#2d415f]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#00f0ff]" />
                  Connected Controllers (HTML5 Gamepad API)
                </span>
                <span className="text-[10px] font-mono text-[#00ff88]">
                  {detectedGamepads.length} Detected
                </span>
              </div>

              {detectedGamepads.length === 0 ? (
                <p className="text-[11px] text-[#94a3b8] italic bg-[#090d15] p-2.5 rounded border border-[#2d415f]">
                  No controllers detected yet. Plug in your joystick or throttle and press any button to wake up the browser Gamepad API.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  <p className="text-[10px] text-[#94a3b8] mb-1.5">
                    Press any button on a controller to identify it below:
                  </p>
                  {detectedGamepads.map((pad, idx) => {
                    const isActive = lastActiveGamepadIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded border flex items-center justify-between transition-all duration-150 ${
                          isActive
                            ? 'bg-[rgba(0,240,255,0.15)] border-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                            : 'bg-[#090d15] border-[#2d415f] hover:border-[#00f0ff]/50'
                        }`}
                      >
                        <div className="truncate mr-2 flex-1">
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="inline-block w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shrink-0" />
                            )}
                            <span className="font-bold text-white font-mono text-[11px]">
                              js{idx + 1} — {pad.id.split('(')[0].trim()}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#94a3b8] font-mono mt-0.5">
                            {pad.axes.length} Axes · {pad.buttons.length} Buttons
                            {isActive && lastActiveBtn && (
                              <span className="ml-2 text-[#00f0ff] font-bold">▶ {lastActiveBtn} pressed</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAdoptConnectedGamepad(pad)}
                          className="px-2 py-1 bg-[#00f0ff]/20 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-black font-mono font-bold rounded text-[10px] transition-all shrink-0"
                        >
                          Adopt
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Template Selector */}
            <div className="glass-panel p-3.5 border border-[#2d415f] space-y-3">
              <label className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ffb700]" />
                Select Hardware Preset Template:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full bg-[#090d15] border border-[#2d415f] rounded p-2 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
              >
                {HARDWARE_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.manufacturer})
                  </option>
                ))}
              </select>

              {/* Hardware Parameters */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-[#090d15] border border-[#2d415f] rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Logical Instance</label>
                  <select
                    value={instance}
                    onChange={(e) => setInstance(Number(e.target.value))}
                    className="w-full bg-[#090d15] border border-[#2d415f] rounded px-2 py-1.5 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <option key={i} value={i}>js{i} (Joystick #{i})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Product String (DirectInput Name)</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-[#090d15] border border-[#2d415f] rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Product GUID (DirectInput Hardware ID)</label>
                <input
                  type="text"
                  value={guid}
                  onChange={(e) => setGuid(e.target.value)}
                  className="w-full bg-[#090d15] border border-[#2d415f] rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
                  placeholder="0200231D-0000-0000-0000-504944564944"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#090d15] border border-[#2d415f] rounded px-1.5 py-1.5 text-white font-mono text-[11px] focus:border-[#00f0ff] focus:outline-none"
                  >
                    <option value="flight_stick_right">Right Stick (Flight)</option>
                    <option value="omni_throttle_left">Left Omni-Throttle (6DOF)</option>
                    <option value="throttle_quadrant">Throttle Quadrant</option>
                    <option value="pedals">Rudder Pedals</option>
                    <option value="button_box">Button Box</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Axes Count</label>
                  <input
                    type="number"
                    value={axisCount}
                    onChange={(e) => setAxisCount(Number(e.target.value))}
                    className="w-full bg-[#090d15] border border-[#2d415f] rounded px-2 py-1.5 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] font-mono text-[10px] block mb-1">Button Count</label>
                  <input
                    type="number"
                    value={buttonCount}
                    onChange={(e) => setButtonCount(Number(e.target.value))}
                    className="w-full bg-[#090d15] border border-[#2d415f] rounded px-2 py-1.5 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Axis Inversion Options */}
            <div className="glass-panel p-3.5 border border-[#2d415f] space-y-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#00ff88]" />
                Star Citizen Recommended Inversions:
              </span>
              <p className="text-[11px] text-[#94a3b8]">
                Star Citizen requires <code className="text-[#00f0ff]">val="1"</code> for natural stick pitch and Omni-Throttle vertical twist.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {Object.entries(inversions).map(([axis, isInverted]) => (
                  <label 
                    key={axis} 
                    className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                      isInverted 
                        ? 'bg-[rgba(0,240,255,0.12)] border-[#00f0ff] text-[#00f0ff]' 
                        : 'bg-[#090d15] border-[#2d415f] text-[#94a3b8] hover:border-white/40'
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold uppercase">{axis}</span>
                    <input 
                      type="checkbox" 
                      checked={isInverted} 
                      onChange={() => toggleInversion(axis)}
                      className="accent-[#00f0ff] w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Generated Artifacts & Actions (7 cols) */}
          <div className="col-span-12 md:col-span-7 flex flex-col space-y-4">
            {/* Artifact Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#2d415f] pb-2">
              <button
                onClick={() => setOutputTab('xml')}
                className={`hud-tab text-xs py-1.5 ${outputTab === 'xml' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
              >
                &lt;options&gt; Block
              </button>
              <button
                onClick={() => setOutputTab('json')}
                className={`hud-tab text-xs py-1.5 ${outputTab === 'json' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
              >
                Hardware JSON
              </button>
              <button
                onClick={() => setOutputTab('layout')}
                className={`hud-tab text-xs py-1.5 ${outputTab === 'layout' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
              >
                Starter Profile XML
              </button>
              <button
                onClick={() => setOutputTab('submission')}
                className={`hud-tab text-xs py-1.5 ${outputTab === 'submission' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
              >
                Community PR Template
              </button>
            </div>

            {/* Artifact Code Viewport */}
            <div className="flex-1 min-h-[320px] bg-[#050811] border border-[#2d415f] rounded-lg p-4 font-mono text-xs overflow-x-auto relative">
              {outputTab === 'xml' && (
                <div>
                  <div className="text-[11px] text-[#94a3b8] mb-2">
                    Paste this directly into your Star Citizen <code className="text-[#00f0ff]">&lt;ActionMaps&gt;</code> root block or apply below:
                  </div>
                  <pre className="text-[#00f0ff]">{generatedOptionsXML}</pre>
                </div>
              )}

              {outputTab === 'json' && (
                <div>
                  <div className="text-[11px] text-[#94a3b8] mb-2">
                    Standard JSON hardware definition format for the <code className="text-[#00ff88]">sc-controller-mapper</code> device catalog:
                  </div>
                  <pre className="text-[#00ff88]">{JSON.stringify(generatedHardwareJSON, null, 2)}</pre>
                </div>
              )}

              {outputTab === 'layout' && (
                <div>
                  <div className="text-[11px] text-[#94a3b8] mb-2">
                    Complete ready-to-load Star Citizen XML layout with standard flight/strafe actions pre-assigned to <code className="text-[#00f0ff]">js{instance}_*</code>:
                  </div>
                  <pre className="text-[#e2e8f0]">{generatedStarterXML}</pre>
                </div>
              )}

              {outputTab === 'submission' && (
                <div>
                  <div className="text-[11px] text-[#94a3b8] mb-2">
                    Formatted Markdown template to paste into a GitHub Issue or Pull Request to submit new hardware support:
                  </div>
                  <pre className="text-[#ffb700] whitespace-pre-wrap">{generatedSubmissionMarkdown}</pre>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = 
                      outputTab === 'xml' ? generatedOptionsXML :
                      outputTab === 'json' ? JSON.stringify(generatedHardwareJSON, null, 2) :
                      outputTab === 'layout' ? generatedStarterXML : generatedSubmissionMarkdown;
                    copyToClipboard(text, outputTab);
                  }}
                  className="btn-sci-fi text-[#00f0ff] border-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)]"
                >
                  {copiedTab === outputTab ? (
                    <>
                      <Check className="w-4 h-4 text-[#00ff88]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy {outputTab.toUpperCase()}
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (outputTab === 'xml') {
                      downloadFile(`options_${productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.xml`, generatedOptionsXML, 'application/xml');
                    } else if (outputTab === 'json') {
                      downloadFile(`${generatedHardwareJSON.id}.json`, JSON.stringify(generatedHardwareJSON, null, 2), 'application/json');
                    } else if (outputTab === 'layout') {
                      downloadFile(`layout_${generatedHardwareJSON.id}.xml`, generatedStarterXML, 'application/xml');
                    } else {
                      downloadFile(`hardware_submission_${generatedHardwareJSON.id}.md`, generatedSubmissionMarkdown, 'text/markdown');
                    }
                  }}
                  className="btn-sci-fi"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
              </div>

              {onApplyOptions && (
                <button
                  onClick={handleApplyToActiveProfile}
                  className="btn-sci-fi bg-[#00f0ff] text-black font-bold border-[#00f0ff] hover:bg-[#33f3ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply &lt;options&gt; to Active Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[rgba(10,17,28,0.98)] border-t border-[#2d415f] flex items-center justify-between text-xs font-mono text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00f0ff]" />
            <span>Targeting Star Citizen CryEngine XML AST Format (v1.0.0 Options Spec)</span>
          </div>
          <button 
            onClick={onClose} 
            className="px-4 py-1.5 rounded bg-[#1e293b] text-white hover:bg-[#334155] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default HardwareGeneratorModal;
