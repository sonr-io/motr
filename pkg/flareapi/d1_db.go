//go:build js && wasm
// +build js,wasm

package flareapi

import (
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/pkg/models"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func D1Connection(c echo.Context) (models.Querier, error) {
	ctx, err := unwrap(c)
	if err != nil {
		return nil, err
	}
	db, err := sql.Open("d1", ctx.Cloudflare.Database)
	if err != nil {
		return nil, err
	}
	return models.New(db), nil
}
