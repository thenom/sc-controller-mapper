package p4k

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFindDataP4K(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_p4k_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// 1. Error when nothing exists
	_, err = FindDataP4K(tmpDir)
	if err == nil {
		t.Errorf("expected error when Data.p4k does not exist, got nil")
	}

	// 2. Discover under LIVE/Data.p4k
	liveDir := filepath.Join(tmpDir, "LIVE")
	if err := os.MkdirAll(liveDir, 0755); err != nil {
		t.Fatalf("failed creating LIVE dir: %v", err)
	}
	liveP4K := filepath.Join(liveDir, "Data.p4k")
	if err := os.WriteFile(liveP4K, []byte("dummy p4k"), 0644); err != nil {
		t.Fatalf("failed creating test p4k: %v", err)
	}

	found, err := FindDataP4K(tmpDir)
	if err != nil {
		t.Fatalf("FindDataP4K failed: %v", err)
	}
	if found != liveP4K {
		t.Errorf("expected %s, got %s", liveP4K, found)
	}

	// 3. Direct file path passed
	foundDirect, err := FindDataP4K(liveP4K)
	if err != nil {
		t.Fatalf("FindDataP4K failed on direct file: %v", err)
	}
	if foundDirect != liveP4K {
		t.Errorf("expected %s, got %s", liveP4K, foundDirect)
	}
}
