
package adapter

import "testing"

func TestLoadBlocks(t *testing.T) {
	registry, err := LoadBlocks()

	// Pastikan tidak ada error.
	if err != nil {
		t.Fatalf("LoadBlocks failed: %v", err)
	}

	// Pastikan registry berhasil dibuat.
	if registry == nil {
		t.Fatal("Registry is nil")
	}

	// Pastikan registry memiliki block states.
	if registry.Len() == 0 {
		t.Fatal("Registry has no block states")
	}

	t.Logf("Registry loaded successfully!")
	t.Logf("Total block states: %d", registry.Len())
}
