package cookies

import (
	"encoding/base64"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

// Key is a type alias for string.
type Key string

const (
	// SessionID is the key for the session ID cookie.
	SessionID Key = "session.id"

	// SessionChallenge is the key for the session challenge cookie.
	SessionChallenge Key = "session.challenge"

	// SessionRole is the key for the session role cookie.
	SessionRole Key = "session.role"

	// UserHandle is the key for the User Handle cookie.
	UserHandle Key = "user.handle"

	// VaultAddress is the key for the Vault address cookie.
	VaultAddress Key = "vault.address"

	// VaultCID is the key for the Vault CID cookie.
	VaultCID Key = "vault.cid"

	// VaultSchema is the key for the Vault schema cookie.
	VaultSchema Key = "vault.schema"
)

// String returns the string representation of the CookieKey.
func (c Key) String() string {
	return string(c)
}

// ╭───────────────────────────────────────────────────────────╮
// │                      Utility Methods                      │
// ╰───────────────────────────────────────────────────────────╯

func Exists(c echo.Context, key Key) bool {
	ck, err := c.Cookie(key.String())
	if err != nil {
		return false
	}
	return ck != nil
}

func Read(c echo.Context, key Key) (string, error) {
	cookie, err := c.Cookie(key.String())
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

func ReadBytes(c echo.Context, key Key) ([]byte, error) {
	cookie, err := c.Cookie(key.String())
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

func ReadUnsafe(c echo.Context, key Key) string {
	ck, err := c.Cookie(key.String())
	if err != nil {
		return ""
	}
	return ck.Value
}

func Write(c echo.Context, key Key, value string) error {
	cookie := &http.Cookie{
		Name:     key.String(),
		Value:    value,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Path:     "/",
		// Add Secure and SameSite attributes as needed
	}
	c.SetCookie(cookie)
	return nil
}

func WriteBytes(c echo.Context, key Key, value []byte) error {
	cookie := &http.Cookie{
		Name:     key.String(),
		Value:    base64.RawURLEncoding.EncodeToString(value),
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Path:     "/",
		// Add Secure and SameSite attributes as needed
	}
	c.SetCookie(cookie)
	return nil
}
