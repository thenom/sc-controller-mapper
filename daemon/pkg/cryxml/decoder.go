package cryxml

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"strings"
)

var magic = []byte("CryXmlB\x00")

// IsCryXmlB checks if the byte slice starts with the CryXmlB magic header
func IsCryXmlB(data []byte) bool {
	return len(data) >= len(magic) && bytes.Equal(data[:len(magic)], magic)
}

type header struct {
	XMLSize                uint32
	NodeTablePosition      uint32
	NodeCount              uint32
	AttributeTablePosition uint32
	AttributeCount         uint32
	ChildTablePosition     uint32
	ChildCount             uint32
	StringDataPosition     uint32
	StringDataSize         uint32
}

type node struct {
	TagStringOffset     uint32
	ItemType            uint32
	AttributeCount      uint16
	ChildCount          uint16
	ParentIndex         int32
	FirstAttributeIndex int32
	FirstChildIndex     int32
	Reserved            int32
}

type attribute struct {
	KeyStringOffset   uint32
	ValueStringOffset uint32
}

// Decode translates binary CryXmlB data into a standard formatted XML string
func Decode(data []byte) (string, error) {
	if !IsCryXmlB(data) {
		return "", errors.New("invalid CryXmlB magic header")
	}

	r := bytes.NewReader(data[len(magic):])
	var hdr header
	if err := binary.Read(r, binary.LittleEndian, &hdr); err != nil {
		return "", fmt.Errorf("failed reading CryXmlB header: %w", err)
	}

	// Validate node table bounds
	if int(hdr.NodeTablePosition)+int(hdr.NodeCount)*28 > len(data) {
		return "", errors.New("node table out of bounds")
	}
	nodes := make([]node, hdr.NodeCount)
	nodeReader := bytes.NewReader(data[hdr.NodeTablePosition:])
	if err := binary.Read(nodeReader, binary.LittleEndian, &nodes); err != nil {
		return "", fmt.Errorf("failed reading node table: %w", err)
	}

	// Validate attribute table bounds
	if int(hdr.AttributeTablePosition)+int(hdr.AttributeCount)*8 > len(data) {
		return "", errors.New("attribute table out of bounds")
	}
	attributes := make([]attribute, hdr.AttributeCount)
	attrReader := bytes.NewReader(data[hdr.AttributeTablePosition:])
	if err := binary.Read(attrReader, binary.LittleEndian, &attributes); err != nil {
		return "", fmt.Errorf("failed reading attribute table: %w", err)
	}

	// Validate child table bounds
	if int(hdr.ChildTablePosition)+int(hdr.ChildCount)*4 > len(data) {
		return "", errors.New("child table out of bounds")
	}
	childIndices := make([]int32, hdr.ChildCount)
	childReader := bytes.NewReader(data[hdr.ChildTablePosition:])
	if err := binary.Read(childReader, binary.LittleEndian, &childIndices); err != nil {
		return "", fmt.Errorf("failed reading child table: %w", err)
	}

	// Validate string data bounds
	if int(hdr.StringDataPosition)+int(hdr.StringDataSize) > len(data) {
		return "", errors.New("string data table out of bounds")
	}
	stringData := data[hdr.StringDataPosition : hdr.StringDataPosition+hdr.StringDataSize]

	getString := func(offset uint32) string {
		if int(offset) >= len(stringData) {
			return ""
		}
		sub := stringData[offset:]
		idx := bytes.IndexByte(sub, 0)
		if idx == -1 {
			return string(sub)
		}
		return string(sub[:idx])
	}

	var sb strings.Builder
	sb.WriteString("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n")

	var writeNode func(nodeIndex int, depth int)
	writeNode = func(nodeIndex int, depth int) {
		if nodeIndex < 0 || nodeIndex >= len(nodes) {
			return
		}
		n := nodes[nodeIndex]
		tag := getString(n.TagStringOffset)
		indent := strings.Repeat("  ", depth)

		sb.WriteString(indent)
		sb.WriteString("<")
		sb.WriteString(tag)

		attrStart := int(n.FirstAttributeIndex)
		attrCount := int(n.AttributeCount)
		for i := attrStart; i < attrStart+attrCount && i < len(attributes); i++ {
			k := getString(attributes[i].KeyStringOffset)
			v := getString(attributes[i].ValueStringOffset)
			sb.WriteString(" ")
			sb.WriteString(k)
			sb.WriteString("=\"")
			sb.WriteString(escapeXMLAttr(v))
			sb.WriteString("\"")
		}

		childStart := int(n.FirstChildIndex)
		childCount := int(n.ChildCount)

		if childCount == 0 {
			sb.WriteString(" />\n")
		} else {
			sb.WriteString(">\n")
			for i := childStart; i < childStart+childCount && i < len(childIndices); i++ {
				writeNode(int(childIndices[i]), depth+1)
			}
			sb.WriteString(indent)
			sb.WriteString("</")
			sb.WriteString(tag)
			sb.WriteString(">\n")
		}
	}

	if len(nodes) > 0 {
		writeNode(0, 0)
	}

	return sb.String(), nil
}

func escapeXMLAttr(s string) string {
	var buf strings.Builder
	for _, r := range s {
		switch r {
		case '&':
			buf.WriteString("&amp;")
		case '<':
			buf.WriteString("&lt;")
		case '>':
			buf.WriteString("&gt;")
		case '"':
			buf.WriteString("&quot;")
		case '\'':
			buf.WriteString("&apos;")
		default:
			buf.WriteRune(r)
		}
	}
	return buf.String()
}
