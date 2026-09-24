package locator

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
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

// BuildManifest represents the metadata stored in build_manifest.id or parsed from game logs
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

// rawManifest handles both flat JSON and nested Data JSON formats
type rawManifest struct {
	Branch               string `json:"Branch"`
	BuildDateStamp       string `json:"BuildDateStamp"`
	BuildId              string `json:"BuildId"`
	BuildTimeStamp       string `json:"BuildTimeStamp"`
	Config               string `json:"Config"`
	Platform             string `json:"Platform"`
	RequestedP4ChangeNum string `json:"RequestedP4ChangeNum"`
	Tag                  string `json:"Tag"`
	Version              string `json:"Version"`
	Data                 *struct {
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
	baseDir := gameRoot
	if fi, err := os.Stat(gameRoot); err == nil && !fi.IsDir() {
		baseDir = filepath.Dir(gameRoot)
	}

	candidates := []string{
		filepath.Join(baseDir, "build_manifest.id"),
		filepath.Join(baseDir, "LIVE", "build_manifest.id"),
		filepath.Join(baseDir, "PTU", "build_manifest.id"),
		filepath.Join(baseDir, "EPTU", "build_manifest.id"),
		filepath.Join(filepath.Dir(baseDir), "build_manifest.id"),
		filepath.Join(filepath.Dir(filepath.Dir(baseDir)), "build_manifest.id"),
		filepath.Join(baseDir, "f_build.id"),
		filepath.Join(baseDir, "LIVE", "f_build.id"),
		filepath.Join(baseDir, "build.id"),
	}

	for _, c := range candidates {
		if fi, err := os.Stat(c); err == nil && !fi.IsDir() {
			content, err := os.ReadFile(c)
			if err != nil {
				continue
			}
			var raw rawManifest
			if err := json.Unmarshal(content, &raw); err == nil {
				var manifest BuildManifest
				if raw.Data != nil {
					manifest.Data.Branch = raw.Data.Branch
					manifest.Data.BuildDateStamp = raw.Data.BuildDateStamp
					manifest.Data.BuildId = raw.Data.BuildId
					manifest.Data.BuildTimeStamp = raw.Data.BuildTimeStamp
					manifest.Data.Config = raw.Data.Config
					manifest.Data.Platform = raw.Data.Platform
					manifest.Data.RequestedP4ChangeNum = raw.Data.RequestedP4ChangeNum
					manifest.Data.Tag = raw.Data.Tag
					manifest.Data.Version = raw.Data.Version
				}
				if manifest.Data.Version == "" && raw.Version != "" {
					manifest.Data.Version = raw.Version
				}
				if manifest.Data.Branch == "" && raw.Branch != "" {
					manifest.Data.Branch = raw.Branch
				}
				if manifest.Data.BuildDateStamp == "" && raw.BuildDateStamp != "" {
					manifest.Data.BuildDateStamp = raw.BuildDateStamp
				}
				if manifest.Data.BuildId == "" && raw.BuildId != "" {
					manifest.Data.BuildId = raw.BuildId
				}
				if manifest.Data.BuildTimeStamp == "" && raw.BuildTimeStamp != "" {
					manifest.Data.BuildTimeStamp = raw.BuildTimeStamp
				}

				if manifest.Data.BuildDateStamp == "" {
					manifest.Data.BuildDateStamp = fi.ModTime().Format("Mon Jan 2 2006")
				}

				if manifest.Data.Version != "" || manifest.Data.Branch != "" {
					return &manifest, nil
				}
			}
		}
	}

	// Fallback: Check Game.log
	if m, err := parseManifestFromGameLog(baseDir); err == nil && m != nil {
		return m, nil
	}

	return nil, fmt.Errorf("build_manifest.id / Game.log not found or invalid in %s", gameRoot)
}

func parseManifestFromGameLog(baseDir string) (*BuildManifest, error) {
	logCandidates := []string{
		filepath.Join(baseDir, "Game.log"),
		filepath.Join(baseDir, "game.log"),
		filepath.Join(baseDir, "LIVE", "Game.log"),
		filepath.Join(baseDir, "LIVE", "game.log"),
		filepath.Join(baseDir, "PTU", "Game.log"),
		filepath.Join(baseDir, "EPTU", "Game.log"),
		filepath.Join(filepath.Dir(baseDir), "Game.log"),
		filepath.Join(filepath.Dir(baseDir), "LIVE", "Game.log"),
	}

	branchRegex := regexp.MustCompile(`(?i)(?:Branch|Game Branch)\s*[:=]\s*([^\r\n]+)`)
	versionRegex := regexp.MustCompile(`(?i)(?:Version|Build Version|Build Version ID|Build)\s*[:=]\s*([^\r\n]+)`)
	dateRegex := regexp.MustCompile(`(?i)(?:BuildDateStamp|Build Date|Built on)\s*[:=]\s*([^\r\n]+)`)

	for _, lp := range logCandidates {
		fi, err := os.Stat(lp)
		if err != nil || fi.IsDir() {
			continue
		}
		f, err := os.Open(lp)
		if err != nil {
			continue
		}
		defer f.Close()

		var manifest BuildManifest
		scanner := bufio.NewScanner(f)
		lineCount := 0
		for scanner.Scan() && lineCount < 200 {
			line := strings.TrimSpace(scanner.Text())
			lineCount++

			if m := branchRegex.FindStringSubmatch(line); len(m) > 1 && manifest.Data.Branch == "" {
				manifest.Data.Branch = strings.TrimSpace(m[1])
			}
			if m := versionRegex.FindStringSubmatch(line); len(m) > 1 && manifest.Data.Version == "" {
				manifest.Data.Version = strings.TrimSpace(m[1])
			}
			if m := dateRegex.FindStringSubmatch(line); len(m) > 1 && manifest.Data.BuildDateStamp == "" {
				manifest.Data.BuildDateStamp = strings.TrimSpace(m[1])
			}
		}

		if manifest.Data.BuildDateStamp == "" {
			manifest.Data.BuildDateStamp = fi.ModTime().Format("Mon Jan 2 2006")
		}

		if manifest.Data.Version != "" || manifest.Data.Branch != "" {
			return &manifest, nil
		}
	}

	return nil, fmt.Errorf("no valid game log found")
}

// ResolveBuildMetadata resolves Star Citizen build info from manifest, game logs, launcher logs, and archive modtime
func ResolveBuildMetadata(gameRoot string, p4kPath string) *BuildManifest {
	manifest, _ := ReadBuildManifest(gameRoot)
	if manifest == nil {
		manifest = &BuildManifest{}
	}

	combinedPath := filepath.ToSlash(gameRoot + " " + p4kPath)

	// 1. If date is missing, infer from Data.p4k modification time
	if manifest.Data.BuildDateStamp == "" && p4kPath != "" {
		if fi, err := os.Stat(p4kPath); err == nil {
			manifest.Data.BuildDateStamp = fi.ModTime().Format("Mon Jan 2 2006")
		}
	}
	if manifest.Data.BuildDateStamp == "" {
		manifest.Data.BuildDateStamp = time.Now().Format("Mon Jan 2 2006")
	}

	// 2. If branch is missing or plain "LIVE", detect branch from path
	if manifest.Data.Branch == "" || manifest.Data.Branch == "LIVE" {
		branchRegex := regexp.MustCompile(`(?i)(?:sc-alpha-|alpha-)?(4\.\d+(?:\.\d+)?)`)
		if m := branchRegex.FindStringSubmatch(combinedPath); len(m) > 1 {
			manifest.Data.Branch = "sc-alpha-" + m[1]
		} else if strings.Contains(strings.ToLower(combinedPath), "/ptu") {
			manifest.Data.Branch = "PTU"
		} else if strings.Contains(strings.ToLower(combinedPath), "/eptu") {
			manifest.Data.Branch = "EPTU"
		} else if manifest.Data.Branch == "" {
			manifest.Data.Branch = "LIVE"
		}
	}

	// 3. If version is missing or matches branch, attempt build number extraction from path
	if manifest.Data.Version == "" || manifest.Data.Version == manifest.Data.Branch || manifest.Data.Version == "LIVE" {
		buildNumRegex := regexp.MustCompile(`(?i)(?:build|live)[._-]?(\d{7,10})`)
		if m := buildNumRegex.FindStringSubmatch(combinedPath); len(m) > 1 {
			manifest.Data.Version = m[1]
		} else {
			buildRegex := regexp.MustCompile(`(?i)(4\.\d+(?:\.\d+)?(?:[._-](?:live|ptu|eptu))?(?:[._-]\d{4,10})?)`)
			if m := buildRegex.FindStringSubmatch(combinedPath); len(m) > 1 {
				manifest.Data.Version = m[1]
			}
		}
	}
	if manifest.Data.Version == "" {
		manifest.Data.Version = manifest.Data.Branch
	}

	return manifest
}
