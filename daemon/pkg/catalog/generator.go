package catalog

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"unicode"
)

// ActionCatalogEntry represents a single action within the catalog
type ActionCatalogEntry struct {
	Name                  string `json:"name"`
	Label                 string `json:"label"`
	Category              string `json:"category,omitempty"`
	Description           string `json:"description,omitempty"`
	DefaultActivationMode string `json:"defaultActivationMode,omitempty"`
	DefaultMultiTap       int    `json:"defaultMultiTap,omitempty"`
	MasterFlightMode      string `json:"masterFlightMode,omitempty"`
}

// ActionMapCatalog represents an action map category and its child actions
type ActionMapCatalog struct {
	MapName string               `json:"mapName"`
	Label   string               `json:"label"`
	Domain  string               `json:"domain"`
	Actions []ActionCatalogEntry `json:"actions"`
}

// MasterActionCatalog maps ActionMap identifiers to ActionMapCatalog definitions
type MasterActionCatalog map[string]ActionMapCatalog

// Intermediate XML structs for decoding defaultProfile.xml
type xmlGenericProfile struct {
	ActionGroups []xmlActionGroup `xml:"actiongroup"`
	ActionMaps   []xmlActionMap   `xml:"actionmap"`
}

type xmlActionGroup struct {
	Action  string      `xml:"action,attr"`
	Actions []xmlAction `xml:"action"`
}

type xmlActionMap struct {
	Name    string      `xml:"name,attr"`
	UILabel string      `xml:"UILabel,attr"`
	Actions []xmlAction `xml:"action"`
}

type xmlAction struct {
	Name           string `xml:"name,attr"`
	ActivationMode string `xml:"activationMode,attr"`
	UILabel        string `xml:"UILabel,attr"`
	UIDescription  string `xml:"UIDescription,attr"`
	Category       string `xml:"Category,attr"`
	UICategory     string `xml:"UICategory,attr"`
}

// GenerateCatalogFromGameData parses defaultProfile.xml and global.ini tokens into MasterActionCatalog
func GenerateCatalogFromGameData(defaultProfileXML string, loc map[string]string) (MasterActionCatalog, error) {
	var profile xmlGenericProfile
	if err := xml.Unmarshal([]byte(defaultProfileXML), &profile); err != nil {
		return nil, fmt.Errorf("failed to unmarshal defaultProfile.xml: %w", err)
	}

	result := make(MasterActionCatalog)

	for _, m := range profile.ActionMaps {
		mapName := strings.TrimSpace(m.Name)
		if mapName == "" {
			continue
		}

		mapLabel := resolveMapLabel(mapName, m.UILabel, loc)
		domain := resolveDomain(mapName)

		catalogActions := make([]ActionCatalogEntry, 0, len(m.Actions))
		seenActions := make(map[string]bool)

		for _, a := range m.Actions {
			actName := strings.TrimSpace(a.Name)
			if actName == "" || seenActions[actName] {
				continue
			}
			seenActions[actName] = true

			label, desc := resolveActionLocalization(actName, mapName, a.UILabel, a.UIDescription, loc)
			category := categorizeAction(actName, mapName, a.Category)
			actMode, multiTap := resolveActivationMode(actName, a.ActivationMode, label, desc)
			masterMode := resolveMasterFlightMode(actName, mapName)

			catalogActions = append(catalogActions, ActionCatalogEntry{
				Name:                  actName,
				Label:                 label,
				Category:              category,
				Description:           desc,
				DefaultActivationMode: actMode,
				DefaultMultiTap:       multiTap,
				MasterFlightMode:      masterMode,
			})
		}

		result[mapName] = ActionMapCatalog{
			MapName: mapName,
			Label:   mapLabel,
			Domain:  domain,
			Actions: catalogActions,
		}
	}

	// Inject root actiongroups (e.g. actiongroup="v_attack" containing v_attack_all, v_attack_group1, v_attack_group2)
	// into relevant actionmaps (spaceship_weapons and vehicle_general).
	for _, g := range profile.ActionGroups {
		if strings.TrimSpace(g.Action) == "v_attack" {
			targetMaps := []string{"spaceship_weapons", "vehicle_general"}
			for _, tm := range targetMaps {
				if mCatalog, exists := result[tm]; exists {
					existingNames := make(map[string]bool)
					for _, existing := range mCatalog.Actions {
						existingNames[existing.Name] = true
					}
					var newActions []ActionCatalogEntry
					for _, a := range g.Actions {
						actName := strings.TrimSpace(a.Name)
						if actName != "" && !existingNames[actName] {
							label, desc := resolveActionLocalization(actName, tm, a.UILabel, a.UIDescription, loc)
							category := categorizeAction(actName, tm, a.Category)
							actMode, multiTap := resolveActivationMode(actName, a.ActivationMode, label, desc)
							masterMode := resolveMasterFlightMode(actName, tm)
							newActions = append(newActions, ActionCatalogEntry{
								Name:                  actName,
								Label:                 label,
								Category:              category,
								Description:           desc,
								DefaultActivationMode: actMode,
								DefaultMultiTap:       multiTap,
								MasterFlightMode:      masterMode,
							})
							existingNames[actName] = true
						}
					}
					mCatalog.Actions = append(newActions, mCatalog.Actions...)
					result[tm] = mCatalog
				}
			}
		}
	}

	return result, nil
}

