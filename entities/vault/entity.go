package vault

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type VaultEntity interface {
	GetModel() models.Vault
}

type VaultsEntity interface {
	GetModels() []models.Vault
	GetTable() templ.Component
}
