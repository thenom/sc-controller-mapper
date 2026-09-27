package p4k

import (
	"archive/zip"
	"bytes"
	"encoding/binary"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFindDataP4K(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "sc_p4k_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// 1. Error when nothing exists
	_, err = FindDataP4K(tmpDir)
	if err == nil {
		t.Errorf("expected error when Data.p4k does not exist, got nil")
	}

	// 2. Discover under LIVE/Data.p4k
	liveDir := filepath.Join(tmpDir, "LIVE")
	if err := os.MkdirAll(liveDir, 0755); err != nil {
		t.Fatalf("failed creating LIVE dir: %v", err)
	}
	liveP4K := filepath.Join(liveDir, "Data.p4k")
	if err := os.WriteFile(liveP4K, []byte("dummy p4k"), 0644); err != nil {
		t.Fatalf("failed creating test p4k: %v", err)
	}

	found, err := FindDataP4K(tmpDir)
	if err != nil {
		t.Fatalf("FindDataP4K failed: %v", err)
	}
	if found != liveP4K {
		t.Errorf("expected %s, got %s", liveP4K, found)
	}

	// 3. Direct file path passed
	foundDirect, err := FindDataP4K(liveP4K)
	if err != nil {
		t.Fatalf("FindDataP4K failed on direct file: %v", err)
	}
	if foundDirect != liveP4K {
		t.Errorf("expected %s, got %s", liveP4K, foundDirect)
	}
}

func TestCryDecryptReader(t *testing.T) {
	orig := []byte("Testing CryEngine cipher stream decryption")
	encrypted := make([]byte, len(orig))
	copy(encrypted, orig)

	keyLen := len(CryEngineKey)
	for i := 0; i < len(encrypted); i++ {
		encrypted[i] ^= CryEngineKey[i%keyLen]
	}

	reader := NewCryDecryptReader(io.NopCloser(bytes.NewReader(encrypted)), CryEngineKey)
	decrypted, err := io.ReadAll(reader)
	if err != nil {
		t.Fatalf("unexpected error reading from CryDecryptReader: %v", err)
	}

	if !bytes.Equal(decrypted, orig) {
		t.Fatalf("expected decrypted text '%s', got '%s'", string(orig), string(decrypted))
	}

	if err := reader.Close(); err != nil {
		t.Fatalf("unexpected error closing CryDecryptReader: %v", err)
	}
}

func TestFindZip64HeaderOffset(t *testing.T) {
	// 1. Extra field with tag 0x0001 and size 28
	extra := make([]byte, 32)
	binary.LittleEndian.PutUint16(extra[0:2], 0x0001)
	binary.LittleEndian.PutUint16(extra[2:4], 28)
	// relative header offset at field[16:24] -> extra[20:28]
	binary.LittleEndian.PutUint64(extra[20:28], 12345678)

	offset, ok := findZip64HeaderOffset(extra)
	if !ok || offset != 12345678 {
		t.Fatalf("expected offset 12345678, got %d (ok: %v)", offset, ok)
	}

	// 2. Extra field with different tag
	binary.LittleEndian.PutUint16(extra[0:2], 0x9999)
	_, ok = findZip64HeaderOffset(extra)
	if ok {
		t.Fatalf("expected false for unknown tag")
	}

	// 3. Short extra field
	_, ok = findZip64HeaderOffset([]byte{0x01, 0x00})
	if ok {
		t.Fatalf("expected false for short extra field")
	}
}

func TestExtractFromP4K(t *testing.T) {
	tmpDir := t.TempDir()
	p4kPath := filepath.Join(tmpDir, "Data.p4k")

	// Create test zip archive representing Data.p4k
	f, err := os.Create(p4kPath)
	if err != nil {
		t.Fatalf("failed to create zip file: %v", err)
	}
	zw := zip.NewWriter(f)

	// Add defaultProfile.xml
	profileW, err := zw.Create("Data/Libs/Config/defaultProfile.xml")
	if err != nil {
		t.Fatalf("failed creating profile entry: %v", err)
	}
	profileW.Write([]byte(`<?xml version="1.0"?><profile></profile>`))

	// Add global.ini
	locW, err := zw.Create("Data/Localization/english/global.ini")
	if err != nil {
		t.Fatalf("failed creating loc entry: %v", err)
	}
	locW.Write([]byte("ui_test = Test Value\n"))

	if err := zw.Close(); err != nil {
		t.Fatalf("failed closing zip writer: %v", err)
	}
	f.Close()

	// Extract
	gameData, err := ExtractFromP4K(p4kPath, "sig-123")
	if err != nil {
		t.Fatalf("ExtractFromP4K failed: %v", err)
	}
	if !strings.Contains(gameData.DefaultProfileXML, "<profile>") {
		t.Errorf("missing <profile> in extracted xml: %s", gameData.DefaultProfileXML)
	}
	if gameData.Localization["ui_test"] != "Test Value" {
		t.Errorf("expected 'Test Value', got '%s'", gameData.Localization["ui_test"])
	}

	// Test missing file
	_, err = ExtractFromP4K(filepath.Join(tmpDir, "missing.p4k"), "sig")
	if err == nil {
		t.Errorf("expected error for missing file")
	}

	// Test zip without profile
	badP4k := filepath.Join(tmpDir, "bad.p4k")
	bf, _ := os.Create(badP4k)
	bzw := zip.NewWriter(bf)
	otherW, _ := bzw.Create("other.txt")
	otherW.Write([]byte("test"))
	bzw.Close()
	bf.Close()

	_, err = ExtractFromP4K(badP4k, "sig")
	if err == nil || !strings.Contains(err.Error(), "not found inside Data.p4k") {
		t.Errorf("expected profile not found error, got: %v", err)
	}
}

func TestExtractFromP4K_CryXmlB_And_Deflate(t *testing.T) {
	tmpDir := t.TempDir()
	p4kPath := filepath.Join(tmpDir, "Data.p4k")

	f, err := os.Create(p4kPath)
	if err != nil {
		t.Fatalf("failed to create zip file: %v", err)
	}
	zw := zip.NewWriter(f)

	// Create CryXmlB profile entry with Deflate
	hdr := &zip.FileHeader{
		Name:   "Data/Libs/Config/defaultProfile.xml",
		Method: zip.Deflate,
	}
	profileW, err := zw.CreateHeader(hdr)
	if err != nil {
		t.Fatalf("failed creating header: %v", err)
	}

	// CryXmlB with minimal valid header
	var cryBuf bytes.Buffer
	cryBuf.Write([]byte("CryXmlB\x00"))
	// 9 uint32s: XMLSize, NodeTablePos, NodeCount, AttrTablePos, AttrCount, ChildTablePos, ChildCount, StrDataPos, StrDataSize
	for i := 0; i < 9; i++ {
		binary.Write(&cryBuf, binary.LittleEndian, uint32(0))
	}
	profileW.Write(cryBuf.Bytes())

	if err := zw.Close(); err != nil {
		t.Fatalf("failed closing zip writer: %v", err)
	}
	f.Close()

	gameData, err := ExtractFromP4K(p4kPath, "sig-cry")
	if err != nil {
		t.Fatalf("ExtractFromP4K failed: %v", err)
	}
	if !strings.Contains(gameData.DefaultProfileXML, "<?xml") {
		t.Errorf("expected decoded xml, got: %s", gameData.DefaultProfileXML)
	}
}

func TestOpenEntry_Variations(t *testing.T) {
	// 1. Create a zip file with an entry
	tmpDir := t.TempDir()
	zipPath := filepath.Join(tmpDir, "test_open.zip")

	f, err := os.Create(zipPath)
	if err != nil {
		t.Fatalf("failed creating zip: %v", err)
	}
	zw := zip.NewWriter(f)
	w, err := zw.Create("test.txt")
	if err != nil {
		t.Fatalf("failed creating file in zip: %v", err)
	}
	w.Write([]byte("Hello world!"))
	zw.Close()
	f.Close()

	// Reopen with zip.OpenReader
	zr, err := zip.OpenReader(zipPath)
	if err != nil {
		t.Fatalf("failed opening zip reader: %v", err)
	}
	defer zr.Close()

	entry := zr.File[0]

	// Open raw store entry
	fRead, _ := os.Open(zipPath)
	defer fRead.Close()

	rc, err := openEntry(fRead, entry)
	if err != nil {
		t.Fatalf("unexpected error from openEntry: %v", err)
	}
	data, _ := io.ReadAll(rc)
	rc.Close()
	if string(data) != "Hello world!" {
		t.Errorf("expected 'Hello world!', got '%s'", string(data))
	}

	// 2. Unsupported method
	badMethodEntry := *entry
	badMethodEntry.Method = 99
	_, err = openEntry(fRead, &badMethodEntry)
	if err == nil || !strings.Contains(err.Error(), "unsupported compression method") {
		t.Fatalf("expected unsupported compression method error, got: %v", err)
	}

	// 3. Encrypted flag set
	encEntry := *entry
	encEntry.Flags |= 0x1
	rcEnc, err := openEntry(fRead, &encEntry)
	if err != nil {
		t.Fatalf("unexpected error for encrypted entry: %v", err)
	}
	rcEnc.Close()

	// 4. Zip64 header offset pointing to invalid offset
	zip64Entry := *entry
	extra := make([]byte, 32)
	binary.LittleEndian.PutUint16(extra[0:2], 0x0001)
	binary.LittleEndian.PutUint16(extra[2:4], 28)
	binary.LittleEndian.PutUint64(extra[20:28], 99999999) // way past file length
	zip64Entry.Extra = extra

	_, err = openEntry(fRead, &zip64Entry)
	if err == nil || !strings.Contains(err.Error(), "failed reading local header") {
		t.Fatalf("expected local header read error, got: %v", err)
	}

	// 5. Zip64 pointing to valid local header start (offset 0 in standard zip is local header sig 0x04034b50)
	binary.LittleEndian.PutUint64(extra[20:28], 0)
	zip64Entry.Extra = extra
	rcZip64, err := openEntry(fRead, &zip64Entry)
	if err != nil {
		t.Fatalf("unexpected error for valid local header zip64: %v", err)
	}
	rcZip64.Close()

	// 5b. Zip64 pointing to offset with non-standard local header sig (calls OpenRaw)
	binary.LittleEndian.PutUint64(extra[20:28], 4)
	zip64Entry.Extra = extra
	rcZip64NonSig, err := openEntry(fRead, &zip64Entry)
	if err != nil {
		t.Fatalf("unexpected error for non-standard sig: %v", err)
	}
	rcZip64NonSig.Close()

	// 6. Zstandard method (93)
	zstdEntry := *entry
	zstdEntry.Method = 93
	rcZstd, err := openEntry(fRead, &zstdEntry)
	if err != nil {
		t.Fatalf("unexpected error for zstd entry: %v", err)
	}
	rcZstd.Close()
}
