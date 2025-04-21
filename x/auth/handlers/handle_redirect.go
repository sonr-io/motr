//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
)

func (h *Handler) HandleRedirectLogin(c echo.Context) error {
	return nil
}

func (h *Handler) HandleRedirectRegister(c echo.Context) error {
	return nil
}
