# Walkthrough: Star Citizen Keybinding Management Architecture

The foundational architecture and core modules for the Star Citizen Keybinding Management Application have been bootstrapped, implemented, and verified.

---

## 1. Directory Structure

The repository is organized as a clean monorepo with clear separation of concerns across type contracts, XML parsing, conflict detection, the React frontend, and the native Go extraction tool:

```
sc-mapping/
├── packages/
│   ├── shared-types/                # Shared TypeScript contracts & AST interfaces
│   │   ├── src/actionmaps.ts        # ActionMaps JSON Schema (rebind vs addbind, prefixes)
│   │   ├── src/conflicts.ts         # ConflictSeverity, ConflictDetails, ConflictReport
│   │   ├── src/hardware.ts          # Physical device options, Gamepad API types
│   │   └── src/localization.ts      # global.ini localization types
│   ├── parser/                      # Lossless XML DOM Parser & Serializer
│   │   ├── src/ActionMapsParser.ts  # DOM to JSON parser with prefix fidelity
│   │   ├── src/LocalizationMerger.ts# global.ini localization ingestion module
│   │   └── src/ActionMapsExporter.ts# XML serializer & hardware instance recompiler
│   └── resolver/                    # Intelligent Conflict Detection Engine
│       ├── src/ConflictResolver.ts  # Core ConflictResolver evaluation class
│       ├── src/ExclusionMatrix.ts   # Operational domain matrix & SCM/NAV flight modes
│       ├── src/TemporalEvaluator.ts # activationMode & multiTap temporal analyzer
│       └── src/test-verify.ts       # Automated verification test suite
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
    ├── pkg/cache/                   # Compressed .scj cache store
    └── bin/sc-daemon                # Compiled Go binary
```

---

## 2. Phase 1: XML Parsing & Localization Ingestion

- **Distinction between `<rebind>` and `<addbind>`**:
  Modeled in `BindingInput` with `bindType: 'rebind' | 'addbind'`, allowing a single action to contain multiple concurrent or alternate hardware inputs.
- **Hardware Prefix Fidelity**:
  Preserves `kb1_`, `mo1_`, `gp1_`, and arbitrary `js{N}_` joystick indices and chorded modifier keys (`lalt+`, `lctrl+`).
- **Localization Merger**:
  Extracts key-value pairs from Star Citizen's `global.ini` (e.g., `@ui_v_pitch=Pitch (Elevator)`), mapping them to action titles with humanized fallbacks.

---

## 3. Phase 2: Intelligent Conflict Detection Engine

- **Exclusionary Context Matrix (`ExclusionMatrix.ts`)**:
  Classifies actionmaps into operational domains (`spaceship`, `onfoot`, `ground_vehicle`, `turret`, `eva`, `spectator`). Actions sharing a key across incompatible domains (e.g. `spaceship_weapons` vs. `player_input_onfoot`) resolve to **Severity 0 (None)** without false alarms.
- **Master Modes Conditioning**:
  Isolates Star Citizen 3.23+ flight modes (`SCM` weapons vs. `NAV` quantum spooling), allowing shared keys between mode-locked commands.
- **Temporal State Machine (`TemporalEvaluator.ts` & `ConflictResolver.ts`)**:
  - **Rule A (`double_tap` vs. single tap)**: Evaluates to **Severity 1 (Warning - Latency Penalty)**, alerting the user to the ~250ms buffer delay on the single-tap action.
  - **Rule B (`multiTap="2"` vs. single tap)**: Evaluates to **Severity 2 (Fatal - Concurrent Collision)** because CryEngine dispatches single tap on the initial downstroke.
  - **Rule C (`hold` vs. single tap)**: Evaluates to **Severity 1 (Warning)** for benign actions, and escalates to **Severity 2 (Fatal)** if a destructive action (`v_eject`, `v_self_destruct`, `v_jettison_cargo`) shares the boundary.

---

## 4. Phase 3: Hardware Translation & HTML5 Gamepad Listening

