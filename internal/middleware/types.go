//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/labstack/echo/v4"
	"github.com/medama-io/go-useragent"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/sink/models/common"
	"github.com/sonr-io/motr/sink/models/vault"
)

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

// Define the credential structure matching our frontend data
type CredentialDescriptor struct {
	ID                      string            `json:"id"`
	RawID                   string            `json:"rawId"`
	Type                    string            `json:"type"`
	AuthenticatorAttachment string            `json:"authenticatorAttachment"`
	Transports              string            `json:"transports"`
	ClientExtensionResults  map[string]string `json:"clientExtensionResults"`
	Response                struct {
		AttestationObject string `json:"attestationObject"`
		ClientDataJSON    string `json:"clientDataJSON"`
	} `json:"response"`
}

func (c *CredentialDescriptor) ToModel(handle, origin string) *vault.Credential {
	return &vault.Credential{
		Handle:                  handle,
		Origin:                  origin,
		CredentialID:            c.ID,
		Type:                    c.Type,
		Transports:              c.Transports,
		AuthenticatorAttachment: c.AuthenticatorAttachment,
	}
}

func CredentialArrayToDescriptors(credentials []vault.Credential) []*CredentialDescriptor {
	var descriptors []*CredentialDescriptor
	for _, cred := range credentials {
		cd := &CredentialDescriptor{
			ID:                      cred.CredentialID,
			RawID:                   cred.CredentialID,
			Type:                    cred.Type,
			AuthenticatorAttachment: cred.AuthenticatorAttachment,
			Transports:              cred.Transports,
		}
		descriptors = append(descriptors, cd)
	}
	return descriptors
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
		BrowserName:    s.GetBrowser(),
		BrowserVersion: s.GetMajorVersion(),
		ClientIpaddr:   e.RealIP(),
		Platform:       s.GetOS(),
		IsMobile:       s.IsMobile(),
		IsTablet:       s.IsTablet(),
		IsDesktop:      s.IsDesktop(),
		IsBot:          s.IsBot(),
		IsTv:           s.IsTV(),
		// IsHumanFirst:   int64(f),
		// IsHumanLast:    int64(l),
		Challenge: challenge.String(),
	}
}

// ╭───────────────────────────────────────────────────────────╮
// │            Create Passkey (/register/passkey)             │
// ╰───────────────────────────────────────────────────────────╯

// CreatePasskeyParams represents the parameters for creating a passkey
type CreatePasskeyParams struct {
	Address       string
	Handle        string
	Name          string
	Challenge     string
	CreationBlock string
}

// ╭───────────────────────────────────────────────────────────╮
// │            Create Profile (/register/profile)             │
// ╰───────────────────────────────────────────────────────────╯

// CreateProfileParams represents the parameters for creating a profile
type CreateProfileParams struct {
	TurnstileSiteKey string
	FirstNumber      int
	LastNumber       int
}

// Sum returns the sum of the first and last number
func (d CreateProfileParams) Sum() int {
	return d.FirstNumber + d.LastNumber
}
