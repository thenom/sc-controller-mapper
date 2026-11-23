import React from 'react';
import { Zap, ExternalLink } from 'lucide-react';

interface SupporterProps {
  className?: string;
}

/**
 * SupporterFuelBadge: Discreet, glowing top-bar action button for voluntary Ko-fi support.
 */
export const SupporterFuelBadge: React.FC<SupporterProps> = ({ className = '' }) => {
  const supporterUrl = import.meta.env.VITE_SUPPORTER_URL || 'https://ko-fi.com/thenom';

  return (
    <a
      href={supporterUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Fuel the server: Optional Ko-fi tip to support ongoing development"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] ${className}`}
    >
      <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span className="tracking-wider">FUEL SERVER</span>
      <ExternalLink className="w-2.5 h-2.5 text-amber-400/60" />
    </a>
  );
};
