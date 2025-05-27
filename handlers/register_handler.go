package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/ui/register"
)

type RegisterOptions struct {
	Address   string
	Handle    string
	Challenge string
}

func HandleRegisterInitial(c echo.Context) error {
	return middleware.Render(c, register.RegisterView())
}

func HandleRegisterCheck(c echo.Context) error {
	return middleware.Render(c, register.RegisterView())
}

func HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, register.RegisterView())
}

func HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, register.RegisterView())
}
