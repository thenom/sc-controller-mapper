# Star Citizen Local Extraction Daemon (`sc-daemon`)

A high-performance, lightweight Go binary designed to extract `defaultProfile.xml` and English localization (`global.ini`) directly from Star Citizen's 90GB+ `Data.p4k` archive and generate a standalone JSON configuration file for the web application.

---

## Key Features

1. **Custom Path Argument**: Accepts `--game-path` (or `-p`) to target any Star Citizen installation location.
2. **Auto-Discovery Fallback**: Automatically parses RSI Launcher logs (`%APPDATA%\rsilauncher\logs\log.log` and `%APPDATA%\RSI Launcher\logs\log.log`) if no path is passed.
3. **Zip64 Byte Seeking**: Utilizes `io.ReaderAt` byte-range seeks to read the archive's Central Directory at the file tail without loading the 90GB archive into memory.
4. **CryEngine Decryption**: Integrates the 16-byte CryEngine cipher key (`0x5E, 0x7A, 0x20, 0x02, 0x30, 0x2E, 0xEB, 0x1A, 0x3B, 0xB6, 0x17, 0xC3, 0x0F, 0xDE, 0x1E, 0x47`) to decrypt encrypted zip entries in-place.
5. **Smart `.scj` Cache**: Computes a fast signature (file size + modtime) and maintains a gzip-compressed cache (`cache.scj`) in the local temp directory to avoid redundant extractions.
6. **Web App Config Generation**: Serializes the extracted profile and localization dictionary into a standalone JSON file (default `game-data.json` or `--output`).
7. **Optional HTTP Daemon**: Pass `--daemon` to serve local endpoints (`/api/v1/health`, `/api/v1/game-data`) on port 8765.

---

## Build Instructions

```bash
cd daemon
go build -o sc-daemon main.go
```

---

## Usage

### 1. Extract to Web App Config (Explicit Path)
```bash
./sc-daemon --game-path="D:\Games\Roberts Space Industries\StarCitizen" --output="../apps/web/public/game-data.json"
```

### 2. Auto-Detect from Launcher Logs
```bash
./sc-daemon --output="../apps/web/public/game-data.json"
```

### 3. Run as Local Background Daemon
```bash
./sc-daemon --game-path="D:\Games\Roberts Space Industries\StarCitizen" --daemon --port=8765
```

---

## CLI Flags

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--game-path` | `-p` | `""` | Path to Star Citizen root directory |
| `--output` | `-o` | `game-data.json` | Destination path for generated JSON file |
| `--daemon` | | `false` | Run as persistent background HTTP service |
| `--port` | | `8765` | Port for HTTP service in daemon mode |
