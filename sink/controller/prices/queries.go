package prices

import (
	"context"

	"github.com/sonr-io/motr/sink/models"
)

type Queries interface {
	GetPriceByAssetID(ctx context.Context, assetID string) (models.Price, error)
	GetPriceByID(ctx context.Context, id string) (models.Price, error)
	InsertPrice(ctx context.Context, arg models.InsertPriceParams) (models.Price, error)
	ListPriceHistoryByAssetID(ctx context.Context, arg models.ListPriceHistoryByAssetIDParams) ([]models.Price, error)
	UpdatePrice(ctx context.Context, arg models.UpdatePriceParams) (models.Price, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
