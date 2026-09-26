package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/sc-mapping/daemon/pkg/cache"
	"github.com/sc-mapping/daemon/pkg/catalog"
	"github.com/sc-mapping/daemon/pkg/config"
	"github.com/sc-mapping/daemon/pkg/locator"
	"github.com/sc-mapping/daemon/pkg/p4k"
)

const Version = "1.0.0"

func main() {
	var (
		gamePathFlag      string
		outputFlag        string
		runDaemonFlag     bool
		daemonPortFlag    int
		versionFlag       bool
		sanitizeFlag      bool
		updateProjectFlag bool
		projectRootFlag   string
		gameVersionFlag   string
		gameBranchFlag    string
		gameBuildDateFlag string
	)

	fs := flag.NewFlagSet("sc-daemon", flag.ExitOnError)

	fs.StringVar(&gamePathFlag, "game-path", "", "Path to Star Citizen install directory (e.g. D:\\Games\\Roberts Space Industries\\StarCitizen) or Data.p4k file")
	fs.StringVar(&gamePathFlag, "p", "", "Shorthand for --game-path")
	fs.StringVar(&gamePathFlag, "p4k", "", "Direct path to Data.p4k archive (alias for --game-path)")
	fs.StringVar(&outputFlag, "output", "game-data.json", "Output path for the generated web application config file")
	fs.StringVar(&outputFlag, "o", "game-data.json", "Shorthand for --output")
	fs.BoolVar(&runDaemonFlag, "daemon", false, "Run as background HTTP daemon serving local API endpoints")
	fs.IntVar(&daemonPortFlag, "port", 8765, "Port to listen on when running in daemon mode")
	fs.BoolVar(&versionFlag, "version", false, "Print daemon version and exit")
	fs.BoolVar(&versionFlag, "v", false, "Shorthand for --version")
	fs.BoolVar(&sanitizeFlag, "sanitize", true, "Sanitize personal home directories in exported config")
	fs.BoolVar(&updateProjectFlag, "update-project", false, "Update project action catalog and web data files (packages/parser and apps/web/public)")
	fs.BoolVar(&updateProjectFlag, "u", false, "Shorthand for --update-project")
	fs.StringVar(&projectRootFlag, "project-root", ".", "Path to project root monorepo directory (default: current directory)")
	fs.StringVar(&gameVersionFlag, "game-version", "", "Override or explicitly specify Star Citizen build version (e.g. 12660092)")
	fs.StringVar(&gameVersionFlag, "gv", "", "Shorthand for --game-version")
	fs.StringVar(&gameBranchFlag, "game-branch", "", "Override or explicitly specify Star Citizen branch (e.g. sc-alpha-4.10.1 or LIVE)")
	fs.StringVar(&gameBranchFlag, "gb", "", "Shorthand for --game-branch")
	fs.StringVar(&gameBuildDateFlag, "game-build-date", "", "Override or explicitly specify Star Citizen build date (e.g. Wed Sep 23 2026)")
	fs.StringVar(&gameBuildDateFlag, "gd", "", "Shorthand for --game-build-date")

	fs.Usage = func() {
		fmt.Printf("sc-daemon v%s — Star Citizen Keybinding Suite Extraction Daemon\n\n", Version)
		fmt.Println("Usage:")
		fmt.Println("  sc-daemon [command] [flags]")
		fmt.Println("\nCommands:")
		fmt.Println("  extract             Extract game data (default if no command given)")
		fmt.Println("  serve               Run as background HTTP daemon (alias for --daemon)")
		fmt.Println("\nFlags:")
		fs.PrintDefaults()
		fmt.Println("\nExamples:")
		fmt.Println("  # Extract and update project action catalog & web data files for a PR:")
		fmt.Println("  ./daemon/bin/sc-daemon --update-project")
		fmt.Println("  ./daemon/bin/sc-daemon -p \"C:\\Program Files\\Roberts Space Industries\\StarCitizen\" -u")
		fmt.Println("  ./daemon/bin/sc-daemon extract --p4k=\"/path/to/Data.p4k\" --update-project")
		fmt.Println("\n  # Run local HTTP daemon for live web app sync:")
		fmt.Println("  ./daemon/bin/sc-daemon --daemon --port=8765")
		fmt.Println("  ./daemon/bin/sc-daemon serve --port=8765")
	}

	args := os.Args[1:]
	var subCmd string
	if len(args) > 0 && !strings.HasPrefix(args[0], "-") {
		subCmd = strings.ToLower(args[0])
		args = args[1:]
	}

	if subCmd == "help" {
		fs.Usage()
		return
	}

	if subCmd == "serve" {
		runDaemonFlag = true
	}

	if err := fs.Parse(args); err != nil {
		log.Fatalf("Error parsing flags: %v", err)
	}

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
	} else {
		fmt.Printf("[daemon] Discovered Star Citizen Path: %s\n", gameRoot)
	}

	overrides := VersionOverrides{
		Version:   gameVersionFlag,
		Branch:    gameBranchFlag,
		BuildDate: gameBuildDateFlag,
	}

	// 2. Perform Extraction / Cache Check if gameRoot is available
	var gameData *config.GameDataConfig
	if gameRoot != "" {
		gameData, err = processGameData(gameRoot, outputFlag, sanitizeFlag, overrides)
		if err != nil {
			log.Printf("[daemon] Extraction error: %v\n", err)
		} else {
			fmt.Printf("[daemon] ✓ Generated web application config at: %s\n", outputFlag)
		}
	} else {
		// Fallback for offline development, CI, or when updating catalogs from existing game-data.json:
		candidatePaths := []string{
			outputFlag,
			filepath.Join(projectRootFlag, "apps", "web", "public", "game-data.json"),
			"apps/web/public/game-data.json",
			"game-data.json",
		}
		for _, p := range candidatePaths {
			if fileBytes, readErr := os.ReadFile(p); readErr == nil {
				var loaded config.GameDataConfig
				if jsonErr := json.Unmarshal(fileBytes, &loaded); jsonErr == nil && loaded.DefaultProfileXML != "" {
					fmt.Printf("[daemon] Discovered existing game data cache at: %s\n", p)
					gameData = &loaded
					break
				}
			}
		}

		if gameData == nil && !runDaemonFlag && !updateProjectFlag {
			log.Fatalf("[daemon] Fatal: Cannot proceed without a valid game path or game-data.json. Use --game-path=\"...\" or --p4k=\"...\"")
		}
	}

	// 2b. If --update-project flag set, parse and update monorepo action catalog files & web static data
	if gameData != nil && updateProjectFlag {
		fmt.Printf("[daemon] Generating master action catalog for project at '%s'...\n", projectRootFlag)
		cat, err := catalog.GenerateCatalogFromGameData(gameData.DefaultProfileXML, gameData.Localization)
		if err != nil {
			log.Printf("[daemon] Error generating action catalog: %v\n", err)
		} else {
			written, err := catalog.UpdateProjectCatalogFiles(projectRootFlag, cat)
			if err != nil {
				log.Printf("[daemon] Error updating project catalog files: %v\n", err)
			} else {
				totalActions := 0
				for _, m := range cat {
					totalActions += len(m.Actions)
				}
				fmt.Printf("[daemon] ✓ Successfully updated project catalog (%d action maps, %d actions):\n", len(cat), totalActions)
				for _, w := range written {
					fmt.Printf("         - %s\n", w)
				}
			}
		}

		// Also update apps/web/public/game-data.json so the web app has the latest base profile & localization
		webGameDataPath := filepath.Join(projectRootFlag, "apps", "web", "public", "game-data.json")
		if outputFlag == "game-data.json" || outputFlag != webGameDataPath {
			if err := writeOutputFile(webGameDataPath, gameData); err != nil {
				log.Printf("[daemon] Warning: failed updating web app game data at %s: %v\n", webGameDataPath, err)
			} else {
				fmt.Printf("[daemon] ✓ Successfully updated web application static data: %s\n", webGameDataPath)
			}
		}
	}

	// 3. If --daemon flag set, start HTTP server
	if runDaemonFlag {
		startHTTPServer(daemonPortFlag, gameData)
	}
}

