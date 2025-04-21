//go:build js && wasm
// +build js,wasm

package middleware

import (
	"net/http"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/labstack/echo/v4"
	"github.com/medama-io/go-useragent"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/database"
	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/vault"
)

type SessionContext struct {
	echo.Context
	ID              string
	controller      database.CommonQueries
	vaultController database.VaultQueries
}

func NewSession(c echo.Context, cfg config.Config) *SessionContext {
	commonDB, _ := cfg.DB.GetCommon()
	vaultDB, _ := cfg.DB.GetVault()

	return &SessionContext{
		Context:         c,
		ID:              getOrCreateSessionID(c),
		controller:      common.New(commonDB),
		vaultController: vault.New(vaultDB),
	}
}

func BaseSessionCreateParams(e echo.Context) common.CreateSessionParams {
	// f := rand.Intn(5) + 1
	// l := rand.Intn(4) + 1
	challenge, _ := protocol.CreateChallenge()
	id := getOrCreateSessionID(e)
	ua := useragent.NewParser()
	s := ua.Parse(e.Request().UserAgent())
	return common.CreateSessionParams{
		ID:             id,
		BrowserName:    s.Browser().String(),
		BrowserVersion: s.BrowserVersion(),
		ClientIpaddr:   e.RealIP(),
		Platform:       s.OS().String(),
		IsMobile:       s.IsMobile(),
		IsTablet:       s.IsTablet(),
		IsDesktop:      s.IsDesktop(),
		IsBot:          s.IsBot(),
		IsTv:           s.IsTV(),
		Challenge:      challenge.String(),
	}
}

func GetSession(c echo.Context) (*SessionContext, error) {
	cc, ok := c.(*SessionContext)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Session Context not found")
	}
	return cc, nil
}

// GetCommonQueries retrieves the Controller from the context
func GetCommonQueries(c echo.Context) (database.CommonQueries, error) {
	sc, err := GetSession(c)
	if err != nil {
		return nil, err
	}
	if sc.controller == nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Controller not set in session")
	}
	return sc.controller, nil
}

// GetVaultQueries retrieves the VaultController from the context
func GetVaultQueries(c echo.Context) (database.VaultQueries, error) {
	sc, err := GetSession(c)
	if err != nil {
		return nil, err
	}
	if sc.vaultController == nil {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "VaultController not set in session")
	}
	return sc.vaultController, nil
}

// getOrCreateSessionID returns the session ID from the cookie or creates a new one if it doesn't exist
func getOrCreateSessionID(c echo.Context) string {
	if ok := CookieExists(c, SessionID); !ok {
		sessionID := ksuid.New().String()
		WriteCookie(c, SessionID, sessionID)
		c.Echo().Logger.Debug("Wrote session ID to cookie")
		return sessionID
	}
	c.Echo().Logger.Debug("Has session ID in cookie")
	sessionID, err := ReadCookie(c, SessionID)
	if err != nil {
		sessionID = ksuid.New().String()
		WriteCookie(c, SessionID, sessionID)
		c.Echo().Logger.Debug("Failed to read session ID from cookie, wrote new one")
	}
	return sessionID
}
