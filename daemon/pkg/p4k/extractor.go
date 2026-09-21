package p4k

import (
	"archive/zip"
	"bytes"
	"compress/flate"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/klauspost/compress/zstd"
	"github.com/sc-mapping/daemon/pkg/config"
	"github.com/sc-mapping/daemon/pkg/cryxml"
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
			rc, err := openEntry(f, file)
			if err != nil {
				return nil, fmt.Errorf("error reading defaultProfile.xml: %w", err)
			}
			buf := new(bytes.Buffer)
			if _, err := io.Copy(buf, rc); err != nil {
				rc.Close()
				return nil, fmt.Errorf("error copying defaultProfile.xml: %w", err)
			}
			rc.Close()

			rawBytes := buf.Bytes()
			if cryxml.IsCryXmlB(rawBytes) {
				decodedXML, err := cryxml.Decode(rawBytes)
				if err != nil {
					return nil, fmt.Errorf("failed to decode CryXmlB defaultProfile.xml: %w", err)
				}
				gameData.DefaultProfileXML = decodedXML
				log.Printf("[daemon] ✓ Extracted and decoded CryXmlB defaultProfile.xml (%d bytes)", len(decodedXML))
			} else {
				gameData.DefaultProfileXML = buf.String()
				log.Printf("[daemon] ✓ Extracted plaintext defaultProfile.xml (%d bytes)", len(gameData.DefaultProfileXML))
			}
			foundProfile = true
		}

		if strings.EqualFold(normPath, "Data/Localization/english/global.ini") {
			rc, err := openEntry(f, file)
			if err != nil {
				log.Printf("[daemon] Notice: global.ini not accessible in Data.p4k (using fallback action labels): %v", err)
			} else {
				locMap, err := parser.ParseLocalizationINI(rc)
				rc.Close()
				if err != nil {
					log.Printf("[daemon] Notice: failed parsing global.ini: %v", err)
				} else {
					gameData.Localization = locMap
					foundLoc = true
					log.Printf("[daemon] ✓ Extracted %d localization tokens from global.ini", len(locMap))
				}
			}
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

func findZip64HeaderOffset(extra []byte) (int64, bool) {
	for i := 0; i+4 <= len(extra); {
		tag := binary.LittleEndian.Uint16(extra[i : i+2])
		size := int(binary.LittleEndian.Uint16(extra[i+2 : i+4]))
		i += 4
		if i+size > len(extra) {
			break
		}
		field := extra[i : i+size]
		// In Star Citizen Data.p4k Zip64 records:
		// [0:8] uncompressed size, [8:16] compressed size, [16:24] relative header offset
		if tag == 0x0001 && size >= 24 {
			offset := int64(binary.LittleEndian.Uint64(field[16:24]))
			return offset, true
		}
		i += size
	}
	return 0, false
}

func openEntry(rAt io.ReaderAt, file *zip.File) (io.ReadCloser, error) {
	var raw io.Reader

	if offset, ok := findZip64HeaderOffset(file.Extra); ok {
		var localHeader [30]byte
		if _, err := rAt.ReadAt(localHeader[:], offset); err != nil {
			return nil, fmt.Errorf("failed reading local header at %d: %w", offset, err)
		}
		sig := binary.LittleEndian.Uint32(localHeader[0:4])
		if sig != 0x04034b50 && sig != 0x14034b50 {
			r, err := file.OpenRaw()
			if err != nil {
				return nil, fmt.Errorf("open raw failed: %w", err)
			}
			raw = r
		} else {
			fnLen := int64(binary.LittleEndian.Uint16(localHeader[26:28]))
			extraLen := int64(binary.LittleEndian.Uint16(localHeader[28:30]))
			dataOffset := offset + 30 + fnLen + extraLen
			raw = io.NewSectionReader(rAt, dataOffset, int64(file.CompressedSize64))
		}
	} else {
		r, err := file.OpenRaw()
		if err != nil {
			return nil, fmt.Errorf("open raw failed: %w", err)
		}
		raw = r
	}

	var r io.Reader = raw
	// CryEngine encrypted flag check (bit 0 of general purpose bit flag)
	if file.Flags&0x1 != 0 {
		r = NewCryDecryptReader(io.NopCloser(raw), CryEngineKey)
	}

	switch file.Method {
	case 0: // Store (no compression)
		return io.NopCloser(r), nil
	case 8: // Deflate
		return flate.NewReader(r), nil
	case 93, 100: // Zstandard (0x5D / 0x64)
		zr, err := zstd.NewReader(r)
		if err != nil {
			return nil, fmt.Errorf("zstd reader init failed: %w", err)
		}
		return zr.IOReadCloser(), nil
	default:
		return nil, fmt.Errorf("unsupported compression method: %d (0x%x)", file.Method, file.Method)
	}
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
