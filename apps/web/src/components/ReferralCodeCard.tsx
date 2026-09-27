import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  Shuffle,
  ExternalLink,
  HelpCircle,
  X,
  Sparkles,
  Heart,
  Terminal,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import {
  REFERRAL_POOL,
  CREATOR_REFERRAL_CODE,
  CREATOR_ENLIST_URL,
  getRandomReferral,
  getEnlistUrl,
  ReferralEntry
} from '../data/referralCodes';

interface ReferralCodeCardProps {
  className?: string;
  initialCode?: string;
}

export const ReferralCodeCard: React.FC<ReferralCodeCardProps> = ({
  className = '',
  initialCode
}) => {
  const [currentEntry, setCurrentEntry] = useState<ReferralEntry>(() => {
    if (initialCode) {
      const match = REFERRAL_POOL.find(
        r => r.code.toUpperCase() === initialCode.toUpperCase()
      );
      if (match) return match;
    }
    return getRandomReferral(REFERRAL_POOL);
  });

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentEntry.code);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = currentEntry.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code:', err);
    }
  };

  const handleReroll = () => {
    setIsRolling(true);
    const nextPick = getRandomReferral(REFERRAL_POOL, currentEntry.code);
    setCurrentEntry(nextPick);
    setIsCopied(false);
    setTimeout(() => setIsRolling(false), 300);
  };

  const enlistUrl = currentEntry.enlistUrl || getEnlistUrl(currentEntry.code);

  const getRoleBadgeClasses = (role: ReferralEntry['role']) => {
    switch (role) {
      case 'creator':
        return 'bg-amber-950/70 border-amber-500/50 text-amber-300';
      case 'supporter':
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300';
      case 'contributor':
      default:
        return 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300';
    }
  };

  return (
    <>
      <div
        data-testid="referral-code-card"
        className={`glass-panel p-4 sm:p-5 rounded-xl border border-slate-800/90 bg-gradient-to-r from-slate-900/90 via-slate-950/95 to-cyan-950/30 backdrop-blur-md shadow-xl relative overflow-hidden ${className}`}
      >
        {/* Subtle decorative glowing corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Rocket className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-100 tracking-wider">
                  STAR CITIZEN RECRUIT ENLISTMENT & REFERRAL HUB
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  +5,000 UEC BONUS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 hidden sm:inline">
                  COMMUNITY RANDOMIZER
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="btn-help"
              title="Learn what Star Citizen referral codes grant and how to get your code added to the randomizer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What's this?</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left Column: Code Display and Metadata */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Active Recruit Bonus Code:
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-slate-400">Pilot:</span>
                <strong className="text-slate-200">@{currentEntry.pilotName}</strong>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-semibold ${getRoleBadgeClasses(
                    currentEntry.role
                  )}`}
                >
                  {currentEntry.roleLabel}
                </span>
              </div>
            </div>

            {/* Interactive Code Box */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 rounded-lg border border-slate-800 bg-slate-950/80">
              <div className="flex-1 px-3 py-1.5 flex items-center justify-between gap-2">
                <span
                  data-testid="referral-code-display"
                  className="font-mono text-lg sm:text-xl font-black text-cyan-300 tracking-widest selection:bg-cyan-500 selection:text-black"
                >
                  {currentEntry.code}
                </span>
                {REFERRAL_POOL.length > 1 && (
                  <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
                    Pool: {REFERRAL_POOL.length} pilots
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                    isCopied
                      ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-400 hover:text-cyan-300'
                  }`}
                  title="Copy Star Citizen referral code to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReroll}
                  disabled={isRolling}
                  className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all duration-150 flex items-center gap-1 border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 cursor-pointer ${
                    isRolling ? 'opacity-60 scale-95' : ''
                  }`}
                  title={`Randomize code from our supporter & contributor pool (${REFERRAL_POOL.length} pilot${
                    REFERRAL_POOL.length > 1 ? 's' : ''
                  } registered)`}
                >
                  <Shuffle
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isRolling ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">Reroll</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              New pilots enlist with this code to receive <strong className="text-emerald-400 font-semibold">5,000 free UEC</strong> ($5 USD in-game currency) + active promotional bonus rewards during RSI events.
            </p>
          </div>

          {/* Right Column: Direct CTA Button & Contributor Plug */}
          <div className="lg:w-72 shrink-0 flex flex-col justify-between gap-3 pt-2 lg:pt-0 lg:border-l lg:border-slate-800/80 lg:pl-5">
            <a
              href={enlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full group px-4 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-200 border border-cyan-400/50 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2"
              title="Open official Roberts Space Industries enlist page with this referral code pre-filled"
            >
              <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              <span>ENLIST WITH CODE</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Want your code added?</span>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer transition-colors"
              >
                Learn how →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "What's this?" Modal */}
      {isHelpOpen && (
        <div
          data-testid="referral-help-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="glass-panel w-full max-w-xl p-6 border-[#00f0ff]/50 shadow-[0_0_35px_rgba(0,240,255,0.25)] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2.5 text-[#00f0ff]">
                <Gift className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Star Citizen Referral Codes & Community Randomizer
                </h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-[#94a3b8] hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs text-[#cbd5e1] leading-relaxed">
              {/* Section 1: For New Recruits */}
              <div className="p-3.5 rounded-lg bg-[rgba(0,240,255,0.06)] border border-[#00f0ff]/30 space-y-1.5">
                <div className="text-[#00f0ff] font-semibold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  What is a Star Citizen Referral Code?
                </div>
                <p className="text-[11px] text-[#e2e8f0]">
                  When you create a new Star Citizen account on Roberts Space Industries (RSI), using a referral code grants your account an extra <strong>5,000 UEC</strong> ($5 USD in-game currency) right from your first day in the Persistent Universe.
                </p>
                <p className="text-[11px] text-[#e2e8f0]">
                  During major RSI events (such as Foundation Festival, Luminalia, IAE, and Invictus Launch Week), Cloud Imperium Games often adds <strong>free bonus ships or vehicles</strong> (like the Argo Cargo, Dragonfly, HoverQuad, or P-52 Merlin) for both the recruit and the referring pilot when a game package ($40+) is pledged!
                </p>
              </div>

              {/* Section 2: How to Use */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#94a3b8]">How to Use This Referral Code:</span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#e2e8f0]">
                  <li>
                    Click the <strong>"Enlist with Code"</strong> button above to open the RSI registration page with the code automatically pre-filled.
                  </li>
                  <li>
                    Or manually paste the code (<code className="text-[#00f0ff] font-mono font-bold">{currentEntry.code}</code>) into the <strong>Referral Code</strong> field on <a href="https://robertsspaceindustries.com/enlist" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">robertsspaceindustries.com/enlist</a> during account creation.
                  </li>
                </ol>
              </div>

              {/* Section 3: Community Randomizer & How to Get Added */}
              <div className="p-3.5 rounded-lg bg-[#090d15] border border-[#2d415f] space-y-2.5">
                <div className="text-white font-semibold flex items-center gap-1.5 text-xs">
                  <Heart className="w-4 h-4 text-amber-400" />
                  How to Get Your Own Referral Code Added to the Pool
                </div>
                <p className="text-[11px] text-[#94a3b8]">
                  Star Citizen Keybinding Architect is 100% free and open-source. The project creator's code (<code className="text-[#00f0ff] font-mono">{CREATOR_REFERRAL_CODE}</code>) is always in rotation, but anyone who supports or contributes to the suite can get their referral code added to our community randomizer:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Option A: Ko-fi */}
                  <div className="p-2.5 rounded bg-slate-900/60 border border-amber-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px] mb-1">
                        <Heart className="w-3.5 h-3.5 text-amber-400" />
                        <span>Support via Ko-fi</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-normal">
                        Help fuel server hosting and maintenance. Include your <strong>Star Citizen referral code</strong> and RSI handle in your Ko-fi donation note!
                      </p>
                    </div>
                    <a
                      href="https://ko-fi.com/thenom"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 transition-colors"
                    >
                      <span>Fuel on Ko-fi</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* Option B: GitHub */}
                  <div className="p-2.5 rounded bg-slate-900/60 border border-cyan-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px] mb-1">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Contribute on GitHub</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-normal">
                        Submit a Pull Request with a bug fix, controller preset, conflict rule, or patch catalog update. Add your code to <code className="text-cyan-400">referralCodes.ts</code>!
                      </p>
                    </div>
                    <a
                      href="https://github.com/thenom/sc-controller-mapper"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
                    >
                      <span>View GitHub Repo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-[#2d415f]/60">
              <span className="text-[10px] font-mono text-[#64748b]">
                Active Pool: {REFERRAL_POOL.length} verified pilot{REFERRAL_POOL.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
