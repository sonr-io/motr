package asset

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type AssetEntity interface {
	GetModel() *models.Asset
	GetCard(ticker, price string) templ.Component
}

type AssetsEntity interface {
	GetModels() []*models.Asset
	GetList() templ.Component
	GetDropdown() templ.Component
}
