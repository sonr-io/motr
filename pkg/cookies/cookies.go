package cookies

import (
	"encoding/base64"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

// CookieKey is a type alias for string.
type CookieKey string

const (
	// SessionID is the key for the session ID cookie.
	SessionID CookieKey = "session.id"

	// SessionChallenge is the key for the session challenge cookie.
	SessionChallenge CookieKey = "session.challenge"

	// SessionRole is the key for the session role cookie.
	SessionRole CookieKey = "session.role"

	// UserHandle is the key for the User Handle cookie.
	UserHandle CookieKey = "user.handle"

	// VaultAddress is the key for the Vault address cookie.
	VaultAddress CookieKey = "vault.address"

	// VaultCID is the key for the Vault CID cookie.
	VaultCID CookieKey = "vault.cid"

	// VaultSchema is the key for the Vault schema cookie.
	VaultSchema CookieKey = "vault.schema"
)

// String returns the string representation of the CookieKey.
func (c CookieKey) String() string {
	return string(c)
}

// ╭───────────────────────────────────────────────────────────╮
// │                      Utility Methods                      │
// ╰───────────────────────────────────────────────────────────╯

// Exists returns true if the request has the cookie Key.
func (k CookieKey) Exists(c echo.Context) bool {
	ck, err := c.Cookie(k.String())
	return err == nil && ck != nil
}

// MustEqual returns true if the request has the cookie Key.
func (k CookieKey) MustEqual(c echo.Context, value string) bool {
	v, err := k.Read(c)
	if err != nil {
		return false
	}
	return v == value
}

// Read returns the cookie value for the Key.
func (k CookieKey) Read(c echo.Context) (string, error) {
	cookie, err := c.Cookie(k.String())
	if err != nil {
		// Cookie not found or other error
		return "", err
	}
	if cookie == nil || cookie.Value == "" {
		// Cookie is empty
		return "", http.ErrNoCookie
	}
	return cookie.Value, nil
}

// ReadBytes returns the cookie value for the Key.
func (k CookieKey) ReadBytes(c echo.Context) ([]byte, error) {
	cookie, err := c.Cookie(k.String())
	if err != nil {
		// Cookie not found or other error
		return nil, err
	}
	if cookie == nil || cookie.Value == "" {
		// Cookie is empty
		return nil, http.ErrNoCookie
	}
	return base64.RawURLEncoding.DecodeString(cookie.Value)
}

// ReadUnsafe returns the cookie value for the Key.
func (k CookieKey) ReadUnsafe(c echo.Context) string {
	ck, err := c.Cookie(k.String())
	if err != nil {
		return ""
	}
	return ck.Value
}

// Write sets the cookie value for the Key.
func (k CookieKey) Write(c echo.Context, value string) {
	cookie := &http.Cookie{
		Name:     k.String(),
		Value:    value,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Path:     "/",
	}
	c.SetCookie(cookie)
}

// WriteBytes sets the cookie value for the Key.
func (k CookieKey) WriteBytes(c echo.Context, value []byte) {
	cookie := &http.Cookie{
		Name:     k.String(),
		Value:    base64.RawURLEncoding.EncodeToString(value),
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Path:     "/",
	}
	c.SetCookie(cookie)
}
