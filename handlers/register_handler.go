package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/register"
	"github.com/sonr-io/motr/pkg/render"
)

type RegisterOptions struct {
	Address   string
	Handle    string
	Challenge string
}

func HandleRegisterInitial(c echo.Context) error {
	return render.View(c, register.RegisterView())
}

func HandleRegisterCheck(c echo.Context) error {
	return render.View(c, register.RegisterView())
}

func HandleRegisterFinish(c echo.Context) error {
	return render.View(c, register.RegisterView())
}

func HandleRegisterStart(c echo.Context) error {
	return render.View(c, register.RegisterView())
}
