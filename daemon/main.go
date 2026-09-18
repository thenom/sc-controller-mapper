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

func main() {
	var (
		gamePathFlag   string
		outputFlag     string
		runDaemonFlag  bool
		daemonPortFlag int
	)

	flag.StringVar(&gamePathFlag, "game-path", "", "Path to Star Citizen install directory (e.g. D:\\Games\\Roberts Space Industries\\StarCitizen)")
	flag.StringVar(&gamePathFlag, "p", "", "Shorthand for --game-path")
	flag.StringVar(&outputFlag, "output", "game-data.json", "Output path for the generated web application config file")
	flag.StringVar(&outputFlag, "o", "game-data.json", "Shorthand for --output")
	flag.BoolVar(&runDaemonFlag, "daemon", false, "Run as background HTTP daemon serving local API endpoints")
	flag.IntVar(&daemonPortFlag, "port", 8765, "Port to listen on when running in daemon mode")
	flag.Parse()

	fmt.Println("==========================================================")
	fmt.Println("  Star Citizen Local Extraction Daemon & Config Builder   ")
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
		gameData, err = processGameData(gameRoot, outputFlag)
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

func processGameData(gameRoot string, outputPath string) (*config.GameDataConfig, error) {
	p4kPath, err := p4k.FindDataP4K(gameRoot)
	if err != nil {
		return nil, err
	}
	fmt.Printf("[daemon] Found Data.p4k archive: %s\n", p4kPath)

	sig, err := cache.ComputeP4KSignature(p4kPath)
	if err != nil {
		return nil, fmt.Errorf("failed to compute p4k signature: %w", err)
	}

	cacheDir := filepath.Join(os.TempDir(), "sc-mapping")
	cacheFile := filepath.Join(cacheDir, "cache.scj")

	// Try loading from .scj cache
	cachedData, err := cache.LoadCachedGameData(cacheFile, sig)
	if err == nil && cachedData != nil {
		fmt.Println("[daemon] ✓ Cache hit: Using existing .scj cache payload.")
		cachedData.GamePath = gameRoot
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
	data.GamePath = gameRoot
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
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
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
	fmt.Printf("[daemon] Running HTTP daemon on http://%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
