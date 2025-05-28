package blockchain

import (
	"github.com/a-h/templ"
	models "github.com/sonr-io/motr/internal/sink/network"
)

type BlockchainEntity interface {
	GetModel() models.Blockchain
	GetCard(ticker, price string) templ.Component
}

type BlockchainsEntity interface {
	GetModels() []models.Blockchain
	GetList() templ.Component
	GetDropdown() templ.Component
}
