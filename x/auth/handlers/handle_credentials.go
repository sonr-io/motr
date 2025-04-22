//go:build js && wasm
// +build js,wasm

package handlers

import (
	"encoding/json"
	"fmt"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui"
	"github.com/sonr-io/motr/x/auth/components"
	"github.com/sonr-io/motr/x/auth/types"
)

// HandleSubmitCredentialLogin handles the submit credential login request.
func (h *Handler) HandleSubmitCredentialLogin(c echo.Context) error {
	return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
}

// HandleSubmitCredentialRegister handles the submit credential register request.
func (h *Handler) HandleSubmitCredentialRegister(c echo.Context) error {
	credJSON := c.FormValue("credentialJSON")
	if credJSON == "" {
		return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
	}
	cred := webauthn.Credential{}
	err := json.Unmarshal([]byte(credJSON), &cred)
	if err != nil {
		return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
	}
	fmt.Println(cred)

	return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
}
