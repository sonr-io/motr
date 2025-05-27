package health

import (
	"context"

	"github.com/sonr-io/motr/pkg/models"
)

type Queries interface {
	GetHealthByEndpoint(ctx context.Context, endpointUrl string) (models.Health, error)
	GetHealthByID(ctx context.Context, id string) (models.Health, error)
	InsertHealth(ctx context.Context, arg models.InsertHealthParams) (models.Health, error)
	ListHealthByChain(ctx context.Context, arg models.ListHealthByChainParams) ([]models.Health, error)
	ListHealthByStatus(ctx context.Context, arg models.ListHealthByStatusParams) ([]models.Health, error)
	ListHealthChecksNeedingUpdate(ctx context.Context, limit int64) ([]models.Health, error)
	SoftDeleteHealth(ctx context.Context, id string) error
	UpdateHealthCheck(ctx context.Context, arg models.UpdateHealthCheckParams) (models.Health, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
