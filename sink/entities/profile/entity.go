package profile

import "github.com/sonr-io/motr/sink/models"

type ProfileEntity interface {
	GetModel() *models.Profile
}
