
package adapter

import "testing"

func TestLoadBiomes(t *testing.T) {
	ids, tree, err := LoadBiomes()
	if err != nil {
		t.Fatalf("LoadBiomes failed: %v", err)
	}

	if len(ids) == 0 {
		t.Fatal("Biome IDs are empty")
	}

	if tree == nil {
		t.Fatal("Biome tree is nil")
	}

	_, ok := tree.Search([7]int64{})
	if !ok {
		t.Fatal("Biome tree search failed")
	}

	t.Log("Biome registry loaded successfully!")
	t.Logf("Total biome IDs: %d", len(ids))
}
