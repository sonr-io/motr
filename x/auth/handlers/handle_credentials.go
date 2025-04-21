//go:build js && wasm
// +build js,wasm

package handlers

import (
	"encoding/json"
	"fmt"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/components"
)

func (h *Handler) HandleSubmitCredentialLogin(c echo.Context) error {
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleSubmitCredentialRegister(c echo.Context) error {
	credJSON := c.FormValue("credentialJSON")
	if credJSON == "" {
		return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
	}
	cred := webauthn.Credential{}
	err := json.Unmarshal([]byte(credJSON), &cred)
	if err != nil {
		return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
	}
	fmt.Println(cred)

	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}
