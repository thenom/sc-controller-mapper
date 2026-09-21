# Staged Rollout, CI/CD & Monetization Roadmap

This document records the comprehensive staged deployment and monetization blueprint for the **Star Citizen Keybinding Management Suite**, allowing this project to be maintained, deployed, and scaled from any machine or development environment.

---

## 1. Executive Summary & Progression Stages

The project transitions in controlled stages from a private containerized test environment to a secure, cloud-hardened public deployment with self-sustaining monetization:

```
+---------------------------------------------------------------------------------------------------+
| STAGE 1: Private Server Container (Active)                                                        |
| - Multi-stage Docker build with unprivileged Nginx on port 8080                                  |
| - Exposed to friends via simple home router NAT port forwarding                                   |
| - Functional & aesthetic monetization validation (AdSense sandbox, hardware affiliate cards,     |
|   and "Fuel the Server" supporter button)                                                         |
| - Multi-tier Vitest unit/component test suite (<1s run time) + pre-commit hygiene                  |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
| STAGE 2: GCP Semi-Private via OpenTofu (Local State & IP Whitelisting)                            |
| - Managed via OpenTofu CLI (`tofu`) with strictly local state (`tofu.tfstate`)                    |
| - Git-safe: sensitive project IDs and IPs kept in local `terraform.tfvars` (gitignored)           |
| - Cloud Run / Cloud Storage backend behind Global HTTPS Load Balancer                             |
| - Google Cloud Armor Security Policy: Strict IP CIDR whitelist for testers; default 403 Forbidden |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
| STAGE 3: GCP Geo-Locked Hardened Public Deployment                                                |
| - Cloud Armor policy evolved to ISO country allowlist (e.g. US, GB, CA, DE, FR, AU)               |
| - Layer 7 DDoS & Anti-Scraping Rate Limiting (max 120 req/min per IP)                             |
| - Preconfigured OWASP WAF rules (scanner detection, protocol attacks)                             |
| - Google-managed SSL/TLS certificate with auto-renewal and HTTP-to-HTTPS redirect                  |
+---------------------------------------------------------------------------------------------------+
                                                │
                                                ▼
+---------------------------------------------------------------------------------------------------+
| STAGE 4: Self-Sustaining Traffic-Scaled Monetization                                              |
| - Switch `VITE_MONETIZATION_MODE` from "test" to "live"                                           |
| - High-intent flight sim hardware affiliate partnerships (VKB, VIRPIL, Amazon sim mounts)         |
| - Voluntary community supporter backing (Ko-fi / Patreon "Quantum Fuel")                          |
| - Non-intrusive, dark-mode native Google AdSense / Carbon Ads to offset GCP Load Balancer costs    |
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

## 4. Stage 2 & 3: GCP OpenTofu Specifications

### Directory Structure (`infra/tofu/`)
```
infra/tofu/
├── versions.tf               # OpenTofu requirement (>= 1.6.0) and google provider
├── backend.tf                # local backend: path = "tofu.tfstate"
├── variables.tf              # Configurable project_id, region, allowed_ips, access_mode
├── terraform.tfvars.example  # Git-tracked placeholder template
├── security.tf               # Google Cloud Armor security policies
├── compute.tf                # Cloud Run container or Cloud Storage SPA backend
├── loadbalancer.tf           # Global HTTPS Load Balancer & Google-managed SSL
└── outputs.tf                # Public IP, DNS instructions
```

### Critical Rules for OpenTofu
- Always use the **`tofu`** binary:
  ```bash
  cd infra/tofu
  tofu init
  tofu plan
  tofu apply
  ```
- **Local State & Secrets**: `tofu.tfstate`, `*.tfvars`, and GCP service account keys are permanently `.gitignored`.

### Cloud Armor Policy Modes
- **Stage 2 (`access_mode = "ip_whitelist"`)**:
  - Rule 1000: `src_ip_ranges: var.allowed_ip_cidrs` $\rightarrow$ `allow`
  - Default: `deny(403)`
- **Stage 3 (`access_mode = "geo_locked"`)**:
  - Rule 1000: `origin.region_code` in `["US", "GB", "CA", "DE", "FR", "AU"]` $\rightarrow$ `allow`
  - Rule 2000 (Rate Limit): Max 120 req/min/IP $\rightarrow$ `rate_limit_threshold`
  - Rule 3000 (WAF): `evaluatePreconfiguredExpr('scannerdetection-v33-stable')` $\rightarrow$ `deny(403)`
  - Default: `deny(403)`

---

## 5. Cost & Monetization Scaling

### GCP Cost Baseline
- An External Application Load Balancer costs ~$18–$20/month base fee for forwarding rules, plus Cloud Armor policy rules ($5/policy/mo + $1/rule/mo).
- Cloud Run / Cloud Storage compute is near-zero for low/moderate traffic.
- Target monthly infrastructure cost: ~$25–$30/month.

### Recouping Strategy
1. **Contextual Affiliates**: A single joystick or desk mount purchase via referral ($150–$300) yields ~$10–$25 commission, covering up to a full month of Load Balancer fees.
2. **Voluntary Backers ("Quantum Fuel")**: 5–10 regular community supporters on Ko-fi/Patreon cover the baseline hosting.
3. **Ad Units**: Once traffic exceeds ~20,000 monthly pageviews, live AdSense/Carbon ad impressions offset traffic bandwidth scaling.

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
  1. After deploying to a public custom domain in Stage 3, submit the domain for Google AdSense site review.
  2. Create responsive ad units in AdSense dashboard and retrieve your live Publisher ID (`ca-pub-...`) and Slot ID.
  3. Update `VITE_ADSENSE_CLIENT_ID` and `VITE_ADSENSE_SLOT_ID`, and switch `VITE_MONETIZATION_MODE=live`.

### D. End-to-End (E2E) Browser Automation
- **Purpose**: Comprehensive browser-level testing for complex UI interactions.
- **Tasks**:
  1. Install `@playwright/test` when expanded CI automation is desired.
  2. Implement headless test specs for drag-and-drop device rack re-indexing and XML file upload/export flows.

### E. Stage 2 & Stage 3 OpenTofu GCP Execution
- **Purpose**: Migrate from private home server to automated GCP infrastructure.
- **Tasks**:
  1. Create GCP Project and set up billing.
  2. Populate `infra/tofu/terraform.tfvars` with your project ID and friend IP CIDR blocks.
  3. Deploy Stage 2 with `tofu apply` (Cloud Run / GCS + Global HTTPS LB + Cloud Armor IP whitelist).
  4. Transition to Stage 3 (Cloud Armor Geo-fencing + OWASP WAF rules + Google Edge DDoS).

