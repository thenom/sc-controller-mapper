import React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import {
  SupporterFuelBadge,
  HardwareAffiliateCard,
  AdSenseSlot
} from '../MonetizationSlot';

describe('Monetization Components', () => {
  describe('SupporterFuelBadge', () => {
    it('renders fuel server button with link attributes', () => {
      render(<SupporterFuelBadge />);
      const badge = screen.getByTitle(/Fuel the server/i);
      expect(badge).toBeDefined();
      expect(badge.getAttribute('target')).toBe('_blank');
      expect(badge.getAttribute('rel')).toBe('noopener noreferrer');
      expect(screen.getByText('FUEL SERVER')).toBeDefined();
    });
  });

  describe('HardwareAffiliateCard', () => {
    it('renders recommended peripherals with affiliate links and specs', () => {
      render(<HardwareAffiliateCard />);
      expect(screen.getByText('RECOMMENDED HARDWARE TELEMETRY')).toBeDefined();
      expect(screen.getByText('VKB Gladiator NXT EVO')).toBeDefined();
      expect(screen.getByText('VIRPIL VPC MongoosT-50')).toBeDefined();
      expect(screen.getByText('Heavy-Duty Desk Mounts')).toBeDefined();

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(3);
      links.forEach(link => {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('href')).toMatch(/(ref=|tag=)/);
      });
    });
  });

  describe('AdSenseSlot', () => {
    it('renders live Google AdSense unit by default with publisher and slot IDs', () => {
      const { container } = render(<AdSenseSlot />);
      const slotContainer = screen.getByTestId('monetization-slot-container');
      expect(slotContainer).toBeDefined();
      expect(screen.getByText(/SPONSOR COMM TRANSMISSION/i)).toBeDefined();

      const ins = container.querySelector('ins.adsbygoogle');
      expect(ins).not.toBeNull();
      expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-4414971156573564');
      expect(ins?.getAttribute('data-ad-slot')).toBe('9700539154');
      expect(ins?.getAttribute('data-ad-format')).toBe('auto');
      expect(ins?.getAttribute('data-full-width-responsive')).toBe('true');
    });

    it('renders mock simulator creative when in mock mode without breaking layout', () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'mock');
      render(<AdSenseSlot />);
      const container = screen.getByTestId('monetization-slot-container');
      expect(container).toBeDefined();
      expect(screen.getByText(/SPONSOR COMM \/\/ SIMULATOR MODE/i)).toBeDefined();
      expect(screen.getByText(/SAFE TEST ACTIVE/i)).toBeDefined();
      expect(screen.getByText(/Aegis Flight Systems & Precision HOTAS Mounts/i)).toBeDefined();
      vi.unstubAllEnvs();
    });

    it('returns null when mode is off', () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'off');
      const { container } = render(<AdSenseSlot />);
      expect(container.firstChild).toBeNull();
      vi.unstubAllEnvs();
    });

    it('injects script in test/live mode and handles onload and onerror', () => {
      document.head.innerHTML = '';
      vi.stubEnv('VITE_MONETIZATION_MODE', 'test');
      vi.stubEnv('VITE_ADSENSE_CLIENT_ID', 'ca-pub-test1234');
      const { unmount } = render(<AdSenseSlot />);

      const script = document.querySelector('script[src*="adsbygoogle.js"]') as HTMLScriptElement;
      expect(script).toBeDefined();

      // Trigger onload
      if (script && script.onload) {
        act(() => {
          (script as any).onload(new Event('load'));
        });
      }

      unmount();
      document.head.innerHTML = '';

      // Trigger onerror for adblock detection and verify graceful fallback creative remains visible
      render(<AdSenseSlot />);
      const script2 = document.querySelector('script[src*="adsbygoogle.js"]') as HTMLScriptElement;
      if (script2 && script2.onerror) {
        act(() => {
          (script2 as any).onerror(new Event('error'));
        });
      }

      expect(screen.getByTestId('monetization-slot-container')).toBeDefined();
      expect(screen.getByText(/Aegis Flight Systems & Precision HOTAS Mounts/i)).toBeDefined();

      vi.unstubAllEnvs();
    });

    it('gracefully renders compact fallback banner when AdSense marks slot as unfilled (e.g. preview domains)', async () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'live');
      const { container } = render(<AdSenseSlot />);

      const ins = container.querySelector('ins.adsbygoogle');
      expect(ins).not.toBeNull();

      act(() => {
        ins?.setAttribute('data-ad-status', 'unfilled');
      });

      await waitFor(() => {
        expect(screen.getByTestId('monetization-slot-container')).toBeDefined();
        expect(screen.getByText(/Aegis Flight Systems & Precision HOTAS Mounts/i)).toBeDefined();
      });

      vi.unstubAllEnvs();
    });

    it('falls back from placeholder ca-pub-0000000000000000 client ID and 0000000000 slot ID', () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'live');
      vi.stubEnv('VITE_ADSENSE_CLIENT_ID', 'ca-pub-0000000000000000');
      vi.stubEnv('VITE_ADSENSE_SLOT_ID', '0000000000');

      const { container } = render(<AdSenseSlot />);
      const ins = container.querySelector('ins.adsbygoogle');
      expect(ins).not.toBeNull();
      expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-4414971156573564');
      expect(ins?.getAttribute('data-ad-slot')).toBe('9700539154');
      expect(ins?.getAttribute('data-ad-format')).toBe('auto');

      vi.unstubAllEnvs();
    });

    it('forces live mode on scbind.com even when VITE_MONETIZATION_MODE is set to test in Cloudflare build env', () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'test');
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...originalLocation, hostname: 'scbind.com' }
      });

      const { container } = render(<AdSenseSlot />);
      expect(screen.getByText(/SPONSOR COMM TRANSMISSION/i)).toBeDefined();
      expect(screen.queryByText(/SAFE TEST ACTIVE/i)).toBeNull();

      const ins = container.querySelector('ins.adsbygoogle');
      expect(ins).not.toBeNull();
      expect(ins?.getAttribute('data-adtest')).toBeNull();

      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation
      });
      vi.unstubAllEnvs();
    });

    it('prevents unscoped [class*="w-*"] CSS substring selectors in index.css from collapsing layout containers', () => {
      const cssPath = path.resolve(__dirname, '../../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      expect(cssContent).not.toMatch(/,\s*\[class\*="w-\d/);
      expect(cssContent).not.toMatch(/,\s*\[class\*="h-\d/);
    });
  });
});
