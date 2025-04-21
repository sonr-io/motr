package handlers

import "github.com/sonr-io/motr/sink/models"

type Handler struct {
	Querier models.Querier
}

func New(q models.Querier) *Handler {
	return &Handler{Querier: q}
}
