import React, { useState, useMemo, useEffect } from 'react';
import {
  ActionMapsParser,
  ActionMapsExporter,
  LocalizationMerger
} from '@sc-mapping/parser';
import {
  ConflictResolver,
  ConflictSeverity
} from '@sc-mapping/resolver';
import type {
  ActionMapsDocument,
  JoystickDeviceOption,
  ActionBinding,
  BindingInput,
  ConflictDetails
} from '@sc-mapping/shared-types';
import { DeviceRack } from './components/DeviceRack';
import { ConflictViewer } from './components/ConflictViewer';
import { BindingTable } from './components/BindingTable';
import { BindingEditorModal } from './components/BindingEditorModal';
import { HardwareInspector } from './components/HardwareInspector';
import { HardwareGeneratorModal } from './components/HardwareGeneratorModal';
import {
  SupporterFuelBadge,
  HardwareAffiliateCard,
  AdSenseSlot
} from './components/MonetizationSlot';
import { useGamepadListener } from './hooks/useGamepadListener';
import {
  Upload,
  Download,
  Cpu,
  Database,
  RefreshCw,
  Sparkles,
  Gamepad2,
  Table,
  ShieldAlert,
  Crosshair,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  Terminal,
  Bug,
  ExternalLink,
  X
} from 'lucide-react';

const SAMPLE_XML = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="dual_vkb_evo_scm">
  <options type="joystick" instance="1" Product="VKBsim Gladiator EVO R">
    <invert axis="pitch" val="1"/>
    <invert axis="throttle" val="0"/>
  </options>
  <options type="joystick" instance="2" Product="VKBsim Gladiator EVO L">
  </options>
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
      <addbind input="js2_rotx" activationMode="press"/>
    </action>
    <action name="v_yaw">
      <rebind input="js1_yaw"/>
    </action>
    <action name="v_roll">
      <rebind input="js1_roll"/>
    </action>
    <action name="v_boost">
      <rebind input="js1_button4" activationMode="press"/>
    </action>
    <action name="v_spacebreak">
      <rebind input="js1_button4" activationMode="double_tap"/>
    </action>
    <action name="v_eject">
      <rebind input="js1_button5" activationMode="hold"/>
    </action>
    <action name="v_lights_toggle">
      <rebind input="js1_button5" activationMode="press"/>
    </action>
    <action name="v_toggle_quantum_mode">
      <rebind input="js1_button3" activationMode="press"/>
    </action>
    <action name="v_master_mode_cycle">
      <rebind input="js1_button3" activationMode="press"/>
    </action>
  </actionmap>
  <actionmap name="spaceship_weapons">
    <action name="v_attack1_group1">
      <rebind input="js1_button1" activationMode="press"/>
    </action>
  </actionmap>
  <actionmap name="player">
    <action name="fire">
      <rebind input="js1_button1" activationMode="press"/>
    </action>
  </actionmap>
