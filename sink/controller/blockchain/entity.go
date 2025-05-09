package blockchain

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
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
