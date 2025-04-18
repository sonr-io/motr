//go:build js && wasm
// +build js,wasm

package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/models/common"
)

type index struct {
	Data *common.Queries
}

func Index(db *common.Queries) *index {
	return &index{
		Data: db,
	}
}

func (i index) Handler(c echo.Context) error {
	return middleware.Render(c, views.DemoView(time.Now()))
}
