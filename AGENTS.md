# AGENTS.md — Star Citizen Keybinding Management Suite

## 1. Project Overview & Purpose

This project is a high-performance web-based Keybinding Management Suite designed specifically for Star Citizen's CryEngine-derived XML input architecture. It addresses critical limitations of the in-game keybinding interface:

1. **The 4-Device Limitation**: Star Citizen's console command `pp_resortdevices` cannot remap setups with more than 4 connected input devices (common in complex HOTAS/HOSAS/pedal setups). This suite bypasses that limitation by rewriting `jsX_` prefixes at the XML AST level.
2. **Lossless XML Parsing & Round-Tripping**: Preserves `<options>` blocks (inversions, product GUIDs, deadzones), along with primary `<rebind>` and additive `<addbind>` inputs.
3. **Intelligent Conflict Detection**: Distinguishes between harmless overlaps in mutually exclusive flight/ground modes and fatal collisions using temporal state machine analysis (`multiTap`, `activationMode`, Master Modes SCM/NAV).
4. **Hardware Listening**: HTML5 Gamepad API listener to detect physical button/axis presses in real time and jump straight to the relevant binding in the UI.
5. **Native Go Extraction Daemon (`sc-daemon`)**: Direct Zip64 central directory streamer and CryEngine cipher decryptor to extract default bindings and localization strings directly from Star Citizen's 90GB+ `Data.p4k` archive without high RAM consumption.

Detailed specifications, mathematical formulas, and cipher routines are documented in [docs/ARCHITECTURE_BLUEPRINT.md](docs/ARCHITECTURE_BLUEPRINT.md).

---

## 2. Monorepo Architecture

The repository is organized as an npm workspace monorepo:

```
sc-mapping/
├── AGENTS.md                     # Agent context & architectural guidelines (this file)
├── README.md                     # High-level overview & quickstart
├── CONTRIBUTING.md               # Open source contributor setup & PR guidelines
├── TODO.md                       # Project backlog & deferred enhancements
├── Dockerfile                    # Multi-stage unprivileged Nginx container build
├── docker-compose.yml            # Stage 1 private server container definition
├── docs/
│   ├── ARCHITECTURE_BLUEPRINT.md # Full 40KB system specification, rules, and cipher specs
│   ├── STAGED_ROLLOUT_PLAN.md    # Multi-stage deployment, GCP OpenTofu, & monetization plan
│   └── BOOTSTRAP_WALKTHROUGH.md  # Implementation log of initial bootstrap
├── sample-data/                  # Offline sample XML profiles and localization fixtures
│   ├── dual_vkb_evo_hosas.xml    # Dual VKB Gladiator EVO profile (HOSAS)
│   ├── hotas_t16000m.xml         # Thrustmaster T.16000M + TWCS profile
│   └── sample_global.ini         # Extracted localization tokens
├── packages/
│   ├── shared-types/             # TypeScript AST interfaces, conflict models, hardware types
│   │   └── src/                  # actionmaps.ts, conflicts.ts, hardware.ts, localization.ts
│   ├── parser/                   # Non-destructive XML DOM Parser & Serializer (@xmldom/xmldom)
│   │   └── src/                  # ActionMapsParser.ts, ActionMapsExporter.ts, LocalizationMerger.ts
│   └── resolver/                 # Intelligent Conflict Detection Engine
│       └── src/                  # ConflictResolver.ts, ExclusionMatrix.ts, TemporalEvaluator.ts
├── apps/
│   └── web/                      # React 18 / Vite Web Application
│       └── src/
│           ├── components/       # DeviceRack.tsx, MonetizationSlot.tsx, etc.
│           ├── hooks/            # useGamepadListener.ts (HTML5 Gamepad API hook)
│           └── App.tsx           # Main workspace UI
└── daemon/                       # Go extraction daemon (sc-daemon)
    ├── main.go                   # CLI and HTTP server
    └── pkg/                      # p4k extraction, locator, parser, cache
```

---

## 3. Core Technical Invariants

When modifying or extending this codebase, adhere to these domain invariants:

### A. `<rebind>` vs. `<addbind>`
- Star Citizen XML distinguishes between `<rebind>` (which replaces an engine default) and `<addbind>` (which binds an additional concurrent input).
- Actions store inputs in an array `BindingInput[]` where each entry has `bindType: 'rebind' | 'addbind'`.
- Never collapse or discard `addbind` nodes during parsing or serialization.

### B. Hardware Prefix Fidelity
- Device inputs are prefixed (e.g. `kb1_`, `mo1_`, `gp1_`, `js1_`, `js2_`...).
- Joy inputs can have chorded modifiers (e.g. `lalt+js1_button1`).
- Device instance numbers are 1-based (`js1`, `js2`, etc.).

### C. Conflict Evaluation Pipeline
Conflicts are rated across a 4-tier severity spectrum:
- `Severity 0 (None)`: Non-overlapping operational contexts (e.g. `spaceship_movement` vs `player_input_onfoot`), mutually exclusive cockpit **Operator Modes** (`spaceship_weapons`, `spaceship_missiles`, `spaceship_mining`, `spaceship_salvage`, `spaceship_scanning`), mode toggles (`v_toggle_mining_mode` vs `v_toggle_salvage_mode`), or isolated Master Modes (`SCM` weapons vs `NAV` quantum spool).
- `Severity 1 (Warning)`: Contextual overlap or latency penalty:
  - *Rule A*: `double_tap` vs `press` (~250ms buffer latency).
  - *Rule B*: `multiTap="2"` vs `multiTap="1"` (~250ms buffer latency on single-tap while engine checks for double-tap; standard pattern for ATC / Target pins).
  - *Rule C*: `hold` vs `press` on non-destructive commands.
