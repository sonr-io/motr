package user

import (
	"context"
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/user/controller"
	"github.com/onsonr/motr/x/user/model"
)

type Model = *model.Queries

func InitTables(db *sql.DB) (Model, error) {
	if _, err := db.ExecContext(context.Background(), model.Schema); err != nil {
		return nil, err
	}
	return model.New(db), nil
}

func RegisterRoutes(e *echo.Echo, m Model, mdws ...echo.MiddlewareFunc) {
	controller.HandleProfiles(e.Group("/profiles"), m)
	controller.HandleSessions(e.Group("/sessions"), m)
	controller.HandleVault(e.Group("/vault"), m)
}
