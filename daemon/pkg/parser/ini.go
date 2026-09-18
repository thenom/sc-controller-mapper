package parser

import (
	"bufio"
	"io"
	"strings"
)

// ParseLocalizationINI parses a Star Citizen global.ini file stream into a string map
func ParseLocalizationINI(r io.Reader) (map[string]string, error) {
	result := make(map[string]string)
	scanner := bufio.NewScanner(r)

	// Set a larger buffer for long lines in global.ini
	buf := make([]byte, 64*1024)
	scanner.Buffer(buf, 1024*1024)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])

			// Strip leading @ character if present
			if strings.HasPrefix(key, "@") {
				key = key[1:]
			}

			result[strings.ToLower(key)] = value
		}
	}

	if err := scanner.Err(); err != nil {
		return result, err
	}

	return result, nil
}
