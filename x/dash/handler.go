//go:build js && wasm
// +build js,wasm

package dash

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/x/dash/views"
)

func (cc *DashController) HandleDashOverview(c echo.Context) error {
	return middleware.Render(c, views.DemoView(time.Now()))
}
