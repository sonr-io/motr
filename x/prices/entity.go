package prices

import (
	"github.com/a-h/templ"
	models "github.com/sonr-io/motr/internal/sink/network"
)

type PriceEntity interface {
	GetModel() models.Price
	GetCard() templ.Component
}

type PricesEntity interface {
	GetModels() []models.Price
	GetList() templ.Component
}
