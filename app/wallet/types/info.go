package types

type AssetInfo struct {
	Ticker    string
	Name      string
	IsDefault bool
}

type CoinInfo struct {
	Ticker    string
	Name      string
	IsDefault bool
}

type ChainInfo struct {
	Name string
	ID   string
}
