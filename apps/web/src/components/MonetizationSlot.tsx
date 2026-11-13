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
  const mode = (import.meta.env.VITE_MONETIZATION_MODE as MonetizationMode) || 'live';
  const rawClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const clientId =
    rawClientId && rawClientId !== 'ca-pub-0000000000000000'
      ? rawClientId
      : 'ca-pub-4414971156573564';
  const rawSlotId = import.meta.env.VITE_ADSENSE_SLOT_ID;
  const slotId =
    rawSlotId && rawSlotId !== '0000000000'
      ? rawSlotId
      : '9700539154';

  const [adBlocked, setAdBlocked] = useState<boolean>(false);
  const [adUnfilled, setAdUnfilled] = useState<boolean>(false);
  const [, setIsLoaded] = useState<boolean>(false);
  const insRef = React.useRef<HTMLModElement | null>(null);
  const pushedRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (mode === 'off') return;

    if (mode === 'test' || mode === 'live') {
      const pushAd = () => {
        if (pushedRef.current) return;
        try {
          pushedRef.current = true;
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.warn('[AdSense] Push execution error:', err);
        }
      };

      try {
        const existingScript = document.querySelector(
          'script[src*="adsbygoogle.js"]'
        ) as HTMLScriptElement | null;

        if (!existingScript) {
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
            pushAd();
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('error', () => setAdBlocked(true));
          setIsLoaded(true);
          pushAd();
        }
      } catch (e) {
        setAdBlocked(true);
      }
    }
  }, [mode, clientId, slotId]);

  // Watch for AdSense marking the slot as unfilled so we don't leave a blank box
  useEffect(() => {
    const el = insRef.current;
    if (!el || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(() => {
      if (el.getAttribute('data-ad-status') === 'unfilled') {
        setAdUnfilled(true);
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, [mode]);

  if (mode === 'off') {
    return null;
  }

  const showFallbackCreative = mode === 'mock' || adBlocked || adUnfilled;

  return (
    <div
      data-testid="monetization-slot-container"
      className={`relative w-full rounded-lg border border-slate-800/60 bg-slate-950/50 px-3 py-2 overflow-hidden backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/40 text-[9px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Radio className="w-2.5 h-2.5 text-cyan-500/70" />
          <span className="tracking-wider uppercase font-medium">
            {mode === 'live' ? 'SPONSOR COMM TRANSMISSION' : 'SPONSOR COMM // SIMULATOR MODE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mode !== 'live' && (
            <span className="px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-700/40 text-emerald-400/90 font-mono text-[8px]">
              SAFE TEST ACTIVE
            </span>
          )}
          <span className="text-slate-500">Supports Hosting</span>
        </div>
      </div>

      {showFallbackCreative ? (
        // Compact, low-profile dark-mode creative (used in mock mode or when AdSense is blocked/unfilled on preview domains)
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3 py-1.5 rounded-md border border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-950/30 border border-cyan-800/30 text-cyan-400/80 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200 tracking-wide">
                Aegis Flight Systems & Precision HOTAS Mounts
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Zero-flex flight stick positioning engineered specifically for high-G space combat simulation.
              </p>
            </div>
          </div>
          <a
            href="https://www.amazon.com/s?k=hotas+desk+mount"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-2.5 py-1 rounded text-[10px] font-mono font-medium border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400 transition-all duration-150 flex items-center gap-1"
          >
            <span>Learn More</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      ) : (
        // Official Google AdSense Default Ad Unit (block container ensures non-zero availableWidth on push)
        <div className="w-full min-h-[60px] overflow-hidden">
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
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
