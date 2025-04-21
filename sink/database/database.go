//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	"github.com/sonr-io/motr/sink/models"
	_ "github.com/syumai/workers/cloudflare/d1"
)

type (
	Queries *models.Queries
)

func NewQueries(db *sql.DB) Queries {
	return models.New(db)
}
