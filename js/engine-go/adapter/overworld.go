package adapter

import (
	"fmt"

	"github.com/helix-bedrock/worldgen/1.26.60/blocks"
	"github.com/helix-bedrock/worldgen/1.26.60/overworld"
)

// Generator mengelola generator dunia Minecraft Bedrock.
type Generator struct {
	world *overworld.Overworld
	cache *overworld.TerrainCache
}

// NewGenerator membuat generator berdasarkan seed.
func NewGenerator(
	seed int64,
	registry *blocks.Registry,
	biomeIDs map[string]uint32,
	cacheSize int,
) (*Generator, error) {
	if registry == nil {
		return nil, fmt.Errorf("block registry is nil")
	}

	if len(biomeIDs) == 0 {
		return nil, fmt.Errorf("biome IDs are empty")
	}

	world, err := overworld.NewOverworld(
		seed,
		registry,
		biomeIDs,
	)
	if err != nil {
		return nil, fmt.Errorf("create overworld: %w", err)
	}

	if cacheSize <= 0 {
		cacheSize = 1024
	}

	cache := overworld.NewTerrainCache(world, cacheSize)

	return &Generator{
		world: world,
		cache: cache,
	}, nil
}

// Seed mengembalikan seed dunia.
func (g *Generator) Seed() int64 {
	if g == nil || g.world == nil {
		return 0
	}

	return g.world.Seed()
}

// GenerateChunk menghasilkan chunk lengkap.
func (g *Generator) GenerateChunk(
	chunkX, chunkZ int32,
) (*overworld.Chunk, error) {
	if g == nil || g.cache == nil {
		return nil, fmt.Errorf("generator is not initialized")
	}

	chunk := new(overworld.Chunk)
	g.cache.Generate(chunkX, chunkZ, chunk)

	return chunk, nil
}
