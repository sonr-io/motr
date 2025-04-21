//go:build js && wasm
// +build js,wasm

package middleware

import "github.com/labstack/echo/v4"

func (sc *SessionContext) InitSession(c echo.Context) error {
	return nil
}
