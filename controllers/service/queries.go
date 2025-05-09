package service

import (
	"context"

	"github.com/sonr-io/motr/internal/sink/models"
)

type Queries interface {
	GetServiceByAddress(ctx context.Context, address string) (models.Service, error)
	GetServiceByChainAndAddress(ctx context.Context, arg models.GetServiceByChainAndAddressParams) (models.Service, error)
	GetServiceByID(ctx context.Context, id string) (models.Service, error)
	InsertService(ctx context.Context, arg models.InsertServiceParams) (models.Service, error)
	ListServicesByChain(ctx context.Context, arg models.ListServicesByChainParams) ([]models.Service, error)
	ListServicesByOwner(ctx context.Context, arg models.ListServicesByOwnerParams) ([]models.Service, error)
	SoftDeleteService(ctx context.Context, id string) error
	UpdateService(ctx context.Context, arg models.UpdateServiceParams) (models.Service, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
