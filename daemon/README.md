# Star Citizen Local Extraction Daemon (`sc-daemon`)

A high-performance, lightweight Go binary designed to extract `defaultProfile.xml` and English localization (`global.ini`) directly from Star Citizen's 90GB+ `Data.p4k` archive and generate standalone configuration files and master action catalogs for the web application and parser.

> [!WARNING]
> **Backup Notice**: Always retain offline copies of your original, working Star Citizen mapping files (`LIVE/USER/Client/0/Controls/Mappings/`). This suite and daemon are provided as-is without liability for loss or corruption of configuration files.

---

## Key Features

1. **Custom Path & Archive Support**: Accepts `--game-path` (or `-p`) to target any Star Citizen installation directory (e.g. `C:\Program Files\Roberts Space Industries\StarCitizen`), channel subfolder (`LIVE`), or direct path to `Data.p4k` via `--p4k`.
2. **Auto-Discovery Fallback**: Automatically parses RSI Launcher logs (`%APPDATA%\rsilauncher\logs\log.log` and `%APPDATA%\RSI Launcher\logs\log.log`) and standard installation paths if no path is passed.
3. **Zip64 Byte Seeking**: Utilizes `io.ReaderAt` byte-range seeks to read the archive's Central Directory at the file tail without loading the 90GB archive into memory.
4. **CryEngine Decryption**: Integrates the 16-byte CryEngine cipher key (`0x5E, 0x7A, 0x20, 0x02, 0x30, 0x2E, 0xEB, 0x1A, 0x3B, 0xB6, 0x17, 0xC3, 0x0F, 0xDE, 0x1E, 0x47`) to decrypt encrypted zip entries in-place.
5. **Project Action Catalog Generator**: Pass `--update-project` (or `-u`) to automatically update:
   - `packages/parser/src/catalog/sc_action_catalog.json` (canonical parser catalog)
   - `apps/web/public/data/sc_action_catalog.json` (web search catalog)
   - `apps/web/public/game-data.json` (bundled base profile and localization)
6. **Smart `.scj` Cache**: Computes a fast signature (file size + modtime) and maintains a gzip-compressed cache (`cache.scj`) in the local temp directory to avoid redundant extractions.
7. **Optional HTTP Daemon**: Pass `--daemon` or run `sc-daemon serve` to serve local endpoints (`/api/v1/health`, `/api/v1/version`, `/api/v1/game-data`) on port 8765 for real-time web UI sync.

---

## Build Instructions

From the repository root:
```bash
npm run daemon:build
```
Or directly inside the `daemon/` directory:
```bash
cd daemon
go build -o bin/sc-daemon main.go
```
The compiled binary will be placed at `daemon/bin/sc-daemon`.

---

## Contributor Extraction Workflow

### 1. Extract & Update Project Monorepo Files (Recommended for PRs)

#### Using npm shortcut (auto-detects Star Citizen path):
```bash
npm run daemon:extract
```

#### Explicit Star Citizen Root or Channel:
```bash
./daemon/bin/sc-daemon -p "C:\Program Files\Roberts Space Industries\StarCitizen" -u
```

#### Direct Path to `Data.p4k`:
```bash
./daemon/bin/sc-daemon --p4k="D:\Games\StarCitizen\LIVE\Data.p4k" -u
```

#### Linux / Proton / Steam Deck:
```bash
./daemon/bin/sc-daemon -p "/mnt/games/StarCitizen/LIVE" -u
```

### 2. Standalone JSON File Extraction

```bash
./daemon/bin/sc-daemon --output="game-data.json"
```

### 3. Run as Local Background Daemon for Live Web UI Sync

```bash
# Using npm shortcut:
npm run daemon:serve

# Or using the binary:
./daemon/bin/sc-daemon --daemon --port=8765
# Or using the subcommand:
./daemon/bin/sc-daemon serve --port=8765
```

Once running, navigate to `http://localhost:5173` and click **Sync with Local Daemon** in the **Contributor Tools** modal.

---

## CLI Flags & Commands

### Commands
| Command | Description |
|---------|-------------|
| `extract` | Default command. Streams game files and writes configuration/catalogs. |
| `serve` | Runs the HTTP API service on `127.0.0.1:8765` (alias for `--daemon`). |
| `help` | Displays command and flag usage. |

### Flags
| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--game-path` | `-p` | `""` | Path to Star Citizen root directory or channel |
| `--p4k` | | `""` | Direct path to `Data.p4k` archive (alias for `--game-path`) |
| `--update-project` | `-u` | `false` | Updates monorepo action catalogs and web public data |
| `--project-root` | | `.` | Monorepo root directory when running `--update-project` |
| `--output` | `-o` | `game-data.json` | Destination path for standalone extracted JSON payload |
| `--daemon` | | `false` | Run as persistent background HTTP service |
| `--port` | | `8765` | Port for HTTP service in daemon mode |
| `--sanitize` | | `true` | Sanitize personal home directories in exported config |
| `--version` | `-v` | `false` | Print daemon version and exit |

---

## HTTP Endpoints (Daemon Mode)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check (`{"status": "healthy", "version": "1.0.0"}`) |
| `GET` | `/api/v1/version` | Daemon version payload |
| `GET` | `/api/v1/game-data` | Extracted profile XML, localization map, and build manifest metadata |
