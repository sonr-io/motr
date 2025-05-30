package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/login"
	"github.com/sonr-io/motr/internal/ui/register"
	"github.com/sonr-io/motr/pkg/render"
)

func HandleLoginCheck(c echo.Context) error {
	return render.Component(c, login.LoginView())
}

func HandleLoginInitial(c echo.Context) error {
	return render.Component(c, login.LoginView())
}

func HandleLoginFinish(c echo.Context) error {
	return render.Component(c, login.LoginView())
}

func HandleLoginStart(c echo.Context) error {
	return render.Component(c, login.LoginView())
}

func HandleRegisterInitial(c echo.Context) error {
	return render.Component(c, register.RegisterView())
}

func HandleRegisterCheck(c echo.Context) error {
	return render.Component(c, register.RegisterView())
}

func HandleRegisterFinish(c echo.Context) error {
	return render.Component(c, register.RegisterView())
}

func HandleRegisterStart(c echo.Context) error {
	return render.Component(c, register.RegisterView())
}
