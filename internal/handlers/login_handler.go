package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/models/vault"
	"github.com/sonr-io/motr/sink/options"
)

func LoginHandler(db *vault.Queries) echo.HandlerFunc {
	return func(c echo.Context) error {
		return middleware.Render(c, views.LoginView(options.LoginOptions{}))
	}
}
