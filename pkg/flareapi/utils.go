//go:build js && wasm
// +build js,wasm

package flareapi

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/pkg/session"
)

func unwrap(c echo.Context) (*session.Context, error) {
	cc, err := session.Unwrap(c)
	if err != nil {
		return nil, err
	}
	return cc, nil
}
