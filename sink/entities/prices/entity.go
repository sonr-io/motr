package prices

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type PriceEntity interface {
	GetModel() *models.Price
	GetCard() templ.Component
}

type PricesEntity interface {
	GetModels() []*models.Price
	GetList() templ.Component
}
