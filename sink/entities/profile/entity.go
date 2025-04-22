package profile

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type ProfileEntity interface {
	GetModel() *models.Profile
}

type ProfilesEntity interface {
	GetModels() []*models.Profile
	GetList() templ.Component
	GetDropdown() templ.Component
}
