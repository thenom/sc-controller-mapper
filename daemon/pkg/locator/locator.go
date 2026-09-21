package locator

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// ResolveGamePath resolves the Star Citizen root directory using CLI arg, env var, launcher logs, or standard paths
func ResolveGamePath(cliPath string) (string, error) {
	// 1. Explicit CLI Path supplied by user
	if cliPath != "" {
		cleaned := filepath.Clean(cliPath)
		if _, err := os.Stat(cleaned); err == nil {
			return cleaned, nil
		}
		return "", fmt.Errorf("specified game path does not exist: %s", cleaned)
	}

	// 2. Check Environment Variable
	if envPath := os.Getenv("STARCITIZEN_PATH"); envPath != "" {
		if _, err := os.Stat(envPath); err == nil {
			return envPath, nil
		}
	}

	// 3. Inspect RSI Launcher Logs
	logPath, err := discoverFromLauncherLogs()
	if err == nil && logPath != "" {
		if _, err := os.Stat(logPath); err == nil {
			return logPath, nil
		}
	}

	// 4. Default standard locations
	candidateDefaults := []string{
		`C:\Program Files\Roberts Space Industries\StarCitizen`,
		`D:\Roberts Space Industries\StarCitizen`,
		`D:\Games\Roberts Space Industries\StarCitizen`,
		`E:\Roberts Space Industries\StarCitizen`,
		`E:\Games\Roberts Space Industries\StarCitizen`,
	}

	for _, candidate := range candidateDefaults {
		if _, err := os.Stat(candidate); err == nil {
			return candidate, nil
		}
	}

	return "", fmt.Errorf("unable to locate Star Citizen directory. Please specify with --game-path or -p")
}

func discoverFromLauncherLogs() (string, error) {
	appData := os.Getenv("APPDATA")
	if appData == "" {
		return "", fmt.Errorf("APPDATA environment variable not set")
	}

	possibleLogs := []string{
		filepath.Join(appData, "rsilauncher", "logs", "log.log"),
		filepath.Join(appData, "RSI Launcher", "logs", "log.log"),
	}

	pathRegex := regexp.MustCompile(`(?i)(?:gamePath|Library folder|Installing [^"]* to)\s*[:=]\s*["']?([A-Z]:\\[^"'\r\n]+?)(?:\\StarCitizen)?["']?$`)

	for _, logFile := range possibleLogs {
		f, err := os.Open(logFile)
		if err != nil {
			continue
		}
		defer f.Close()

		var matched string
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := scanner.Text()
			matches := pathRegex.FindStringSubmatch(line)
			if len(matches) > 1 {
				matched = strings.TrimSpace(matches[1])
			}
		}

		if matched != "" {
			// If path doesn't end with StarCitizen, check if subfolder exists
			if !strings.HasSuffix(strings.ToLower(matched), "starcitizen") {
				subPath := filepath.Join(matched, "StarCitizen")
				if _, err := os.Stat(subPath); err == nil {
					return subPath, nil
				}
			}
			return matched, nil
		}
	}

	return "", fmt.Errorf("no valid game path found in RSI launcher logs")
}

// BuildManifest represents the metadata stored in build_manifest.id
type BuildManifest struct {
	Data struct {
		Branch               string `json:"Branch"`
		BuildDateStamp       string `json:"BuildDateStamp"`
		BuildId              string `json:"BuildId"`
		BuildTimeStamp       string `json:"BuildTimeStamp"`
		Config               string `json:"Config"`
		Platform             string `json:"Platform"`
		RequestedP4ChangeNum string `json:"RequestedP4ChangeNum"`
		Tag                  string `json:"Tag"`
		Version              string `json:"Version"`
	} `json:"Data"`
}

// ReadBuildManifest attempts to find and parse build_manifest.id in gameRoot or channel subdirectories
func ReadBuildManifest(gameRoot string) (*BuildManifest, error) {
	candidates := []string{
		filepath.Join(gameRoot, "build_manifest.id"),
		filepath.Join(gameRoot, "LIVE", "build_manifest.id"),
		filepath.Join(gameRoot, "PTU", "build_manifest.id"),
		filepath.Join(gameRoot, "EPTU", "build_manifest.id"),
	}

	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			content, err := os.ReadFile(c)
			if err != nil {
				continue
			}
			var manifest BuildManifest
			if err := json.Unmarshal(content, &manifest); err == nil && manifest.Data.Version != "" {
				return &manifest, nil
			}
		}
	}

	return nil, fmt.Errorf("build_manifest.id not found or invalid in %s", gameRoot)
}
