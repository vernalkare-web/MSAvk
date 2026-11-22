package adapter

import (
	"fmt"

	"github.com/helix-bedrock/worldgen/blocks"
	"github.com/helix-bedrock/worldgen/overworld"
)

// ChunkReader membaca data blok dan biome dari sebuah chunk.
type ChunkReader struct {
	chunk    *overworld.Chunk
	registry *blocks.Registry
	airID    uint32
}

// NewChunkReader membuat reader untuk chunk.
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

// validatePosition memvalidasi koordinat lokal chunk dan Y dunia.
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

// BlockIDAt mengambil ID block pada koordinat lokal chunk.
func (r *ChunkReader) BlockIDAt(x, y, z int) (uint32, error) {
	if err := r.validatePosition(x, y, z); err != nil {
		return 0, err
	}

	return r.chunk.Block(x, y, z), nil
}

// BlockAt mengambil state block pada koordinat lokal chunk.
func (r *ChunkReader) BlockAt(x, y, z int) (blocks.State, error) {
	id, err := r.BlockIDAt(x, y, z)
	if err != nil {
		return blocks.State{}, err
	}

	state, ok := r.registry.State(id)
	if !ok {
		return blocks.State{}, fmt.Errorf("unknown block state ID: %d", id)
	}

	return state, nil
}

// BiomeIDAt mengambil ID biome pada koordinat lokal chunk.
func (r *ChunkReader) BiomeIDAt(x, y, z int) (uint32, error) {
	if err := r.validatePosition(x, y, z); err != nil {
		return 0, err
	}

	return r.chunk.Biome(x, y, z), nil
}

// WaterloggedAt memeriksa apakah block berada dalam kondisi waterlogged.
func (r *ChunkReader) WaterloggedAt(x, y, z int) (bool, error) {
	if err := r.validatePosition(x, y, z); err != nil {
		return false, err
	}

	return r.chunk.Waterlogged(x, y, z), nil
}

// SurfaceY mengembalikan Y block non-air tertinggi.
// Catatan: fungsi ini mengembalikan Y block itu sendiri, bukan Y+1.
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

	return 0, fmt.Errorf(
		"no non-air block found at x=%d z=%d",
		x,
		z,
	)
}

// soilPlants berisi blok tanaman yang tidak dihitung sebagai material solid.
var soilPlants = map[string]bool{
	"minecraft:large_fern":         true,
	"minecraft:tall_grass":         true,
	"minecraft:short_grass":        true,
	"minecraft:fern":               true,
	"minecraft:sunflower":          true,
	"minecraft:lilac":              true,
	"minecraft:rose_bush":          true,
	"minecraft:peony":              true,
	"minecraft:poppy":              true,
	"minecraft:dandelion":          true,
	"minecraft:blue_orchid":        true,
	"minecraft:allium":             true,
	"minecraft:azure_bluet":        true,
	"minecraft:red_tulip":          true,
	"minecraft:orange_tulip":       true,
	"minecraft:white_tulip":        true,
	"minecraft:pink_tulip":         true,
	"minecraft:oxeye_daisy":        true,
	"minecraft:cornflower":         true,
	"minecraft:lily_of_the_valley": true,
	"minecraft:torchflower":        true,
	"minecraft:sweet_berry_bush":   true,
	"minecraft:bush":               true,
	"minecraft:firefly_bush":       true,
	"minecraft:wildflowers":        true,
	"minecraft:pink_petals":        true,
	"minecraft:leaf_litter":        true,
	"minecraft:open_eyeblossom":    true,
	"minecraft:closed_eyeblossom":  true,
	"minecraft:cactus_flower":      true,
	"minecraft:short_dry_grass":    true,
	"minecraft:tall_dry_grass":     true,
	"minecraft:red_shrub":          true,
}

// isSolidMaterial meniru aturan solidMaterial milik Helix.
func (r *ChunkReader) isSolidMaterial(id uint32) bool {
	if r == nil || r.registry == nil {
		return false
	}

	state, ok := r.registry.State(id)
	if !ok {
		return false
	}

	name := state.Name

	switch name {
	case "minecraft:air",
		"minecraft:water",
		"minecraft:flowing_water",
		"minecraft:lava",
		"minecraft:flowing_lava":
		return false
	}

	if soilPlants[name] {
		return false
	}

	// Registry menyimpan tag dengan prefix minecraft:.
	// Helix menghapus prefix tersebut sebelum pengecekan.
	for _, tag := range r.registry.Tags(name) {
		if tag == "leaves" ||
			tag == "minecraft:leaves" {
			return false
		}
	}

	switch name {
	case "minecraft:snow_layer",
		"minecraft:vine",
		"minecraft:seagrass",
		"minecraft:kelp",
		"minecraft:waterlily",
		"minecraft:deadbush",
		"minecraft:reeds",
		"minecraft:web",
		"minecraft:fire",
		"minecraft:torch",
		"minecraft:brown_mushroom",
		"minecraft:red_mushroom":
		return false
	}

	return true
}

// GroundY mengembalikan koordinat Y tepat di atas
// blok solid tertinggi pada kolom chunk.
func (r *ChunkReader) GroundY(x, z int) (int, error) {
	if r == nil || r.chunk == nil {
		return 0, fmt.Errorf("chunk reader is not initialized")
	}

	if r.registry == nil {
		return 0, fmt.Errorf("block registry is nil")
	}

	if x < 0 || x > 15 {
		return 0, fmt.Errorf("x out of range: %d", x)
	}

	if z < 0 || z > 15 {
		return 0, fmt.Errorf("z out of range: %d", z)
	}

	for y := overworld.MaxY - 1; y >= overworld.MinY; y-- {
		id := r.chunk.Block(x, y, z)

		if r.isSolidMaterial(id) {
			return y + 1, nil
		}
	}

	return overworld.MinY, nil
}
