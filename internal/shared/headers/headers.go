//go:build js && wasm
// +build js,wasm

package headers

import "github.com/labstack/echo/v4"

type Key string

const (
	Authorization Key = "Authorization"

	// User Agent
	Architecture    Key = "Sec-CH-UA-Arch"
	Bitness         Key = "Sec-CH-UA-Bitness"
	FullVersionList Key = "Sec-CH-UA-Full-Version-List"
	Mobile          Key = "Sec-CH-UA-Mobile"
	Model           Key = "Sec-CH-UA-Model"
	Platform        Key = "Sec-CH-UA-Platform"
	PlatformVersion Key = "Sec-CH-UA-Platform-Version"
	UserAgent       Key = "Sec-CH-UA"

	// Sonr Injected
	SonrAPIURL  Key = "X-Sonr-API"
	SonrgRPCURL Key = "X-Sonr-GRPC"
	SonrRPCURL  Key = "X-Sonr-RPC"
	SonrWSURL   Key = "X-Sonr-WS"
)

func (h Key) String() string {
	return string(h)
}

// ╭───────────────────────────────────────────────────────────╮
// │                      Utility Methods                      │
// ╰───────────────────────────────────────────────────────────╯

func Equals(c echo.Context, key Key, value string) bool {
	return c.Response().Header().Get(key.String()) == value
}

// HeaderExists returns true if the request has the header Key.
func Exists(c echo.Context, key Key) bool {
	return c.Response().Header().Get(key.String()) != ""
}

// HeaderRead returns the header value for the Key.
func Read(c echo.Context, key Key) string {
	return c.Response().Header().Get(key.String())
}

// HeaderWrite sets the header value for the Key.
func Write(c echo.Context, key Key, value string) {
	c.Response().Header().Set(key.String(), value)
}
