//go:build js && wasm
// +build js,wasm

package handlers

import (
	"encoding/json"
	"fmt"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/x/auth/components"
)

// ╭───────────────────────────────────────────────────────────╮
// │                   Register Initial  (/register)           │
// ╰───────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterInitial(c echo.Context) error {
	return middleware.Render(c, components.RegisterView())
}

// ╭──────────────────────────────────────────────────────────────────╮
// │            Register Start (/register/:handle/start)              │
// ╰──────────────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, components.RegisterView())
}

// ╭────────────────────────────────────────────────────────────────────╮
// │            Register Finish (/register/:handle/finish)              │
// ╰────────────────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, components.RegisterView())
}

// HandleSubmitCredentialRegister handles the submit credential register request.
func (h *Handler) HandleSubmitCredentialRegister(c echo.Context) error {
	credJSON := c.FormValue("credentialJSON")
	if credJSON == "" {
		return middleware.Render(c, components.RegisterView())
	}
	cred := webauthn.Credential{}
	err := json.Unmarshal([]byte(credJSON), &cred)
	if err != nil {
		return middleware.Render(c, components.RegisterView())
	}
	fmt.Println(cred)

	return middleware.Render(c, components.RegisterView())
}
