package blockchain

import (
	"context"
	"database/sql"

	"github.com/sonr-io/motr/sink/models"
)

type Queries interface {
	GetBlockchainByChainName(ctx context.Context, chainName string) (models.Blockchain, error)
	GetBlockchainByCosmosChainID(ctx context.Context, chainIDCosmos sql.NullString) (models.Blockchain, error)
	GetBlockchainByEvmChainID(ctx context.Context, chainIDEvm sql.NullString) (models.Blockchain, error)
	GetBlockchainByID(ctx context.Context, id string) (models.Blockchain, error)
	GetBlockchainEndpoints(ctx context.Context, id string) (models.GetBlockchainEndpointsRow, error)
	GetBlockchainExplorer(ctx context.Context, id string) (models.GetBlockchainExplorerRow, error)
	GetBlockchainWithAssetInfo(ctx context.Context, id string) (models.GetBlockchainWithAssetInfoRow, error)
	InsertBlockchain(ctx context.Context, arg models.InsertBlockchainParams) (models.Blockchain, error)
	ListBlockchainsWithAssetInfo(ctx context.Context, arg models.ListBlockchainsWithAssetInfoParams) ([]models.ListBlockchainsWithAssetInfoRow, error)
	ListBlockchainsWithERC20Support(ctx context.Context) ([]models.Blockchain, error)
	ListBlockchainsWithExtensionSupport(ctx context.Context) ([]models.Blockchain, error)
	ListBlockchainsWithMobileSupport(ctx context.Context) ([]models.Blockchain, error)
	ListBlockchainsWithStaking(ctx context.Context) ([]models.Blockchain, error)
	SearchBlockchains(ctx context.Context, arg models.SearchBlockchainsParams) ([]models.Blockchain, error)
	SoftDeleteBlockchain(ctx context.Context, id string) error
	UpdateBlockchain(ctx context.Context, arg models.UpdateBlockchainParams) (models.Blockchain, error)
	UpdateBlockchainDescriptions(ctx context.Context, arg models.UpdateBlockchainDescriptionsParams) (models.Blockchain, error)
	UpdateBlockchainEndpoints(ctx context.Context, arg models.UpdateBlockchainEndpointsParams) (models.Blockchain, error)
	UpdateBlockchainExplorer(ctx context.Context, arg models.UpdateBlockchainExplorerParams) (models.Blockchain, error)
	UpdateBlockchainFeeInfo(ctx context.Context, arg models.UpdateBlockchainFeeInfoParams) (models.Blockchain, error)
	UpdateBlockchainImages(ctx context.Context, arg models.UpdateBlockchainImagesParams) (models.Blockchain, error)
	UpdateBlockchainSocialLinks(ctx context.Context, arg models.UpdateBlockchainSocialLinksParams) (models.Blockchain, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
