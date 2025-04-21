//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/sonr-io/motr/sink/models/vault"
)

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
