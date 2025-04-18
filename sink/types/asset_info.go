package types

type AssetInfo struct {
	Ticker    string
	Name      string
	IsDefault bool
	Icon      Icon
}

type Coin struct {
	Ticker    string
	Name      string
	IsDefault bool
}
