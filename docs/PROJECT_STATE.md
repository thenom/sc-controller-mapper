# Star Citizen Keybinding Management Suite — Project State & Roadmap

**Last Updated**: 2026-09-21  
**Current Milestone**: Phase 4 Real-World Game Integration Complete; Phase 5 Interactive Web UI Enhancement in progress.

---

## 1. Executive Summary

This project provides a lossless, high-performance Keybinding Management Suite for Star Citizen's CryEngine XML input system. It bypasses the in-game 4-device `pp_resortdevices` ceiling, non-destructively parses primary `<rebind>` and additive `<addbind>` inputs, evaluates binding conflicts via a temporal state machine and exclusionary context matrix, and extracts base game profiles directly from the 90GB+ `Data.p4k` archive via a native Go daemon (`sc-daemon`).

---

## 2. Component Implementation Status

| Component | Target Location | Status | Key Features & Notes |
| :--- | :--- | :---: | :--- |
| **Shared Types** | `packages/shared-types` | **Complete** | AST interfaces, `BindingInput` (`rebind` vs `addbind`), `ConflictSeverity` (0, 1, 2), hardware device options. |
| **XML Parser & Serializer** | `packages/parser` | **Complete** | Non-destructive DOM parsing via `@xmldom/xmldom`. Supports both user `<ActionMaps>` and base game `<profile>`. Preserves `<options>`, inversions, GUIDs, and chorded modifiers. Lossless export with `jsX_` remapping. |
| **Conflict Detection Engine** | `packages/resolver` | **Complete** | Exclusionary context matrix (on-foot vs flight vs turret). SC 3.23+ SCM vs NAV Master Mode isolation. Temporal rules: Rule A (double-tap latency), Rule B (multiTap collision), Rule C (hold vs tap with destructive action safety). |
| **Hardware Listener** | `apps/web/src/hooks/useGamepadListener.ts` | **Complete** | HTML5 Gamepad API polling with 0.65 deadzone and leading-edge button detection. Emits `jsX_buttonY` and `jsX_axis` events. |
| **Device Rack Remapper** | `apps/web/src/components/DeviceRack.tsx` | **Complete** | Drag-and-drop joystick instance re-ordering. Generates instance remapping table for AST-level recompilation. |
| **Go Extraction Daemon** | `daemon/` | **Complete** | Direct Zip64 central directory streamer (`io.ReaderAt`). CryEngine 16-byte XOR cipher decryptor. Zero-dependency `CryXmlB` binary XML decoder. Method 100 (zstd) decompression. Local `.scj` cache and HTTP server (`:8765`). |
| **Web UI Application** | `apps/web/` | **Complete** | React 18 / Vite app with sci-fi HUD styling. Includes DeviceRack remapping, ConflictViewer diagnostics, filterable & paginated BindingTable, interactive BindingEditorModal with Gamepad API capture, and 1-click Preset Quick-Loader. |

---

## 3. Real-World CryEngine Discoveries & Fixes

When integrating against real Star Citizen game files (`.../StarCitizen/LIVE/Data.p4k`), several low-level undocumented characteristics were discovered and implemented:

1. **`CryXmlB` Binary XML Format**:
   - `Data/Libs/Config/defaultProfile.xml` inside `Data.p4k` is stored in Crytek's compiled binary format (`CryXmlB\0`).
   - Implemented `daemon/pkg/cryxml/decoder.go` to reconstruct standard XML text from binary node, attribute, and string tables without external C++ or Python dependencies.
2. **Zip64 32-Byte Header Sizing**:
   - Standard Go `archive/zip` fails on CIG's custom 32-byte Zip64 extra field records. Implemented `findZip64HeaderOffset` in `daemon/pkg/p4k/extractor.go` to accurately stream raw compressed streams.
3. **Zstandard Compression (Method 100 / `0x64`)**:
   - Modern `Data.p4k` archives compress entries with Zstandard. Added `github.com/klauspost/compress/zstd` decompressor to `sc-daemon`.
4. **CIG Local Header Signature**:
   - Handled both standard `PK\x03\x04` (`0x04034b50`) and CIG-specific `0x14034b50` zip signatures.
5. **Base Game `<profile>` vs User `<ActionMaps>`**:
   - Base game XML uses root `<profile>` with inline device attributes (`keyboard="1" mouse="1" gamepad="1" joystick="1"`), while exported profiles use `<ActionMaps>`. `packages/parser/src/ActionMapsParser.ts` supports both transparently.
6. **Data.p4k Sparse File Layout**:
   - Under Linux/Wine, `Data.p4k` may be allocated as an ext4 sparse file during patching. `defaultProfile.xml` resides at offset ~70.3 GB (allocated), while `global.ini` resides at offset ~133.6 GB. Localization parser was updated with non-fatal fallbacks to ensure unhindered operation if `global.ini` has not finished downloading.

---

## 4. Current Verification Results

- **Full Workspace Build**: `npm run build` exits 0 with all packages (`shared-types`, `parser`, `resolver`, `web`) compiling in < 1s.
- **Go Daemon Build**: `npm run daemon:build` exits 0 (`daemon/bin/sc-daemon`).
- **Resolver Verification Suite**: `node packages/resolver/dist/test-verify.js` exits 0 (all 5 core test cases pass).
- **Live Game Data**: `game-data.json` and `apps/web/public/game-data.json` populated with 50 ActionMaps, 1,103 actions, and 956 bindings from LIVE 3.24+.
- **Browser End-to-End Audit**: Full headless browser interaction test verified:
  - Sci-fi HUD and styling render cleanly with zero console errors.
  - Preset switching (Dual VKB HOSAS, T.16000M HOTAS) dynamically updates Device Rack and Conflict Engine.
  - Live Game Data loader populates 50 Maps and 1,103 Actions in < 100ms.
  - Search filtering (`v_pitch`) filters bindings instantly.
  - `BindingEditorModal` captures hardware input and allows activationMode/multiTap customization.

---

## 5. Active Roadmap

- [x] Extract live Star Citizen bindings using `sc-daemon`.
- [x] Support binary `CryXmlB` decoding and Zstandard decompression.
- [x] Update parser for `<profile>` schema and metadata tokens.
- [x] **Modular UI Refactoring**: Decouple `ConflictViewer`, `BindingTable`, and `HardwareInspector` from `App.tsx` into modular components.
- [x] **Sample Preset Quick-Loader**: Add 1-click loading for Dual VKB HOSAS and T.16000M HOTAS sample profiles in the UI.
- [x] **Interactive Binding Editor**: Enable direct editing/adding of `<rebind>` and `<addbind>` inputs with activation modes directly in the Web UI.
- [x] **Conflict Engine False-Positive Elimination**: Expanded `ExclusionMatrix` across all 50 real Star Citizen action maps into 10 mutually exclusive operational domains (`spaceship`, `onfoot`, `eva`, `ground_vehicle`, `turret`, `screen_ui`, `menu`, `spectator`, `camera_mode`, `internal_debug`). Added device-scoped auditing (`Joysticks`, `All`, `Keyboard`).
- [x] **Hardware Device Inspector & Live HUD**: Live interactive button matrix (Buttons 1-32+) and analog axis deflection meters. Solves the physical button identification problem by lighting up pressed buttons and displaying exact Star Citizen input IDs and mapped actions.
- [x] **Daemon Versioning & Privacy Sanitization**: Added `--version` CLI flag, `/api/v1/version` endpoint, and sanitized file paths to prevent exposure of personal home directories.
- [ ] **Device Visualizer**: Interactive SVG mapping visualizer for HOTAS/HOSAS hardware.

