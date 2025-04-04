//go:build js && wasm
// +build js,wasm

package user

import (
	"context"
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/user/model"
	"github.com/onsonr/motr/x/user/view"
)

type Model = *model.Queries

func InitTables(db *sql.DB) (Model, error) {
	if _, err := db.ExecContext(context.Background(), model.Schema); err != nil {
		return nil, err
	}
	return model.New(db), nil
}

func RegisterRoutes(e *echo.Echo, m Model, mdws ...echo.MiddlewareFunc) {
	// // API Routes
	// g := e.Group("/api/user/v1")
	// controller.HandleProfiles(g, m)
	// controller.HandleSessions(g, m)
	// controller.HandleVault(g, m)
	//
	// View Routes
	e.GET("/dashboard", view.HandleView)
	e.GET("/settings", view.HandleView)
	e.GET("/wallet", view.HandleView)
}
