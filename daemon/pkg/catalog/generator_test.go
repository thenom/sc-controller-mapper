package catalog

import (
	"os"
	"path/filepath"
	"testing"
)

func TestGenerateCatalogFromGameData(t *testing.T) {
	sampleXML := `<?xml version="1.0" encoding="utf-8"?>
<profile version="1">
  <actionmap name="spaceship_movement">
    <action name="v_pitch"/>
    <action name="v_yaw"/>
    <action name="v_eject"/>
  </actionmap>
  <actionmap name="spaceship_weapons">
    <action name="v_attack1_group1"/>
  </actionmap>
</profile>`

	sampleLoc := map[string]string{
		"ui_v_pitch":             "Pitch",
		"ui_v_yaw":               "Yaw",
		"ui_v_eject":             "Emergency Eject",
		"ui_v_attack1_group1":    "Fire Primary Group",
		"ui_spaceship_movement": "Spaceship Movement",
	}

	cat, err := GenerateCatalogFromGameData(sampleXML, sampleLoc)
	if err != nil {
		t.Fatalf("GenerateCatalogFromGameData failed: %v", err)
	}

	if len(cat) != 2 {
		t.Errorf("expected 2 action maps, got %d", len(cat))
	}

	flightMap, exists := cat["spaceship_movement"]
	if !exists {
		t.Fatalf("spaceship_movement map missing from catalog")
	}

	if flightMap.Label != "Spaceship Movement" {
		t.Errorf("expected label 'Spaceship Movement', got '%s'", flightMap.Label)
	}

	if len(flightMap.Actions) != 3 {
		t.Errorf("expected 3 actions in spaceship_movement, got %d", len(flightMap.Actions))
	}

	pitch := flightMap.Actions[0]
	if pitch.Name != "v_pitch" || pitch.Label != "Pitch" {
		t.Errorf("expected v_pitch / Pitch, got %s / %s", pitch.Name, pitch.Label)
	}

	// Test UpdateProjectCatalogFiles with temp dir
	tmpDir, err := os.MkdirTemp("", "sc_catalog_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	written, err := UpdateProjectCatalogFiles(tmpDir, cat)
	if err != nil {
		t.Fatalf("UpdateProjectCatalogFiles failed: %v", err)
	}

	if len(written) != 3 {
		t.Errorf("expected 3 written paths, got %d: %v", len(written), written)
	}

	for _, p := range written {
		if _, err := os.Stat(p); err != nil {
			t.Errorf("expected file %s to exist: %v", p, err)
		}
	}

	// Verify content
	content, _ := os.ReadFile(filepath.Join(tmpDir, "packages", "parser", "src", "catalog", "sc_action_catalog.json"))
	if len(content) == 0 {
		t.Errorf("generated catalog file was empty")
	}

	tsContent, _ := os.ReadFile(filepath.Join(tmpDir, "packages", "parser", "src", "catalog", "defaultCatalog.ts"))
	if len(tsContent) == 0 {
		t.Errorf("generated defaultCatalog.ts file was empty")
	}
}

func TestGenerateCatalog_ExtendedFeatures(t *testing.T) {
	xmlData := `<?xml version="1.0" encoding="utf-8"?>
<profile version="1">
  <actiongroup action="v_attack">
    <action name="v_attack_all" UILabel="@ui_attack_all" Category="combat" />
    <action name="v_attack1_group1" />
  </actiongroup>
  <actionmap name="spaceship_weapons" UILabel="@map_weapons">
    <action name="v_attack1_group1" activationMode="press" />
  </actionmap>
  <actionmap name="vehicle_general" UILabel="General Vehicle">
    <action name="v_lights" UILabel="@ui_ci_v_lights" />
  </actionmap>
  <actionmap name="spaceship_missiles">
    <action name="v_missile_fire" activationMode="delayed_press_double_tap" />
  </actionmap>
  <actionmap name="spaceship_mining">
    <action name="v_mining_laser" />
  </actionmap>
  <actionmap name="spaceship_salvage">
    <action name="v_salvage_beam" />
  </actionmap>
  <actionmap name="spaceship_quantum">
    <action name="v_toggle_quantum_mode" />
    <action name="v_master_mode_set_nav" />
    <action name="v_master_mode_cycle_long" />
    <action name="v_toggle_qdrive_engagement" />
  </actionmap>
  <actionmap name="player_onfoot">
    <action name="v_eject_hold" UILabel="Eject (Hold)" UIDescription="Long press to eject" />
    <action name="v_master_mode_cycle" />
    <action name="shield_raise" />
    <action name="target_lock" />
    <action name="scan_ping" />
    <action name="power_toggle" />
    <action name="seat_exit" />
    <action name="v_roll" />
  </actionmap>
  <actionmap name="ground_vehicle">
    <action name="drive_forward" />
  </actionmap>
  <actionmap name="zero_gravity">
    <action name="eva_boost" />
  </actionmap>
  <actionmap name="turret_aim">
    <action name="aim" />
  </actionmap>
  <actionmap name="view_orbit">
    <action name="cam" />
  </actionmap>
  <actionmap name="custom_map">
    <action name="foo" />
  </actionmap>
</profile>`

	loc := map[string]string{
		"map_weapons,p":      "Spaceship Weapons",
		"ui_attack_all,u":    "Attack All Targets",
		"ui_ci_v_lights":     "Toggle Headlights",
		"ui_ci_v_lights_desc": "Turns on headlights",
		"token_with_comma,x": "Comma Value",
	}

	cat, err := GenerateCatalogFromGameData(xmlData, loc)
	if err != nil {
		t.Fatalf("GenerateCatalogFromGameData failed: %v", err)
	}

	// Verify domain mappings
	if cat["spaceship_weapons"].Domain != "spaceship" {
		t.Errorf("expected domain spaceship, got %s", cat["spaceship_weapons"].Domain)
	}
	if cat["ground_vehicle"].Domain != "ground_vehicle" {
		t.Errorf("expected domain ground_vehicle, got %s", cat["ground_vehicle"].Domain)
	}
	if cat["player_onfoot"].Domain != "onfoot" {
		t.Errorf("expected domain onfoot, got %s", cat["player_onfoot"].Domain)
	}
	if cat["zero_gravity"].Domain != "eva" {
		t.Errorf("expected domain eva, got %s", cat["zero_gravity"].Domain)
	}
	if cat["turret_aim"].Domain != "turret" {
		t.Errorf("expected domain turret, got %s", cat["turret_aim"].Domain)
	}
	if cat["view_orbit"].Domain != "spectator" {
		t.Errorf("expected domain spectator, got %s", cat["view_orbit"].Domain)
	}
	if cat["custom_map"].Domain != "general" {
		t.Errorf("expected domain general, got %s", cat["custom_map"].Domain)
	}

	// Verify actiongroup injection
	var hasAttackAll bool
	for _, a := range cat["spaceship_weapons"].Actions {
		if a.Name == "v_attack_all" {
			hasAttackAll = true
			if a.Label != "Attack All Targets" {
				t.Errorf("expected 'Attack All Targets', got '%s'", a.Label)
			}
			if a.Category != "Combat" {
				t.Errorf("expected category 'Combat', got '%s'", a.Category)
			}
		}
	}
	if !hasAttackAll {
		t.Errorf("v_attack_all was not injected into spaceship_weapons")
	}

	// Test invalid XML
	_, err = GenerateCatalogFromGameData("<<<invalid xml", loc)
	if err == nil {
		t.Errorf("expected error for invalid xml")
	}
}
