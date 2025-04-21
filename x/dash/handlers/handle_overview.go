package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/x/dash/views"
)

func (h *Handler) HandleOverview(c echo.Context) error {
	return middleware.Render(c, views.DemoView(time.Now()))
}
