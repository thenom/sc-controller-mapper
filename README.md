# Star Citizen Keybinding Management Suite

A high-performance Keybinding Management Application engineered for Star Citizen's CryEngine-derived XML input architecture.

---

## Repository Architecture

```
sc-mapping/
├── packages/
│   ├── shared-types/                # Shared TypeScript schemas & AST interfaces
│   │   ├── src/actionmaps.ts        # ActionMaps JSON Schema (rebind vs addbind, prefixes)
│   │   ├── src/conflicts.ts         # ConflictSeverity, ConflictDetails, ConflictReport
│   │   ├── src/hardware.ts          # Device definitions, GamepadDetectedInput
│   │   └── src/localization.ts      # LocalizationDictionary, LocalizedActionMetadata
│   ├── parser/                      # Lossless XML DOM Parser & Serializer
│   │   ├── src/ActionMapsParser.ts  # Non-destructive XML DOM to TypeScript AST
│   │   ├── src/LocalizationMerger.ts# global.ini localization ingestion module
│   │   └── src/ActionMapsExporter.ts# XML serializer & hardware instance recompiler
│   └── resolver/                    # Intelligent Conflict Detection Engine
│       ├── src/ConflictResolver.ts  # Core ConflictResolver evaluation class
│       ├── src/ExclusionMatrix.ts   # Operational domain matrix & SCM/NAV flight modes
│       └── src/TemporalEvaluator.ts # activationMode & multiTap temporal analyzer
├── apps/
│   └── web/                         # React 18 / Vite Web Application
│       ├── src/App.tsx              # Main UI with audit view, search, import/export
│       ├── src/components/DeviceRack.tsx # Visual device re-indexer (drag-and-drop)
│       └── src/hooks/useGamepadListener.ts # HTML5 Gamepad API "Listening Mode" hook
└── daemon/                          # Go Local Extraction Daemon & Config Generator
    ├── main.go                      # CLI tool & daemon entrypoint
    ├── pkg/locator/                 # RSI launcher log parser & game path resolution
    ├── pkg/p4k/                     # Zip64 byte streamer & CryEngine decryption cipher
    ├── pkg/parser/                  # global.ini stream parser
    └── pkg/cache/                   # Compressed .scj cache store
```

---

## Phase Implementations

### Phase 1: XML Parsing & Localization Ingestion
- **Distinction between `<rebind>` and `<addbind>`**: Encapsulated in `BindingInput.bindType`. Actions store an array of inputs preserving both primary overrides and secondary bindings.
- **Hardware Prefix Preservation**: `kb1_`, `mo1_`, `gp1_`, `js1_`... are parsed into `devicePrefix` and `hardwareKey`.
- **Localization Ingestion**: `LocalizationMerger` maps Star Citizen token keys (e.g. `@ui_v_pitch`) to human-readable names with fallback heuristics.

### Phase 2: Intelligent Conflict Detection Engine
- **Exclusionary Matrix**: Actions in mutually exclusive operational contexts (e.g., `spaceship_movement` vs `player_input_onfoot`) return **Severity 0 (None)**. Modern 3.23+ Master Modes (`SCM` weapons vs `NAV` quantum) are isolated.
- **Temporal State Evaluator**:
  - **Rule A**: `activationMode="double_tap"` vs single tap = **Severity 1 (Warning - Latency penalty)**.
  - **Rule B**: `multiTap="2"` vs single tap = **Severity 2 (Fatal - Concurrent execution)**.
  - **Rule C**: `activationMode="hold"` vs single tap = **Severity 1 (Warning - Contextual overlap)**, or **Severity 2 (Fatal)** if a destructive action (e.g. `v_eject`, `v_self_destruct`) is involved.

### Phase 3: Hardware Translation & HTML5 Gamepad Listening
- **Device Options & Inversions**: Preserves `<options type="joystick" instance="N" Product="...">` and axis `<invert>` configurations.
- **Drag-and-Drop Instance Remapper**: React `DeviceRack` allows swapping logical instances (e.g. `js1` <-> `js2`), bypassing the in-game `pp_resortdevices` 4-device bug.
- **Global Search-and-Replace Recompiler**: Rewrites `jsX_` prefixes across all bindings upon XML export.
- **HTML5 Gamepad API Listening Mode**: `useGamepadListener` samples physical hardware button presses and axis deflections in real-time, instantly filtering the UI to that input.

### Phase 4: Local Go Extraction Daemon (`sc-daemon`)
- Locates Star Citizen via `--game-path` argument (or auto-discovers from RSI launcher logs).
- Streams bytes directly from `Data.p4k` using Zip64 central directory seek semantics (no 90GB RAM consumption).
- Decrypts entries with the CryEngine cipher key.
- Decodes Crytek's binary `CryXmlB` format and decompresses Zstandard chunks.
- Caches compressed `.scj` payloads to prevent redundant extractions.
- Writes standalone `game-data.json` config fixtures for offline web app consumption.

### Phase 5: Interactive Web UI, Hardware Studio & Contributor Workflow
- **Hardware Device Inspector & Live Controller HUD**: Real-time 32-button matrix and analog axis deflection meters via HTML5 Gamepad API. Translates 0-based DirectInput indices into Star Citizen 1-based codes (`js1_button12`) and supports offline profile simulation mode.
- **Hardware Studio & Preset Generator**: Generates `<options>` blocks, community hardware definitions, starter XML templates, and PR submission templates for new hardware.
- **Starter Presets**: Built-in 1-click templates for Dual VKB Gladiator EVO (HOSAS), Dual VKB with Left Omni-Throttle (OTA 6DOF), and Thrustmaster T.16000M + TWCS.
- **Contributor Hub**: Dedicated developer modal separating `sc-daemon` extraction and PR submission tools from everyday player workflows.
- **Pure Vanilla CSS Architecture**: Clean, high-performance styling without heavy framework overhead, complete with constrained SVG icons, badges, and integrated `? What's this?` guidance modals across all major views.

### Phase 6: Containerization, CI/CD Pipeline & Monetization
- **Hardened Unprivileged Containerization**: Multi-stage Node builder + unprivileged Nginx runtime on port `8080` with SPA routing and `/healthz` healthchecks.
- **GitHub Actions CI Workflow**: Automated pipeline running on free, unlimited public runners on every push and pull request (typechecking, Vitest tests, and Docker smoke build).
- **Multi-Tier Test Suite**: Fast Vitest suite (<1s execution) verifying XML round-trip fidelity, hardware prefix swapping, 4-tier conflict detection, and UI component rendering.
- **Git Hygiene & Secret Protection**: `.pre-commit-config.yaml` using Gitleaks to block credentials, private keys, and `.tfstate` files before commit.
- **Aesthetic Flight-HUD Monetization**: Integrated dark-mode supporter button (amber glowing "Fuel Server" Ko-fi link), cockpit telemetry hardware affiliate cards, and sandbox AdSense display units with graceful adblocker collapse.

---

## Verification & Testing

To run the automated Vitest test suite across all workspace packages:
```bash
npm test
```

To run pre-commit checks and secret scans across all files:
```bash
pre-commit run --all-files
```

To run the full TypeScript monorepo build:
```bash
npm run build
```

To run the web app locally in development mode:
```bash
npm run dev
```

To build and run the Stage 1 container locally or on a private server:
```bash
docker-compose up -d --build
curl -I http://localhost:8080/healthz
```

To build and run the Go extraction daemon (contributors updating game assets):
```bash
npm run daemon:build
./daemon/bin/sc-daemon --help
```
