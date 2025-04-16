package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/ui/views"
)

func LoginHandler(c echo.Context) error {
	return render(c, views.LoginView(time.Now(), nil, nil))
}
