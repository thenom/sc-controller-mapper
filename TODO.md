# Project Backlog & Optional Enhancements (TODO)

This document tracks optional items, future stage milestones, and deferred configurations for the **Star Citizen Keybinding Management Suite**.

---

## 1. Analytics & Tracking (Deferred / Optional)

- [ ] **Google Analytics 4 (GA4) Cross-Domain Tracking with Ko-fi**:
  - Create free GA4 property named `SC Controller Mapper` in [Google Analytics](https://analytics.google.com/).
  - Copy Measurement ID (`G-XXXXXXXXXX`).
  - Paste into Ko-fi dashboard: **Settings -> Analytics -> Google Analytics ID**.
  - (Optional) Insert GA4 tracking snippet in `apps/web/index.html` with anonymized IP and cookie consent.

---

## 2. Monetization & Partner Programs (Deferred to Public Launch)

- [x] **Star Citizen Recruit Referral Code Randomizer**:
  - Implemented interactive Star Citizen Referral Code box with creator code `STAR-7TZ5-ZNDC` as permanent anchor.
  - Community Randomizer pool supporting Ko-fi supporters and GitHub PR code contributors (`apps/web/src/data/referralCodes.ts`).
  - One-click copy with feedback, direct RSI enlist link (+5,000 UEC bonus callout), pilot attribution, and comprehensive "What's this?" help modal.
- [ ] **Active Ko-fi Page**:
  - Linked to `https://ko-fi.com/thenom` (Configured in `apps/web/.env` and `MonetizationSlot.tsx`).
- [ ] **Amazon Associates**:
  - Sign up for [Amazon Associates](https://affiliate-program.amazon.com/).
  - Replace placeholder `VITE_AFFILIATE_AMAZON_TAG=scmapper-20` with your verified associate tracking tag.
- [ ] **Flight Hardware Partnerships (VKB / VIRPIL)**:
  - Apply to VKB-Sim and VIRPIL Controls creator/partner programs.
  - Update `VITE_AFFILIATE_VKB_TAG` and `VITE_AFFILIATE_VIRPIL_TAG`.
- [ ] **Google AdSense Public Approval**:
  - After deploying with a public domain in Stage 3, submit site to Google AdSense review.
  - Replace sandbox ID `ca-pub-0000000000000000` with live publisher ID and switch `VITE_MONETIZATION_MODE=live`.

---

## 3. Testing & Automation Enhancements

- [x] **Node 22 & Node 24 Matrix CI Testing (Completed)**:
  - Configured parallel matrix strategy in `.github/workflows/ci.yml` testing build, typecheck, and Vitest suite across both Node 22 and Node 24.
- [x] **GitHub Dependabot Integration (Completed)**:
  - Added `.github/dependabot.yml` with automated weekly/monthly updates for npm monorepo workspaces, GitHub Actions, OpenTofu providers, and Docker images.
  - Follows repository commit conventions with robot emoji prefixes (`🤖 chore(...)`).
- [ ] **Playwright Headless Browser Tests**:
  - Install `@playwright/test` for full browser automation when deeper CI coverage is desired.
  - Add end-to-end tests for XML file upload, drag-and-drop joystick re-indexing, and download flows.
- [ ] **Tailwind CSS v4 Architectural Migration**:
  - Migrate from Tailwind v3 (`tailwind.config.js` + PostCSS) to Tailwind v4 CSS-first architecture (`@tailwindcss/vite` + `@theme` directive in `index.css`).
  - Migrate custom cockpit sci-fi colors (`#00f0ff`, `#ffb700`, `#0b111e`) and fonts into CSS `@theme` tokens.
  - Verify zero visual regressions across all cockpit HUD themes and modals.

---

## 4. Cloud Infrastructure Milestones (Cloudflare Pages & Zero Trust)

- [x] **Stage 2A: Cloudflare Pages & Zero Trust Deployment (Completed)**:
  - Deployed static web application to Cloudflare Pages via OpenTofu (`infra/tofu/`).
  - Attached custom domain `scbind.com` and configured proxied DNS CNAME.
  - Configured Cloudflare Zero Trust Access Application and IP whitelist policy.
  - Hardened Git security with pre-commit gates (`block-sensitive-files.sh`, `detect-private-key`, `gitleaks`).
- [x] **Stage 3: Public Release (Completed)**:
  - Set `enable_zero_trust = false` in `infra/tofu/terraform.tfvars` and ran `tofu apply`.
  - Opened `https://scbind.com` to the world with automated edge DDoS protection, global CDN caching, and SSL/TLS.
