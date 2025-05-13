package credential

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type CredentialEntity interface {
	GetModel() models.Credential
	GetDescriptor() *CredentialDescriptor
	GetInfoModal() templ.Component
}

type CredentialsEntity interface {
	GetModels() []models.Credential
	GetDescriptors() []*CredentialDescriptor
	GetList() templ.Component
}
