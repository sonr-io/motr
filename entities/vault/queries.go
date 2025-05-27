package vault

import (
	"context"

	"github.com/sonr-io/motr/sink/models"
)

type Queries interface {
	GetVaultByID(ctx context.Context, id string) (models.Vault, error)
	GetVaultConfigByCID(ctx context.Context, cid string) (models.Vault, error)
	GetVaultRedirectURIBySessionID(ctx context.Context, sessionID string) (string, error)
	GetVaultsByHandle(ctx context.Context, handle string) ([]models.Vault, error)
	InsertVault(ctx context.Context, arg models.InsertVaultParams) (models.Vault, error)
	SoftDeleteVault(ctx context.Context, id string) error
	UpdateVault(ctx context.Context, arg models.UpdateVaultParams) (models.Vault, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
