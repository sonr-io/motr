package transfer

type CoinInfo struct {
	Ticker    string
	Name      string
	IsDefault bool
}

var defaultCoins = []CoinInfo{
	{Ticker: "SNR", Name: "Sonr", IsDefault: true},
	{Ticker: "BTC", Name: "Bitcoin", IsDefault: true},
	{Ticker: "ETH", Name: "Ethereum", IsDefault: true},
	{Ticker: "SOL", Name: "Solana", IsDefault: false},
	{Ticker: "LTC", Name: "Litecoin", IsDefault: false},
	{Ticker: "DOGE", Name: "Dogecoin", IsDefault: false},
	{Ticker: "XRP", Name: "Ripple", IsDefault: false},
	{Ticker: "OSMO", Name: "Osmosis", IsDefault: false},
	{Ticker: "ATOM", Name: "Cosmos", IsDefault: false},
	{Ticker: "STARZ", Name: "Stargaze", IsDefault: false},
	{Ticker: "AKT", Name: "Akash", IsDefault: false},
	{Ticker: "EVMOS", Name: "Evmos", IsDefault: false},
	{Ticker: "FIL", Name: "Filecoin", IsDefault: false},
	{Ticker: "AXL", Name: "Axelar", IsDefault: false},
}
