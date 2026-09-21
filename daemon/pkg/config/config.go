package config

import "time"

// GameDataConfig represents the generated configuration file consumed by the web app
type GameDataConfig struct {
	Version           string            `json:"version"`             // Suite / Daemon version
	GameVersion       string            `json:"game_version"`        // Star Citizen build version (e.g. 4.10.193.11644)
	GameBranch        string            `json:"game_branch"`         // Star Citizen branch (e.g. sc-alpha-4.10.0)
	GameBuildDate     string            `json:"game_build_date,omitempty"` // Build date (e.g. Tue Sep 15 2026)
	GamePath          string            `json:"game_path"`
	P4kSignature      string            `json:"p4k_signature"`
	ExtractedAt       time.Time         `json:"extracted_at"`
	DefaultProfileXML string            `json:"default_profile_xml"`
	Localization      map[string]string `json:"localization"`
}
