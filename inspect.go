package main

import (
	"fmt"
	"io/fs"

	helixfiles "github.com/helix-bedrock/helix-data/data/files"
)

func main() {
	files := helixfiles.Files()

	targets := []string{
		"bds/mining.json",
		"bds/biome_ids.json",
	}

	for _, name := range targets {
		data, err := fs.ReadFile(files, name)
		if err != nil {
			fmt.Printf("[ERROR] %s: %v\n", name, err)
			continue
		}

		fmt.Printf("[OK] %s ditemukan (%d bytes)\n", name, len(data))
	}

	fmt.Println("\nDaftar isi folder bds:")

	err := fs.WalkDir(files, "bds", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if !entry.IsDir() {
			fmt.Println(path)
		}

		return nil
	})

	if err != nil {
		fmt.Printf("[ERROR] %v\n", err)
	}
}
