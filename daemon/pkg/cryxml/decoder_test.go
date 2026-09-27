package cryxml

import (
	"bytes"
	"encoding/binary"
	"strings"
	"testing"
)

func TestIsCryXmlB(t *testing.T) {
	if IsCryXmlB([]byte{}) {
		t.Errorf("expected false for empty slice")
	}
	if IsCryXmlB([]byte("CryXml")) {
		t.Errorf("expected false for short slice")
	}
	if IsCryXmlB([]byte("CryXmlB!")) {
		t.Errorf("expected false for incorrect magic byte")
	}
	if !IsCryXmlB([]byte("CryXmlB\x00extra data")) {
		t.Errorf("expected true for valid magic header")
	}
}

func buildCryXmlB(
	hdr header,
	nodes []node,
	attrs []attribute,
	children []int32,
	stringData []byte,
) []byte {
	buf := new(bytes.Buffer)
	buf.Write([]byte("CryXmlB\x00"))

	binary.Write(buf, binary.LittleEndian, hdr)

	// Pad or write according to positions if needed, or if positions match sequential order:
	currPos := uint32(buf.Len())

	if hdr.NodeTablePosition > currPos {
		buf.Write(make([]byte, hdr.NodeTablePosition-currPos))
	}
	binary.Write(buf, binary.LittleEndian, nodes)

	currPos = uint32(buf.Len())
	if hdr.AttributeTablePosition > currPos {
		buf.Write(make([]byte, hdr.AttributeTablePosition-currPos))
	}
	binary.Write(buf, binary.LittleEndian, attrs)

	currPos = uint32(buf.Len())
	if hdr.ChildTablePosition > currPos {
		buf.Write(make([]byte, hdr.ChildTablePosition-currPos))
	}
	binary.Write(buf, binary.LittleEndian, children)

	currPos = uint32(buf.Len())
	if hdr.StringDataPosition > currPos {
		buf.Write(make([]byte, hdr.StringDataPosition-currPos))
	}
	buf.Write(stringData)

	return buf.Bytes()
}

func TestDecode_InvalidHeaders(t *testing.T) {
	// Not CryXmlB
	_, err := Decode([]byte("InvalidHeaderData1234567890"))
	if err == nil || !strings.Contains(err.Error(), "invalid CryXmlB magic header") {
		t.Fatalf("expected invalid magic error, got: %v", err)
	}

	// Truncated header
	_, err = Decode([]byte("CryXmlB\x00truncated"))
	if err == nil || !strings.Contains(err.Error(), "failed reading CryXmlB header") {
		t.Fatalf("expected header read error, got: %v", err)
	}
}

func TestDecode_OutOfBoundsChecks(t *testing.T) {
	headerBase := header{
		XMLSize:                100,
		NodeTablePosition:      44,
		NodeCount:              1,
		AttributeTablePosition: 44 + 28,
		AttributeCount:         1,
		ChildTablePosition:     44 + 28 + 8,
		ChildCount:             1,
		StringDataPosition:     44 + 28 + 8 + 4,
		StringDataSize:         10,
	}

	// Node table out of bounds
	h := headerBase
	h.NodeCount = 100 // exceeds buffer
	raw := buildCryXmlB(h, []node{}, []attribute{}, []int32{}, []byte{})
	_, err := Decode(raw)
	if err == nil || !strings.Contains(err.Error(), "node table out of bounds") {
		t.Fatalf("expected node table out of bounds error, got: %v", err)
	}

	// Attribute table out of bounds
	h = headerBase
	h.NodeCount = 0
	h.NodeTablePosition = 44
	h.AttributeTablePosition = 44
	h.AttributeCount = 100
	raw = buildCryXmlB(h, []node{}, []attribute{}, []int32{}, []byte{})
	_, err = Decode(raw)
	if err == nil || !strings.Contains(err.Error(), "attribute table out of bounds") {
		t.Fatalf("expected attribute table out of bounds error, got: %v", err)
	}

	// Child table out of bounds
	h = headerBase
	h.NodeCount = 0
	h.AttributeCount = 0
	h.ChildTablePosition = 44
	h.ChildCount = 100
	raw = buildCryXmlB(h, []node{}, []attribute{}, []int32{}, []byte{})
	_, err = Decode(raw)
	if err == nil || !strings.Contains(err.Error(), "child table out of bounds") {
		t.Fatalf("expected child table out of bounds error, got: %v", err)
	}

	// String data table out of bounds
	h = headerBase
	h.NodeCount = 0
	h.AttributeCount = 0
	h.ChildCount = 0
	h.StringDataPosition = 44
	h.StringDataSize = 1000
	raw = buildCryXmlB(h, []node{}, []attribute{}, []int32{}, []byte{})
	_, err = Decode(raw)
	if err == nil || !strings.Contains(err.Error(), "string data table out of bounds") {
		t.Fatalf("expected string data table out of bounds error, got: %v", err)
	}
}

