import React, { useState, useMemo } from 'react';
import type {
  ActionMapsDocument,
  ActionBinding,
  BindingInput,
  ConflictReport
} from '@sc-mapping/shared-types';
import {
  Search,
  Radio,
  AlertOctagon,
  AlertTriangle,
  Edit3,
  Plus,
  Layers,
  Filter,
  Gamepad2,
  Keyboard,
  Mouse,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Table,
  Sparkles,
  X,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { CatalogManager } from '@sc-mapping/parser';
import { ConflictResolver } from '@sc-mapping/resolver';
import { AddCustomActionModal } from './AddCustomActionModal';

interface BindingTableProps {
  doc: ActionMapsDocument | null;
  conflictReport: ConflictReport | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isListeningMode: boolean;
  onToggleListening: () => void;
  lastDetectedInput: string | null;
  onEditAction: (mapName: string, action: ActionBinding) => void;
}

const ITEMS_PER_PAGE = 50;

export const BindingTable: React.FC<BindingTableProps> = ({
  doc,
  conflictReport,
  searchQuery,
  onSearchChange,
  isListeningMode,
  onToggleListening,
  lastDetectedInput,
  onEditAction
}) => {
  const [selectedMap, setSelectedMap] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [showUnbound, setShowUnbound] = useState<boolean>(true);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const catalogManager = useMemo(() => new CatalogManager(), []);

  // Set of actions that have fatal conflicts, warnings, or redundancies
  const actionConflictMap = useMemo(() => {
    const map = new Map<string, 'fatal' | 'warning' | 'redundant' | 'deprecated'>();
    if (!conflictReport) return map;

    for (const c of conflictReport.conflicts) {
      const type: 'fatal' | 'warning' | 'redundant' | 'deprecated' =
        c.severity === 2
          ? 'fatal'
          : c.severity === 1
            ? 'warning'
            : c.conflictType === 'deprecated'
              ? 'deprecated'
              : 'redundant';

      const existingA = map.get(c.sourceAction);
      if (!existingA || existingA === 'redundant' || existingA === 'deprecated') {
        map.set(c.sourceAction, type);
      } else if (type === 'fatal') {
        map.set(c.sourceAction, 'fatal');
      }

      if (c.targetAction && c.targetAction !== 'Obsolete / Superseded') {
        const existingB = map.get(c.targetAction);
        if (!existingB || existingB === 'redundant' || existingB === 'deprecated') {
          map.set(c.targetAction, type);
        } else if (type === 'fatal') {
          map.set(c.targetAction, 'fatal');
        }
      }
    }
    return map;
  }, [conflictReport]);

  // Available Action Maps list (combines profile maps + master catalog maps)
  const actionMapsList = useMemo(() => {
    const mapSet = new Set<string>();
    if (doc) {
      Object.keys(doc.actionMaps).forEach((m) => mapSet.add(m));
    }
    catalogManager.getAllActionMaps().forEach((m) => mapSet.add(m.mapName));
    return Array.from(mapSet).sort();
  }, [doc, catalogManager]);

  // Count of unbound catalog actions in current map scope
  const unboundCount = useMemo(() => {
    if (!doc) return catalogManager.getAllActions().length;
    return catalogManager.getUnboundActions(doc, selectedMap === 'all' ? undefined : selectedMap).length;
  }, [doc, catalogManager, selectedMap]);

  // Dynamic list of devices available in document (e.g. ALL, JS1, JS2, JS3..., KB1, MO1)
  const availableDevices = useMemo(() => {
    const set = new Set<string>();
    set.add('all');

    if (doc) {
      for (const dev of doc.devices) {
        if (dev.type === 'joystick') {
          set.add(`js${dev.instance}`);
        } else if (dev.type === 'keyboard') {
          set.add('kb1');
        } else if (dev.type === 'mouse') {
          set.add('mo1');
        }
      }
      for (const group of Object.values(doc.actionMaps)) {
        for (const act of Object.values(group.actions)) {
          for (const inp of act.inputs) {
            if (inp.devicePrefix) {
              set.add(inp.devicePrefix.toLowerCase());
            }
          }
        }
      }
    }

    // Baseline fallback devices
    set.add('js1');
    set.add('js2');
    set.add('kb1');
    set.add('mo1');

    return Array.from(set).sort((a, b) => {
      if (a === 'all') return -1;
      if (b === 'all') return 1;
      const isJsA = a.startsWith('js');
      const isJsB = b.startsWith('js');
      if (isJsA && isJsB) {
        const numA = parseInt(a.slice(2), 10) || 0;
        const numB = parseInt(b.slice(2), 10) || 0;
        return numA - numB;
      }
      if (isJsA) return -1;
      if (isJsB) return 1;
      return a.localeCompare(b);
    });
  }, [doc]);

  // Filtered Actions List (combines active profile actions + unbound catalog actions)
  const filteredList = useMemo(() => {
    const result: Array<{
      mapName: string;
      action: ActionBinding;
      isUnbound?: boolean;
    }> = [];

    const boundKeys = new Set<string>();
    const q = searchQuery.toLowerCase().trim();

    // 1. Process actions present in the active document
    if (doc) {
      for (const [mapName, group] of Object.entries(doc.actionMaps)) {
        if (selectedMap !== 'all' && mapName.toLowerCase() !== selectedMap.toLowerCase()) continue;

        for (const [actName, action] of Object.entries(group.actions)) {
          const physicalInputs = (action.inputs || []).filter(i => !ConflictResolver.isUnboundPlaceholder(i));
          const hasPhysicalInputs = physicalInputs.length > 0;

          if (hasPhysicalInputs) {
            boundKeys.add(`${mapName.toLowerCase()}::${actName.toLowerCase()}`);
          }

          // If in "Bound Only" mode and action has no real physical inputs, hide it (unless user explicitly searches)
          if (!showUnbound && !hasPhysicalInputs && !q) {
            continue;
          }

          // Device filtering: match only actions with real physical inputs for the selected device
          if (selectedDevice !== 'all') {
            const hasDevice = physicalInputs.some(i =>
              i.devicePrefix.toLowerCase() === selectedDevice.toLowerCase() ||
              i.input.toLowerCase().startsWith(selectedDevice.toLowerCase() + '_')
            );
            if (!hasDevice) continue;
          }

          // Query filtering
          if (q) {
            const stripMod = (s: string) => s.includes('+') ? s.split('+').pop()! : s;
            const matches =
              actName.toLowerCase().includes(q) ||
              (action.label && action.label.toLowerCase().includes(q)) ||
              mapName.toLowerCase().includes(q) ||
              (action.description && action.description.toLowerCase().includes(q)) ||
              action.inputs.some(i => {
                const raw = i.input.toLowerCase();
                const stripped = stripMod(raw);
                return raw.includes(q) || stripped.includes(q) || stripped === q;
              });

            if (!matches) continue;
          }

          result.push({
            mapName,
            action,
            isUnbound: !hasPhysicalInputs
          });
        }
      }
    }

    // 2. Process unbound catalog actions if enabled or searching (and device filter is 'all')
    if ((showUnbound || q) && selectedDevice === 'all') {
      for (const item of catalogManager.getAllActions()) {
        const key = `${item.mapName.toLowerCase()}::${item.action.name.toLowerCase()}`;
        if (boundKeys.has(key)) continue;

        if (selectedMap !== 'all' && item.mapName.toLowerCase() !== selectedMap.toLowerCase()) {
          continue;
        }

        if (q) {
          const matches =
            item.action.name.toLowerCase().includes(q) ||
            item.action.label.toLowerCase().includes(q) ||
            (item.action.category && item.action.category.toLowerCase().includes(q)) ||
            (item.action.description && item.action.description.toLowerCase().includes(q)) ||
            item.mapName.toLowerCase().includes(q) ||
            item.mapLabel.toLowerCase().includes(q);

          if (!matches) continue;
        }

        result.push({
          mapName: item.mapName,
          action: {
            name: item.action.name,
            label: item.action.label,
            description: item.action.description,
            inputs: []
          },
          isUnbound: true
        });
      }
    }

    return result;
  }, [doc, searchQuery, selectedMap, selectedDevice, showUnbound, catalogManager]);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMap, selectedDevice, showUnbound]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedActions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const getDeviceBadgeColor = (prefix: string) => {
    if (prefix.startsWith('js1')) return 'bg-[rgba(0,229,255,0.15)] text-[#00e5ff] border-[rgba(0,229,255,0.3)]';
    if (prefix.startsWith('js2')) return 'bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border-[rgba(255,170,0,0.3)]';
    if (prefix.startsWith('js3')) return 'bg-[rgba(168,85,247,0.15)] text-[#c084fc] border-[rgba(168,85,247,0.3)]';
    if (prefix.startsWith('js4')) return 'bg-[rgba(236,72,153,0.15)] text-[#f472b6] border-[rgba(236,72,153,0.3)]';
    if (prefix.startsWith('js')) return 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border-[rgba(59,130,246,0.3)]';
    if (prefix.startsWith('kb')) return 'bg-[rgba(0,255,136,0.15)] text-[#00ff88] border-[rgba(0,255,136,0.3)]';
    if (prefix.startsWith('mo')) return 'bg-[rgba(168,85,247,0.15)] text-[#c084fc] border-[rgba(168,85,247,0.3)]';
    return 'bg-[rgba(148,163,184,0.15)] text-[#cbd5e1] border-[rgba(148,163,184,0.3)]';
  };

  return (
    <div className="glass-panel p-5">
      {/* Section Header with Description and Help Modal */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2d415f]">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="text-base text-[#e2e8f0] font-semibold tracking-wider">
              Keybinding Matrix & Rebind Engine
            </h2>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="btn-help"
              title="Learn what the Keybinding Matrix does and how to use it"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What's this?</span>
            </button>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Search, filter, and inspect actions across all 50 CryEngine action maps. Rebind inputs, add chords, or customize activation modes.
          </p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2d415f]">
        {/* Search & Hardware Listening */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8492a6]" />
            <input
              type="text"
              placeholder="Search actions, labels, or inputs (e.g. 'pitch', 'js1_button1', 'throttle')..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#090d15] border border-[#2d415f] rounded text-[#e2e8f0] focus:outline-none focus:border-[#00e5ff]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8492a6] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onToggleListening}
            className={`px-3 py-2 rounded text-xs font-mono font-semibold transition-all flex items-center gap-2 shrink-0 ${
              isListeningMode
                ? 'bg-[#ff3344] text-white shadow-[0_0_15px_rgba(255,51,68,0.5)] animate-pulse'
                : 'bg-[rgba(0,229,255,0.1)] text-[#00e5ff] border border-[rgba(0,229,255,0.4)] hover:bg-[#00e5ff] hover:text-black'
            }`}
            title="Listen to physical joystick/gamepad presses to jump to binding"
          >
            <Radio className="w-4 h-4" />
            {isListeningMode ? 'Listening to Controller...' : 'Hardware Listener'}
          </button>
        </div>

        {/* ActionMap and Device Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* ActionMap Select */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#8492a6]" />
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="text-xs bg-[#090d15] border border-[#2d415f] rounded px-3 py-2 text-[#e2e8f0] focus:border-[#00e5ff] focus:outline-none max-w-[200px]"
            >
              <option value="all">All Action Maps ({actionMapsList.length})</option>
              {actionMapsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Device Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#090d15] p-1 rounded border border-[#2d415f] flex-wrap">
            {availableDevices.map((dev) => (
              <button
                key={dev}
                onClick={() => setSelectedDevice(dev)}
                className={`px-2 py-1 text-xs font-mono rounded transition-all ${
                  selectedDevice === dev
                    ? 'bg-[#00e5ff] text-black font-bold'
                    : 'text-[#8492a6] hover:text-white'
                }`}
              >
                {dev.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Unbound Catalog Toggle */}
          <button
            onClick={() => setShowUnbound(!showUnbound)}
            className={`px-2.5 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-all border ${
              showUnbound
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/40 shadow-[0_0_10px_rgba(0,240,255,0.15)] font-semibold'
                : 'bg-[#090d15] text-[#8492a6] border-[#2d415f] hover:text-white'
            }`}
            title="Toggle display of Star Citizen catalog actions that are currently unbound in this profile"
          >
            {showUnbound ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Unbound Catalog ({unboundCount})</span>
          </button>

          {/* Add Custom Action Button */}
          <button
            onClick={() => setIsAddCustomModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-mono rounded bg-white/5 hover:bg-[#00f0ff]/10 border border-[#2d415f] hover:border-[#00f0ff]/50 text-[#e2e8f0] hover:text-[#00f0ff] flex items-center gap-1.5 transition-all"
            title="Define and bind a new or unlisted Star Citizen action"
          >
            <Plus className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>+ Custom Action</span>
          </button>
        </div>
      </div>

      {/* Listening Status Banner */}
      {isListeningMode && (
        <div className="mb-4 p-3 rounded border border-[#00e5ff] bg-[rgba(0,229,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#00e5ff]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Hardware Listening Mode active. Press any button or move an axis on your HOTAS/HOSAS to filter bindings.</span>
          </div>
          {lastDetectedInput && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00e5ff] text-black font-bold">
              Detected: {lastDetectedInput}
            </span>
          )}
        </div>
      )}

      {/* Action Table Header */}
      <div className="flex items-center justify-between text-xs text-[#8492a6] mb-3 px-1">
        <div>
          Showing <strong className="text-white font-mono">{filteredList.length}</strong> actions
          {selectedMap !== 'all' && ` in ${selectedMap}`}
          {selectedDevice !== 'all' && ` (Device: ${selectedDevice.toUpperCase()})`}
        </div>
        <div className="font-mono">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2d415f] text-xs font-mono text-[#8492a6]">
              <th className="pb-3 px-3 font-semibold">Action & Context</th>
              <th className="pb-3 px-3 font-semibold">Bound Inputs</th>
              <th className="pb-3 px-3 font-semibold">Status / Conflict</th>
              <th className="pb-3 px-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b] text-xs">
            {paginatedActions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#8492a6]">
                  No actions found matching "{searchQuery}".
                </td>
              </tr>
            ) : (
              paginatedActions.map(({ mapName, action, isUnbound }) => {
                const conflictStatus = actionConflictMap.get(action.name);

                return (
                  <tr
                    key={`${mapName}-${action.name}`}
                    className={`hover:bg-[rgba(0,229,255,0.03)] transition-colors group ${
                      isUnbound ? 'opacity-80 hover:opacity-100 bg-[#060a10]/50' : ''
                    }`}
                  >
                    {/* Action Info */}
                    <td className="py-3 px-3 align-top max-w-[280px]">
                      <div className="text-sm font-semibold text-white group-hover:text-[#00e5ff] transition-colors flex items-center gap-2">
                        <span>{action.label || action.name}</span>
                        {isUnbound && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            catalog
                          </span>
                        )}
                      </div>
                      <div className="action-meta-row">
                        <span className="badge-context">
                          {mapName}
                        </span>
                        <span className="badge-action-code">
                          {action.name}
                        </span>
                        {action.description && (
                          <span className="text-[11px] text-[#64748b] truncate max-w-[160px]" title={action.description}>
                            {action.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Inputs */}
                    <td className="py-3 px-3 align-top">
                      {isUnbound ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/50 text-slate-400 border border-slate-700/60 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          Unbound in Profile
                        </span>
                      ) : action.inputs.length === 0 ? (
                        <span className="text-xs text-[#64748b] italic">Unbound</span>
                      ) : (
                        <div className="input-chips-container">
                          {action.inputs.map((inp, iIdx) => {
                            const badgeColor = getDeviceBadgeColor(inp.devicePrefix);

                            return (
                              <div
                                key={iIdx}
                                className={`input-chip ${badgeColor}`}
                              >
                                {(!inp.hardwareKey || inp.hardwareKey === '' || inp.input.endsWith('_')) ? (
                                  <span className="font-mono text-xs text-[#94a3b8] italic mr-1">
                                    [Unbound on {inp.devicePrefix.toUpperCase()}]
                                  </span>
                                ) : (
                                  <span className="font-mono font-bold text-white mr-1">{inp.input}</span>
                                )}

                                {inp.bindType === 'addbind' && (
                                  <span className="chip-tag text-[#94a3b8]">
                                    add
                                  </span>
                                )}

                                {inp.activationMode && (
                                  <span className="chip-tag text-[#00e5ff]">
                                    {inp.activationMode}
                                  </span>
                                )}

                                {inp.multiTap && inp.multiTap > 1 && (
                                  <span className="chip-tag text-[#ffaa00]">
                                    {inp.multiTap}x
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Conflict Status */}
                    <td className="py-3 px-3 align-top">
                      {isUnbound ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 italic">
                          Ready to bind
                        </span>
                      ) : conflictStatus === 'fatal' ? (
                        <span className="conflict-badge conflict-badge-fatal">
                          <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                          <span>Fatal Conflict</span>
                        </span>
                      ) : conflictStatus === 'warning' ? (
                        <span className="conflict-badge conflict-badge-warning">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          <span>Latency Warning</span>
                        </span>
                      ) : conflictStatus === 'deprecated' ? (
                        <span className="conflict-badge bg-[rgba(192,132,252,0.18)] text-[#c084fc] border border-[rgba(192,132,252,0.4)]">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          <span>Obsolete (3.23+)</span>
                        </span>
                      ) : conflictStatus === 'redundant' ? (
                        <span className="conflict-badge bg-[rgba(192,132,252,0.18)] text-[#c084fc] border border-[rgba(192,132,252,0.4)]">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          <span>Redundant</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00ff88]">
                          <CheckCircle className="w-3.5 h-3.5 opacity-80" />
                          <span>Clear</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 align-top text-right">
                      {isUnbound ? (
                        <button
                          onClick={() => onEditAction(mapName, action)}
                          className="px-3 py-1.5 rounded bg-[rgba(0,240,255,0.12)] hover:bg-[#00f0ff] text-[#00f0ff] hover:text-black border border-[#00f0ff]/40 hover:border-[#00f0ff] transition-all inline-flex items-center gap-1.5 text-xs font-mono font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                          title="Assign hardware binding to this catalog action"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Bind</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onEditAction(mapName, action)}
                          className="px-2.5 py-1.5 rounded bg-[#090d15] border border-[#2d415f] hover:border-[#00e5ff] text-[#94a3b8] hover:text-[#00e5ff] transition-all inline-flex items-center gap-1.5 text-xs font-mono"
                          title="Edit bindings for this action"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2d415f] text-xs text-[#8492a6]">
          <div>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredList.length)} of {filteredList.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-[#090d15] border border-[#2d415f] disabled:opacity-40 hover:border-[#00e5ff] text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-[#090d15] border border-[#2d415f] disabled:opacity-40 hover:border-[#00e5ff] text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* What's this? Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg p-6 shadow-2xl border border-[#00f0ff]/40 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-[#00f0ff]" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Keybinding Matrix • Guide
                </h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-[#94a3b8] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#cbd5e1] leading-relaxed">
              <p>
                <strong>What does this section do?</strong> The Keybinding Matrix gives you a unified, searchable view of every input mapping in your Star Citizen configuration.
              </p>
              <ul className="space-y-2 list-disc pl-4 text-[11px] text-[#94a3b8]">
                <li>
                  <strong className="text-white">Primary vs. Additive Inputs:</strong> Star Citizen supports binding multiple triggers to the same action. Primary inputs replace engine defaults (<code className="text-[#00f0ff]">rebind</code>), while extra inputs act concurrently (<code className="text-[#94a3b8]">addbind</code>).
                </li>
                <li>
                  <strong className="text-white">Activation Modes:</strong> Configure whether an action triggers on simple <code className="text-[#00f0ff]">press</code>, <code className="text-[#00f0ff]">hold</code>, or <code className="text-[#00f0ff]">double_tap</code>.
                </li>
                <li>
                  <strong className="text-white">Hardware Listener:</strong> Toggle the listener and press any button or deflect an axis on your physical HOTAS/HOSAS to instantly jump to that control in the table.
                </li>
                <li>
                  <strong className="text-white">Editing:</strong> Click <strong>Edit</strong> on any row to add or modify inputs and change activation modes without hand-editing XML.
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

      {/* Add Custom Action Modal */}
      <AddCustomActionModal
        isOpen={isAddCustomModalOpen}
        onClose={() => setIsAddCustomModalOpen(false)}
        onAddAction={(mapName, actionName, label) => {
          onEditAction(mapName, {
            name: actionName,
            label: label,
            inputs: []
          });
        }}
        knownActionMaps={actionMapsList}
      />
    </div>
  );
};
