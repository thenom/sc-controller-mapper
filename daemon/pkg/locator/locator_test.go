package locator

import (
	"os"
	"path/filepath"
	"testing"
)

func TestResolveGamePathExplicit(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_locator_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	resolved, err := ResolveGamePath(tmpDir)
	if err != nil {
		t.Fatalf("unexpected error resolving existing dir: %v", err)
	}
	if resolved != tmpDir {
		t.Errorf("expected %s, got %s", tmpDir, resolved)
	}

	_, err = ResolveGamePath(filepath.Join(tmpDir, "nonexistent_dir"))
	if err == nil {
		t.Errorf("expected error for nonexistent path, got nil")
	}
}

func TestReadBuildManifest(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_manifest_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	manifestJSON := `{
		"Data": {
			"Branch": "sc-alpha-4.10.0",
			"BuildDateStamp": "2026-09-20",
			"BuildId": "1234567",
			"Version": "4.10.0-LIVE.1234567"
		}
	}`

	manifestPath := filepath.Join(tmpDir, "build_manifest.id")
	if err := os.WriteFile(manifestPath, []byte(manifestJSON), 0644); err != nil {
		t.Fatalf("failed writing test manifest: %v", err)
	}

	// 1. Read directly from directory
	m, err := ReadBuildManifest(tmpDir)
	if err != nil {
		t.Fatalf("failed reading manifest from dir: %v", err)
	}
	if m.Data.Version != "4.10.0-LIVE.1234567" {
		t.Errorf("expected version 4.10.0-LIVE.1234567, got %s", m.Data.Version)
	}

	// 2. Read when passing a file path (e.g. Data.p4k in the same dir)
	fakeP4K := filepath.Join(tmpDir, "Data.p4k")
	if err := os.WriteFile(fakeP4K, []byte("fake"), 0644); err != nil {
		t.Fatalf("failed writing fake p4k: %v", err)
	}

	m2, err := ReadBuildManifest(fakeP4K)
	if err != nil {
		t.Fatalf("failed reading manifest when pointing to file in dir: %v", err)
	}
	if m2.Data.Branch != "sc-alpha-4.10.0" {
		t.Errorf("expected branch sc-alpha-4.10.0, got %s", m2.Data.Branch)
	}
}

func TestReadBuildManifestFlatJSON(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_manifest_flat_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	flatJSON := `{
		"Branch": "sc-alpha-4.10.1",
		"BuildDateStamp": "2026-09-24",
		"BuildId": "12660092",
		"Version": "4.10.1-LIVE.12660092"
	}`

	if err := os.WriteFile(filepath.Join(tmpDir, "f_build.id"), []byte(flatJSON), 0644); err != nil {
		t.Fatalf("failed writing test manifest: %v", err)
	}

	m, err := ReadBuildManifest(tmpDir)
	if err != nil {
		t.Fatalf("failed reading flat manifest: %v", err)
	}
	if m.Data.Version != "4.10.1-LIVE.12660092" {
		t.Errorf("expected version 4.10.1-LIVE.12660092, got %s", m.Data.Version)
	}
	if m.Data.Branch != "sc-alpha-4.10.1" {
		t.Errorf("expected branch sc-alpha-4.10.1, got %s", m.Data.Branch)
	}
}

func TestParseManifestFromGameLog(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_gamelog_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	gameLog := `BackupNameAttachment: "2026-09-24_17-20-00"
Build Date: Sep 24 2026
Branch: sc-alpha-4.10.1
Build Version: 12660092
Is Dedicated Server: No
`
	if err := os.WriteFile(filepath.Join(tmpDir, "Game.log"), []byte(gameLog), 0644); err != nil {
		t.Fatalf("failed writing test Game.log: %v", err)
	}

	m, err := ReadBuildManifest(tmpDir)
	if err != nil {
		t.Fatalf("failed parsing manifest from Game.log: %v", err)
	}
	if m.Data.Branch != "sc-alpha-4.10.1" {
		t.Errorf("expected branch sc-alpha-4.10.1, got %s", m.Data.Branch)
	}
	if m.Data.Version != "12660092" {
		t.Errorf("expected version 12660092, got %s", m.Data.Version)
	}
	if m.Data.BuildDateStamp != "Sep 24 2026" {
		t.Errorf("expected build date Sep 24 2026, got %s", m.Data.BuildDateStamp)
	}
}