</ActionMaps>`;

export const App: React.FC = () => {
  const [doc, setDoc] = useState<ActionMapsDocument | null>(() => {
    try {
      const parsed = ActionMapsParser.parseXML(SAMPLE_XML);
      const merger = new LocalizationMerger();
      merger.loadDictionary({
        'v_pitch': 'Pitch (Elevator)',
        'v_yaw': 'Yaw (Rudder)',
        'v_roll': 'Roll (Ailerons)',
        'v_boost': 'Engine Boost / Afterburner',
        'v_spacebreak': 'Space Brake',
        'v_eject': 'Emergency Ejection',
        'v_lights_toggle': 'Exterior Ship Lights',
        'v_attack1_group1': 'Primary Weapon Group 1'
      });
      merger.enrichDocument(parsed);
      return parsed;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'matrix' | 'inspector' | 'conflicts'>('matrix');
  const [hardwareMapping, setHardwareMapping] = useState<Map<number, number>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [lastDetectedInput, setLastDetectedInput] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [daemonStatus, setDaemonStatus] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('Dual VKB EVO Sample');
  const [deviceScope, setDeviceScope] = useState<string>('js'); // Default to joysticks
  const [inspectorDeviceIndex, setInspectorDeviceIndex] = useState<number>(0);
  const [inspectorSelectedInput, setInspectorSelectedInput] = useState<string | null>(null);

  // Game Version & Suite Versioning State
  const [gameVersion, setGameVersion] = useState<string>('12660092');
  const [gameBranch, setGameBranch] = useState<string>('sc-alpha-4.10.1');
  const [gameBuildDate, setGameBuildDate] = useState<string>('Thu Sep 24 2026');
  const suiteVersion = '1.0.0';
  const [isVersionInfoOpen, setIsVersionInfoOpen] = useState(false);

  // Automatically sync target game version metadata from bundled/extracted static data
  useEffect(() => {
    fetch('/game-data.json')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) return;
        if (data.game_version) setGameVersion(data.game_version);
        if (data.game_branch) setGameBranch(data.game_branch);
        if (data.game_build_date) {
          setGameBuildDate(data.game_build_date);
        } else if (data.extracted_at) {
          setGameBuildDate(new Date(data.extracted_at).toDateString());
        }
      })
      .catch(() => {
        // Fallback to static defaults if offline or running in test runner
      });
  }, []);

  // Hardware Generator / Submission Studio Modal State
  const [isHardwareStudioOpen, setIsHardwareStudioOpen] = useState(false);
  const [isContributorToolsOpen, setIsContributorToolsOpen] = useState(false);
  const [isDisclaimerDismissed, setIsDisclaimerDismissed] = useState(false);

  // Modal State for Interactive Binding Editor
  const [editingTarget, setEditingTarget] = useState<{
    mapName: string;
    action: ActionBinding;
  } | null>(null);

  // HTML5 Gamepad Listening Hook
  const { activeDevices } = useGamepadListener({
    isListening: isListeningMode,
    onInputDetected: (evt) => {
      setLastDetectedInput(evt.scInputString);
      setSearchQuery(evt.scInputString);
    }
  });

  // Extract Joysticks from parsed Document
  const joystickDevices = useMemo<JoystickDeviceOption[]>(() => {
    if (!doc) return [];
    return doc.devices.filter((d): d is JoystickDeviceOption => d.type === 'joystick');
  }, [doc]);

  // Run Conflict Audit with active device scope
  const conflictReport = useMemo(() => {
    if (!doc) return null;
    return ConflictResolver.auditDocument(doc, { deviceFilter: deviceScope });
  }, [doc, deviceScope]);

  // Total action counts
  const totalActionsCount = useMemo(() => {
    if (!doc) return 0;
    let count = 0;
    for (const group of Object.values(doc.actionMaps)) {
      count += Object.keys(group.actions).length;
    }
    return count;
  }, [doc]);

  const loadGameDataConfig = (data: any, presetName: string = 'live') => {
    if (!data.default_profile_xml) {
      throw new Error("Invalid config: missing default_profile_xml");
    }
    const parsed = ActionMapsParser.parseXML(data.default_profile_xml);
    if (data.localization && Object.keys(data.localization).length > 0) {
      const merger = new LocalizationMerger();
      merger.loadDictionary(data.localization);
      merger.enrichDocument(parsed);
    }
    if (data.game_version) setGameVersion(data.game_version);
    if (data.game_branch) setGameBranch(data.game_branch);
    if (data.game_build_date) {
      setGameBuildDate(data.game_build_date);
    } else if (data.extracted_at) {
      setGameBuildDate(new Date(data.extracted_at).toDateString());
    }
    setDoc(parsed);
    const initialMap = new Map<number, number>();
    parsed.devices.forEach(d => {
      if (d.type === 'joystick') initialMap.set(d.instance, d.instance);
    });
    setHardwareMapping(initialMap);
    setActivePreset(presetName);
  };

  const handleApplyDeviceOptions = (newDevice: JoystickDeviceOption) => {
    if (!doc) return;
    const nextDoc: ActionMapsDocument = JSON.parse(JSON.stringify(doc));
    const existingIndex = nextDoc.devices.findIndex(
      d => d.type === 'joystick' && d.instance === newDevice.instance
    );
    if (existingIndex >= 0) {
      nextDoc.devices[existingIndex] = newDevice;
    } else {
      nextDoc.devices.push(newDevice);
    }
    setDoc(nextDoc);
    const nextMap = new Map(hardwareMapping);
    nextMap.set(newDevice.instance, newDevice.instance);
    setHardwareMapping(nextMap);
  };

  // Load from local static /game-data.json
  const handleLoadLiveData = async () => {
    setIsLoadingLive(true);
    try {
      const res = await fetch('/game-data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load /game-data.json`);
      const data = await res.json();
      loadGameDataConfig(data, 'Star Citizen LIVE');
    } catch (err: any) {
      alert(`Error loading LIVE game data: ${err.message}`);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Load Sample Preset XML
  const handleLoadSamplePreset = async (fileName: string, presetName: string) => {
    setIsLoadingLive(true);
    try {
      const res = await fetch(`/samples/${fileName}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Could not load sample profile`);
      const xml = await res.text();
      const parsed = ActionMapsParser.parseXML(xml);
      setDoc(parsed);
      const initialMap = new Map<number, number>();
      parsed.devices.forEach(d => {
        if (d.type === 'joystick') initialMap.set(d.instance, d.instance);
      });
      setHardwareMapping(initialMap);
      setActivePreset(presetName);
    } catch (err: any) {
      alert(`Error loading preset: ${err.message}`);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Sync from Go Daemon HTTP API
  const handleSyncDaemon = async () => {
    setDaemonStatus('Connecting...');
    try {
      const res = await fetch('http://127.0.0.1:8765/api/v1/game-data');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Daemon returned error`);
      const data = await res.json();
      loadGameDataConfig(data, 'Daemon LIVE');
      setDaemonStatus('Connected v1.0.0');
    } catch (err: any) {
      setDaemonStatus('Offline');
      alert(`Could not connect to sc-daemon at http://127.0.0.1:8765: ${err.message}\nMake sure to run: npm run daemon:serve (or ./daemon/bin/sc-daemon --daemon)`);
    }
  };

  // File Upload Handler (.xml or .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          loadGameDataConfig(data, file.name);
        } else {
          const parsed = ActionMapsParser.parseXML(content);
          setDoc(parsed);
          const initialMap = new Map<number, number>();
          parsed.devices.forEach(d => {
            if (d.type === 'joystick') initialMap.set(d.instance, d.instance);
          });
          setHardwareMapping(initialMap);
          setActivePreset(file.name);
        }
      } catch (err: any) {
        alert(`Error parsing file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Export XML with device remapping applied
  const handleExportXML = () => {
    if (!doc) return;
    const xml = ActionMapsExporter.exportToXML(doc, hardwareMapping);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout_${doc.profileName}_exported.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save modified binding inputs from modal (handles existing, unbound catalog, or newly created custom actions)
  const handleSaveActionInputs = (mapName: string, actionName: string, inputs: BindingInput[], label?: string) => {
    if (!doc) return;
    const nextDoc: ActionMapsDocument = JSON.parse(JSON.stringify(doc));
    if (!nextDoc.actionMaps[mapName]) {
      nextDoc.actionMaps[mapName] = {
        name: mapName,
        actions: {}
      };
    }
    if (!nextDoc.actionMaps[mapName].actions[actionName]) {
      nextDoc.actionMaps[mapName].actions[actionName] = {
        name: actionName,
        label: label,
        inputs: []
      };
    }
    nextDoc.actionMaps[mapName].actions[actionName].inputs = inputs;
    if (label && !nextDoc.actionMaps[mapName].actions[actionName].label) {
      nextDoc.actionMaps[mapName].actions[actionName].label = label;
    }
    setDoc(nextDoc);
  };

  const handleAutoFix = (conflict: ConflictDetails) => {
    if (!doc || !conflict.deprecatedAction) return;

    const nextDoc: ActionMapsDocument = JSON.parse(JSON.stringify(doc));
    const targetActionNames = conflict.deprecatedAction.split(',').map(s => s.trim().toLowerCase());
    let modified = false;

    for (const actionMap of Object.values(nextDoc.actionMaps)) {
      for (const [actName, actionObj] of Object.entries(actionMap.actions)) {
        if (targetActionNames.includes(actName.toLowerCase())) {
          const initialLen = actionObj.inputs.length;
          actionObj.inputs = actionObj.inputs.filter(
            inp => inp.input.toLowerCase() !== conflict.sharedInput.toLowerCase()
          );
          if (actionObj.inputs.length !== initialLen) {
            modified = true;
          }
        }
      }
    }

    if (modified) {
      setDoc(nextDoc);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Pilot Safety & XML Backup Advisory Banner */}
      {!isDisclaimerDismissed && (
        <div className="mb-5 px-3.5 py-2.5 rounded bg-[rgba(255,183,0,0.07)] border border-[#ffb700]/30 flex items-center justify-between gap-3 text-xs text-[#e2e8f0] shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ffb700] shrink-0" />
            <p className="text-[11px] leading-snug">
              <strong className="text-[#ffb700] font-semibold">Important Pilot Advisory:</strong> Always keep backup copies of your original and working keybinding XML files (<code className="text-[#00f0ff] font-mono text-[10px]">LIVE/USER/Client/0/Controls/Mappings/</code>). This suite is provided as-is without warranty; maintainers assume no liability or responsibility for any lost, corrupted, or overwritten mapping files.
            </p>
          </div>
          <button
            onClick={() => setIsDisclaimerDismissed(true)}
            className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0"
            title="Dismiss advisory"
            aria-label="Dismiss advisory"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cockpit HUD Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-6 border-b border-[#2d415f] mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 rounded bg-[rgba(0,240,255,0.1)] border border-[#00f0ff]/40 text-[#00f0ff]">
              <Cpu className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black tracking-wider text-white">
                  STAR CITIZEN KEYBINDING ARCHITECT
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#1e293b] text-[#94a3b8] border border-[#334155]">
                  Suite v{suiteVersion}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <button
                  onClick={() => setIsVersionInfoOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[rgba(0,240,255,0.08)] border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[rgba(0,240,255,0.18)] transition-colors text-[11px] font-mono cursor-pointer"
                  title="Click to view Star Citizen Game Version Compatibility details"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
                  <span>Target Game: <strong>Star Citizen Alpha {gameBranch.replace(/^sc-alpha-|^alpha-\s*|^sc-/i, '')}</strong> (Build {gameVersion})</span>
                  <Info className="w-3 h-3 text-[#94a3b8]" />
                </button>
                <span className="text-[11px] text-[#64748b] font-mono">• Build: {gameBuildDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <SupporterFuelBadge />

          <button
            onClick={() => setIsHardwareStudioOpen(true)}
            className="btn-sci-fi text-[#ffb700] border-[#ffb700] hover:bg-[rgba(255,183,0,0.12)] shadow-[0_0_12px_rgba(255,183,0,0.25)]"
            title="Open Hardware Studio: generate options, presets, or community hardware definitions"
          >
            <Gamepad2 className="w-4 h-4" />
            Hardware Studio
          </button>

          <label className="btn-sci-fi cursor-pointer" title="Import an actionmaps.xml or custom profile">
            <Upload className="w-4 h-4" />
            Import XML
            <input type="file" accept=".xml,.json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={handleExportXML} className="btn-sci-fi" disabled={!doc} title="Export clean XML with device swaps applied">
            <Download className="w-4 h-4" />
            Export XML
          </button>

          <button
            onClick={() => setIsContributorToolsOpen(true)}
            className="btn-sci-fi text-[#8492a6] border-[#2d415f] hover:text-[#00e5ff] hover:border-[#00e5ff]"
            title="Developer & Contributor Hub: sc-daemon extraction, local sync, and game patch PR tools"
          >
            <Terminal className="w-4 h-4" />
            Contributor Tools
          </button>

          <a
            href="https://github.com/thenom/sc-controller-mapper/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sci-fi text-[#8492a6] border-[#2d415f] hover:text-[#ff4455] hover:border-[#ff4455] flex items-center gap-1.5"
            title="Report an issue or bug on GitHub"
          >
            <Bug className="w-4 h-4 text-[#ff4455]" />
            Report Issue
          </a>
        </div>
      </header>

      {/* Profile Telemetry Bar */}
      <div className="glass-panel p-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Starter Presets (Templates) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 text-[#ffb700]" />
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-[#94a3b8] font-semibold uppercase tracking-wider text-[11px]">Starter Presets:</span>
            <span className="text-[10px] text-[#64748b] hidden sm:inline" title="Baseline example templates for popular setups. They do not alter engine rules.">(Templates)</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleLoadSamplePreset('vkb_evo_hosas_omni.xml', 'Dual VKB (Right + Omni Left)')}
              className={`px-3 py-1 rounded font-mono font-semibold transition-all ${
                activePreset === 'Dual VKB (Right + Omni Left)'
                  ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-[#090d15] text-[#94a3b8] border border-[#2d415f] hover:border-[#00f0ff]'
              }`}
              title="Starter template: Right VKB Gladiator EVO + Left Omni-Throttle (OTA)"
            >
              Dual VKB (Right + Omni Left OTA)
            </button>
            <button
              onClick={() => handleLoadSamplePreset('dual_vkb_evo_hosas.xml', 'Dual VKB HOSAS')}
              className={`px-3 py-1 rounded font-mono font-semibold transition-all ${
                activePreset === 'Dual VKB HOSAS'
                  ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-[#090d15] text-[#94a3b8] border border-[#2d415f] hover:border-[#00f0ff]'
              }`}
              title="Starter template: Dual standard VKB Gladiator EVO flight sticks"
            >
              Dual VKB EVO (HOSAS)
            </button>
            <button
              onClick={() => handleLoadSamplePreset('hotas_t16000m.xml', 'T.16000M HOTAS')}
              className={`px-3 py-1 rounded font-mono font-semibold transition-all ${
                activePreset === 'T.16000M HOTAS'
                  ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-[#090d15] text-[#94a3b8] border border-[#2d415f] hover:border-[#00f0ff]'
              }`}
              title="Starter template: Thrustmaster T.16000M Flight Stick + TWCS Throttle"
            >
              Thrustmaster T.16000M (HOTAS)
            </button>
          </div>
        </div>

        {/* HUD Metrics */}
        <div className="flex items-center gap-4 font-mono text-xs text-[#94a3b8]">
          <span>
            Active Profile: <strong className="text-white font-bold">{activePreset}</strong>
          </span>
          <span>•</span>
          <span>
            Action Maps: <strong className="text-[#00f0ff]">{Object.keys(doc?.actionMaps || {}).length}</strong>
          </span>
          <span>•</span>
          <span>
            Total Actions: <strong className="text-[#00ff88]">{totalActionsCount}</strong>
          </span>
          <span>•</span>
          <span>
            Conflicts: <strong className={conflictReport?.hasFatalConflicts ? 'text-[#ff2a4b]' : 'text-[#00ff88]'}>
              {conflictReport?.conflicts.length || 0}
            </strong>
          </span>
        </div>
      </div>

      {/* Primary HUD Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2d415f] mb-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`hud-tab ${activeTab === 'matrix' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
        >
          <Table className="w-4 h-4" />
          Keybinding Matrix
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`hud-tab ${activeTab === 'inspector' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
        >
          <Crosshair className="w-4 h-4" />
          Device Inspector & Live HUD
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`hud-tab ${activeTab === 'conflicts' ? 'hud-tab-active' : 'hud-tab-inactive'}`}
        >
          <ShieldAlert className="w-4 h-4" />
          Conflict Diagnostics
          {conflictReport && conflictReport.conflicts.length > 0 && (
            <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              conflictReport.hasFatalConflicts ? 'bg-[#ff2a4b] text-white' : 'bg-[#ffb700] text-black font-bold'
            }`}>
              {conflictReport.conflicts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Keybinding Matrix & Device Rack */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Hardware Device Rack */}
          {doc && (
            <DeviceRack
              devices={joystickDevices}
              mapping={hardwareMapping}
              onMappingChange={setHardwareMapping}
              activeGamepadIds={activeDevices}
              onOpenHardwareStudio={() => setIsHardwareStudioOpen(true)}
            />
          )}

          {/* Filterable Binding Table */}
          <BindingTable
            doc={doc}
            conflictReport={conflictReport}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isListeningMode={isListeningMode}
            onToggleListening={() => setIsListeningMode(!isListeningMode)}
            lastDetectedInput={lastDetectedInput}
            onEditAction={(mapName, action) => {
              setEditingTarget({ mapName, action });
            }}
          />
        </div>
      )}

      {/* TAB 2: Hardware Device Inspector ("Show what it sees") */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          <HardwareInspector
            doc={doc}
            selectedDeviceIndex={inspectorDeviceIndex}
            onSelectDeviceIndex={setInspectorDeviceIndex}
            selectedInput={inspectorSelectedInput}
            onSelectInput={setInspectorSelectedInput}
            onSelectAction={(actionName) => {
              setSearchQuery(actionName);
              setActiveTab('matrix');
            }}
            onEditAction={(mapName, action) => {
              setEditingTarget({ mapName, action });
            }}
          />

          {/* Quick rack remapper below */}
          {doc && (
            <DeviceRack
              devices={joystickDevices}
              mapping={hardwareMapping}
              onMappingChange={setHardwareMapping}
              activeGamepadIds={activeDevices}
              onOpenHardwareStudio={() => setIsHardwareStudioOpen(true)}
            />
          )}
        </div>
      )}

      {/* TAB 3: Conflict Diagnostics */}
      {activeTab === 'conflicts' && (
        <div>
          <ConflictViewer
            report={conflictReport}
            deviceScope={deviceScope}
            onDeviceScopeChange={setDeviceScope}
            onSelectAction={(actionName) => {
              setSearchQuery(actionName);
              setActiveTab('matrix');
            }}
            onAutoFix={handleAutoFix}
          />
        </div>
      )}

      {/* Monetization & Community Telemetry */}
      <section className="mt-8 space-y-4">
        <AdSenseSlot />
        <HardwareAffiliateCard />
      </section>

      {/* Cockpit HUD Footer */}
      <footer className="mt-12 pt-6 border-t border-[#2d415f]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748b]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#8492a6]">Star Citizen Keybinding Architect</span>
          <span>•</span>
          <span className="font-mono">Suite v{suiteVersion}</span>
          <span>•</span>
          <span>Target SC {gameBranch.replace('sc-alpha-', '')}</span>
          <span>•</span>
          <span>Open Source (AGPL-3.0)</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href="https://github.com/thenom/sc-controller-mapper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#94a3b8] hover:text-[#00e5ff] transition-colors flex items-center gap-1.5"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/thenom/sc-controller-mapper/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff5566] hover:text-[#ff7788] transition-colors flex items-center gap-1.5 font-medium"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Report an Issue</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>

      {/* Interactive Binding Editor Modal */}
      {editingTarget && (
        <BindingEditorModal
          mapName={editingTarget.mapName}
          action={editingTarget.action}
          isOpen={!!editingTarget}
          onClose={() => setEditingTarget(null)}
          onSave={handleSaveActionInputs}
        />
      )}

      {/* Hardware Studio & Submission Generator Modal */}
      <HardwareGeneratorModal
        isOpen={isHardwareStudioOpen}
        onClose={() => setIsHardwareStudioOpen(false)}
        onApplyOptions={handleApplyDeviceOptions}
      />

      {/* Game Version Compatibility Modal */}
      {isVersionInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-xl p-6 shadow-2xl border border-[#00f0ff]/40 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-[#00ff88]" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Game Version Compatibility & Architecture
                </h2>
              </div>
              <button
                onClick={() => setIsVersionInfoOpen(false)}
                className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#cbd5e1] leading-relaxed">
              <div className="p-3.5 rounded bg-[#090d15] border border-[#2d415f] space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Target Game Branch:</span>
                  <strong className="text-[#00f0ff]">{gameBranch}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Star Citizen Build:</span>
                  <strong className="text-white">{gameVersion}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Game Build Date:</span>
                  <span className="text-[#94a3b8]">{gameBuildDate}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#2d415f]/50">
                  <span className="text-[#94a3b8]">Suite Application:</span>
                  <strong className="text-[#00ff88]">sc-controller-mapper v{suiteVersion}</strong>
                </div>
              </div>

              <p>
                <strong>How Compatibility Works:</strong> The action map definitions, default input codes, and localized descriptions are extracted directly from Star Citizen's official CryEngine <code className="text-[#00f0ff]">Data.p4k</code> archive (<code className="text-[#00f0ff]">defaultProfile.xml</code> and <code className="text-[#00f0ff]">global.ini</code>).
              </p>

              <div className="p-3 rounded bg-[rgba(255,183,0,0.08)] border border-[#ffb700]/30 space-y-1.5">
                <div className="text-[#ffb700] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  What happens when Star Citizen updates? (e.g. 4.10.2)
                </div>
                <p className="text-[11px] text-[#e2e8f0]">
                  If a new patch introduces new flight actions, targeting modes, or changes action names, your existing profiles will continue to function safely. However, newly added game features won't appear in the binding catalog until the game data is refreshed.
                </p>
                <p className="text-[11px] text-[#00f0ff]">
                  To update compatibility, run <code className="text-white bg-[#090d15] px-1 py-0.5 rounded border border-[#2d415f]">npm run daemon:extract</code> (or <code className="text-white bg-[#090d15] px-1 py-0.5 rounded border border-[#2d415f]">./daemon/bin/sc-daemon -u</code>) or click <strong>Sync Daemon</strong> when playing on the latest patch.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsVersionInfoOpen(false)}
                className="px-4 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contributor & Maintainer Tools Modal */}
      {isContributorToolsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-xl p-6 border-[#2d415f] shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2 text-[#00f0ff]">
                <Terminal className="w-5 h-5" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Contributor Hub & Extraction Daemon (<code className="text-[#00f0ff]">sc-daemon</code>)
                </h3>
              </div>
              <button
                onClick={() => setIsContributorToolsOpen(false)}
                className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#cbd5e1] leading-relaxed">
              <div className="p-3 rounded bg-[rgba(0,240,255,0.06)] border border-[#00f0ff]/30 space-y-1.5">
                <div className="text-[#00f0ff] font-semibold flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Architecture & Contributor Role
                </div>
                <p className="text-[11px] text-[#e2e8f0]">
                  Keybinding Architect is a <strong>stateless, client-side application</strong> deployed via immutable Nginx containers. Game definitions and catalogs are <strong>not updated at runtime</strong> — any runtime updates to a container would be permanently lost upon restart.
                </p>
                <p className="text-[11px] text-[#e2e8f0]">
                  Instead, game patches are extracted by contributors on their local machine, committed to git, and submitted via a <strong>Pull Request</strong> so the updated catalogs are baked into the container image for everyone.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#94a3b8]">Contributor Patch Extraction & PR Workflow:</span>
                <pre className="p-2.5 rounded bg-[#090d15] border border-[#2d415f] text-[11px] font-mono text-[#00f0ff] overflow-x-auto leading-relaxed">
{`# 1. Compile the extraction daemon binary
npm run daemon:build

# 2. Extract Data.p4k & update git-tracked catalogs
npm run daemon:extract
# Or specify explicit game directory / Data.p4k path:
./daemon/bin/sc-daemon -p "C:\\Program Files\\Roberts Space Industries\\StarCitizen" -u

# 3. Verify tests and TypeScript compilation
npm test && npm run build

# 4. Commit and submit Pull Request
git commit -am "chore(catalog): update actions & tokens for Star Citizen 4.x"`}
                </pre>
                <p className="text-[10px] text-[#64748b]">
                  Running with <code className="text-[#00f0ff]">-u</code> updates <code className="text-[#94a3b8]">sc_action_catalog.json</code> and <code className="text-[#94a3b8]">game-data.json</code> directly in the codebase for git tracking.
                </p>
              </div>

              <div className="p-3 rounded bg-[#090d15] border border-[#2d415f] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#94a3b8] font-semibold">Web App Data Verification:</span>
                  <span className={`font-mono text-[10px] ${daemonStatus ? 'text-[#00ff88]' : 'text-[#8492a6]'}`}>
                    {daemonStatus ? `Dev Sync: ${daemonStatus}` : 'Daemon: Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#2d415f]/50">
                  <button
                    onClick={handleLoadLiveData}
                    className="btn-sci-fi text-[#00f0ff] border-[#00f0ff] hover:bg-[rgba(0,240,255,0.12)] text-xs flex-1"
                    disabled={isLoadingLive}
                    title="Load bundled static game-data.json baked into this build"
                  >
                    <Database className="w-3.5 h-3.5" />
                    {isLoadingLive ? 'Loading...' : 'Preview Bundled LIVE Data'}
                  </button>
                  <button
                    onClick={handleSyncDaemon}
                    className="btn-sci-fi text-[#8492a6] border-[#2d415f] hover:text-[#00ff88] hover:border-[#00ff88] text-xs flex-1"
                    title="Developer diagnostic: Connect to ephemeral local daemon at 127.0.0.1:8765"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Local Dev Sync (127.0.0.1:8765)
                  </button>
                </div>
                <p className="text-[10px] text-[#64748b]">
                  "Preview Bundled LIVE Data" tests the static catalog committed to git. "Local Dev Sync" is strictly an optional diagnostic when testing the Go daemon before writing files.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2d415f]/60">
              <a
                href="https://github.com/thenom/sc-controller-mapper/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#ff5566] hover:text-[#ff7788] transition-colors flex items-center gap-1.5 font-medium"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Submit Issue or Suggestion on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setIsContributorToolsOpen(false)}
                className="px-4 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold transition-colors"
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
export default App;
