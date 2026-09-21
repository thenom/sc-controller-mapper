import React, { useState, useMemo } from 'react';
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
  BindingInput
} from '@sc-mapping/shared-types';
import { DeviceRack } from './components/DeviceRack';
import { ConflictViewer } from './components/ConflictViewer';
import { BindingTable } from './components/BindingTable';
import { BindingEditorModal } from './components/BindingEditorModal';
import { HardwareInspector } from './components/HardwareInspector';
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
  AlertOctagon
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
    setDoc(parsed);
    const initialMap = new Map<number, number>();
    parsed.devices.forEach(d => {
      if (d.type === 'joystick') initialMap.set(d.instance, d.instance);
    });
    setHardwareMapping(initialMap);
    setActivePreset(presetName);
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
      alert(`Could not connect to sc-daemon at http://127.0.0.1:8765: ${err.message}\nMake sure to run: ./daemon/bin/sc-daemon --daemon`);
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

  // Save modified binding inputs from modal
  const handleSaveActionInputs = (mapName: string, actionName: string, inputs: BindingInput[]) => {
    if (!doc) return;
    const nextDoc: ActionMapsDocument = JSON.parse(JSON.stringify(doc));
    if (nextDoc.actionMaps[mapName] && nextDoc.actionMaps[mapName].actions[actionName]) {
      nextDoc.actionMaps[mapName].actions[actionName].inputs = inputs;
      setDoc(nextDoc);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cockpit HUD Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-6 border-b border-[#2d415f] mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded bg-[rgba(0,240,255,0.1)] border border-[#00f0ff]/40 text-[#00f0ff]">
              <Cpu className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white">
                STAR CITIZEN KEYBINDING ARCHITECT
              </h1>
              <p className="text-xs text-[#94a3b8] font-mono">
                Lossless CryEngine AST Parser • Master Modes Conflict Engine • Hardware Remapper
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={handleLoadLiveData} 
            className="btn-sci-fi text-[#00f0ff] border-[#00f0ff] hover:bg-[rgba(0,240,255,0.12)]"
            disabled={isLoadingLive}
            title="Load live base game profile extracted from Data.p4k"
          >
            <Database className="w-4 h-4" />
            {isLoadingLive ? 'Loading...' : 'LIVE Game Data'}
          </button>

          <button 
            onClick={handleSyncDaemon} 
            className="btn-sci-fi text-[#00ff88] border-[#00ff88] hover:bg-[rgba(0,255,136,0.12)]"
            title="Sync from sc-daemon HTTP API at 127.0.0.1:8765"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Daemon {daemonStatus && `(${daemonStatus})`}
          </button>

          <label className="btn-sci-fi cursor-pointer" title="Import an actionmaps.xml or daemon game-data.json">
            <Upload className="w-4 h-4" />
            Import
            <input type="file" accept=".xml,.json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={handleExportXML} className="btn-sci-fi" disabled={!doc} title="Export clean XML with device swaps applied">
            <Download className="w-4 h-4" />
            Export XML
          </button>
        </div>
      </header>

      {/* Profile Telemetry Bar */}
      <div className="glass-panel p-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Presets */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ffb700]" />
          <span className="text-[#94a3b8] font-semibold uppercase tracking-wider text-[11px]">Presets:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleLoadSamplePreset('dual_vkb_evo_hosas.xml', 'Dual VKB HOSAS')}
              className={`px-3 py-1 rounded font-mono font-semibold transition-all ${
                activePreset === 'Dual VKB HOSAS'
                  ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-[#090d15] text-[#94a3b8] border border-[#2d415f] hover:border-[#00f0ff]'
              }`}
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
          />
        </div>
      )}

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
    </div>
  );
};
export default App;
