package main

import (
	"fmt"
	"io/fs"

	helixfiles "github.com/helix-bedrock/helix-data/data/1.26.60"
)

func main() {
	files := helixfiles.Files()

	err := fs.WalkDir(files, ".", func(
		path string,
		entry fs.DirEntry,
		err error,
	) error {
		if err != nil {
			return err
		}

		fmt.Println(path)
		return nil
	})

	if err != nil {
		panic(err)
	}
}