package adapter

import (
	"testing"

	"github.com/helix-bedrock/worldgen/overworld"
)

func TestChunkReader(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatal(err)
	}

	biomeIDs, _, err := LoadBiomes()
	if err != nil {
		t.Fatal(err)
	}

	generator, err := NewGenerator(123456789, registry, biomeIDs, 16)
	if err != nil {
		t.Fatal(err)
	}

	chunk, err := generator.GenerateChunk(0, 0)
	if err != nil {
		t.Fatal(err)
	}

	reader, err := NewChunkReader(chunk, registry)
	if err != nil {
		t.Fatal(err)
	}

	t.Run("BlockAt", func(t *testing.T) {
		state, err := reader.BlockAt(0, overworld.MinY, 0)
		if err != nil {
			t.Fatal(err)
		}
		if state.Name == "" {
			t.Fatal("block name is empty")
		}
		t.Logf("Block: %s, Props: %v", state.Name, state.Props)
	})

	t.Run("BlockIDAt", func(t *testing.T) {
		id, err := reader.BlockIDAt(0, overworld.MinY, 0)
		if err != nil {
			t.Fatal(err)
		}
		t.Logf("Block ID: %d", id)
	})

	t.Run("BiomeIDAt", func(t *testing.T) {
		id, err := reader.BiomeIDAt(0, 64, 0)
		if err != nil {
			t.Fatal(err)
		}
		t.Logf("Biome ID: %d", id)
	})

	t.Run("WaterloggedAt", func(t *testing.T) {
		value, err := reader.WaterloggedAt(0, 64, 0)
		if err != nil {
			t.Fatal(err)
		}
		t.Logf("Waterlogged: %v", value)
	})

	t.Run("SurfaceY", func(t *testing.T) {
		y, err := reader.SurfaceY(0, 0)
		if err != nil {
			t.Fatal(err)
		}
		if y < overworld.MinY || y >= overworld.MaxY {
			t.Fatalf("surface Y out of range: %d", y)
		}
		t.Logf("Surface Y: %d", y)
	})
}

func TestChunkReaderInvalidCoordinates(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatal(err)
	}

	reader, err := NewChunkReader(new(overworld.Chunk), registry)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name    string
		x, y, z int
	}{
		{"negative X", -1, 64, 0},
		{"X too large", 16, 64, 0},
		{"negative Z", 0, 64, -1},
		{"Z too large", 0, 64, 16},
		{"Y too low", 0, overworld.MinY - 1, 0},
		{"Y too high", 0, overworld.MaxY, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := reader.BlockIDAt(tt.x, tt.y, tt.z)
			if err == nil {
				t.Fatal("expected coordinate validation error")
			}
		})
	}
}
