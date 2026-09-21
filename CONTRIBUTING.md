# Contributing to Star Citizen Keybinding Suite

Thank you for your interest in contributing to the **Star Citizen Keybinding Management Suite**! This project is an open-source, high-performance tool designed for complex HOTAS/HOSAS/pedal keybinding management, conflict detection, and CryEngine XML manipulation.

---

## 1. Prerequisites

Before starting, ensure your local development environment has:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **OpenTofu**: `tofu` CLI `>= 1.6.0`  
  *(Note: All infrastructure and `.tf` files in this repository strictly use the `tofu` binary, not proprietary Terraform)*
- **Docker & Docker Compose**: For local containerized testing
- **Go**: `v1.22+` *(only needed if modifying the native extraction daemon in `daemon/`)*
- **pre-commit**: Recommended for automated git hygiene and secret scanning (`pip install pre-commit`)

---

## 2. Quickstart & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/sc-controller-mapper.git
   cd sc-controller-mapper
   ```

2. **Install monorepo dependencies**:
   ```bash
   npm install
   ```

3. **Install pre-commit hooks**:
   ```bash
   pre-commit install
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Core Architecture & Non-Negotiable Invariants

When contributing code, please maintain these domain invariants:

### A. `<rebind>` vs. `<addbind>` Preservation
- Star Citizen XML distinguishes between `<rebind>` (replaces an engine default) and `<addbind>` (adds a concurrent input).
- Actions store inputs in an array `BindingInput[]` where each entry has `bindType: 'rebind' | 'addbind'`.
- **Never** collapse or discard `addbind` nodes during parsing or export.

### B. Hardware Prefix Fidelity
- Device inputs are prefixed (e.g. `kb1_`, `mo1_`, `gp1_`, `js1_`, `js2_`...).
- Joysticks can feature chorded modifiers (e.g. `lalt+js1_button1`).
- Device instance numbers are 1-based (`js1`, `js2`, etc.).

### C. 4-Tier Conflict Severity Model
- **Severity 0 (None)**: Non-overlapping operational contexts (e.g. `spaceship_movement` vs `player_input_onfoot`) or isolated Master Modes (`SCM` weapons vs `NAV` quantum spool).
- **Severity 1 (Warning)**: Contextual overlap or latency penalty (e.g. `double_tap` vs `press` ~250ms buffer latency, `multiTap="2"` vs `multiTap="1"`).
- **Severity 2 (Fatal)**: Concurrent execution or destructive command overlap (`v_eject`, `v_self_destruct`, `v_jettison_cargo`, `player_suicide`).
- **Severity 3 (Redundant / Deprecated)**: Subsumed functionality (e.g. `v_flightready` + `v_power_set_on`) or removed legacy flight bindings (`v_ifcs_toggle_cruise_control`).

### D. Aesthetic Integrity & Monetization
- The suite features a custom dark cyberpunk/cockpit theme (`#0B0F19`, `#0F172A`, cyan/amber glowing accents).
- Any UI components or monetization slots must preserve visual immersion. Never introduce bright, unstyled, or intrusive ad banners.

---

## 4. Verification & Testing Commands

Always run the full verification suite before submitting a pull request:

```bash
# 1. Run all unit and component tests (Vitest)
npm test

# 2. Compile TypeScript across all packages and the web application
npm run build

# 3. Validate OpenTofu infrastructure code
cd infra/tofu
tofu init -backend=false
tofu fmt -check
tofu validate
cd ../..

# 4. Build and test Go daemon (if daemon files changed)
npm run daemon:build
cd daemon && go test ./... && cd ..

# 5. Run pre-commit checks manually across all files
pre-commit run --all-files
```

---

## 5. Security & Secret Leak Prevention

- **Never** commit `.tfstate` or `*.tfvars` files with real GCP credentials or project IDs.
- Template files ending in `.example` (such as `terraform.tfvars.example` and `apps/web/.env.example`) are checked into git; actual local overrides remain strictly `.gitignored`.
- Pre-commit runs `gitleaks` on every staged commit to intercept secrets before they leave your workstation.

---

## 6. Pull Request Process

1. Fork the repo and create your feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Commit your changes using Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `infra:`, `refactor:`).
3. Ensure all tests pass (`npm test && npm run build`).
4. Push to your fork and submit a Pull Request to `main`.
5. GitHub Actions CI will automatically run linting, tests, OpenTofu validation, and container smoke tests.
