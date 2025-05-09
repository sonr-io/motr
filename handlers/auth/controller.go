//go:build js && wasm
// +build js,wasm

package auth

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/components/views"
	"github.com/sonr-io/motr/internal/config"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

// ╭───────────────────────────────────────────────────────────╮
// │                   Auth Handler                            │
// ╰───────────────────────────────────────────────────────────╯

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	hkv, err := cfg.KV.GetHandles()
	if err != nil {
		return err
	}
	skv, err := cfg.KV.GetSessions()
	if err != nil {
		return err
	}

	h := NewAuthHandler(q, hkv, skv)
	h.SetupRoutes(s)
	return nil
}

// ╭───────────────────────────────────────────────────────────╮
// │                   Auth Handler                            │
// ╰───────────────────────────────────────────────────────────╯

// AuthHandler is the auth handler.
type AuthHandler struct {
	DB       models.Querier
	Handles  *kv.Namespace
	Sessions *kv.Namespace
}

func NewAuthHandler(q models.Querier, hkv *kv.Namespace, skv *kv.Namespace) *AuthHandler {
	return &AuthHandler{DB: q, Handles: hkv, Sessions: skv}
}

// SetupRoutes sets up the routes for the auth handler.
func (h *AuthHandler) SetupRoutes(s *config.Server) {
	s.GET("/login", h.HandleLoginInitial)
	s.GET("/login/:handle", h.HandleLoginStart)
	s.POST("/login/:handle/check", h.HandleLoginUsernameCheck)
	s.POST("/login/:handle/finish", h.HandleLoginFinish)

	s.GET("/register", h.HandleRegisterInitial)
	s.GET("/register/:handle", h.HandleRegisterStart)
	s.POST("/register/:handle/check", h.HandleRegisterUsernameCheck)
	s.POST("/register/:handle/finish", h.HandleRegisterFinish)
}

func (c *AuthHandler) VerifyHandle(handle string, target bool) bool {
	_, err := c.Handles.GetString(handle, nil)
	if err != nil {
		return !target
	}
	res, err := c.DB.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res == target
}

// ╭───────────────────────────────────────────────────────────╮
// │                   Login Handlers (/login)                 │
// ╰───────────────────────────────────────────────────────────╯

// HandleLoginFinish handles the finish login request.
func (h *AuthHandler) HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}

// HandleLoginStart handles the start login request.
func (h *AuthHandler) HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}

func (h *AuthHandler) HandleLoginInitial(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}

// HandleSubmitCredentialLogin handles the submit credential login request.
func (h *AuthHandler) HandleSubmitCredentialLogin(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

// ╭───────────────────────────────────────────────────────────╮
// │                 Profile Handlers (/login)                 │
// ╰───────────────────────────────────────────────────────────╯

// HandleRegisterUsernameCheck handles the username check request.
func (h *AuthHandler) HandleRegisterUsernameCheck(c echo.Context) error {
	handle := c.FormValue("handle")
	ok := h.VerifyHandle(handle, false)
	if ok {
		return middleware.Render(c, views.RegisterView())
	}
	return middleware.Render(c, views.RegisterView())
}

// HandleLoginUsernameCheck handles the username check request.
func (h *AuthHandler) HandleLoginUsernameCheck(c echo.Context) error {
	handle := c.FormValue("handle")
	ok := h.VerifyHandle(handle, true)
	if ok {
		return middleware.Render(c, views.RegisterView())
	}
	return middleware.Render(c, views.RegisterView())
}

func (h *AuthHandler) HandleSubmitUsernameClaim(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

func (h *AuthHandler) HandleSubmitProfile(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

// ╭────────────────────────────────────────────────────────╮
// │                   Register Init  (/register)           │
// ╰────────────────────────────────────────────────────────╯

// HandleRegisterInitial handles the initial register request.
func (h *AuthHandler) HandleRegisterInitial(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

// HandleRegisterStart handles the start register request.
func (h *AuthHandler) HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

// HandleRegisterFinish handles the finish register request.
func (h *AuthHandler) HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}

// HandleSubmitCredentialRegister handles the submit credential register request.
func (h *AuthHandler) HandleSubmitCredentialRegister(c echo.Context) error {
	credJSON := c.FormValue("credentialJSON")
	if credJSON == "" {
		return middleware.Render(c, views.RegisterView())
	}
	cred := webauthn.Credential{}
	err := json.Unmarshal([]byte(credJSON), &cred)
	if err != nil {
		return middleware.Render(c, views.RegisterView())
	}
	fmt.Println(cred)

	return middleware.Render(c, views.RegisterView())
}
