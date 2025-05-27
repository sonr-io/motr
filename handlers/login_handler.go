package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/shared/webauth"
	"github.com/sonr-io/motr/ui"
	"github.com/sonr-io/motr/ui/login"
)

type LoginOptions struct {
	Account            string
	Handle             string
	HelpText           string
	Label              string
	Challenge          string
	AllowedCredentials []*webauth.CredentialDescriptor
}

func HandleLoginCheck(c echo.Context) error {
	return ui.Render(c, login.LoginView())
}

func HandleLoginInitial(c echo.Context) error {
	return ui.Render(c, login.LoginView())
}

func HandleLoginFinish(c echo.Context) error {
	return ui.Render(c, login.LoginView())
}

func HandleLoginStart(c echo.Context) error {
	return ui.Render(c, login.LoginView())
}
