package info

import "github.com/sonr-io/motr/nebula/types/html"

type AssetInfo struct {
	Ticker    string
	Name      string
	IsDefault bool
	Icon      html.Icon
}
