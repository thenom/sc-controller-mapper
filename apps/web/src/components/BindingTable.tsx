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
  CheckCircle
} from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Set of actions that have fatal conflicts or warnings
  const actionConflictMap = useMemo(() => {
    const map = new Map<string, 'fatal' | 'warning'>();
    if (!conflictReport) return map;

    for (const c of conflictReport.conflicts) {
      const existingA = map.get(c.sourceAction);
      if (c.severity === 2 || existingA === 'fatal') {
        map.set(c.sourceAction, 'fatal');
      } else {
        map.set(c.sourceAction, 'warning');
      }

      const existingB = map.get(c.targetAction);
      if (c.severity === 2 || existingB === 'fatal') {
        map.set(c.targetAction, 'fatal');
      } else {
        map.set(c.targetAction, 'warning');
      }
    }
    return map;
  }, [conflictReport]);

  // Available Action Maps list
  const actionMapsList = useMemo(() => {
    if (!doc) return [];
    return Object.keys(doc.actionMaps).sort();
  }, [doc]);

  // Filtered Actions List
  const filteredList = useMemo(() => {
    if (!doc) return [];
    const result: Array<{
      mapName: string;
      action: ActionBinding;
    }> = [];

    const q = searchQuery.toLowerCase().trim();

    for (const [mapName, group] of Object.entries(doc.actionMaps)) {
      if (selectedMap !== 'all' && mapName !== selectedMap) continue;

      for (const [actName, action] of Object.entries(group.actions)) {
        // Device filtering
        if (selectedDevice !== 'all') {
          const hasDevice = action.inputs.some(i => 
            i.devicePrefix.toLowerCase() === selectedDevice.toLowerCase() ||
            i.input.toLowerCase().startsWith(selectedDevice.toLowerCase() + '_')
          );
          if (!hasDevice) continue;
        }

        // Query filtering
        if (q) {
          const matches =
            actName.toLowerCase().includes(q) ||
            (action.label && action.label.toLowerCase().includes(q)) ||
            mapName.toLowerCase().includes(q) ||
            action.inputs.some(i => i.input.toLowerCase().includes(q));

          if (!matches) continue;
        }

        result.push({ mapName, action });
      }
    }

    return result;
  }, [doc, searchQuery, selectedMap, selectedDevice]);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMap, selectedDevice]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedActions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const getDeviceBadgeColor = (prefix: string) => {
    if (prefix.startsWith('js1')) return 'bg-[rgba(0,229,255,0.15)] text-[#00e5ff] border-[rgba(0,229,255,0.3)]';
    if (prefix.startsWith('js2')) return 'bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border-[rgba(255,170,0,0.3)]';
    if (prefix.startsWith('js')) return 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border-[rgba(59,130,246,0.3)]';
    if (prefix.startsWith('kb')) return 'bg-[rgba(0,255,136,0.15)] text-[#00ff88] border-[rgba(0,255,136,0.3)]';
    if (prefix.startsWith('mo')) return 'bg-[rgba(168,85,247,0.15)] text-[#c084fc] border-[rgba(168,85,247,0.3)]';
    return 'bg-[rgba(148,163,184,0.15)] text-[#cbd5e1] border-[rgba(148,163,184,0.3)]';
  };

  return (
    <div className="glass-panel p-5">
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
          <div className="flex items-center gap-1 bg-[#090d15] p-1 rounded border border-[#2d415f]">
            {['all', 'js1', 'js2', 'kb1', 'mo1'].map((dev) => (
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
        <span>
          Showing <strong className="text-white">{filteredList.length}</strong> actions
          {selectedMap !== 'all' && ` in ${selectedMap}`}
          {selectedDevice !== 'all' && ` (Device: ${selectedDevice.toUpperCase()})`}
        </span>
        <span>Page {currentPage} of {totalPages}</span>
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
              paginatedActions.map(({ mapName, action }) => {
                const conflictStatus = actionConflictMap.get(action.name);

                return (
                  <tr
                    key={`${mapName}-${action.name}`}
                    className="hover:bg-[rgba(0,229,255,0.03)] transition-colors group"
                  >
                    {/* Action Info */}
                    <td className="py-3 px-3 align-top max-w-[280px]">
                      <div className="text-sm font-semibold text-white group-hover:text-[#00e5ff] transition-colors">
                        {action.label || action.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#090d15] text-[#8492a6] border border-[#1e293b]">
                          {mapName}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748b]">
                          {action.name}
                        </span>
                      </div>
                    </td>

                    {/* Inputs */}
                    <td className="py-3 px-3 align-top">
                      {action.inputs.length === 0 ? (
                        <span className="text-xs text-[#64748b] italic">Unbound</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {action.inputs.map((inp, iIdx) => {
                            const badgeColor = getDeviceBadgeColor(inp.devicePrefix);

                            return (
                              <div
                                key={iIdx}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono border ${badgeColor}`}
                              >
                                <span className="font-bold">{inp.input}</span>

                                {inp.bindType === 'addbind' && (
                                  <span className="text-[9px] uppercase px-1 rounded bg-black/40 text-[#8492a6]">
                                    add
                                  </span>
                                )}

                                {inp.activationMode && (
                                  <span className="text-[9px] uppercase px-1 rounded bg-black/40 text-[#00e5ff]">
                                    {inp.activationMode}
                                  </span>
                                )}

                                {inp.multiTap && inp.multiTap > 1 && (
                                  <span className="text-[9px] uppercase px-1 rounded bg-black/40 text-[#ffaa00]">
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
                      {conflictStatus === 'fatal' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[rgba(255,51,68,0.15)] text-[#ff3344] border border-[rgba(255,51,68,0.3)]">
                          <AlertOctagon className="w-3.5 h-3.5" /> Fatal Conflict
                        </span>
                      ) : conflictStatus === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border border-[rgba(255,170,0,0.3)]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Latency Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00ff88]">
                          <CheckCircle className="w-3.5 h-3.5 opacity-70" /> Clear
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 align-top text-right">
                      <button
                        onClick={() => onEditAction(mapName, action)}
                        className="p-1.5 rounded bg-[#090d15] border border-[#2d415f] hover:border-[#00e5ff] text-[#8492a6] hover:text-[#00e5ff] transition-all inline-flex items-center gap-1"
                        title="Edit bindings for this action"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Edit</span>
                      </button>
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
    </div>
  );
};
