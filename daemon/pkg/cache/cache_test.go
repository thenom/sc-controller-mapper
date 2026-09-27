package cache

import (
	"compress/gzip"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/sc-mapping/daemon/pkg/config"
)

func TestComputeP4KSignature(t *testing.T) {
	tmpDir := t.TempDir()
	p4kPath := filepath.Join(tmpDir, "Data.p4k")

	// File does not exist
	_, err := ComputeP4KSignature(p4kPath)
	if err == nil {
		t.Fatalf("expected error for non-existent file")
	}

	// Create dummy file
	if err := os.WriteFile(p4kPath, []byte("dummy p4k data"), 0644); err != nil {
		t.Fatalf("failed to create dummy file: %v", err)
	}

	sig1, err := ComputeP4KSignature(p4kPath)
	if err != nil {
		t.Fatalf("unexpected error computing signature: %v", err)
	}
	if len(sig1) != 32 {
		t.Fatalf("expected 32 hex char signature, got length %d (%s)", len(sig1), sig1)
	}

	// Signature should be stable for identical file
	sig2, err := ComputeP4KSignature(p4kPath)
	if err != nil || sig1 != sig2 {
		t.Fatalf("expected stable signature, got %s vs %s", sig1, sig2)
	}
}

func TestSaveAndLoadCachedGameData(t *testing.T) {
	tmpDir := t.TempDir()
	cacheFile := filepath.Join(tmpDir, "nested", "game-data.scj")

	cfg := &config.GameDataConfig{
		Version:           "1.0.0",
		GameVersion:       "4.10.0.12345",
		GameBranch:        "sc-alpha-4.10.0",
		GamePath:          "/opt/StarCitizen",
		P4kSignature:      "test-signature-12345",
		ExtractedAt:       time.Now(),
		DefaultProfileXML: "<profile></profile>",
		Localization: map[string]string{
			"ui_pitch": "Pitch",
		},
	}

	// Save cache
	if err := SaveCachedGameData(cacheFile, cfg); err != nil {
		t.Fatalf("failed to save cached game data: %v", err)
	}

	// Load valid cache
	loaded, err := LoadCachedGameData(cacheFile, "test-signature-12345")
	if err != nil {
		t.Fatalf("unexpected error loading cache: %v", err)
	}
	if loaded.GameVersion != cfg.GameVersion || loaded.Localization["ui_pitch"] != "Pitch" {
		t.Fatalf("loaded game data mismatch: %+v", loaded)
	}

	// Signature mismatch
	_, err = LoadCachedGameData(cacheFile, "different-signature")
	if err == nil || !strings.Contains(err.Error(), "cache signature mismatch") {
		t.Fatalf("expected signature mismatch error, got: %v", err)
	}

	// Non-existent cache file
	_, err = LoadCachedGameData(filepath.Join(tmpDir, "missing.scj"), "sig")
	if err == nil {
		t.Fatalf("expected error for non-existent cache file")
	}

	// Corrupt gzip stream
	corruptFile := filepath.Join(tmpDir, "corrupt.scj")
	if err := os.WriteFile(corruptFile, []byte("not gzipped content"), 0644); err != nil {
		t.Fatalf("failed to write corrupt file: %v", err)
	}
	_, err = LoadCachedGameData(corruptFile, "sig")
	if err == nil || !strings.Contains(err.Error(), "invalid gzip stream in cache") {
		t.Fatalf("expected invalid gzip stream error, got: %v", err)
	}

	// Valid gzip but corrupt JSON
	badJsonFile := filepath.Join(tmpDir, "badjson.scj")
	bf, err := os.Create(badJsonFile)
	if err != nil {
		t.Fatalf("failed to create badjson file: %v", err)
	}
	gw := gzip.NewWriter(bf)
	gw.Write([]byte("{invalid-json-content"))
	gw.Close()
	bf.Close()

	_, err = LoadCachedGameData(badJsonFile, "sig")
	if err == nil || !strings.Contains(err.Error(), "error decoding json cache") {
		t.Fatalf("expected json decode error, got: %v", err)
	}
}

func TestSaveCachedGameData_Error(t *testing.T) {
	// Trying to create a file where a directory already exists as file
	tmpDir := t.TempDir()
	blockingFilePath := filepath.Join(tmpDir, "file_conflict")
	if err := os.WriteFile(blockingFilePath, []byte("blocker"), 0644); err != nil {
		t.Fatalf("failed to create blocking file: %v", err)
	}

	badPath := filepath.Join(blockingFilePath, "sub", "cache.scj")
	err := SaveCachedGameData(badPath, &config.GameDataConfig{})
	if err == nil {
		t.Fatalf("expected error when directory creation fails")
	}
}
