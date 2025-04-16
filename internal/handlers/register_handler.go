package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/models/resolver"
	"github.com/sonr-io/motr/sink/options"
)

func RegisterHandler(q *resolver.Queries) echo.HandlerFunc {
	return func(c echo.Context) error {
		return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
	}
}
