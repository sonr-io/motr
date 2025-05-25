package sink

import (
	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

type (
	EchoView        func(c echo.Context) error
	EchoViewFunc    func(c echo.Context, b templ.Component) error
	EchoPartialView func(c echo.Context) templ.Component
)
