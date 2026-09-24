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
