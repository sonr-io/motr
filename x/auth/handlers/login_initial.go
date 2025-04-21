package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/models"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/views"
)

func HandleLoginInitial(q models.Querier) echo.HandlerFunc {
	return func(c echo.Context) error {
		return middleware.Render(c, views.LoginView(options.LoginOptions{}))
	}
}

func HandleUsernameExists(q models.Querier) echo.HandlerFunc {
	return func(c echo.Context) error {
		handle := c.Param("handle")
		ok, err := q.CheckHandleExists(c.Request().Context(), handle)
		if err != nil {
			return err
		}
		if ok {
			return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
		}
		return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
	}
}
