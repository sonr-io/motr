package vault

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/pkg/models"
)

type VaultEntity interface {
	GetModel() models.Vault
}

type VaultsEntity interface {
	GetModels() []models.Vault
	GetTable() templ.Component
}
