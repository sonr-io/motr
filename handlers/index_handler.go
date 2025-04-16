package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/ui/views"
)

func IndexHandler(c echo.Context) error {
	return middleware.Render(c, views.DemoView(time.Now()))
}
