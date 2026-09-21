import React, { useState } from 'react';
import { X, Plus, Terminal, HelpCircle } from 'lucide-react';

interface AddCustomActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAction: (mapName: string, actionName: string, label?: string) => void;
  knownActionMaps: string[];
}

export const AddCustomActionModal: React.FC<AddCustomActionModalProps> = ({
  isOpen,
  onClose,
  onAddAction,
  knownActionMaps
}) => {
  const [selectedMap, setSelectedMap] = useState<string>(knownActionMaps[0] || 'spaceship_movement');
  const [customMapName, setCustomMapName] = useState<string>('');
  const [isCustomMap, setIsCustomMap] = useState<boolean>(false);
  const [actionName, setActionName] = useState<string>('');
  const [actionLabel, setActionLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const map = isCustomMap ? customMapName.trim() : selectedMap.trim();
    const act = actionName.trim();

    if (!map) {
      setError('Please select or enter an Action Map name.');
      return;
    }
    if (!act) {
      setError('Please enter a programmatic Action identifier (e.g. v_master_mode_switch).');
      return;
    }

    // Auto-generate human label if omitted
    const finalLabel = actionLabel.trim() || act.replace(/^v_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    onAddAction(map, act, finalLabel);
    // Reset form
    setActionName('');
    setActionLabel('');
    setCustomMapName('');
    setIsCustomMap(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#070d14] border border-[#00f0ff]/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] rounded-lg overflow-hidden flex flex-col font-mono text-white animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#0b131e]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2 uppercase">
                Add Custom Action
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Define an action for new Star Citizen updates or unlisted commands
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Action Map Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Target Action Map (Category)
            </label>
            {!isCustomMap ? (
              <div className="flex gap-2">
                <select
                  value={selectedMap}
                  onChange={(e) => setSelectedMap(e.target.value)}
                  className="flex-1 bg-[#0b131e] border border-[#1e293b] focus:border-[#00f0ff] rounded px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {knownActionMaps.map((map) => (
                    <option key={map} value={map}>
                      {map}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomMap(true)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-[#1e293b] rounded text-xs text-[#00f0ff] transition-colors"
                >
                  + New Map
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMapName}
                    onChange={(e) => setCustomMapName(e.target.value)}
                    placeholder="e.g. spaceship_movement or player_actions"
                    className="flex-1 bg-[#0b131e] border border-[#00f0ff]/50 focus:border-[#00f0ff] rounded px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomMap(false)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-[#1e293b] rounded text-xs text-[#94a3b8] transition-colors"
                  >
                    Select Existing
                  </button>
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Must be lowercase matching CryEngine convention (e.g. <code className="text-cyan-400">spaceship_power</code>).
                </p>
              </div>
            )}
          </div>

          {/* Action Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Programmatic Action Identifier <span className="text-[#00f0ff]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                placeholder="e.g. v_master_mode_switch or v_engineering_power"
                className="w-full bg-[#0b131e] border border-[#1e293b] focus:border-[#00f0ff] rounded px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none"
                required
              />
              <Terminal className="absolute right-3 top-2.5 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-cyan-500" />
              Typically begins with <code className="text-cyan-400">v_</code> for vehicles or <code className="text-cyan-400">player_</code> for on-foot.
            </p>
          </div>

          {/* Action Display Label */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Human-Readable Label <span className="text-[#64748b] text-[10px] lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder="e.g. Master Mode Switch"
              className="w-full bg-[#0b131e] border border-[#1e293b] focus:border-[#00f0ff] rounded px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-[#334155] rounded text-xs font-semibold tracking-wider text-slate-300 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#00f0ff]/20 to-[#00f0ff]/40 hover:from-[#00f0ff]/30 hover:to-[#00f0ff]/50 border border-[#00f0ff] rounded text-xs font-bold tracking-wider text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              ADD & BIND INPUT
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
