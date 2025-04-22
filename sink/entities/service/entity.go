package service

import (
	"github.com/a-h/templ"
	"github.com/sonr-io/motr/sink/models"
)

type ServiceEntity interface {
	GetModel() models.Service
	GetCard() templ.Component
}

type ServicesEntity interface {
	GetModels() []models.Service
	GetList() templ.Component
}
