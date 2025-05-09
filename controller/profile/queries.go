package profile

import (
	"context"

	"github.com/sonr-io/motr/sink/models"
)

type Queries interface {
	CheckHandleExists(ctx context.Context, handle string) (bool, error)
	GetAccountsByHandle(ctx context.Context, handle string) ([]models.Account, error)
	GetCredentialsByHandle(ctx context.Context, handle string) ([]models.Credential, error)
	GetVaultsByHandle(ctx context.Context, handle string) ([]models.Vault, error)
	InsertProfile(ctx context.Context, arg models.InsertProfileParams) (models.Profile, error)
	ListProfiles(ctx context.Context, arg models.ListProfilesParams) ([]models.Profile, error)
	SoftDeleteProfile(ctx context.Context, address string) error
	UpdateProfile(ctx context.Context, arg models.UpdateProfileParams) (models.Profile, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
