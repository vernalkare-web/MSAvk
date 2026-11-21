
package adapter

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"strings"

	helixfiles "github.com/helix-bedrock/helix-data/data/files"
	"github.com/helix-bedrock/worldgen/1.26.60/biome"
)

// LoadBiomes loads Bedrock biome IDs and builds the climate lookup tree.
func LoadBiomes() (map[string]uint32, *biome.Tree, error) {
	// 1. Access Helix Data files.
	files := helixfiles.Files()

	// 2. Read Bedrock biome IDs.
	biomeJSON, err := fs.ReadFile(files, "bds/biome_ids.json")
	if err != nil {
		return nil, nil, fmt.Errorf("read biome_ids.json: %w", err)
	}

	// 3. Extract the biome mapping.
	var document struct {
		Biomes map[string]uint32 `json:"biomes"`
	}

	if err := json.Unmarshal(biomeJSON, &document); err != nil {
		return nil, nil, fmt.Errorf("decode biome JSON: %w", err)
	}

	if len(document.Biomes) == 0 {
		return nil, nil, fmt.Errorf("biomes field is missing or empty")
	}

	// 4. Normalize biome names.
	ids := make(map[string]uint32, len(document.Biomes))

	for name, id := range document.Biomes {
		name = strings.TrimPrefix(name, "minecraft:")

		if _, exists := ids[name]; exists {
			return nil, nil, fmt.Errorf("duplicate biome name: %s", name)
		}

		ids[name] = id
	}

	// 5. Load vanilla Overworld climate entries.
	entries := biome.Entries(false)

	// 6. Check missing biome IDs.
	missing := biome.Missing(entries, ids)
	if len(missing) > 0 {
		return nil, nil, fmt.Errorf(
			"missing biome IDs: %v",
			missing,
		)
	}

	// 7. Build climate lookup tree.
	tree := biome.NewTree(entries, ids)

	return ids, tree, nil
}
