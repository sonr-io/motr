package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/login"
	"github.com/sonr-io/motr/middleware/render"
	"github.com/sonr-io/motr/middleware/webauth"
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
