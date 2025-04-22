package vault

import "github.com/sonr-io/motr/sink/models"

type VaultEntity interface {
	GetModel() *models.Vault
}
