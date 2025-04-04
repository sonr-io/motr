//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/onsonr/motr/x/identity"
	"github.com/onsonr/motr/x/portfolio"
	"github.com/onsonr/motr/x/user"
)

type Connection struct {
	db        *sql.DB
	Identity  identity.Model
	Portfolio portfolio.Model
	User      user.Model
}

// New returns a new SQLite database instance
func New() (*Connection, error) {
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

	return &Connection{
		db:        db,
		Identity:  idTable,
		Portfolio: portTable,
		User:      userTable,
	}, nil
}
