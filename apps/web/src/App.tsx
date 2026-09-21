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
import { useGamepadListener } from './hooks/useGamepadListener';
import { 
  Upload, 
  Download, 
  Cpu, 
  Database,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  Gamepad2,
  FileCode
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
  <actionmap name="player_input_onfoot">
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

  const [hardwareMapping, setHardwareMapping] = useState<Map<number, number>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [lastDetectedInput, setLastDetectedInput] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [daemonStatus, setDaemonStatus] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('sample');

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

  // Run Conflict Audit
  const conflictReport = useMemo(() => {
    if (!doc) return null;
    return ConflictResolver.auditDocument(doc);
  }, [doc]);

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
      loadGameDataConfig(data, 'live');
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
      loadGameDataConfig(data, 'daemon');
      setDaemonStatus('Connected');
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
      {/* Header & HUD Telemetry */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#2d415f] mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Cpu className="w-7 h-7 text-[#00e5ff] animate-pulse" />
            <h1 className="text-2xl font-bold tracking-wider text-white">
              Star Citizen Keybinding Architect
            </h1>
          </div>
          <p className="text-xs text-[#8492a6]">
            Lossless CryEngine XML Parser • Intelligent Conflict Resolver • Hardware Remapper
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={handleLoadLiveData} 
            className="btn-sci-fi text-[#00e5ff] border-[#00e5ff] hover:bg-[rgba(0,229,255,0.1)]"
            disabled={isLoadingLive}
            title="Load live base game profile extracted from Data.p4k"
          >
            <Database className="w-4 h-4" />
            {isLoadingLive ? 'Loading...' : 'LIVE Game Data'}
          </button>

          <button 
            onClick={handleSyncDaemon} 
            className="btn-sci-fi text-[#00ff88] border-[#00ff88] hover:bg-[rgba(0,255,136,0.1)]"
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

      {/* Preset Profiles Bar */}
      <div className="glass-panel p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ffaa00]" />
          <span className="text-[#8492a6] font-semibold">Sample Presets:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleLoadSamplePreset('dual_vkb_evo_hosas.xml', 'Dual VKB HOSAS')}
              className={`px-2.5 py-1 rounded font-mono transition-all ${
                activePreset === 'Dual VKB HOSAS'
                  ? 'bg-[#00e5ff] text-black font-bold'
                  : 'bg-[#090d15] text-[#8492a6] border border-[#2d415f] hover:border-[#00e5ff]'
              }`}
            >
              Dual VKB EVO (HOSAS)
            </button>
            <button
              onClick={() => handleLoadSamplePreset('hotas_t16000m.xml', 'T.16000M HOTAS')}
              className={`px-2.5 py-1 rounded font-mono transition-all ${
                activePreset === 'T.16000M HOTAS'
                  ? 'bg-[#00e5ff] text-black font-bold'
                  : 'bg-[#090d15] text-[#8492a6] border border-[#2d415f] hover:border-[#00e5ff]'
              }`}
            >
              Thrustmaster T.16000M (HOTAS)
            </button>
          </div>
        </div>

        {/* Telemetry Status Pills */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#8492a6]">
          <span>
            Profile: <strong className="text-white">{doc?.profileName || 'None'}</strong>
          </span>
          <span>•</span>
          <span>
            Maps: <strong className="text-[#00e5ff]">{Object.keys(doc?.actionMaps || {}).length}</strong>
          </span>
          <span>•</span>
          <span>
            Actions: <strong className="text-[#00ff88]">{totalActionsCount}</strong>
          </span>
        </div>
      </div>

      {/* Hardware Device Rack */}
      {doc && (
        <DeviceRack
          devices={joystickDevices}
          mapping={hardwareMapping}
          onMappingChange={setHardwareMapping}
          activeGamepadIds={activeDevices}
        />
      )}

      {/* Intelligent Conflict Audit Viewer */}
      <ConflictViewer
        report={conflictReport}
        onSelectAction={(actionName) => setSearchQuery(actionName)}
      />

      {/* Searchable Virtualized Binding Table */}
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