// VersionOverrides allows manual CLI specification of game version details
type VersionOverrides struct {
	Version   string
	Branch    string
	BuildDate string
}

func processGameData(gameRoot string, outputPath string, sanitize bool, overrides VersionOverrides) (*config.GameDataConfig, error) {
	p4kPath, err := p4k.FindDataP4K(gameRoot)
	if err != nil {
		return nil, err
	}
	fmt.Printf("[daemon] Found Data.p4k archive: %s\n", p4kPath)

	sig, err := cache.ComputeP4KSignature(p4kPath)
	if err != nil {
		return nil, fmt.Errorf("failed to compute p4k signature: %w", err)
	}

	manifest := locator.ResolveBuildMetadata(gameRoot, p4kPath)
	if overrides.Version != "" {
		manifest.Data.Version = overrides.Version
	}
	if overrides.Branch != "" {
		manifest.Data.Branch = overrides.Branch
	}
	if overrides.BuildDate != "" {
		manifest.Data.BuildDateStamp = overrides.BuildDate
	}

	fmt.Printf("[daemon] Star Citizen Build: %s (%s, %s)\n", manifest.Data.Version, manifest.Data.Branch, manifest.Data.BuildDateStamp)

	cacheDir := filepath.Join(os.TempDir(), "sc-mapping")
	cacheFile := filepath.Join(cacheDir, "cache.scj")

	// Try loading from .scj cache
	cachedData, err := cache.LoadCachedGameData(cacheFile, sig)
	if err == nil && cachedData != nil {
		fmt.Println("[daemon] ✓ Cache hit: Using existing .scj cache payload.")
		cachedData.Version = Version
		cachedData.GameVersion = manifest.Data.Version
		cachedData.GameBranch = manifest.Data.Branch
		cachedData.GameBuildDate = manifest.Data.BuildDateStamp
		cachedData.ExtractedAt = time.Now()
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
	data.GameVersion = manifest.Data.Version
	data.GameBranch = manifest.Data.Branch
	data.GameBuildDate = manifest.Data.BuildDateStamp
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
	fileBytes = append(fileBytes, '\n')

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
