package adapter

import "testing"

func TestNewGenerator(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatalf("LoadBlocks failed: %v", err)
	}

	biomeIDs, _, err := LoadBiomes()
	if err != nil {
		t.Fatalf("LoadBiomes failed: %v", err)
	}

	const seed int64 = 123456789

	generator, err := NewGenerator(
		seed,
		registry,
		biomeIDs,
		64,
	)
	if err != nil {
		t.Fatalf("NewGenerator failed: %v", err)
	}

	if generator.Seed() != seed {
		t.Fatalf("Seed mismatch: got %d, want %d",
			generator.Seed(), seed)
	}

	t.Logf("Overworld generator initialized!")
	t.Logf("Seed: %d", generator.Seed())
}

func TestGenerateChunk(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatalf("LoadBlocks failed: %v", err)
	}

	biomeIDs, _, err := LoadBiomes()
	if err != nil {
		t.Fatalf("LoadBiomes failed: %v", err)
	}

	generator, err := NewGenerator(
		123456789,
		registry,
		biomeIDs,
		64,
	)
	if err != nil {
		t.Fatalf("NewGenerator failed: %v", err)
	}

	chunk, err := generator.GenerateChunk(0, 0)
	if err != nil {
		t.Fatalf("GenerateChunk failed: %v", err)
	}

	if chunk == nil {
		t.Fatal("Generated chunk is nil")
	}

	t.Log("Chunk generated successfully!")
}
