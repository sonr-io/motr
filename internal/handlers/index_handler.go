package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/models"
)

func IndexHandler(db *models.Queries) echo.HandlerFunc {
	return func(c echo.Context) error {
		return middleware.Render(c, views.DemoView(time.Now()))
	}
}
