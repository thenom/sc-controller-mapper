package p4k

import "io"

// CryEngineKey is the 16-byte decryption key used for Star Citizen Data.p4k encrypted entries
var CryEngineKey = []byte{
	0x5E, 0x7A, 0x20, 0x02,
	0x30, 0x2E, 0xEB, 0x1A,
	0x3B, 0xB6, 0x17, 0xC3,
	0x0F, 0xDE, 0x1E, 0x47,
}

// CryDecryptReader wraps an io.ReadCloser and decrypts CryEngine encrypted streams in-place
type CryDecryptReader struct {
	src io.ReadCloser
	key []byte
	pos int64
}

// NewCryDecryptReader creates a new decrypting reader
func NewCryDecryptReader(src io.ReadCloser, key []byte) *CryDecryptReader {
	return &CryDecryptReader{
		src: src,
		key: key,
		pos: 0,
	}
}

func (r *CryDecryptReader) Read(p []byte) (n int, err error) {
	n, err = r.src.Read(p)
	if n > 0 {
		keyLen := int64(len(r.key))
		for i := 0; i < n; i++ {
			p[i] ^= r.key[(r.pos+int64(i))%keyLen]
		}
		r.pos += int64(n)
	}
	return n, err
}

func (r *CryDecryptReader) Close() error {
	return r.src.Close()
}
