package adapter

import (
	"fmt"

	"github.com/helix-bedrock/worldgen/blocks"
	"github.com/helix-bedrock/worldgen/overworld"
)

// ChunkReader membaca data block dan biome dari chunk.
type ChunkReader struct {
	chunk    *overworld.Chunk
	registry *blocks.Registry
	airID    uint32
}

// NewChunkReader membuat reader untuk sebuah chunk.
func NewChunkReader(
	chunk *overworld.Chunk,
	registry *blocks.Registry,
) (*ChunkReader, error) {
	if chunk == nil {
		return nil, fmt.Errorf("chunk is nil")
	}

	if registry == nil {
		return nil, fmt.Errorf("block registry is nil")
	}

	airID, ok := registry.Default("minecraft:air")
	if !ok {
		return nil, fmt.Errorf("default air block not found")
	}

	return &ChunkReader{
		chunk:    chunk,
		registry: registry,
		airID:    airID,
	}, nil
}

// validatePosition memeriksa koordinat lokal chunk.
func (r *ChunkReader) validatePosition(x, y, z int) error {
	if r == nil || r.chunk == nil {
		return fmt.Errorf("chunk reader is not initialized")
	}

	if x < 0 || x > 15 {
		return fmt.Errorf("x out of range: %d", x)
	}

	if z < 0 || z > 15 {
		return fmt.Errorf("z out of range: %d", z)
	}

	if y < overworld.MinY || y >= overworld.MaxY {
		return fmt.Errorf("y out of range: %d", y)
	}

	return nil
}

// BlockIDAt mengembalikan ID block pada koordinat lokal chunk.
func (r *ChunkReader) BlockIDAt(x, y, z int) (uint32, error) {
	if err := r.validatePosition(x, y, z); err != nil {
		return 0, err
	}

	return r.chunk.Block(x, y, z), nil
}

// BlockAt mengembalikan informasi block pada koordinat tertentu.
func (r *ChunkReader) BlockAt(
	x, y, z int,
) (blocks.State, error) {
	id, err := r.BlockIDAt(x, y, z)
	if err != nil {
		return blocks.State{}, err
	}

	state, ok := r.registry.State(id)
	if !ok {
		return blocks.State{}, fmt.Errorf(
			"unknown block state ID: %d", id,
		)
	}

	return state, nil
}

// BiomeIDAt mengembalikan ID biome pada koordinat tertentu.
func (r *ChunkReader) BiomeIDAt(x, y, z int) (uint32, error) {
	if err := r.validatePosition(x, y, z); err != nil {
		return 0, err
	}

	return r.chunk.Biome(x, y, z), nil
}

// WaterloggedAt memeriksa apakah block memiliki source water.
func (r *ChunkReader) WaterloggedAt(x, y, z int) (bool, error) {
	if err := r.validatePosition(x, y, z); err != nil {
		return false, err
	}

	return r.chunk.Waterlogged(x, y, z), nil
}

// SurfaceY mencari block non-air tertinggi pada kolom x,z.
// Hasilnya menggunakan koordinat Y dunia.
func (r *ChunkReader) SurfaceY(x, z int) (int, error) {
	if r == nil || r.chunk == nil {
		return 0, fmt.Errorf("chunk reader is not initialized")
	}

	if x < 0 || x > 15 {
		return 0, fmt.Errorf("x out of range: %d", x)
	}

	if z < 0 || z > 15 {
		return 0, fmt.Errorf("z out of range: %d", z)
	}

	for y := overworld.MaxY - 1; y >= overworld.MinY; y-- {
		id := r.chunk.Block(x, y, z)

		if id != r.airID {
			return y, nil
		}
	}

	return 0, fmt.Errorf("no non-air block found at x=%d z=%d", x, z)
}
