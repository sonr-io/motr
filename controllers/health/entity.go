package health

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/internal/sink/models"
)

type HealthEntity interface {
	GetModel() models.Health
	GetCard() templ.Component
}

type HealthsEntity interface {
	GetModels() []models.Health
	GetList() templ.Component
}
