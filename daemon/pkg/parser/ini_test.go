package parser

import (
	"errors"
	"strings"
	"testing"
)

type errReader struct{}

func (e *errReader) Read(p []byte) (n int, err error) {
	return 0, errors.New("simulated read error")
}

func TestParseLocalizationINI(t *testing.T) {
	content := `
# Header Comment
; Semicolon comment

# Empty line above
@ui_VehicleFlight = Spaceship Movement
ui_Pitch = Pitch Up / Down
ui_Action_Complex = Setting = Key = Value

# Line without equals sign
InvalidLineWithoutEquals

  @spaced_key   =   Spaced Value
; Trailing comment
`

	r := strings.NewReader(content)
	res, err := ParseLocalizationINI(r)
	if err != nil {
		t.Fatalf("unexpected error parsing INI: %v", err)
	}

	if res["ui_vehicleflight"] != "Spaceship Movement" {
		t.Errorf("expected 'Spaceship Movement', got '%s'", res["ui_vehicleflight"])
	}

	if res["ui_pitch"] != "Pitch Up / Down" {
		t.Errorf("expected 'Pitch Up / Down', got '%s'", res["ui_pitch"])
	}

	if res["ui_action_complex"] != "Setting = Key = Value" {
		t.Errorf("expected 'Setting = Key = Value', got '%s'", res["ui_action_complex"])
	}

	if res["spaced_key"] != "Spaced Value" {
		t.Errorf("expected 'Spaced Value', got '%s'", res["spaced_key"])
	}

	if _, exists := res["invalidlinewithoutequals"]; exists {
		t.Errorf("line without equals sign should not be parsed into result")
	}
}

func TestParseLocalizationINI_ReaderError(t *testing.T) {
	_, err := ParseLocalizationINI(&errReader{})
	if err == nil {
		t.Fatalf("expected error from errReader, got nil")
	}
}