func TestResolveBuildMetadataFallback(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_fallback_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	p4kPath := filepath.Join(tmpDir, "StarCitizen", "LIVE", "Data.p4k")
	if err := os.MkdirAll(filepath.Dir(p4kPath), 0755); err != nil {
		t.Fatalf("failed creating dir: %v", err)
	}
	if err := os.WriteFile(p4kPath, []byte("fake-p4k"), 0644); err != nil {
		t.Fatalf("failed writing fake p4k: %v", err)
	}

	// Resolve without manifest or log file
	resolved := ResolveBuildMetadata(filepath.Dir(p4kPath), p4kPath)
	if resolved == nil {
		t.Fatalf("expected non-nil resolved build metadata")
	}
	if resolved.Data.Branch == "" {
		t.Errorf("expected branch to be inferred, got empty")
	}
	if resolved.Data.BuildDateStamp == "" {
		t.Errorf("expected build date stamp from p4k modtime, got empty")
	}
}

func TestResolveGamePath_EnvAndLogs(t *testing.T) {
	tmpDir := t.TempDir()

	// 1. Test STARCITIZEN_PATH env var
	gameDir := filepath.Join(tmpDir, "GameDir")
	if err := os.Mkdir(gameDir, 0755); err != nil {
		t.Fatalf("failed to create dir: %v", err)
	}

	t.Setenv("STARCITIZEN_PATH", gameDir)
	resolved, err := ResolveGamePath("")
	if err != nil || resolved != gameDir {
		t.Fatalf("expected ResolveGamePath with STARCITIZEN_PATH to return %s, got %s (err: %v)", gameDir, resolved, err)
	}

	// 2. Clear STARCITIZEN_PATH and test RSI Launcher log discovery
	t.Setenv("STARCITIZEN_PATH", "")

	appDataDir := filepath.Join(tmpDir, "AppData")
	t.Setenv("APPDATA", appDataDir)

	scSubDir := filepath.Join(tmpDir, "RSIInstall", "StarCitizen")
	if err := os.MkdirAll(scSubDir, 0755); err != nil {
		t.Fatalf("failed creating scSubDir: %v", err)
	}

	logDir := filepath.Join(appDataDir, "rsilauncher", "logs")
	if err := os.MkdirAll(logDir, 0755); err != nil {
		t.Fatalf("failed creating logDir: %v", err)
	}

	logContent := "2026-09-24 Info: gamePath = \"" + filepath.Join(tmpDir, "RSIInstall") + "\"\n"
	if err := os.WriteFile(filepath.Join(logDir, "log.log"), []byte(logContent), 0644); err != nil {
		t.Fatalf("failed writing log file: %v", err)
	}

	resolvedLog, err := ResolveGamePath("")
	if err != nil {
		t.Fatalf("unexpected error finding game path from launcher log: %v", err)
	}
	if resolvedLog != scSubDir {
		t.Errorf("expected %s, got %s", scSubDir, resolvedLog)
	}

	// 3. Test unable to locate failure
	t.Setenv("APPDATA", filepath.Join(tmpDir, "empty_appdata"))
	_, err = ResolveGamePath("")
	if err == nil {
		t.Fatalf("expected error when no path exists and cannot be located")
	}
}

func TestResolveBuildMetadata_Patterns(t *testing.T) {
	// PTU detection
	mPTU := ResolveBuildMetadata("/opt/StarCitizen/PTU", "")
	if mPTU.Data.Branch != "PTU" {
		t.Errorf("expected branch PTU, got %s", mPTU.Data.Branch)
	}

	// EPTU detection
	mEPTU := ResolveBuildMetadata("/opt/StarCitizen/EPTU", "")
	if mEPTU.Data.Branch != "EPTU" {
		t.Errorf("expected branch EPTU, got %s", mEPTU.Data.Branch)
	}

	// Build number regex extraction from path
	mVer := ResolveBuildMetadata("/opt/StarCitizen/LIVE/build-98765432", "")
	if mVer.Data.Version != "98765432" {
		t.Errorf("expected version 98765432, got %s", mVer.Data.Version)
	}
}
