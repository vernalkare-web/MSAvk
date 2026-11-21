package adapter

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/fs"

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

	// 3. Extract the "biomes" object.
	var document struct {
		Biomes json.RawMessage `json:"biomes"`
	}

	if err := json.Unmarshal(biomeJSON, &document); err != nil {
		return nil, nil, fmt.Errorf("decode biome JSON: %w", err)
	}

	if len(document.Biomes) == 0 {
		return nil, nil, fmt.Errorf("biomes field is missing or empty")
	}

	// 4. Load only the biome ID mapping.
	ids, err := biome.LoadIDs(bytes.NewReader(document.Biomes))
	if err != nil {
		return nil, nil, fmt.Errorf("load biome IDs: %w", err)
	}

	if len(ids) == 0 {
		return nil, nil, fmt.Errorf("no biome IDs found")
	}

	// 5. Load the vanilla Overworld climate entries.
	entries := biome.Entries(false)

	// 6. Check that every biome used by the climate table has an ID.
	missing := biome.Missing(entries, ids)
	if len(missing) > 0 {
		return nil, nil, fmt.Errorf(
			"missing biome IDs: %v",
			missing,
		)
	}

	// 7. Build the climate lookup tree.
	tree := biome.NewTree(entries, ids)

	return ids, tree, nil
}
