package config

import "time"

// GameDataConfig represents the generated configuration file consumed by the web app
type GameDataConfig struct {
	Version           string            `json:"version"`
	GamePath          string            `json:"game_path"`
	P4kSignature      string            `json:"p4k_signature"`
	ExtractedAt       time.Time         `json:"extracted_at"`
	DefaultProfileXML string            `json:"default_profile_xml"`
	Localization      map[string]string `json:"localization"`
}