func resolveMasterFlightMode(actName, mapName string) string {
	lowerAct := strings.ToLower(actName)
	lowerMap := strings.ToLower(mapName)

	if lowerAct == "v_master_mode_set_scm" ||
		lowerMap == "spaceship_weapons" ||
		lowerMap == "spaceship_missiles" ||
		lowerMap == "spaceship_mining" ||
		lowerMap == "spaceship_salvage" {
		return "SCM"
	}

	if lowerAct == "v_master_mode_set_nav" ||
		lowerAct == "v_master_mode_cycle_long" ||
		lowerAct == "v_toggle_qdrive_engagement" ||
		lowerAct == "v_toggle_quantum_mode" ||
		lowerMap == "spaceship_quantum" {
		return "NAV"
	}

	return ""
}

func resolveActivationMode(actName string, xmlMode string, label string, desc string) (string, int) {
	m := strings.TrimSpace(xmlMode)
	lowerMode := strings.ToLower(m)

	if lowerMode != "" {
		multiTap := 1
		if strings.Contains(lowerMode, "double_tap") {
			multiTap = 2
		}
		return lowerMode, multiTap
	}

	lowerAct := strings.ToLower(actName)
	lowerLabel := strings.ToLower(label)
	lowerDesc := strings.ToLower(desc)

	if strings.Contains(lowerLabel, "(hold)") || strings.Contains(lowerDesc, "(hold)") ||
		strings.Contains(lowerLabel, "long press") || strings.Contains(lowerDesc, "long press") ||
		strings.HasSuffix(lowerAct, "_hold") || strings.HasSuffix(lowerAct, "_long") {
		return "delayed_press", 1
	}

	if lowerAct == "v_master_mode_cycle" || strings.HasSuffix(lowerAct, "_tap") {
		return "tap", 1
	}

	return "press", 1
}

// UpdateProjectCatalogFiles writes the serialized catalog into monorepo target files
func UpdateProjectCatalogFiles(projectRoot string, catalog MasterActionCatalog) ([]string, error) {
	paths := []string{
		filepath.Join(projectRoot, "packages", "parser", "src", "catalog", "sc_action_catalog.json"),
		filepath.Join(projectRoot, "apps", "web", "public", "data", "sc_action_catalog.json"),
	}

	data, err := json.MarshalIndent(catalog, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal action catalog: %w", err)
	}
	data = append(data, '\n')

	var written []string
	for _, p := range paths {
		dir := filepath.Dir(p)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return written, fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
		if err := os.WriteFile(p, data, 0644); err != nil {
			return written, fmt.Errorf("failed to write %s: %w", p, err)
		}
		written = append(written, p)
	}

	// Also sync packages/parser/src/catalog/defaultCatalog.ts directly so TypeScript modules are always synced
	defaultCatalogTsPath := filepath.Join(projectRoot, "packages", "parser", "src", "catalog", "defaultCatalog.ts")
	tsContent := "import type { MasterActionCatalog } from \"@sc-mapping/shared-types\";\n\n" +
		"export const MASTER_ACTION_CATALOG: MasterActionCatalog = " + string(data) + ";\n"
	if err := os.WriteFile(defaultCatalogTsPath, []byte(tsContent), 0644); err == nil {
		written = append(written, defaultCatalogTsPath)
	}

	return written, nil
}

