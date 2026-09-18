package p4k

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/sc-mapping/daemon/pkg/config"
	"github.com/sc-mapping/daemon/pkg/parser"
)

// ExtractFromP4K streams and extracts defaultProfile.xml and global.ini from Data.p4k
func ExtractFromP4K(p4kPath string, signature string) (*config.GameDataConfig, error) {
	f, err := os.Open(p4kPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open Data.p4k: %w", err)
	}
	defer f.Close()

	fi, err := f.Stat()
	if err != nil {
		return nil, fmt.Errorf("failed to stat Data.p4k: %w", err)
	}

	// Zip64 seeking reader: does NOT load 90GB into memory
	zipReader, err := zip.NewReader(f, fi.Size())
	if err != nil {
		return nil, fmt.Errorf("invalid zip structure in Data.p4k: %w", err)
	}

	gameData := &config.GameDataConfig{
		Version:      "1.0.0",
		P4kSignature: signature,
		Localization: make(map[string]string),
	}

	var foundProfile, foundLoc bool

	for _, file := range zipReader.File {
		normPath := strings.ReplaceAll(file.Name, `\`, `/`)

		if strings.EqualFold(normPath, "Data/Libs/Config/defaultProfile.xml") {
			rc, err := openEntry(file)
			if err != nil {
				return nil, fmt.Errorf("error reading defaultProfile.xml: %w", err)
			}
			buf := new(bytes.Buffer)
			if _, err := io.Copy(buf, rc); err != nil {
				rc.Close()
				return nil, fmt.Errorf("error copying defaultProfile.xml: %w", err)
			}
			rc.Close()
			gameData.DefaultProfileXML = buf.String()
			foundProfile = true
		}

		if strings.EqualFold(normPath, "Data/Localization/english/global.ini") {
			rc, err := openEntry(file)
			if err != nil {
				return nil, fmt.Errorf("error reading global.ini: %w", err)
			}
			locMap, err := parser.ParseLocalizationINI(rc)
			rc.Close()
			if err != nil {
				return nil, fmt.Errorf("error parsing global.ini: %w", err)
			}
			gameData.Localization = locMap
			foundLoc = true
		}

		if foundProfile && foundLoc {
			break
		}
	}

	if !foundProfile {
		return nil, fmt.Errorf("Data/Libs/Config/defaultProfile.xml not found inside Data.p4k")
	}

	return gameData, nil
}

func openEntry(file *zip.File) (io.ReadCloser, error) {
	rc, err := file.Open()
	if err != nil {
		return nil, err
	}

	// CryEngine encrypted flag check (bit 0 of general purpose bit flag)
	if file.Flags&0x1 != 0 {
		return NewCryDecryptReader(rc, CryEngineKey), nil
	}

	return rc, nil
}

// FindDataP4K searches for Data.p4k under LIVE, PTU, or EPTU folders
func FindDataP4K(gameRoot string) (string, error) {
	channels := []string{"LIVE", "PTU", "EPTU", "TECH-PREVIEW"}
	for _, ch := range channels {
		candidate := filepath.Join(gameRoot, ch, "Data.p4k")
		if _, err := os.Stat(candidate); err == nil {
			return candidate, nil
		}
	}

	// Also check directly under gameRoot
	candidate := filepath.Join(gameRoot, "Data.p4k")
	if _, err := os.Stat(candidate); err == nil {
		return candidate, nil
	}

	return "", fmt.Errorf("Data.p4k not found in %s (checked LIVE, PTU, EPTU)", gameRoot)
}
