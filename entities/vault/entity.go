package vault

import (
	"github.com/sonr-io/motr/internal/sink/models"
)

type VaultEntity interface {
	GetModel() models.Vault
}