func TestDecode_ValidXML(t *testing.T) {
	// Construct string table:
	// 0: "root\x00" (len 5)
	// 5: "child\x00" (len 6)
	// 11: "name\x00" (len 5)
	// 16: "Test & < > \" ' value\x00" (len 23)
	// 39: "unterminated" (no trailing null)
	strTable := []byte("root\x00child\x00name\x00Test & < > \" ' value\x00unterminated")

	nodes := []node{
		// 0: Root node (has 1 attribute, 1 child)
		{
			TagStringOffset:     0,
			AttributeCount:      1,
			ChildCount:          1,
			ParentIndex:         -1,
			FirstAttributeIndex: 0,
			FirstChildIndex:     0,
		},
		// 1: Child node (self-closing, 0 children, 0 attributes)
		{
			TagStringOffset:     5,
			AttributeCount:      0,
			ChildCount:          0,
			ParentIndex:         0,
			FirstAttributeIndex: -1,
			FirstChildIndex:     -1,
		},
	}

	attrs := []attribute{
		{
			KeyStringOffset:   11, // "name"
			ValueStringOffset: 16, // "Test & < > \" ' value"
		},
	}

	children := []int32{1}

	nodeTablePos := uint32(44)
	attrTablePos := nodeTablePos + uint32(len(nodes)*28)
	childTablePos := attrTablePos + uint32(len(attrs)*8)
	stringDataPos := childTablePos + uint32(len(children)*4)

	hdr := header{
		XMLSize:                500,
		NodeTablePosition:      nodeTablePos,
		NodeCount:              uint32(len(nodes)),
		AttributeTablePosition: attrTablePos,
		AttributeCount:         uint32(len(attrs)),
		ChildTablePosition:     childTablePos,
		ChildCount:             uint32(len(children)),
		StringDataPosition:     stringDataPos,
		StringDataSize:         uint32(len(strTable)),
	}

	raw := buildCryXmlB(hdr, nodes, attrs, children, strTable)

	xmlStr, err := Decode(raw)
	if err != nil {
		t.Fatalf("unexpected error decoding valid CryXmlB: %v", err)
	}

	if !strings.Contains(xmlStr, `<?xml version="1.0" encoding="utf-8"?>`) {
		t.Errorf("missing xml header")
	}
	if !strings.Contains(xmlStr, `<root name="Test &amp; &lt; &gt; &quot; &apos; value">`) {
		t.Errorf("attribute escaping or root node incorrect: %s", xmlStr)
	}
	if !strings.Contains(xmlStr, `  <child />`) {
		t.Errorf("child node indentation or self-closing format incorrect: %s", xmlStr)
	}
	if !strings.Contains(xmlStr, `</root>`) {
		t.Errorf("missing closing root tag: %s", xmlStr)
	}
}

func TestDecode_StringEdgeCasesAndEmptyNodes(t *testing.T) {
	// Empty node slice
	hdr := header{
		XMLSize:                10,
		NodeTablePosition:      44,
		NodeCount:              0,
		AttributeTablePosition: 44,
		AttributeCount:         0,
		ChildTablePosition:     44,
		ChildCount:             0,
		StringDataPosition:     44,
		StringDataSize:         0,
	}
	raw := buildCryXmlB(hdr, []node{}, []attribute{}, []int32{}, []byte{})
	xmlStr, err := Decode(raw)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if strings.TrimSpace(xmlStr) != `<?xml version="1.0" encoding="utf-8"?>` {
		t.Errorf("expected header only, got: %s", xmlStr)
	}

	// Out of bounds string offset and unterminated string
	strTable := []byte("unterminated")
	nodes := []node{
		{
			TagStringOffset:     9999, // out of bounds offset -> returns ""
			AttributeCount:      1,
			ChildCount:          1,
			ParentIndex:         -1,
			FirstAttributeIndex: 0,
			FirstChildIndex:     0,
		},
		{
			TagStringOffset:     0, // unterminated string -> string(sub)
			AttributeCount:      0,
			ChildCount:          0,
			ParentIndex:         0,
			FirstAttributeIndex: 0,
			FirstChildIndex:     0,
		},
	}
	attrs := []attribute{
		{KeyStringOffset: 0, ValueStringOffset: 9999},
	}
	children := []int32{1, 999} // 999 out of bounds child index

	hdr = header{
		XMLSize:                100,
		NodeTablePosition:      44,
		NodeCount:              uint32(len(nodes)),
		AttributeTablePosition: 44 + uint32(len(nodes)*28),
		AttributeCount:         uint32(len(attrs)),
		ChildTablePosition:     44 + uint32(len(nodes)*28) + uint32(len(attrs)*8),
		ChildCount:             uint32(len(children)),
		StringDataPosition:     44 + uint32(len(nodes)*28) + uint32(len(attrs)*8) + uint32(len(children)*4),
		StringDataSize:         uint32(len(strTable)),
	}

	raw = buildCryXmlB(hdr, nodes, attrs, children, strTable)
	xmlStr, err = Decode(raw)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(xmlStr, `<unterminated />`) {
		t.Errorf("expected unterminated child node, got: %s", xmlStr)
	}
}
