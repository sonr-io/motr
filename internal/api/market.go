//go:build js && wasm
// +build js,wasm

package api

import (
	"context"
	"encoding/json"
	"fmt"
)

const (
	kCryptoAPIURL      = "https://api.alternative.me"
	kCryptoAPIListings = "/v2/listings"
	kCryptoAPITickers  = "/v2/ticker"
	kCryptoAPIGlobal   = "/v2/global"
)

type MarketAPI interface {
	Listings(symbol string) (*ListingsResponse, error)
	Ticker(symbol string) (*TickersResponse, error)
	GlobalMarket() (*GlobalMarketResponse, error)
}

type marketAPI struct {
	client *client
	ctx    context.Context
}

func NewMarketAPI(c *client, ctx context.Context) *marketAPI {
	return &marketAPI{
		client: c,
		ctx:    ctx,
	}
}

func (m *marketAPI) Listings(symbol string) (*ListingsResponse, error) {
	r := buildRequest(m.ctx, fmt.Sprintf("%s/%s", kCryptoAPIListings, symbol))
	v := &ListingsResponse{}
	err := doFetch(m.client.fc, r, v)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (m *marketAPI) Ticker(symbol string) (*TickersResponse, error) {
	r := buildRequest(m.ctx, fmt.Sprintf("%s/%s", kCryptoAPITickers, symbol))
	v := &TickersResponse{}
	err := doFetch(m.client.fc, r, v)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (m *marketAPI) GlobalMarket() (*GlobalMarketResponse, error) {
	r := buildRequest(m.ctx, kCryptoAPIGlobal)
	v := &GlobalMarketResponse{}
	err := doFetch(m.client.fc, r, v)
	if err != nil {
		return nil, err
	}
	return v, nil
}

type ListingsResponse struct {
	Data []struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Symbol      string `json:"symbol"`
		WebsiteSlug string `json:"website_slug"`
	} `json:"data"`
	Metadata struct {
		Timestamp           int `json:"timestamp"`
		NumCryptocurrencies int `json:"num_cryptocurrencies"`
		Error               any `json:"error"`
	} `json:"metadata"`
}

func (r *ListingsResponse) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, r)
}

type TickersResponse struct {
	Data []struct {
		Symbol string `json:"symbol"`
		Price  struct {
			USD float64 `json:"USD"`
		} `json:"price"`
	} `json:"data"`
	Metadata struct {
		Timestamp int `json:"timestamp"`
		Error     any `json:"error"`
	} `json:"metadata"`
}

func (r *TickersResponse) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, r)
}

type GlobalMarketResponse struct {
	Data []struct {
		Symbol string `json:"symbol"`
		Price  struct {
			USD float64 `json:"USD"`
		} `json:"price"`
	} `json:"data"`
	Metadata struct {
		Timestamp int `json:"timestamp"`
		Error     any `json:"error"`
	} `json:"metadata"`
}

func (r *GlobalMarketResponse) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, r)
}
