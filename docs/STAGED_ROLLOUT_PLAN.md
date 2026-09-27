# Staged Rollout, CI/CD & Monetization Roadmap

This document records the comprehensive staged deployment and monetization blueprint for the **Star Citizen Keybinding Management Suite**, allowing this project to be maintained, deployed, and scaled from any machine or development environment.

---

## 1. Executive Summary & Progression Stages

The project transitions in controlled stages from a private containerized test environment to a secure, cloud-hardened public deployment with self-sustaining monetization:

```
+---------------------------------------------------------------------------------------------------+
| STAGE 1: Private Server Container (Active Local / Dev)                                            |
| - Multi-stage Docker build with unprivileged Nginx on port 8080                                  |
| - Local containerized environment for offline development and testing                             |
| - Functional & aesthetic monetization validation (AdSense sandbox, hardware affiliate cards,     |
|   and "Fuel the Server" supporter button)                                                         |
| - Multi-tier Vitest unit/component test suite (<1s run time) + pre-commit hygiene                  |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
| STAGE 2: Cloudflare Pages & Zero Trust Staged Gating (Completed)                                   |
| - Managed via OpenTofu CLI (`tofu`) in `infra/tofu/` with local state (`tofu.tfstate`)            |
| - Git-safe: sensitive account/zone IDs, IPs, and emails kept in local `terraform.tfvars`          |
| - Automatic build & edge deployment on push to `main` via Cloudflare Pages                        |
| - Stage 2A: Direct IP Whitelist (`allowed_ips`) for developer & initial testers                  |
| - Stage 2B: Email Allowlist (`allowed_emails`) for friends via Cloudflare Access One-Time PIN    |
| - Cost: $0.00 / month (100% free Cloudflare tier)                                                 |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
| STAGE 3: Cloudflare Pages Public Launch (Active Live on scbind.com)                                |
| - Toggled `enable_zero_trust = false` via OpenTofu to remove the Access gate                      |
| - Proxied DNS CNAME with automatic SSL/TLS certificate renewal and CNAME flattening on scbind.com  |
| - Cloudflare Global Edge CDN with automated DDoS mitigation and fast worldwide asset delivery    |
| - Unrestricted access for community pilots and Google AdSense verification crawlers               |
| - Cost: $0.00 / month (unlimited requests and bandwidth on Cloudflare Pages free plan)            |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
| STAGE 4: Self-Sustaining Traffic-Scaled Monetization                                              |
| - Switch `monetization_mode` from "test" to "live" in `infra/tofu/terraform.tfvars`              |
| - High-intent flight sim hardware affiliate partnerships (VKB, VIRPIL, Amazon sim mounts)         |
| - Voluntary community supporter backing (Ko-fi / Patreon "Quantum Fuel")                          |
| - Non-intrusive, dark-mode native Google AdSense / Carbon Ads                                     |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Stage 1: Private Server Deployment Guide

### Running with Docker Compose
1. Ensure Docker and Docker Compose are installed on your private host.
2. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```
3. Verify local health check:
   ```bash
   curl -I http://localhost:8080/healthz
   # HTTP/1.1 200 OK
   ```

### Sharing with Friends (NAT Port Forwarding)
- On your home router, create a port forwarding NAT rule:
  - **External Port**: `8080` (or `80` / `443` if using a domain)
  - **Internal IP**: Local IP of your private server (e.g., `192.168.1.xxx`)
  - **Internal Port**: `8080`
  - **Protocol**: TCP
- Friends navigate to `http://<your-public-ip>:8080`.

### Testing Monetization & Aesthetics
The container runs with `VITE_MONETIZATION_MODE=test` (or `mock`), enabling friends to test:
- **"FUEL SERVER" Button**: Located in the top action toolbar, opening the test supporter link.
- **Hardware Affiliate Card**: Located above the footer, testing referral tracking parameters (`?tag=...`).
- **AdSense Sandbox**: Testing dark-mode sci-fi responsive styling and verifying that adblockers (uBlock Origin, Brave) gracefully collapse the card without breaking layout borders.

---

## 3. GitHub Actions CI/CD Architecture (Public Repository)

Because this repository is public, GitHub provides **unlimited, 100% free runner minutes** on Linux runners.

### Workflow Blueprint (`.github/workflows/ci.yml`)
1. **`build-and-typecheck`**: Compiles TypeScript across all workspace packages (`@sc-mapping/shared-types`, `@sc-mapping/parser`, `@sc-mapping/resolver`, `@sc-mapping/web`).
2. **`test`**: Runs the Vitest test suite (`npm test`).
3. **`tofu-validate`**: Uses `opentofu/setup-opentofu` to run `tofu fmt -check` and `tofu validate` on the `infra/tofu/` directory without needing GCP credentials.
4. **`docker-smoke`**: Validates that `Dockerfile` compiles cleanly on pull requests.

### Git Hygiene & Pre-Commit
Run locally before pushing:
```bash
pre-commit run --all-files
```
- **Gitleaks** prevents any accidental commit of GCP credentials, `.tfstate`, or private keys.
- **Tofu fmt** checks formatting of OpenTofu files.
- **TypeScript build & Vitest** guarantee no regressions reach git.

---

## 4. Stage 2 & 3: Cloudflare Pages & Zero Trust Specifications

