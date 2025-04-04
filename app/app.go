//go:build js && wasm
// +build js,wasm

package app

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/identity"
	"github.com/onsonr/motr/x/portfolio"
	"github.com/onsonr/motr/x/user"
)

func New(opts ...Option) (*App, error) {
	o := baseOptions()
	for _, opt := range opts {
		opt(o)
	}
	e := o.applyDefaults()

	identity.RegisterRoutes(e, o.conn.Identity)
	portfolio.RegisterRoutes(e, o.conn.Portfolio)
	user.RegisterRoutes(e, o.conn.User)

	return &App{
		Config:   o.cfg,
		Database: o.conn,
		e:        e,
	}, nil
}

func handleIndex(c echo.Context) error {
	return c.String(200, "Hello, World!")
}

func handleError() echo.HTTPErrorHandler {
	return func(err error, c echo.Context) {
		if he, ok := err.(*echo.HTTPError); ok {
			// Log the error if needed
			c.Logger().Errorf("Error: %v", he.Message)
		}
	}
}
