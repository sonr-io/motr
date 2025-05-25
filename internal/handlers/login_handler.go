package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/entities/credential"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/pages"
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
	return middleware.Render(c, pages.LoginView())
}

func HandleLoginInitial(c echo.Context) error {
	return middleware.Render(c, pages.LoginView())
}

func HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, pages.LoginView())
}

func HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, pages.LoginView())
}
