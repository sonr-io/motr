package credential

import (
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/sonr-io/motr/sink/models"
)

type CredentialEntity interface {
	GetModel() *models.Credential
	GetDescriptor() *protocol.CredentialDescriptor
}
