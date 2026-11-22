package adapter

import (
	"testing"

	"github.com/helix-bedrock/worldgen/overworld"
)

func TestIsSolidMaterial(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatal(err)
	}

	reader, err := NewChunkReader(new(overworld.Chunk), registry)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name  string
		solid bool
	}{
		{"minecraft:air", false},
		{"minecraft:water", false},
		{"minecraft:oak_leaves", false},
		{"minecraft:short_grass", false},
		{"minecraft:stone", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			id, ok := registry.Default(tt.name)
			if !ok {
				t.Fatalf("default block not found: %s", tt.name)
			}

			got := reader.isSolidMaterial(id)
			if got != tt.solid {
				t.Fatalf("expected solid=%v, got %v", tt.solid, got)
			}
		})
	}
}

func TestGroundY(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatal(err)
	}

	chunk := new(overworld.Chunk)

	airID, ok := registry.Default("minecraft:air")
	if !ok {
		t.Fatal("air block not found")
	}

	for i := range chunk.Blocks {
		chunk.Blocks[i] = uint16(airID)
	}

	stoneID, ok := registry.Default("minecraft:stone")
	if !ok {
		t.Fatal("stone block not found")
	}

	leavesID, ok := registry.Default("minecraft:oak_leaves")
	if !ok {
		t.Fatal("oak leaves block not found")
	}

	chunk.Blocks[(60-overworld.MinY)<<8] = uint16(stoneID)
	chunk.Blocks[(70-overworld.MinY)<<8] = uint16(leavesID)

	reader, err := NewChunkReader(chunk, registry)
	if err != nil {
		t.Fatal(err)
	}

	y, err := reader.GroundY(0, 0)
	if err != nil {
		t.Fatal(err)
	}

	if y != 61 {
		t.Fatalf("expected GroundY=61, got %d", y)
	}
}

func TestGroundYChunkBoundaries(t *testing.T) {
	registry, err := LoadBlocks()
	if err != nil {
		t.Fatal(err)
	}

	biomeIDs, _, err := LoadBiomes()
	if err != nil {
		t.Fatal(err)
	}

	generator, err := NewGenerator(123456789, registry, biomeIDs, 32)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		chunkX int32
		chunkZ int32
		localX int
		localZ int
	}{
		{0, 0, 15, 8},
		{1, 0, 0, 8},
		{0, 0, 8, 15},
		{0, 1, 8, 0},
	}

	for _, tt := range tests {
		chunk, err := generator.GenerateChunk(tt.chunkX, tt.chunkZ)
		if err != nil {
			t.Fatalf("GenerateChunk(%d,%d): %v", tt.chunkX, tt.chunkZ, err)
		}

		reader, err := NewChunkReader(chunk, registry)
		if err != nil {
			t.Fatal(err)
		}

		y, err := reader.GroundY(tt.localX, tt.localZ)
		if err != nil {
			t.Fatalf("GroundY: %v", err)
		}

		worldX := int(tt.chunkX)*16 + tt.localX
		worldZ := int(tt.chunkZ)*16 + tt.localZ

		t.Logf(
			"Chunk=(%d,%d) World=(%d,%d) Local=(%d,%d) GroundY=%d",
			tt.chunkX,
			tt.chunkZ,
			worldX,
			worldZ,
			tt.localX,
			tt.localZ,
			y,
		)
	}
}
