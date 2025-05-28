//go:build js && wasm
// +build js,wasm

package database

import (
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/sink/activity"
)

// Context is a database context
type Context struct {
	echo.Context
	Config config.CloudflareConfig `json:"cloudflare"`
}

// AccountConn returns a new account connection to the d1 database
func ActivityConn(c echo.Context) (activity.Querier, error) {
	ctx, err := Unwrap(c)
	if err != nil {
		return nil, err
	}
	db, err := sql.Open("d1", ctx.Config.Database)
	if err != nil {
		return nil, err
	}
	return activity.New(db), nil
}
