package activity

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/pkg/models"
)

type ActivityEntity interface {
	GetModel() models.Activity
	GetCard() templ.Component
}

type ActivitiesEntity interface {
	GetModels() []models.Activity
	GetList() templ.Component
}
