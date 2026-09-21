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
  Lightbulb
} from 'lucide-react';

interface ConflictViewerProps {
  report: ConflictReport | null;
  onSelectAction: (actionName: string) => void;
  onAutoFix?: (conflict: ConflictDetails) => void;
}

export const ConflictViewer: React.FC<ConflictViewerProps> = ({
  report,
  onSelectAction,
  onAutoFix
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'fatal' | 'warning'>('all');
  const [searchConflict, setSearchConflict] = useState('');

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
            <h2 className="text-base text-white font-semibold tracking-wider flex items-center gap-2">
              Conflict Audit Engine
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
            <p className="text-xs text-[#8492a6]">
              Temporal state analysis • Master Mode isolation • Operational context validation
            </p>
          </div>
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
            All ({totalConflicts})
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
              ? 'bg-[rgba(255,51,68,0.2)] text-[#ff3344]' 
              : 'bg-[rgba(255,170,0,0.2)] text-[#ffaa00]';

            return (
              <div
                key={`${c.sourceAction}-${c.targetAction}-${idx}`}
                className={`p-3.5 rounded border ${borderCol} ${bgCol} transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase ${badgeCol}`}>
                      {isFatal ? 'Severity 2 (Fatal)' : 'Severity 1 (Warning)'}
                    </span>

                    <span className="text-xs font-mono font-bold text-[#00e5ff] px-2 py-0.5 rounded bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)]">
                      {c.sharedInput}
                    </span>

                    <span className="text-xs text-[#8492a6]">in</span>
                    <span className="text-xs font-mono text-[#e2e8f0]">
                      {c.sourceContext} ↔ {c.targetContext}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectAction(c.sourceAction)}
                      className="text-xs text-[#8492a6] hover:text-[#00e5ff] flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[#090d15]"
                      title="Jump to source action in binding table"
                    >
                      <span>{c.sourceAction}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-[#8492a6]">vs</span>
                    <button
                      onClick={() => onSelectAction(c.targetAction)}
                      className="text-xs text-[#8492a6] hover:text-[#00e5ff] flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[#090d15]"
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
    </div>
  );
};
