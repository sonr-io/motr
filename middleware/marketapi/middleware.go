//go:build js && wasm
// +build js,wasm

package marketapi

import (
	"errors"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/syumai/workers/cloudflare/fetch"
)

const (
	kCryptoAPIURL      = "https://api.alternative.me"
	kCryptoAPIListings = "/v2/listings"
	kCryptoAPITickers  = "/v2/ticker"
	kCryptoAPIGlobal   = "/v2/global"
)

type Context struct {
	echo.Context
	client *fetch.Client
}

func (c *Context) Listings(symbol string) (*ListingsResponse, error) {
	r := c.buildRequest(fmt.Sprintf("%s/%s", kCryptoAPIListings, symbol))
	v := &ListingsResponse{}
	err := c.fetch(r, v)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (c *Context) Ticker(symbol string) (*TickersResponse, error) {
	r := c.buildRequest(fmt.Sprintf("%s/%s", kCryptoAPITickers, symbol))
	v := &TickersResponse{}
	err := c.fetch(r, v)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (c *Context) GlobalMarket() (*GlobalMarketResponse, error) {
	r := c.buildRequest(kCryptoAPIGlobal)
	v := &GlobalMarketResponse{}
	err := c.fetch(r, v)
	if err != nil {
		return nil, err
	}
	return v, nil
}

// Middleware is a middleware that adds a new key to the context
func Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		f := fetch.NewClient()
		return func(c echo.Context) error {
			ctx := &Context{
				Context: c,
				client:  f,
			}
			return next(ctx)
		}
	}
}

// Unwrap unwraps the session context
func Unwrap(c echo.Context) (*Context, error) {
	cc := c.(*Context)
	if cc == nil {
		return nil, errors.New("failed to unwrap session context")
	}
	return cc, nil
}
