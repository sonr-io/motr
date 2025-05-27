package account

import (
	"context"

	"github.com/sonr-io/motr/pkg/models"
)

type Queries interface {
	GetAccountByID(ctx context.Context, id string) (models.Account, error)
	GetAccountByAddress(ctx context.Context, address string) (models.Account, error)
	GetAccountByController(ctx context.Context, controller string) (models.Account, error)
	GetAccountByPublicKey(ctx context.Context, publicKey string) (models.Account, error)
	GetAccountByNumber(ctx context.Context, number int64) (models.Account, error)
	GetAccountBySequence(ctx context.Context, sequence int64) (models.Account, error)
	GetAccountsByChainID(ctx context.Context, chainID string) ([]models.Account, error)
	GetAccountsByHandle(ctx context.Context, handle string) ([]models.Account, error)
	GetAccountsByLabel(ctx context.Context, name string) ([]models.Account, error)
	UpdateAccountLabel(ctx context.Context, arg models.UpdateAccountLabelParams) (models.Account, error)
	UpdateAccountSequence(ctx context.Context, arg models.UpdateAccountSequenceParams) (models.Account, error)
	SoftDeleteAccount(ctx context.Context, id string) error
	ListValidatorAccounts(ctx context.Context) ([]models.Account, error)
	ListDelegatorAccounts(ctx context.Context) ([]models.Account, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
