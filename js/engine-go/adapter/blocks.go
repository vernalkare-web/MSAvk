
package adapter

import (
	"fmt"

	helixdata "github.com/helix-bedrock/helix-data"
	"github.com/helix-bedrock/worldgen/1.26.60/blocks"
)

// LoadBlocks loads Minecraft Bedrock 1.26.60 block states
// from Helix Data and converts them into a Worldgen Registry.
func LoadBlocks() (*blocks.Registry, error) {
	// Load all block states from Helix Data.
	versionedStates, err := helixdata.BlockStates()
	if err != nil {
		return nil, fmt.Errorf("load block states: %w", err)
	}

	// Convert Helix states into Worldgen states.
	states := make([]blocks.State, len(versionedStates))

	for i, state := range versionedStates {
		props := make(map[string]any, len(state.Properties))

		for key, value := range state.Properties {
			props[key] = value
		}

		states[i] = blocks.State{
			Name:  state.Name,
			Props: props,
		}
	}

	// Build the initial registry.
	// Defaults and tags will be connected in the next step.
	registry, err := blocks.New(blocks.Source{
		States: states,
	})

	if err != nil {
		return nil, fmt.Errorf("create block registry: %w", err)
	}

	return registry, nil
}
