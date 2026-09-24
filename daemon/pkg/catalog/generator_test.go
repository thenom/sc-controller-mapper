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
