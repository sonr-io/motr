package identity

import (
	"context"
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/identity/controller"
	"github.com/onsonr/motr/x/identity/model"
)

type Model = *model.Queries

func InitTables(db *sql.DB) (Model, error) {
	if _, err := db.ExecContext(context.Background(), model.Schema); err != nil {
		return nil, err
	}
	return model.New(db), nil
}

func RegisterRoutes(e *echo.Echo, m Model, mdws ...echo.MiddlewareFunc) {
	controller.HandleAccounts(e.Group("/account"), m)
	controller.HandleCredentials(e.Group("/credential"), m)
	controller.HandleDevices(e.Group("/device"), m)
}
