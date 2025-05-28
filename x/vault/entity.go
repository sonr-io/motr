package vault

import (
	"github.com/a-h/templ"
	models "github.com/sonr-io/motr/internal/sink/users"
)

type VaultEntity interface {
	GetModel() models.Vault
}

type VaultsEntity interface {
	GetModels() []models.Vault
	GetTable() templ.Component
}
