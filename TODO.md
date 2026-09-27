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

- [ ] **Playwright Headless Browser Tests**:
  - Install `@playwright/test` for full browser automation when deeper CI coverage is desired.
  - Add end-to-end tests for XML file upload, drag-and-drop joystick re-indexing, and download flows.

---

## 4. Cloud Infrastructure Milestones (Cloudflare Pages & Zero Trust)

- [x] **Stage 2A: Cloudflare Pages & Zero Trust Deployment (Completed)**:
  - Deployed static web application to Cloudflare Pages via OpenTofu (`infra/tofu/`).
  - Attached custom domain `scbind.com` and configured proxied DNS CNAME.
  - Configured Cloudflare Zero Trust Access Application and IP whitelist policy.
  - Hardened Git security with pre-commit gates (`block-sensitive-files.sh`, `detect-private-key`, `gitleaks`).
- [ ] **Stage 2B: Tester Email Allowlist**:
  - Add tester/friend email addresses to `allowed_emails` in `infra/tofu/terraform.tfvars` for One-Time PIN beta access.
  - Run `tofu apply`.
- [ ] **Stage 3: Public Release**:
  - Set `enable_zero_trust = false` in `infra/tofu/terraform.tfvars` and run `tofu apply`.
  - Opens `https://scbind.com` to the world with automated edge DDoS protection and SSL/TLS.
