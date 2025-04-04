//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/onsonr/motr/pkg/config"
	"github.com/onsonr/motr/x/identity"
	"github.com/onsonr/motr/x/portfolio"
	"github.com/onsonr/motr/x/user"
)

// New returns a new SQLite database instance
func New() (*config.DBConnection, error) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		return nil, err
	}

	// create tables
	idTable, err := identity.InitTables(db)
	if err != nil {
		return nil, err
	}
	portTable, err := portfolio.InitTables(db)
	if err != nil {
		return nil, err
	}
	userTable, err := user.InitTables(db)
	if err != nil {
		return nil, err
	}
	return &config.DBConnection{
		DB:        db,
		Identity:  idTable,
		Portfolio: portTable,
		User:      userTable,
	}, nil
}