func locLookup(key string, loc map[string]string) string {
	if loc == nil {
		return ""
	}
	clean := strings.ToLower(strings.TrimSpace(key))
	clean = strings.TrimPrefix(clean, "@")
	if clean == "" {
		return ""
	}

	// 1. Direct match
	if val, ok := loc[clean]; ok && strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}

	// 2. Comma suffixes (Star Citizen localization format: key,p or key,u)
	if val, ok := loc[clean+",p"]; ok && strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	if val, ok := loc[clean+",u"]; ok && strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}

	// 3. If key contains comma, try without suffix
	if strings.Contains(clean, ",") {
		base := strings.Split(clean, ",")[0]
		if val, ok := loc[base]; ok && strings.TrimSpace(val) != "" {
			return strings.TrimSpace(val)
		}
	}

	return ""
}

func resolveActionLocalization(actName, mapName, uiLabel, uiDesc string, loc map[string]string) (string, string) {
	label := ""
	desc := ""

	if loc != nil {
		if uiLabel != "" {
			label = locLookup(uiLabel, loc)
		}
		if uiDesc != "" {
			desc = locLookup(uiDesc, loc)
		}

		if label == "" {
			candidates := []string{
				"ui_" + actName,
				"ui_ci_" + actName,
				"ui_" + mapName + "_" + actName,
				actName,
			}
			for _, c := range candidates {
				val := locLookup(c, loc)
				if val != "" {
					label = val
					if desc == "" {
						desc = locLookup(c+"_desc", loc)
					}
					break
				}
			}
		}
	}

	if label == "" {
		label = humanizeIdentifier(actName)
	}

	return label, desc
}

func resolveMapLabel(mapName, uiLabel string, loc map[string]string) string {
	if loc != nil {
		if uiLabel != "" {
			if val := locLookup(uiLabel, loc); val != "" {
				return val
			}
		}
		candidates := []string{
			"ui_" + mapName,
			"ui_ci_" + mapName,
			mapName,
		}
		for _, c := range candidates {
			if val := locLookup(c, loc); val != "" {
				return val
			}
		}
	}

	return humanizeIdentifier(mapName)
}

func resolveDomain(mapName string) string {
	lower := strings.ToLower(mapName)
	switch {
	case strings.HasPrefix(lower, "spaceship_") || strings.HasPrefix(lower, "seat_") || strings.HasPrefix(lower, "ifcs_"):
		return "spaceship"
	case strings.HasPrefix(lower, "vehicle_") || strings.HasPrefix(lower, "ground_vehicle"):
		return "ground_vehicle"
	case strings.HasPrefix(lower, "player") || lower == "prone" || lower == "mining":
		return "onfoot"
	case strings.HasPrefix(lower, "zero_gravity") || lower == "eva":
		return "eva"
	case strings.HasPrefix(lower, "turret"):
		return "turret"
	case strings.HasPrefix(lower, "view_") || lower == "flycam" || lower == "spectator":
		return "spectator"
	default:
		return "general"
	}
}

func categorizeAction(actName, mapName, xmlCategory string) string {
	if strings.TrimSpace(xmlCategory) != "" {
		return humanizeIdentifier(xmlCategory)
	}

	lower := strings.ToLower(actName)
	switch {
	case strings.Contains(lower, "pitch") || strings.Contains(lower, "yaw") || strings.Contains(lower, "roll") || strings.Contains(lower, "strafe"):
		return "Flight Movement"
	case strings.Contains(lower, "attack") || strings.Contains(lower, "weapon") || strings.Contains(lower, "fire"):
		return "Weapons & Combat"
	case strings.Contains(lower, "missile"):
		return "Missile Systems"
	case strings.Contains(lower, "shield") || strings.Contains(lower, "countermeasure") || strings.Contains(lower, "flare"):
		return "Defensive & Shields"
	case strings.Contains(lower, "target") || strings.Contains(lower, "pin"):
		return "Targeting & Radar"
	case strings.Contains(lower, "mining"):
		return "Mining Operations"
	case strings.Contains(lower, "salvage"):
		return "Salvage Operations"
	case strings.Contains(lower, "scan") || strings.Contains(lower, "ping"):
		return "Scanning"
	case strings.Contains(lower, "power"):
		return "Power Management"
	case strings.Contains(lower, "quantum"):
		return "Quantum Travel"
	case strings.Contains(lower, "door") || strings.Contains(lower, "exit") || strings.Contains(lower, "eject"):
		return "Seat & Access"
	default:
		return humanizeIdentifier(mapName)
	}
}

func humanizeIdentifier(s string) string {
	s = strings.TrimPrefix(s, "v_")
	parts := strings.Split(s, "_")
	for i, p := range parts {
		if len(p) > 0 {
			r := []rune(p)
			r[0] = unicode.ToUpper(r[0])
			parts[i] = string(r)
		}
	}
	return strings.Join(parts, " ")
}
