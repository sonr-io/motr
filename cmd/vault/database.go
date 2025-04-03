//go:build js && wasm
// +build js,wasm

package main

import (
	"context"
	"database/sql"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/onsonr/motr/internal/models"
	sink "github.com/onsonr/motr/internal/sink"
)

// createDB initializes and returns a configured database connection
func createDB() (*models.Queries, error) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		return nil, err
	}

	// create tables
	if _, err := db.ExecContext(context.Background(), sink.SchemaVaultSQL); err != nil {
		return nil, err
	}
	return models.New(db), nil
}
