package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/views"
)

type RegisterOptions struct {
	Address   string
	Handle    string
	Challenge string
}

func HandleRegisterInitial(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

func HandleRegisterCheck(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

func HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

func HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}
