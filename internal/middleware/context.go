//go:build js && wasm
// +build js,wasm

package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/internal/database"
)

type SessionContext struct {
	echo.Context
	ID                 string
	controller         database.Controller
	resolverController database.ResolverController
	vaultController    database.VaultController
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

// GetResolverController retrieves the ResolverController from the context
func GetResolverController(c echo.Context) (database.ResolverController, error) {
	sc, err := GetSession(c)
	if err != nil {
		return nil, err
	}
	if sc.resolverController == nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "ResolverController not set in session")
	}
	return sc.resolverController, nil
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

// MustGetResolverController retrieves the ResolverController from the context or panics
func MustGetResolverController(c echo.Context) database.ResolverController {
	controller, err := GetResolverController(c)
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

// getOrCreateSessionID returns the session ID from the cookie or creates a new one if it doesn't exist
func getOrCreateSessionID(c echo.Context) string {
	if ok := CookieExists(c, SessionID); !ok {
		sessionID := ksuid.New().String()
		WriteCookie(c, SessionID, sessionID)
		c.Echo().Logger.Debug("Wrote session ID to cookie")
		return sessionID
	}
	c.Echo().Logger.Debug("Has session ID in cookie")
	sessionID, err := ReadCookie(c, SessionID)
	if err != nil {
		sessionID = ksuid.New().String()
		WriteCookie(c, SessionID, sessionID)
		c.Echo().Logger.Debug("Failed to read session ID from cookie, wrote new one")
	}
	return sessionID
}
