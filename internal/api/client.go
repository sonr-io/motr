//go:build js && wasm
// +build js,wasm

package api

import (
	"context"

	"github.com/syumai/workers/cloudflare/fetch"
)

type Response interface {
	UnmarshalJSON(data []byte) error
}

type Client interface {
	MarketAPI
}

type client struct {
	fc  *fetch.Client
	ctx context.Context
	MarketAPI
}

func NewClient(ctx context.Context) *client {
	fc := fetch.NewClient()
	c := &client{
		fc:  fc,
		ctx: ctx,
	}
	marketAPI := NewMarketAPI(c, ctx)
	c.MarketAPI = marketAPI
	return c
}
