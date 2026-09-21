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
  JoystickDeviceOption 
} from '@sc-mapping/shared-types';
import { DeviceRack } from './components/DeviceRack';
import { useGamepadListener } from './hooks/useGamepadListener';
import { 
  Upload, 
  Download, 
  Search, 
  Radio, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Sparkles,
  Layers,
  Database,
  RefreshCw
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

  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [daemonStatus, setDaemonStatus] = useState<string | null>(null);

  const loadGameDataConfig = (data: any) => {
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
  };

  // Load from local static /game-data.json
  const handleLoadLiveData = async () => {
    setIsLoadingLive(true);
    try {
      const res = await fetch('/game-data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load /game-data.json`);
      const data = await res.json();
      loadGameDataConfig(data);
    } catch (err: any) {
      alert(`Error loading LIVE game data: ${err.message}`);
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
      loadGameDataConfig(data);
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
          loadGameDataConfig(data);
        } else {
          const parsed = ActionMapsParser.parseXML(content);
          setDoc(parsed);
          const initialMap = new Map<number, number>();
          parsed.devices.forEach(d => {
            if (d.type === 'joystick') initialMap.set(d.instance, d.instance);
          });
          setHardwareMapping(initialMap);
        }
      } catch (err: any) {
        alert(`Error parsing file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Export XML
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

  // Filtered Actions
  const filteredActionList = useMemo(() => {
    if (!doc) return [];
    const list: Array<{
      mapName: string;
      actionName: string;
      label?: string;
      inputs: string[];
      types: string[];
    }> = [];

    const q = searchQuery.toLowerCase().trim();

    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      for (const [actName, action] of Object.entries(group.actions)) {
        const inputStrings = action.inputs.map(i => i.input);
        const bindTypes = action.inputs.map(i => i.bindType);

        const matches =
          !q ||
          actName.toLowerCase().includes(q) ||
          (action.label && action.label.toLowerCase().includes(q)) ||
          mapName.toLowerCase().includes(q) ||
          inputStrings.some(i => i.toLowerCase().includes(q));

        if (matches) {
          list.push({
            mapName,
            actionName: actName,
            label: action.label,
            inputs: inputStrings,
            types: bindTypes
          });
        }
      }
    }
    return list;
  }, [doc, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#2d415f] mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Cpu className="w-7 h-7 text-[#00e5ff]" />
            <h1 className="text-2xl font-bold tracking-wider text-white">
              Star Citizen Keybinding Architect
            </h1>
          </div>
          <p className="text-sm text-[#8492a6]">
            Lossless CryEngine XML Parser • Intelligent Conflict Resolver • Hardware Remapper
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <button 
            onClick={handleLoadLiveData} 
            className="btn-sci-fi text-[#00e5ff] border-[#00e5ff] hover:bg-[rgba(0,229,255,0.1)]"
            disabled={isLoadingLive}
          >
            <Database className="w-4 h-4" />
            {isLoadingLive ? 'Loading LIVE Data...' : 'Load Star Citizen LIVE Data'}
          </button>

          <button 
            onClick={handleSyncDaemon} 
            className="btn-sci-fi text-[#00ff88] border-[#00ff88] hover:bg-[rgba(0,255,136,0.1)]"
            title="Sync from sc-daemon HTTP API at 127.0.0.1:8765"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Daemon {daemonStatus && `(${daemonStatus})`}
          </button>

          <label className="btn-sci-fi cursor-pointer">
            <Upload className="w-4 h-4" />
            Import (.xml / .json)
            <input type="file" accept=".xml,.json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={handleExportXML} className="btn-sci-fi" disabled={!doc}>
            <Download className="w-4 h-4" />
            Export Clean XML
          </button>
        </div>
      </header>

      {/* Conflict Status Banner */}
      {conflictReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className={`p-3 rounded ${conflictReport.hasFatalConflicts ? 'bg-[rgba(255,51,68,0.15)] text-[#ff3344]' : 'bg-[rgba(0,229,255,0.15)] text-[#00e5ff]'}`}>
              {conflictReport.hasFatalConflicts ? <AlertOctagon className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-xs text-[#8492a6] uppercase font-mono">Fatal Collisions</div>
              <div className="text-xl font-bold text-white font-mono">{conflictReport.fatalCount}</div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 rounded bg-[rgba(255,170,0,0.15)] text-[#ffaa00]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#8492a6] uppercase font-mono">Latency / Context Warnings</div>
              <div className="text-xl font-bold text-white font-mono">{conflictReport.warningCount}</div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 rounded bg-[rgba(0,229,255,0.15)] text-[#00e5ff]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#8492a6] uppercase font-mono">Profile Contexts</div>
              <div className="text-xl font-bold text-white font-mono">{Object.keys(doc?.actionMaps || {}).length} Maps</div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Device Rack */}
      {doc && (
        <DeviceRack
          devices={joystickDevices}
          mapping={hardwareMapping}
          onMappingChange={setHardwareMapping}
          activeGamepadIds={activeDevices}
        />
      )}

      {/* Search & Gamepad Listening Bar */}
      <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8492a6]" />
          <input
            type="text"
            placeholder="Search by action, label (e.g. 'Pitch'), input ('js1_button1')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#07090e] border border-[#2d415f] rounded text-sm text-white placeholder-[#8492a6] focus:outline-none focus:border-[#00e5ff]"
          />
        </div>

        <button
          onClick={() => setIsListeningMode(!isListeningMode)}
          className={`btn-sci-fi ${isListeningMode ? 'border-[#ffaa00] text-[#ffaa00] bg-[rgba(255,170,0,0.15)] badge-pulse' : ''}`}
        >
          <Radio className="w-4 h-4" />
          {isListeningMode ? 'Listening (Press Hardware Button)...' : 'Enable Hardware Listening'}
        </button>
      </div>

      {/* Conflict Alert Details */}
      {conflictReport && conflictReport.conflicts.length > 0 && (
        <div className="glass-panel p-5 mb-6 border-[#ffaa00]/30">
          <h3 className="text-sm font-semibold text-[#ffaa00] flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Engine Conflict Resolution Diagnostics
          </h3>
          <div className="space-y-3">
            {conflictReport.conflicts.map((c, idx) => (
              <div
                key={idx}
                className={`p-3 rounded text-xs border ${
                  c.severity === ConflictSeverity.Fatal
                    ? 'border-[#ff3344]/50 bg-[#ff3344]/10 text-red-200'
                    : 'border-[#ffaa00]/50 bg-[#ffaa00]/10 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold mb-1">
                  <span>Input: {c.sharedInput}</span>
                  <span className="uppercase">{c.severity === ConflictSeverity.Fatal ? 'Fatal Conflict' : 'Warning'}</span>
                </div>
                <div className="mb-1">
                  Between <code className="text-white font-semibold">{c.sourceAction}</code> ({c.sourceContext}) and <code className="text-white font-semibold">{c.targetAction}</code> ({c.targetContext})
                </div>
                <div className="text-xs opacity-90">{c.reason}</div>
                {c.recommendation && (
                  <div className="text-xs text-[#00e5ff] mt-1">Recommendation: {c.recommendation}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Virtualized / Filtered Bindings Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#07090e] border-b border-[#2d415f] text-[#8492a6] font-mono uppercase">
            <tr>
              <th className="p-4">Action Context</th>
              <th className="p-4">Localized Label</th>
              <th className="p-4">Programmatic Name</th>
              <th className="p-4">Assigned Inputs (Rebind / Addbind)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d415f]/40 font-mono">
            {filteredActionList.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-[#8492a6]">{item.mapName}</td>
                <td className="p-4 font-sans font-medium text-white">{item.label || item.actionName}</td>
                <td className="p-4 text-[#00e5ff]">{item.actionName}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {item.inputs.map((inp, iIdx) => {
                      const type = item.types[iIdx];
                      return (
                        <span
                          key={iIdx}
                          className={`px-2 py-1 rounded border text-[11px] ${
                            type === 'rebind'
                              ? 'bg-[rgba(0,229,255,0.08)] border-[#00e5ff]/40 text-[#00e5ff]'
                              : 'bg-[rgba(255,170,0,0.08)] border-[#ffaa00]/40 text-[#ffaa00]'
                          }`}
                        >
                          <span className="opacity-60 text-[9px] mr-1 uppercase font-bold">{type}:</span>
                          {inp}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
            {filteredActionList.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#8492a6]">
                  No matching bindings found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
