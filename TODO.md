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

## 4. Cloud Infrastructure Milestones (Stages 2 & 3)

- [ ] **GCP Project Setup**:
  - Create GCP project and enable compute/load balancing APIs.
- [ ] **Stage 2: OpenTofu Semi-Private Deployment**:
  - Populate `infra/tofu/terraform.tfvars` with GCP Project ID and friend IP CIDR ranges.
  - Deploy with `tofu apply` (Cloud Run / GCS + HTTPS Load Balancer + Cloud Armor IP whitelist).
- [ ] **Stage 3: GCP Geo-Locked Public Release**:
  - Transition Cloud Armor security policy to ISO country codes (`origin.region_code`).
  - Enable anti-scraping rate limiting (max 120 req/min/IP).
  - Enable OWASP preconfigured WAF rules (scanner detection, protocol attacks).
  - Provision Google-managed SSL certificate on custom domain.
