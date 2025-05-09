package credential

import (
	"context"

	"github.com/sonr-io/motr/sink/models"
)

type Queries interface {
	GetCredentialByID(ctx context.Context, credentialID string) (models.Credential, error)
	GetCredentialsByHandle(ctx context.Context, handle string) ([]models.Credential, error)
	InsertCredential(ctx context.Context, arg models.InsertCredentialParams) (models.Credential, error)
	SoftDeleteCredential(ctx context.Context, credentialID string) error
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
