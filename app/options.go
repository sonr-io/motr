//go:build js && wasm
// +build js,wasm

package app

import (
	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
	"github.com/onsonr/motr/pkg/config"
)

type App struct {
	Config   *config.MotrConfig
	Database *config.DBConnection
	Echo     *echo.Echo
}

type Options struct {
	conn *config.DBConnection
	cfg  *config.MotrConfig
	mdws []echo.MiddlewareFunc
}

func (o *Options) applyDefaults() *echo.Echo {
	e := echo.New()
	e.IPExtractor = echo.ExtractIPDirect()
	e.HTTPErrorHandler = handleError()
	for _, mdw := range o.mdws {
		e.Use(mdw)
	}
	e.POST("/", handleIndex)
	return e
}

func baseOptions() *Options {
	return &Options{
		mdws: []echo.MiddlewareFunc{
			echomiddleware.Logger(),
			echomiddleware.Recover(),
		},
	}
}

type Option func(*Options)

// WithConfig sets the configuration for the application
func WithConfig(cfg *config.MotrConfig) func(*Options) {
	return func(o *Options) {
		o.cfg = cfg
	}
}

// WithDatabase sets the database connection for the application
func WithDatabase(conn *config.DBConnection) func(*Options) {
	return func(o *Options) {
		o.conn = conn
	}
}

// WithMiddleware sets the middleware for the application
func WithMiddleware(mdws ...echo.MiddlewareFunc) func(*Options) {
	return func(o *Options) {
		o.mdws = append(o.mdws, mdws...)
	}
}
