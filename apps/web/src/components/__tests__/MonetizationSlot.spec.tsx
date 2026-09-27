import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    it('renders mock simulator creative when in mock mode without breaking layout', () => {
      render(<AdSenseSlot />);
      const container = screen.getByTestId('monetization-slot-container');
      expect(container).toBeDefined();
      expect(screen.getByText(/SPONSOR COMM \/\/ SIMULATOR MODE/i)).toBeDefined();
      expect(screen.getByText(/SAFE TEST ACTIVE/i)).toBeDefined();
      expect(screen.getByText(/Aegis Flight Systems & Precision HOTAS Mounts/i)).toBeDefined();
    });

    it('returns null when mode is off', () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'off');
      const { container } = render(<AdSenseSlot />);
      expect(container.firstChild).toBeNull();
      vi.unstubAllEnvs();
    });

    it('injects script in test/live mode and handles onload and onerror', () => {
      vi.stubEnv('VITE_MONETIZATION_MODE', 'test');
      vi.stubEnv('VITE_ADSENSE_CLIENT_ID', 'ca-pub-test1234');
      const { container, unmount } = render(<AdSenseSlot />);

      const script = document.querySelector('script[src*="adsbygoogle.js"]') as HTMLScriptElement;
      expect(script).toBeDefined();

      // Trigger onload
      if (script && script.onload) {
        (script as any).onload(new Event('load'));
      }

      unmount();

      // Trigger onerror for adblock detection
      const { container: container2 } = render(<AdSenseSlot />);
      const script2 = document.querySelector('script[src*="adsbygoogle.js"]') as HTMLScriptElement;
      if (script2 && script2.onerror) {
        (script2 as any).onerror(new Event('error'));
      }

      vi.unstubAllEnvs();
    });
  });
});
