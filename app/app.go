//go:build js && wasm
// +build js,wasm

package app

import (
	"encoding/json"

	"github.com/labstack/echo/v4"
)

// New returns a new App instance
func New(opts ...Option) (*App, error) {
	o := baseOptions()
	for _, opt := range opts {
		opt(o)
	}
	e := o.applyDefaults()
	//
	// identity.RegisterRoutes(e, o.conn.Identity)
	// portfolio.RegisterRoutes(e, o.conn.Portfolio)
	// user.RegisterRoutes(e, o.conn.User)

	return &App{
		Config:   o.cfg,
		Database: o.conn,
		Echo:     e,
	}, nil
}

// handleIndex returns a simple JSON response
func handleIndex(c echo.Context) error {
	params := make(map[string]string)
	if err := json.NewDecoder(c.Request().Body).Decode(&params); err != nil {
		return c.JSON(400, map[string]string{"message": err.Error()})
	}

	c.Response().Header().Set("Content-Type", "application/json")
	return c.JSON(200, map[string]string{"message": "Hello, World!"})
}

// handleError returns a simple JSON response
func handleError() echo.HTTPErrorHandler {
	return func(err error, c echo.Context) {
		if he, ok := err.(*echo.HTTPError); ok {
			// Log the error if needed
			c.Logger().Errorf("Error: %v", he.Message)
		}
	}
}
