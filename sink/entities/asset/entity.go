package asset

import "github.com/sonr-io/motr/sink/models"

type AssetEntity interface {
	GetModel() *models.Asset
}
