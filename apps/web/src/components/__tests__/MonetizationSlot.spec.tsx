import React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SupporterFuelBadge } from '../MonetizationSlot';

describe('Supporter & Site Integrity Components', () => {
  describe('SupporterFuelBadge', () => {
    it('renders fuel server button with Ko-fi link attributes', () => {
      render(<SupporterFuelBadge />);
      const badge = screen.getByTitle(/Fuel the server/i);
      expect(badge).toBeDefined();
      expect(badge.getAttribute('target')).toBe('_blank');
      expect(badge.getAttribute('rel')).toBe('noopener noreferrer');
      expect(badge.getAttribute('href')).toBe('https://ko-fi.com/thenom');
      expect(screen.getByText('FUEL SERVER')).toBeDefined();
    });
  });

  describe('Site Assets & CSS Regression Guards', () => {
    it('prevents unscoped [class*="w-*"] CSS substring selectors in index.css from collapsing layout containers', () => {
      const cssPath = path.resolve(__dirname, '../../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      expect(cssContent).not.toMatch(/,\s*\[class\*="w-\d/);
      expect(cssContent).not.toMatch(/,\s*\[class\*="h-\d/);
    });

    it('keeps site ad-free and provides clean robots.txt, sitemap.xml, privacy.html, and index.html metadata', () => {
      const publicDir = path.resolve(__dirname, '../../../public');
      const indexHtmlPath = path.resolve(__dirname, '../../../index.html');

      expect(fs.existsSync(path.join(publicDir, 'ads.txt'))).toBe(false);

      const robotsTxt = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf-8');
      expect(robotsTxt).toContain('User-agent: *');
      expect(robotsTxt).toContain('Allow: /');
      expect(robotsTxt).toContain('Sitemap: https://scbind.com/sitemap.xml');

      const sitemapXml = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf-8');
      expect(sitemapXml).toContain('<loc>https://scbind.com/</loc>');
      expect(sitemapXml).toContain('<loc>https://scbind.com/privacy.html</loc>');

      const privacyHtml = fs.readFileSync(path.join(publicDir, 'privacy.html'), 'utf-8');
      expect(privacyHtml).not.toContain('Google AdSense');
      expect(privacyHtml).not.toContain('google-adsense-account');
      expect(privacyHtml).toContain('no third-party advertisements');

      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(indexHtml).not.toContain('adsbygoogle.js');
      expect(indexHtml).not.toContain('google-adsense-account');
      expect(indexHtml).toContain('pp_resortdevices');
    });
  });
});
