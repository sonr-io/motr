//go:build js && wasm
// +build js,wasm

package portfolio

import (
	"context"
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/portfolio/controller"
	"github.com/onsonr/motr/x/portfolio/model"
	"github.com/onsonr/motr/x/portfolio/view"
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
	g := e.Group("/api/portfolio/v1")
	controller.HandleAssets(g, m)
	controller.HandleBalances(g, m)
	controller.HandleChains(g, m)

	// View Routes
	e.GET("/allocation", view.HandleView)
	e.GET("/market", view.HandleView)
	e.GET("/transactions", view.HandleView)
}
