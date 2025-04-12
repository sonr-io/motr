package identity

import (
	"context"
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/identity/model"
	"github.com/onsonr/motr/x/identity/view"
)

type Model = *model.Queries

func InitTables(db *sql.DB) (Model, error) {
	if _, err := db.ExecContext(context.Background(), model.Schema); err != nil {
		return nil, err
	}
	return model.New(db), nil
}

func RegisterRoutes(e *echo.Echo, m Model, mdws ...echo.MiddlewareFunc) {
	// API Routes
	// g := e.Group("/api/identity/v1")
	// controller.HandleAccounts(g, m)
	// controller.HandleCredentials(g, m)
	// controller.HandleDevices(g, m)

	// View Routes
	e.GET("/authorize", view.HandleView)
	e.GET("/login", view.HandleView)
	e.GET("/register", view.HandleView)
}
