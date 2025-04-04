//go:build js && wasm
// +build js,wasm

package app

import (
	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
	"github.com/onsonr/motr/pkg/config"
	"github.com/onsonr/motr/pkg/database"
)

type Options struct {
	conn *database.Connection
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
	return nil
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

func WithConfig(cfg *config.MotrConfig) func(*Options) {
	return func(o *Options) {
		o.cfg = cfg
	}
}

func WithDatabase(conn *database.Connection) func(*Options) {
	return func(o *Options) {
		o.conn = conn
	}
}

func WithMiddleware(mdws ...echo.MiddlewareFunc) func(*Options) {
	return func(o *Options) {
		o.mdws = append(o.mdws, mdws...)
	}
}
