package credential

import (
	"github.com/a-h/templ"
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/sonr-io/motr/sink/models"
)

type CredentialEntity interface {
	GetModel() *models.Credential
	GetDescriptor() *protocol.CredentialDescriptor
	GetInfoModal() templ.Component
}

type CredentialsEntity interface {
	GetModels() []*models.Credential
	GetList() templ.Component
}
