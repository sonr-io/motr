//go:build js && wasm
// +build js,wasm

package web

import "github.com/labstack/echo/v4"

type HeaderKey string

const (
	Authorization HeaderKey = "Authorization"

	// User Agent
	Architecture    HeaderKey = "Sec-CH-UA-Arch"
	Bitness         HeaderKey = "Sec-CH-UA-Bitness"
	FullVersionList HeaderKey = "Sec-CH-UA-Full-Version-List"
	Mobile          HeaderKey = "Sec-CH-UA-Mobile"
	Model           HeaderKey = "Sec-CH-UA-Model"
	Platform        HeaderKey = "Sec-CH-UA-Platform"
	PlatformVersion HeaderKey = "Sec-CH-UA-Platform-Version"
	UserAgent       HeaderKey = "Sec-CH-UA"

	// Sonr Injected
	SonrAPIURL  HeaderKey = "X-Sonr-API"
	SonrgRPCURL HeaderKey = "X-Sonr-GRPC"
	SonrRPCURL  HeaderKey = "X-Sonr-RPC"
	SonrWSURL   HeaderKey = "X-Sonr-WS"
)

func (h HeaderKey) String() string {
	return string(h)
}

// ╭───────────────────────────────────────────────────────────╮
// │                      Utility Methods                      │
// ╰───────────────────────────────────────────────────────────╯

// MustEqual returns true if the request has the header Key.
func (k HeaderKey) MustEqual(c echo.Context, value string) bool {
	return c.Response().Header().Get(k.String()) == value
}

// Exists returns true if the request has the header Key.
func (k HeaderKey) Exists(c echo.Context) bool {
	return c.Response().Header().Get(k.String()) != ""
}

// Read returns the header value for the Key.
func (k HeaderKey) Read(c echo.Context) string {
	return c.Response().Header().Get(k.String())
}

// Write sets the header value for the Key.
func (k HeaderKey) Write(c echo.Context, value string) {
	c.Response().Header().Set(k.String(), value)
}
