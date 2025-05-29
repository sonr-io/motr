package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/login"
	"github.com/sonr-io/motr/middleware/render"
)



func HandleLoginCheck(c echo.Context) error {
	return render.View(c, login.LoginView())
}

func HandleLoginInitial(c echo.Context) error {
	return render.View(c, login.LoginView())
}

func HandleLoginFinish(c echo.Context) error {
	return render.View(c, login.LoginView())
}

func HandleLoginStart(c echo.Context) error {
	return render.View(c, login.LoginView())
}
