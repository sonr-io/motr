package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/models"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/views"
)

func HandleLoginFinish(q models.Querier) echo.HandlerFunc {
	return func(c echo.Context) error {
		return middleware.Render(c, views.LoginView(options.LoginOptions{}))
	}
}
