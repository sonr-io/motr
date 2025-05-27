package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/shared/webauth"
	"github.com/sonr-io/motr/ui"
	"github.com/sonr-io/motr/ui/views"
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
	return ui.Render(c, views.LoginView())
}

func HandleLoginInitial(c echo.Context) error {
	return ui.Render(c, views.LoginView())
}

func HandleLoginFinish(c echo.Context) error {
	return ui.Render(c, views.LoginView())
}

func HandleLoginStart(c echo.Context) error {
	return ui.Render(c, views.LoginView())
}
