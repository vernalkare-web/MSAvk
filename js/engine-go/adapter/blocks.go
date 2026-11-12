package adapter

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io/fs"

	helixdata "github.com/helix-bedrock/helix-data"
	"github.com/helix-bedrock/worldgen/1.26.60/blocks"
)

//go:embed data/block_defaults.json
var defaultsJSON []byte

type miningData struct {
	Blocks map[string]struct {
		Tags      []string `json:"tags"`
		NeedsTool bool     `json:"needsTool"`
	} `json:"blocks"`
}

// LoadBlocks loads Bedrock 1.26.60 block data
// and creates a Worldgen block registry.
func LoadBlocks() (*blocks.Registry, error) {
	// 1. Load all block states from Helix Data.
	versionedStates, err := helixdata.BlockStates()
	if err != nil {
		return nil, fmt.Errorf("load block states: %w", err)
	}

	states := make([]blocks.State, len(versionedStates))
	stateIndex := make(map[uint32]uint32, len(versionedStates))
	propertyTypes := make(map[string]map[string]any)

	// 2. Convert Helix block states.
	for i, state := range versionedStates {
		props := make(map[string]any, len(state.Properties))

		for key, value := range state.Properties {
			props[key] = value
		}

		states[i] = blocks.State{
			Name:  state.Name,
			Props: props,
		}

		stateIndex[blocks.Hash(states[i])] = uint32(i)

		if propertyTypes[state.Name] == nil {
			propertyTypes[state.Name] = make(map[string]any)
		}

		for key, value := range props {
			propertyTypes[state.Name][key] = value
		}
	}

	// 3. Decode block_defaults.json.
	var rawDefaults map[string]map[string]any

	if err := json.Unmarshal(defaultsJSON, &rawDefaults); err != nil {
		return nil, fmt.Errorf("decode block defaults: %w", err)
	}

	defaults := make(map[string]uint32, len(rawDefaults))

	for name, rawProps := range rawDefaults {
		props := make(map[string]any, len(rawProps))

		for key, value := range rawProps {
			example, ok := propertyTypes[name][key]
			if !ok {
				return nil, fmt.Errorf(
					"unknown property %s for block %s",
					key, name,
				)
			}

			converted, err := convertProperty(value, example)
			if err != nil {
				return nil, fmt.Errorf(
					"convert %s.%s: %w",
					name, key, err,
				)
			}

			props[key] = converted
		}

		hash := blocks.Hash(blocks.State{
			Name:  name,
			Props: props,
		})

		index, ok := stateIndex[hash]
		if !ok {
			return nil, fmt.Errorf(
				"default state not found: %s",
				name,
			)
		}

		defaults[name] = index
	}

	// 4. Read mining.json from Helix Data.
	files := helixdata.Files()

	miningJSON, err := fs.ReadFile(files, "bds/mining.json")
	if err != nil {
		return nil, fmt.Errorf("read mining.json: %w", err)
	}

	var mining miningData

	if err := json.Unmarshal(miningJSON, &mining); err != nil {
		return nil, fmt.Errorf("decode mining.json: %w", err)
	}

	tags := make(map[string][]string)

	for name, block := range mining.Blocks {
		if len(block.Tags) > 0 {
			tags[name] = block.Tags
		}
	}

	// 5. Build Worldgen Registry.
	registry, err := blocks.New(blocks.Source{
		States:   states,
		Defaults: defaults,
		Tags:     tags,
	})

	if err != nil {
		return nil, fmt.Errorf("create block registry: %w", err)
	}

	return registry, nil
}

// Convert JSON values to the original block property types.
func convertProperty(value any, example any) (any, error) {
	switch example.(type) {
	case uint8:
		number, ok := value.(float64)
		if !ok || number < 0 || number > 255 ||
			number != float64(uint8(number)) {
			return nil, fmt.Errorf("invalid uint8 value: %v", value)
		}
		return uint8(number), nil

	case int32:
		number, ok := value.(float64)
		if !ok || number < -2147483648 ||
			number > 2147483647 ||
			number != float64(int32(number)) {
			return nil, fmt.Errorf("invalid int32 value: %v", value)
		}
		return int32(number), nil

	case string:
		text, ok := value.(string)
		if !ok {
			return nil, fmt.Errorf("invalid string value: %v", value)
		}
		return text, nil

	default:
		return nil, fmt.Errorf("unsupported property type: %T", example)
	}
}
