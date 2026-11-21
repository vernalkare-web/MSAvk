package adapter

import (
	"bytes"
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

	// 3. Decode biome IDs.
	ids, err := biome.LoadIDs(bytes.NewReader(biomeJSON))
	if err != nil {
		return nil, nil, fmt.Errorf("load biome IDs: %w", err)
	}

	if len(ids) == 0 {
		return nil, nil, fmt.Errorf("no biome IDs found")
	}

	// 4. Load the vanilla Overworld climate entries.
	entries := biome.Entries(false)

	// 5. Check that every biome used by the climate table has an ID.
	missing := biome.Missing(entries, ids)
	if len(missing) > 0 {
		return nil, nil, fmt.Errorf(
			"missing biome IDs: %v",
			missing,
		)
	}

	// 6. Build the climate lookup tree.
	tree := biome.NewTree(entries, ids)

	return ids, tree, nil
}