- **`<options>` Inversions & GUIDs**:
  Preserves `<options type="joystick" instance="N" Product="...">` and axis `<invert>` settings.
- **Device Re-indexing & Export Recompilation**:
  The React `DeviceRack` allows users to drag-and-drop or reassign logical device numbers. The `ActionMapsExporter` performs AST-level rewriting of `js1_` -> `js2_` during XML generation, bypassing the 4-device limitation of `pp_resortdevices`.
- **HTML5 Gamepad API Listening Hook (`useGamepadListener.ts`)**:
  Polls hardware inputs with deadzone filtering (`0.65`) and leading-edge button detection, mapping physical triggers to Star Citizen input strings (`js1_button1`, `js1_pitch`) in real time to filter the binding view.

---

## 5. Phase 4: Local Go Extraction Daemon (`sc-daemon`)

- **Custom Path CLI Flag**:
  Supports `--game-path` (or `-p`) to target any Star Citizen install directory, with automatic fallback to RSI Launcher log discovery (`%APPDATA%\rsilauncher\logs\log.log`).
- **Direct Output Generation**:
  Supports `--output` (or `-o`) to write a self-contained `game-data.json` config file directly to the web app's `public/` directory.
- **Memory-Efficient Zip64 Streaming**:
  Uses `archive/zip` seek semantics (`io.ReaderAt`) to read the Central Directory from `Data.p4k` (90GB+) without loading the file into memory.
- **CryEngine Decryption**:
  Implements the CryEngine 16-byte cipher (`0x5E, 0x7A, 0x20, 0x02, 0x30, 0x2E, 0xEB, 0x1A, 0x3B, 0xB6, 0x17, 0xC3, 0x0F, 0xDE, 0x1E, 0x47`).
- **Compressed `.scj` Cache**:
  Maintains a file-signature-validated gzip cache (`cache.scj`) to prevent redundant archive seeks.
- **Daemon Mode**:
  Supports running as an HTTP loopback service via `--daemon` on `--port 8765`.

---

## 6. Verification Results

### Automated Test Suite (`node packages/resolver/dist/test-verify.js`)
```
=== RUNNING VERIFICATION SUITE ===

✓ ActionMapsParser parsed root: custom_profile version: 1
✓ Devices parsed: 2
✓ Device 1 inversions verified: { pitch: true, throttle: false }
✓ Rebind and Addbind parsed cleanly for v_pitch
✓ Localization enriched label: Pitch (Elevator)

--- Evaluating Rule A (double_tap vs single tap) ---
Result severity: 1 Reason: Input Latency Penalty (~250ms)
✓ Rule A passed (Severity 1 - Warning)

--- Evaluating Rule B (multiTap="2" vs single tap) ---
Result severity: 2 Reason: Concurrent Execution Collision
✓ Rule B passed (Severity 2 - Fatal)

--- Evaluating Rule C (hold vs press on Destructive action: v_eject) ---
Result severity: 2 Reason: Destructive Action Safety Conflict
✓ Rule C passed (Severity 2 - Fatal on Destructive Action)

--- Evaluating Exclusionary Matrix (Flight vs On-Foot) ---
Result severity: 0 Reason: Mutually exclusive operational contexts (spaceship_weapons vs player_input_onfoot)
✓ Exclusionary Matrix passed (Severity 0 - None)

--- Testing Hardware Reassignment (Swap js1 <-> js2) ---
✓ Hardware Recompiler rewritten js1 -> js2 successfully!

=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===
```

### TypeScript & Vite Web App Build (`npm run --workspace=@sc-mapping/web build`)
```
vite v5.4.21 building for production...
✓ 1529 modules transformed.
dist/index.html                   0.84 kB
dist/assets/index-D_-EUXwE.css    2.28 kB
dist/assets/index-B5S7pV_4.js   234.42 kB
✓ built in 1.06s
```

### Go Daemon Build (`npm run daemon:build`)
```
go build -o bin/sc-daemon main.go (Exit code 0, binary created at daemon/bin/sc-daemon)
```