### Directory Structure (`infra/tofu/`)
```
infra/tofu/
├── versions.tf               # OpenTofu requirement (>= 1.6.0), cloudflare/cloudflare (~> 4.52), local backend
├── variables.tf              # Account ID, Zone ID, custom_domain (scbind.com), allowed_ips, allowed_emails
├── main.tf                   # cloudflare_pages_project, cloudflare_pages_domain, cloudflare_record, zero trust app & policy
├── outputs.tf                # Live URLs, DNS CNAME, Zero Trust AUD tag, and staged rollout status
└── terraform.tfvars.example  # Git-tracked placeholder template
```

### Critical Rules for OpenTofu
- Always use the **`tofu`** binary:
  ```bash
  cd infra/tofu
  tofu init
  tofu plan
  tofu apply
  ```
- **Local State & Secrets**: `tofu.tfstate`, `*.tfvars`, and cloud API tokens are permanently `.gitignored` and blocked by pre-commit.
- Authentication is handled securely via the `CLOUDFLARE_API_TOKEN` environment variable.

### Staged Access Policy Progression
- **Stage 2A: Private Alpha (`enable_zero_trust = true`, `allowed_ips = ["<your-ip>/32"]`)**:
  - Direct IP Whitelist: developer and initial testers access `https://scbind.com` seamlessly without login prompts.
- **Stage 2B: Semi-Private Beta (`allowed_emails = ["friend@example.com", ...]`)**:
  - Cloudflare Access One-Time PIN (OTP): friends and testers outside whitelisted IPs enter their email and receive a 6-digit access code for a 24-hour session.
- **Stage 3: Public Release (`enable_zero_trust = false`)**:
  - Zero Trust Access Application and Policy are destroyed.
  - Traffic routes directly to Cloudflare Pages edge network on `scbind.com` with automatic DDoS protection and SSL/TLS.

---

## 5. Cost & Monetization Scaling

### Cloudflare Cost Baseline: $0.00 / month
- **Cloudflare Pages**: 100% Free (Unlimited bandwidth, unlimited requests, up to 500 builds/month, custom domain SSL/TLS).
- **Cloudflare DNS & Proxy**: 100% Free (Unlimited DNS queries, edge DDoS mitigation, CNAME flattening for apex `scbind.com`).
- **Cloudflare Zero Trust**: 100% Free (Includes up to 50 active user seats on the Free tier).
- **Target monthly infrastructure cost**: **$0.00 / month**.

### Recouping Strategy & Revenue
Because the hosting cost is $0.00:
1. **Voluntary Backers ("Quantum Fuel")**: 100% of community contributions via Ko-fi go toward developer time and hardware testbeds.
2. **Community Referral Code Randomizer**: Features the creator's code (`STAR-7TZ5-ZNDC`) alongside a community pool where Ko-fi supporters and GitHub code contributors have their referral codes rotated to new pilots (+5,000 UEC enlistment bonus).
3. **Contextual Affiliates**: Hardware referral links on VKB, VIRPIL, and Amazon provide pure upside.
4. **Ad Units**: Optional AdSense / Carbon Ads can be enabled in Stage 4 by setting `monetization_mode = "live"`.

---

## 6. Backlog & Optional Enhancements (TODO)

This section tracks items that are currently optional or deferred for future stages:

### A. Google Analytics (GA4) Cross-Domain Tracking
- **Purpose**: Connect user traffic from the web app with donation conversions on Ko-fi.
- **Tasks**:
  1. Create a free GA4 Property in Google Analytics named `SC Controller Mapper`.
  2. Copy the Measurement ID (`G-XXXXXXXXXX`).
  3. Paste ID into Ko-fi Creator Dashboard: **Settings -> Analytics -> Google Analytics ID**.
  4. (Optional) Add GA4 tracking script to `apps/web/index.html` with cookie consent / IP anonymization enabled.

### B. Hardware Affiliate Program Registrations
- **Purpose**: Earn commissions on joystick, throttle, and mounting hardware referrals.
- **Tasks**:
  1. **Amazon Associates**: Apply for an Amazon Associates account and replace `VITE_AFFILIATE_AMAZON_TAG=scmapper-20` with your verified associate tracking tag.
  2. **VKB / VIRPIL Partner Program**: Reach out to VKB and VIRPIL to register custom community affiliate links and update `VITE_AFFILIATE_VKB_TAG` and `VITE_AFFILIATE_VIRPIL_TAG`.

### C. Google AdSense Public Review & Production Ad Units
- **Purpose**: Transition display ads from sandbox test mode to real revenue generation.
- **Tasks**:
  1. After deploying to a public custom domain in Stage 3 (`enable_zero_trust = false`), submit `scbind.com` for Google AdSense site review.
  2. Create responsive ad units in AdSense dashboard and retrieve your live Publisher ID (`ca-pub-...`) and Slot ID.
  3. Update `adsense_client_id` and `adsense_slot_id` in `infra/tofu/terraform.tfvars`, and switch `monetization_mode = "live"`.

### D. End-to-End (E2E) Browser Automation
- **Purpose**: Comprehensive browser-level testing for complex UI interactions.
- **Tasks**:
  1. Install `@playwright/test` when expanded CI automation is desired.
  2. Implement headless test specs for drag-and-drop device rack re-indexing and XML file upload/export flows.

### E. Cloudflare OpenTofu Live Deployment (Completed)
- **Status**: **Complete**. Deployed live on `scbind.com` via Cloudflare Pages. OpenTofu configuration tracked in `infra/tofu/` with public open access (`enable_zero_trust = false`).
