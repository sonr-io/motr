package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/entities/credential"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/views"
)

type LoginOptions struct {
	Account            string
	Handle             string
	HelpText           string
	Label              string
	Challenge          string
	AllowedCredentials []*credential.CredentialDescriptor
}

func HandleLoginCheck(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}

func HandleLoginInitial(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}

func HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}

func HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}
