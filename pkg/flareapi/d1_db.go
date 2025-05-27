//go:build js && wasm
// +build js,wasm

package flareapi

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/pkg/models"
)

func D1Connection(c echo.Context) (models.Querier, error) {
	ctx, err := unwrap(c)
	if err != nil {
		return nil, err
	}
	db, err := ctx.Cloudflare.OpenDB()
	if err != nil {
		return nil, err
	}
	return models.New(db), nil
}
