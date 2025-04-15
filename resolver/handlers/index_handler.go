package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/resolver/components"
)

func IndexHandler(c echo.Context) error {
	return render(c, components.HomeView(time.Now()))
}
