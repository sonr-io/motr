//go:build js && wasm
// +build js,wasm

package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/database"
)

type SessionContext struct {
	echo.Context
	ID              string
	controller      database.Controller
	vaultController database.VaultController
}

func GetSession(c echo.Context) (*SessionContext, error) {
	cc, ok := c.(*SessionContext)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Session Context not found")
	}
	return cc, nil
}

// GetCommonController retrieves the Controller from the context
func GetCommonController(c echo.Context) (database.Controller, error) {
	sc, err := GetSession(c)
	if err != nil {
		return nil, err
	}
	if sc.controller == nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Controller not set in session")
	}
	return sc.controller, nil
}

// GetVaultController retrieves the VaultController from the context
func GetVaultController(c echo.Context) (database.VaultController, error) {
	sc, err := GetSession(c)
	if err != nil {
		return nil, err
	}
	if sc.vaultController == nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "VaultController not set in session")
	}
	return sc.vaultController, nil
}

// MustGetController retrieves the Controller from the context or panics
func MustGetController(c echo.Context) database.Controller {
	controller, err := GetCommonController(c)
	if err != nil {
		panic(err)
	}
	return controller
}

// MustGetVaultController retrieves the VaultController from the context or panics
func MustGetVaultController(c echo.Context) database.VaultController {
	controller, err := GetVaultController(c)
	if err != nil {
		panic(err)
	}
	return controller
}
