package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/sc-mapping/daemon/pkg/cache"
	"github.com/sc-mapping/daemon/pkg/config"
	"github.com/sc-mapping/daemon/pkg/locator"
	"github.com/sc-mapping/daemon/pkg/p4k"
)

const Version = "1.0.0"

func main() {
	var (
		gamePathFlag   string
		outputFlag     string
		runDaemonFlag  bool
		daemonPortFlag int
		versionFlag    bool
		sanitizeFlag   bool
	)

	flag.StringVar(&gamePathFlag, "game-path", "", "Path to Star Citizen install directory (e.g. D:\\Games\\Roberts Space Industries\\StarCitizen)")
	flag.StringVar(&gamePathFlag, "p", "", "Shorthand for --game-path")
	flag.StringVar(&outputFlag, "output", "game-data.json", "Output path for the generated web application config file")
	flag.StringVar(&outputFlag, "o", "game-data.json", "Shorthand for --output")
	flag.BoolVar(&runDaemonFlag, "daemon", false, "Run as background HTTP daemon serving local API endpoints")
	flag.IntVar(&daemonPortFlag, "port", 8765, "Port to listen on when running in daemon mode")
	flag.BoolVar(&versionFlag, "version", false, "Print daemon version and exit")
	flag.BoolVar(&versionFlag, "v", false, "Shorthand for --version")
	flag.BoolVar(&sanitizeFlag, "sanitize", true, "Sanitize personal home directories in exported config")
	flag.Parse()

	if versionFlag {
		fmt.Printf("sc-daemon v%s\n", Version)
		return
	}

	fmt.Println("==========================================================")
	fmt.Printf("  Star Citizen Local Extraction Daemon v%s\n", Version)
	fmt.Println("==========================================================")

	// 1. Resolve Star Citizen Root Path
	gameRoot, err := locator.ResolveGamePath(gamePathFlag)
	if err != nil {
		log.Printf("[daemon] Game path resolution: %v\n", err)
		if !runDaemonFlag {
			log.Fatalf("[daemon] Fatal: Cannot proceed without a valid game path. Use --game-path=\"...\"")
		}
	} else {
		fmt.Printf("[daemon] Discovered Star Citizen Path: %s\n", gameRoot)
	}

	// 2. Perform Extraction / Cache Check if gameRoot is available
	var gameData *config.GameDataConfig
	if gameRoot != "" {
		gameData, err = processGameData(gameRoot, outputFlag, sanitizeFlag)
		if err != nil {
			log.Printf("[daemon] Extraction error: %v\n", err)
		} else {
			fmt.Printf("[daemon] ✓ Generated web application config at: %s\n", outputFlag)
		}
	}

	// 3. If --daemon flag set, start HTTP server
	if runDaemonFlag {
		startHTTPServer(daemonPortFlag, gameData)
	}
}

func processGameData(gameRoot string, outputPath string, sanitize bool) (*config.GameDataConfig, error) {
	p4kPath, err := p4k.FindDataP4K(gameRoot)
	if err != nil {
		return nil, err
	}
	fmt.Printf("[daemon] Found Data.p4k archive: %s\n", p4kPath)

	sig, err := cache.ComputeP4KSignature(p4kPath)
	if err != nil {
		return nil, fmt.Errorf("failed to compute p4k signature: %w", err)
	}

	manifest, mErr := locator.ReadBuildManifest(gameRoot)
	if mErr == nil && manifest != nil {
		fmt.Printf("[daemon] Star Citizen Build: %s (%s, %s)\n", manifest.Data.Version, manifest.Data.Branch, manifest.Data.BuildDateStamp)
	}

	cacheDir := filepath.Join(os.TempDir(), "sc-mapping")
	cacheFile := filepath.Join(cacheDir, "cache.scj")

	// Try loading from .scj cache
	cachedData, err := cache.LoadCachedGameData(cacheFile, sig)
	if err == nil && cachedData != nil {
		fmt.Println("[daemon] ✓ Cache hit: Using existing .scj cache payload.")
		cachedData.Version = Version
		if manifest != nil {
			cachedData.GameVersion = manifest.Data.Version
			cachedData.GameBranch = manifest.Data.Branch
			cachedData.GameBuildDate = manifest.Data.BuildDateStamp
		}
		if sanitize {
			cachedData.GamePath = "StarCitizen/LIVE"
		} else {
			cachedData.GamePath = gameRoot
		}
		if err := writeOutputFile(outputPath, cachedData); err != nil {
			return nil, err
		}
		return cachedData, nil
	}

	// Cache miss: stream from Data.p4k
	fmt.Println("[daemon] Extracting defaultProfile.xml & global.ini from Data.p4k...")
	startTime := time.Now()
	data, err := p4k.ExtractFromP4K(p4kPath, sig)
	if err != nil {
		return nil, fmt.Errorf("extraction failed: %w", err)
	}
	data.Version = Version
	if manifest != nil {
		data.GameVersion = manifest.Data.Version
		data.GameBranch = manifest.Data.Branch
		data.GameBuildDate = manifest.Data.BuildDateStamp
	}
	if sanitize {
		data.GamePath = "StarCitizen/LIVE"
	} else {
		data.GamePath = gameRoot
	}
	data.ExtractedAt = time.Now()

	fmt.Printf("[daemon] ✓ Extracted %d localization tokens in %v\n", len(data.Localization), time.Since(startTime))

	// Save to cache.scj
	if err := cache.SaveCachedGameData(cacheFile, data); err != nil {
		log.Printf("[daemon] Warning: failed to write cache: %v\n", err)
	}

	// Write web application output config
	if err := writeOutputFile(outputPath, data); err != nil {
		return nil, err
	}

	return data, nil
}

func writeOutputFile(path string, data *config.GameDataConfig) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		// If current directory, dir will be "." which is fine
		if filepath.Dir(path) != "." {
			return err
		}
	}

	fileBytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize JSON config: %w", err)
	}

	if err := os.WriteFile(path, fileBytes, 0644); err != nil {
		return fmt.Errorf("failed to write output file: %w", err)
	}

	return nil
}

func startHTTPServer(port int, initialData *config.GameDataConfig) {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"version":   Version,
			"timestamp": time.Now().UTC(),
		})
	})

	// Version check
	mux.HandleFunc("/api/v1/version", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]any{
			"app":     "sc-daemon",
			"version": Version,
		})
	})

	// Get latest game data
	mux.HandleFunc("/api/v1/game-data", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if initialData == nil {
			http.Error(w, `{"error": "No game data extracted yet"}`, http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(initialData)
	})

	addr := fmt.Sprintf("127.0.0.1:%d", port)
	fmt.Printf("[daemon] Running HTTP daemon v%s on http://%s\n", Version, addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
