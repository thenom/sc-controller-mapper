package cache

import (
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/sc-mapping/daemon/pkg/config"
)

// ComputeP4KSignature computes a fast unique signature based on file size and modification time
func ComputeP4KSignature(p4kPath string) (string, error) {
	fi, err := os.Stat(p4kPath)
	if err != nil {
		return "", err
	}
	sig := fmt.Sprintf("%d-%d", fi.Size(), fi.ModTime().Unix())
	h := sha256.Sum256([]byte(sig))
	return hex.EncodeToString(h[:16]), nil
}

// LoadCachedGameData reads and decompresses .scj cache file
func LoadCachedGameData(cachePath string, expectedSignature string) (*config.GameDataConfig, error) {
	f, err := os.Open(cachePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	gz, err := gzip.NewReader(f)
	if err != nil {
		return nil, fmt.Errorf("invalid gzip stream in cache: %w", err)
	}
	defer gz.Close()

	var cfg config.GameDataConfig
	if err := json.NewDecoder(gz).Decode(&cfg); err != nil {
		return nil, fmt.Errorf("error decoding json cache: %w", err)
	}

	if cfg.P4kSignature != expectedSignature {
		return nil, fmt.Errorf("cache signature mismatch (game updated)")
	}

	return &cfg, nil
}

// SaveCachedGameData writes compressed .scj cache file
func SaveCachedGameData(cachePath string, cfg *config.GameDataConfig) error {
	if err := os.MkdirAll(filepath.Dir(cachePath), 0755); err != nil {
		return err
	}

	f, err := os.Create(cachePath)
	if err != nil {
		return err
	}
	defer f.Close()

	gz := gzip.NewWriter(f)
	defer gz.Close()

	return json.NewEncoder(gz).Encode(cfg)
}
