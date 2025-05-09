package activity

import (
	"context"
	"database/sql"

	"github.com/sonr-io/motr/sink/models"
)

type Queries interface {
	GetActivityByID(ctx context.Context, id string) (models.Activity, error)
	GetActivityByTxHash(ctx context.Context, txHash sql.NullString) (models.Activity, error)
	InsertActivity(ctx context.Context, arg models.InsertActivityParams) (models.Activity, error)
	ListActivitiesByAccount(ctx context.Context, arg models.ListActivitiesByAccountParams) ([]models.Activity, error)
	ListActivitiesByStatus(ctx context.Context, arg models.ListActivitiesByStatusParams) ([]models.Activity, error)
	ListActivitiesByType(ctx context.Context, arg models.ListActivitiesByTypeParams) ([]models.Activity, error)
	SoftDeleteActivity(ctx context.Context, id string) error
	UpdateActivityStatus(ctx context.Context, arg models.UpdateActivityStatusParams) (models.Activity, error)
}

func NewQueries(q models.Querier) Queries {
	return &queries{Querier: q}
}

type queries struct {
	models.Querier
}
