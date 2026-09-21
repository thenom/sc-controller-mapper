import React, { useEffect, useState } from 'react';
import {
  Zap,
  ExternalLink,
  Gamepad2,
  Sparkles,
  Shield,
  Radio,
  Heart,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export type MonetizationMode = 'mock' | 'test' | 'live' | 'off';

interface MonetizationProps {
  className?: string;
}

/**
 * SupporterFuelBadge: Discreet, glowing top-bar action button to support server hosting.
 */
export const SupporterFuelBadge: React.FC<MonetizationProps> = ({ className = '' }) => {
  const supporterUrl = import.meta.env.VITE_SUPPORTER_URL || 'https://ko-fi.com/thenom';

  return (
    <a
      href={supporterUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Fuel the server: Help cover cloud hosting and load-balancing costs"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] ${className}`}
    >
      <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span className="tracking-wider">FUEL SERVER</span>
      <ExternalLink className="w-2.5 h-2.5 text-amber-400/60" />
    </a>
  );
};

/**
 * HardwareAffiliateCard: Cockpit telemetry card featuring compatible HOTAS/HOSAS peripherals.
 */
export const HardwareAffiliateCard: React.FC<MonetizationProps> = ({ className = '' }) => {
  const amazonTag = import.meta.env.VITE_AFFILIATE_AMAZON_TAG || 'scmapper-20';

  const recommendedHardware = [
    {
      name: 'VKB Gladiator NXT EVO',
      type: 'HOSAS / HOTAS Primary Stick',
      desc: 'Dual gimbal contactless sensors, ideal for Star Citizen 6-DOF',
      url: `https://www.vkbcontrollers.com/?ref=${amazonTag}`,
      badge: 'TOP PICK'
    },
    {
      name: 'VIRPIL VPC MongoosT-50',
      type: 'Dual Throttle & Control Panel',
      desc: 'All-metal mechanics with extensive detents and toggle switches',
      url: `https://virpil-controls.eu/?ref=${amazonTag}`,
      badge: 'PREMIUM'
    },
    {
      name: 'Heavy-Duty Desk Mounts',
      type: 'Ergonomic Flight Rig Clamps',
      desc: 'Quick-release aluminum mounting rails for VKB, Virpil, Thrustmaster',
      url: `https://www.amazon.com/s?k=hotas+desk+mount&tag=${amazonTag}`,
      badge: 'ACCESSORY'
    }
  ];

  return (
    <div className={`p-4 rounded-xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/90 backdrop-blur-md shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
            RECOMMENDED HARDWARE TELEMETRY
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700">
          PARTNER // SUPPORTS HOSTING
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendedHardware.map((hw, idx) => (
          <a
            key={idx}
            href={hw.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-cyan-500/40 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {hw.name}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                  {hw.badge}
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-400/80 mb-1">{hw.type}</div>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {hw.desc}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] font-mono text-slate-300 group-hover:text-cyan-400 transition-colors">
              <span>View Specs</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

/**
 * AdSenseSlot: Aesthetic, sci-fi container with test mode / mock mode and automatic adblock fallback.
 */
export const AdSenseSlot: React.FC<MonetizationProps> = ({ className = '' }) => {
  const mode = (import.meta.env.VITE_MONETIZATION_MODE as MonetizationMode) || 'mock';
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000';
  const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID || '0000000000';

  const [adBlocked, setAdBlocked] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (mode === 'off') return;

    if (mode === 'test' || mode === 'live') {
      try {
        // Attempt to load Google AdSense script dynamically if not present
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          script.onerror = () => {
            // AdBlocker detected (e.g. uBlock Origin / Brave Shields blocked script)
            setAdBlocked(true);
          };
          script.onload = () => {
            setIsLoaded(true);
            try {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
              console.warn('[AdSense] Push execution error:', err);
            }
          };
          document.head.appendChild(script);
        } else {
          setIsLoaded(true);
          try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (err) {
            console.warn('[AdSense] Push execution error:', err);
          }
        }
      } catch (e) {
        setAdBlocked(true);
      }
    }
  }, [mode, clientId]);

  if (mode === 'off') {
    return null;
  }

  // Graceful degradation when ad blocker is active: seamlessly hide container or show sleek hardware fallback
  if (adBlocked) {
    return null;
  }

  return (
    <div
      data-testid="monetization-slot-container"
      className={`relative rounded-xl border border-slate-800/90 bg-slate-950/80 p-3 overflow-hidden backdrop-blur-md shadow-md ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[10px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="tracking-wider uppercase font-semibold">
            {mode === 'live' ? 'SPONSOR COMM TRANSMISSION' : 'SPONSOR COMM // SIMULATOR MODE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mode !== 'live' && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-mono text-[9px]">
              SAFE TEST ACTIVE
            </span>
          )}
          <span className="text-slate-300">Supports Hosting</span>
        </div>
      </div>

      {mode === 'mock' ? (
        // High-fidelity dark-mode mock creative to verify layout and aesthetics
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-slate-800/70 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 tracking-wide">
                Aegis Flight Systems & Precision HOTAS Mounts
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Zero-flex flight stick positioning engineered specifically for high-G space combat simulation.
              </p>
            </div>
          </div>
          <a
            href="https://www.amazon.com/s?k=hotas+desk+mount"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-mono font-medium border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all duration-150 flex items-center gap-1"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        // Official Google AdSense slot with sandbox/test attributes
        <div className="min-h-[90px] flex items-center justify-center overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '90px', width: '100%' }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-adtest={mode === 'test' ? 'on' : undefined}
          />
        </div>
      )}
    </div>
  );
};
