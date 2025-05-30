package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/home"
	"github.com/sonr-io/motr/internal/ui/login"
	"github.com/sonr-io/motr/internal/ui/register"
	"github.com/sonr-io/motr/pkg/render"
)

func RenderHomePage(c echo.Context) error {
	return render.Component(c, home.HomeView())
}

func RenderLoginPage(c echo.Context) error {
	return render.Component(c, login.LoginView())
}

func RenderRegisterPage(c echo.Context) error {
	return render.Component(c, register.RegisterView())
}