- `Severity 2 (Fatal)`: Concurrent or destructive execution:
  - *Direct Action Collision*: Identical activation mode and tap count inside concurrent contexts.
  - *Rule C Escalation*: `hold` vs `press` sharing an input where one action is destructive (`v_eject`, `v_self_destruct`, `v_jettison_cargo`, `player_suicide`).
- `Severity 3 (Redundant / Obsolete)`: Subsumed functionality or legacy version deprecation:
  - *Rule R1 (Subsumed Action Redundancy)*: Sharing an input where one command functionally encompasses the other (e.g. `v_flightready` + `v_power_set_on`, `v_open_all_doors` + `v_unlock_all_doors`).
  - *Rule R2 (Current Version Deprecation)*: Mappings for flight or combat systems that were removed or superseded in modern Star Citizen builds (e.g. legacy cruise control `v_ifcs_toggle_cruise_control`, legacy speed limiter reset, legacy quantum mode toggles, legacy PIP toggles).

### D. Device Re-Indexing
- Swapping device numbers in `DeviceRack` must update `<options>` instance attributes AND rewrite all matching `jsX_` prefixes across all actions during export.

### E. OpenTofu Compliance & Secret Safety
- When working with `.tf` files, **always** use the `tofu` CLI binary (OpenTofu).
- Maintain local state (`backend "local"`), and never commit `.tfstate`, `*.tfvars`, or cloud credentials to git.

### F. Daemon-Managed Catalog & Game Metadata Extraction
- **Rule of Dynamic Sourcing (No Hardcoded Game Action Lists)**:
  - Game properties that can change across Star Citizen patches—including `defaultActivationMode` (`delayed_press`, `tap`, `press`, `hold`), `defaultMultiTap` (1 or 2), and `masterFlightMode` (`SCM` vs `NAV`)—**must be managed dynamically by the Go extraction daemon (`sc-daemon`)** and sourced from `defaultProfile.xml` and `global.ini`.
  - **NEVER** hardcode lists of action names in resolver heuristics or parser logic (e.g. do not maintain static sets like `INHERENT_HOLD_ACTIONS` or static lists of SCM/NAV action names in TypeScript code).
- **CryEngine XML Omission & Fallback Contract**:
  - Star Citizen's XML profile exporter omits the `activationMode` and `multiTap` attributes when a custom keybinding uses the engine's default mode.
  - When resolving input conflicts in `TemporalEvaluator` and `ExclusionMatrix`, code **MUST** query `CatalogManager.getDefaultActivationMode(actionName)` and `CatalogManager.getMasterFlightMode(actionName)` before falling back to textual cues (`(Hold)`, `long press`) or naming suffixes (`_hold`, `_tap`). Missing attributes must NOT simply default to `'press'` without consulting the catalog.
- **Synchronized Catalog Regeneration Pipeline**:
  - `sc-daemon` extracts `defaultProfile.xml` and `global.ini` from Star Citizen's `Data.p4k` (or falls back to `apps/web/public/game-data.json` during offline dev / CI).
  - Running `npm run daemon:extract` (or `./daemon/bin/sc-daemon --update-project`) automatically updates:
    1. `packages/parser/src/catalog/sc_action_catalog.json` (canonical parser catalog)
    2. `apps/web/public/data/sc_action_catalog.json` (web app client catalog)
    3. `packages/parser/src/catalog/defaultCatalog.ts` (TypeScript AST constant)
    4. `apps/web/public/game-data.json` (web app live extraction cache)
  - Whenever game files are updated or patch data changes, agents and contributors must run `npm run daemon:extract` to ensure resolver heuristics and action catalogs reflect the latest patch data.

---

## 4. Development & Verification Commands

```bash
# Install dependencies
npm install

# Run automated Vitest test suite across all workspace packages
npm test

# Run pre-commit checks and secret scans across all files
pre-commit run --all-files

# Start the Web Application locally in dev mode
npm run dev

# Run full project build (packages + web)
npm run build

# Build and run Stage 1 container locally or on private server
docker-compose up -d --build

# Build the Go extraction daemon
npm run daemon:build
# Run daemon patch extraction & monorepo catalog update
npm run daemon:extract
# Run daemon HTTP server for live web UI sync
npm run daemon:serve
# Run daemon CLI help
./daemon/bin/sc-daemon --help
```

---

## 5. Offline / Portable Development

If developing on a machine without Star Citizen installed:
- Use files in `sample-data/` to load test profiles into the web UI or parser.
- The web app operates 100% client-side in the browser via file upload/download without requiring the Go daemon.

---

## 6. AI Agent / LLM Contribution Policy

If a Pull Request is developed, generated, or co-authored with the assistance of an AI Agent or Large Language Model (LLM):
1. **PR Title Flag**: The PR title **must** be flagged with a robot emoji (`🤖`), e.g.:
   - `🤖 feat(resolver): add Master Mode weapon toggle exclusion`
   - `🤖 fix(parser): handle chorded joystick modifiers during export`
2. **PR Description Disclosure**: The PR description **must** state clearly and explicitly that the code was developed with or by an AI agent/LLM, detailing the prompt/context, tools used, and manual/automated verification steps taken.
3. **Strict Ban on Co-Authored-By Git Trailers for AI**: **NEVER** add `Co-authored-by:` Git trailers for AI agents or emails (e.g. `antigravity@google.com` or any agent placeholder email). GitHub parses Git trailers and maps emails to real user accounts (such as `@shimonenator`). Disclose AI assistance solely in PR descriptions or commit message prose, never via Git trailers.
