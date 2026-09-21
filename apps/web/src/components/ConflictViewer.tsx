import React, { useState } from 'react';
import type { ConflictReport, ConflictDetails } from '@sc-mapping/shared-types';
import { ConflictSeverity } from '@sc-mapping/shared-types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  ShieldAlert, 
  Lightbulb,
  HelpCircle,
  X
} from 'lucide-react';

interface ConflictViewerProps {
  report: ConflictReport | null;
  deviceScope: string;
  onDeviceScopeChange: (scope: string) => void;
  onSelectAction: (actionName: string) => void;
  onAutoFix?: (conflict: ConflictDetails) => void;
}

export const ConflictViewer: React.FC<ConflictViewerProps> = ({
  report,
  deviceScope,
  onDeviceScopeChange,
  onSelectAction,
  onAutoFix
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'fatal' | 'warning'>('all');
  const [searchConflict, setSearchConflict] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (!report) return null;

  const totalConflicts = report.conflicts.length;
  const filteredConflicts = report.conflicts.filter(c => {
    if (filterSeverity === 'fatal' && c.severity !== ConflictSeverity.Fatal) return false;
    if (filterSeverity === 'warning' && c.severity !== ConflictSeverity.Warning) return false;
    if (searchConflict) {
      const q = searchConflict.toLowerCase();
      return (
        c.sourceAction.toLowerCase().includes(q) ||
        c.targetAction.toLowerCase().includes(q) ||
        c.sharedInput.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="glass-panel p-5 mb-8">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2d415f]">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-[#00e5ff]" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base text-white font-semibold tracking-wider flex items-center gap-2">
                Conflict Diagnostics Engine
                {totalConflicts === 0 ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-[rgba(0,255,136,0.15)] text-[#00ff88] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Optimal (0 Conflicts)
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-[rgba(255,51,68,0.2)] text-[#ff3344] font-mono font-bold">
                    {totalConflicts} Detected
                  </span>
                )}
              </h2>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="btn-help"
                title="Learn how Conflict Diagnostics works and how to read conflicts"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>What's this?</span>
              </button>
            </div>
            <p className="text-xs text-[#8492a6] mt-0.5">
              Identifies overlapping inputs, distinguishes between harmless context sharing, and flags fatal collisions.
            </p>
          </div>
        </div>

        {/* Device Scope and Severity Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Device Scope Selector */}
          <div className="flex items-center gap-1 bg-[#090d15] p-1 rounded border border-[#2d415f] text-xs font-mono">
            <span className="text-[10px] text-[#8492a6] px-1.5 uppercase font-bold">Scope:</span>
            {[
              { id: 'all', label: 'All Devices' },
              { id: 'js', label: 'Joysticks (HOTAS/HOSAS)' },
              { id: 'kb', label: 'Keyboard' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => onDeviceScopeChange(s.id)}
                className={`px-2.5 py-1 rounded transition-all ${
                  deviceScope === s.id
                    ? 'bg-[#00e5ff] text-black font-bold'
                    : 'text-[#8492a6] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Severity Metrics Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1 text-xs rounded font-mono transition-all flex items-center gap-1.5 ${
                filterSeverity === 'all'
                  ? 'bg-[#00e5ff] text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'bg-[#0d131f] text-[#8492a6] border border-[#2d415f] hover:border-[#00e5ff]'
              }`}
            >
              All ({report.conflicts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('fatal')}
              className={`px-3 py-1 text-xs rounded font-mono transition-all flex items-center gap-1.5 ${
                filterSeverity === 'fatal'
                  ? 'bg-[#ff3344] text-white font-bold shadow-[0_0_12px_rgba(255,51,68,0.4)]'
                  : 'bg-[#0d131f] text-[#ff3344] border border-[rgba(255,51,68,0.4)] hover:bg-[rgba(255,51,68,0.1)]'
              }`}
            >
              <AlertOctagon className="w-3 h-3" /> Fatal ({report.fatalCount})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-3 py-1 text-xs rounded font-mono transition-all flex items-center gap-1.5 ${
                filterSeverity === 'warning'
                  ? 'bg-[#ffaa00] text-black font-bold shadow-[0_0_12px_rgba(255,170,0,0.4)]'
                  : 'bg-[#0d131f] text-[#ffaa00] border border-[rgba(255,170,0,0.4)] hover:bg-[rgba(255,170,0,0.1)]'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Warnings ({report.warningCount})
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar if conflicts exist */}
      {totalConflicts > 0 && (
        <div className="mt-4 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8492a6]" />
            <input
              type="text"
              placeholder="Search conflicting actions or inputs (e.g. 'v_eject', 'js1_button4')..."
              value={searchConflict}
              onChange={(e) => setSearchConflict(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#090d15] border border-[#2d415f] rounded text-[#e2e8f0] focus:outline-none focus:border-[#00e5ff]"
            />
          </div>
        </div>
      )}

      {/* Conflict List */}
      {totalConflicts === 0 ? (
        <div className="py-8 text-center text-xs text-[#8492a6]">
          <CheckCircle2 className="w-8 h-8 text-[#00ff88] mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-[#e2e8f0] mb-1">No Input Conflicts Detected</p>
          <p>Your binding configuration has zero hard collisions or temporal buffer locks across all operational contexts.</p>
        </div>
      ) : filteredConflicts.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#8492a6]">
          No conflicts match the selected filter or query.
        </div>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {filteredConflicts.map((c, idx) => {
            const isFatal = c.severity === ConflictSeverity.Fatal;
            const borderCol = isFatal ? 'border-[#ff3344]' : 'border-[#ffaa00]';
            const bgCol = isFatal ? 'bg-[rgba(255,51,68,0.06)]' : 'bg-[rgba(255,170,0,0.05)]';
            const badgeCol = isFatal 
              ? 'conflict-badge-fatal' 
              : 'conflict-badge-warning';

            return (
              <div
                key={`${c.sourceAction}-${c.targetAction}-${idx}`}
                className={`p-3.5 rounded border ${borderCol} ${bgCol} transition-all`}
              >
                <div className="conflict-header">
                  <div className="conflict-meta">
                    <span className={`conflict-badge ${badgeCol}`}>
                      {isFatal ? 'Severity 2 (Fatal)' : 'Severity 1 (Warning)'}
                    </span>

                    <span className="conflict-input-tag">
                      {c.sharedInput}
                    </span>

                    <span className="text-xs text-[#8492a6] px-1">in</span>

                    <span className="text-xs font-mono text-[#e2e8f0] px-2 py-0.5 rounded bg-[#090d15] border border-[#2d415f]">
                      {c.sourceContext} ↔ {c.targetContext}
                    </span>
                  </div>

                  <div className="conflict-actions-nav">
                    <button
                      onClick={() => onSelectAction(c.sourceAction)}
                      className="conflict-action-btn"
                      title="Jump to source action in binding table"
                    >
                      <span>{c.sourceAction}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-[#8492a6] px-1">vs</span>
                    <button
                      onClick={() => onSelectAction(c.targetAction)}
                      className="conflict-action-btn"
                      title="Jump to conflicting action in binding table"
                    >
                      <span>{c.targetAction}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#cbd5e1] mb-1.5 leading-relaxed">
                  <strong className="text-white">Rule Collision: </strong>
                  {c.reason}
                </p>

                {c.recommendation && (
                  <div className="flex items-start gap-2 text-[11px] text-[#94a3b8] bg-[#07090e] p-2 rounded border border-[#1e293b]">
                    <Lightbulb className="w-3.5 h-3.5 text-[#ffaa00] shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      <strong className="text-[#e2e8f0]">Resolution: </strong>
                      {c.recommendation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* What's this? Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg p-6 shadow-2xl border border-[#00f0ff]/40 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#00f0ff]" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Conflict Diagnostics • Architecture Guide
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
                <strong>What does this section do?</strong> Star Citizen permits sharing buttons across actions, but some combinations cause input lockouts, latency, or ship crashes. This engine evaluates your entire binding tree across 3 severity levels:
              </p>
              <ul className="space-y-2 list-disc pl-4 text-[11px] text-[#94a3b8]">
                <li>
                  <strong className="text-[#00ff88]">Severity 0 (Optimal / Clear):</strong> Actions share an input but exist in mutually exclusive game domains (e.g. flight vs. on-foot vs. ground vehicle) or isolated Master Modes (SCM weapons vs NAV quantum spool). Safe to fly.
                </li>
                <li>
                  <strong className="text-[#ffb700]">Severity 1 (Warning):</strong> Temporal conflicts such as <code className="text-[#00f0ff]">double_tap</code> paired with a single <code className="text-[#00f0ff]">press</code>. CryEngine delays single tap execution by ~250ms to check for a potential double-tap.
                </li>
                <li>
                  <strong className="text-[#ff2a4b]">Severity 2 (Fatal):</strong> Concurrent collisions where CryEngine executes both actions simultaneously (e.g. <code className="text-[#ff2a4b]">multiTap="2"</code> vs <code className="text-[#ff2a4b]">multiTap="1"</code>), or destructive commands (Eject, Self-Destruct) sharing triggers with single taps.
                </li>
              </ul>
              <div className="p-2.5 rounded bg-[#090d15] border border-[#2d415f] text-[11px]">
                <strong className="text-white">Tip:</strong> Filter by <strong>Joysticks (HOTAS/HOSAS)</strong> to view only collisions relevant to your flight sticks, or click any action button to jump directly to it in the matrix.
              </div>
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
