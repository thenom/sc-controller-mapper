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

## 5. Extracting Updated Game Files (`sc-daemon` Contributor Workflow)

When RSI releases a new Star Citizen patch (LIVE, PTU, or EPTU), contributors update the repository's action catalog and base profile so players have access to new flight modes, weapon actions, and updated localization tokens.

> [!IMPORTANT]
> **Why updates are committed to git and submitted via PR (Not streamed at runtime):**
> Keybinding Architect is deployed in production as a stateless, immutable Nginx container. It does **not** stream or persist game data at runtime over open ports — any runtime state would be wiped immediately when the container restarts or is redeployed. Furthermore, Star Citizen's 90GB `Data.p4k` archive only exists on local player PCs.
>
> Game updates are **build-time schema updates**. Contributors run `sc-daemon --update-project` on their local machine where the game is installed, commit the generated files to git, and open a Pull Request. Once merged, CI/CD bakes the new catalogs into the container image permanently for all players.

### A. Monorepo Files Updated by Extraction
Running `sc-daemon` with `--update-project` (`-u`) automatically generates and updates:
1. `apps/web/public/game-data.json` — The bundled JSON payload containing the base `defaultProfile.xml` and complete localization dictionary.
2. `packages/parser/src/catalog/sc_action_catalog.json` — The canonical action catalog used by the TypeScript parser for category hierarchy, domain mappings, and human-readable action labels.
3. `apps/web/public/data/sc_action_catalog.json` — The client-side catalog consumed by the web application for real-time action search and binding creation.

### B. Step-by-Step Contributor Procedure

#### Step 1: Compile the extraction daemon binary
```bash
npm run daemon:build
```
This builds the native Go binary to `daemon/bin/sc-daemon`.

#### Step 2: Extract game data and update project files
- **Automatic Detection** (parses RSI Launcher logs in `%APPDATA%`):
  ```bash
  npm run daemon:extract
  ```
- **Explicit Star Citizen directory**:
  ```bash
  ./daemon/bin/sc-daemon -p "C:\Program Files\Roberts Space Industries\StarCitizen" -u
  ```
- **Direct `Data.p4k` archive path**:
  ```bash
  ./daemon/bin/sc-daemon --p4k="D:\Games\StarCitizen\LIVE\Data.p4k" -u
  ```
- **Linux / Proton / Wine installations**:
  ```bash
  ./daemon/bin/sc-daemon -p "/mnt/games/StarCitizen/LIVE" -u
  ```

> [!NOTE]
> The daemon streams the archive's central directory using Zip64 byte seeking and decrypts entries in memory via the CryEngine cipher. It does **not** load the 90GB archive into RAM.

#### Step 3: Verify the extracted changes
Check git status and inspect the diff to review newly added actions:
```bash
git status
git diff packages/parser/src/catalog/sc_action_catalog.json
```
Run the automated test suite and build the project:
```bash
npm test
npm run build
```

#### Step 4: Validate in the Web UI
1. Start the local development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173` and click **Contributor Tools** in the top navigation bar.
3. Click **Load Extracted LIVE Data** to verify that the newly extracted profile and action catalog load cleanly.
4. *(Optional)* To test live HTTP streaming:
   ```bash
   npm run daemon:serve   # starts local HTTP daemon on http://127.0.0.1:8765
   ```
   Then click **Sync with Local Daemon** in the Contributor modal.

#### Step 5: Submit a Pull Request
1. Create a dedicated branch:
   ```bash
   git checkout -b chore/update-sc-patch-data
   ```
2. Commit your changes:
   ```bash
   git commit -am "chore(catalog): update action catalog and tokens for SC 4.x.x"
   ```
3. Open a Pull Request on GitHub following the guidelines in Section 7.

---

## 6. Security & Secret Leak Prevention

- **Never** commit `.tfstate` or `*.tfvars` files with real GCP credentials or project IDs.
- Template files ending in `.example` (such as `terraform.tfvars.example` and `apps/web/.env.example`) are checked into git; actual local overrides remain strictly `.gitignored`.
- Pre-commit runs `gitleaks` on every staged commit to intercept secrets before they leave your workstation.

---

## 7. Pull Request Process

1. Fork the repo and create your feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Commit your changes using Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `infra:`, `refactor:`, `chore:`).
3. Ensure all tests pass (`npm test && npm run build`).
4. **AI / LLM Disclosure**: If the changes were developed, generated, or co-authored by an AI agent or LLM, the PR title **must** be prefixed with `🤖` (e.g. `🤖 chore(catalog): ...`) and explicitly declared in the PR description.
5. Push to your fork and submit a Pull Request to `main`.
6. GitHub Actions CI will automatically run linting, tests, OpenTofu validation, and container smoke tests.
