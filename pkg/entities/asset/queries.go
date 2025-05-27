package asset

import (
	"context"

	"github.com/sonr-io/motr/pkg/models"
)

type Queries interface {
	GetAssetByChainAndSymbol(ctx context.Context, arg models.GetAssetByChainAndSymbolParams) (models.Asset, error)
	GetAssetByID(ctx context.Context, id string) (models.Asset, error)
	GetAssetBySymbol(ctx context.Context, symbol string) (models.Asset, error)
	GetAssetWithLatestPrice(ctx context.Context, id string) (models.GetAssetWithLatestPriceRow, error)
	InsertAsset(ctx context.Context, arg models.InsertAssetParams) (models.Asset, error)
	ListAssetsByChain(ctx context.Context, chainID string) ([]models.Asset, error)
	ListAssetsWithLatestPrices(ctx context.Context, arg models.ListAssetsWithLatestPricesParams) ([]models.ListAssetsWithLatestPricesRow, error)
	SoftDeleteAsset(ctx context.Context, id string) error
	UpdateAsset(ctx context.Context, arg models.UpdateAssetParams) (models.Asset, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
