package adapter

import (
	"io/fs"
	"testing"

	helixfiles "github.com/helix-bedrock/helix-data/data/1.26.60"
)

func TestInspectHelixFiles(t *testing.T) {
	files := helixfiles.Files()

	err := fs.WalkDir(files, ".", func(
		path string,
		entry fs.DirEntry,
		err error,
	) error {
		if err != nil {
			return err
		}

		t.Log(path)
		return nil
	})

	if err != nil {
		t.Fatal(err)
	}
}