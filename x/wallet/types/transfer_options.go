package options

type TransferOptions struct {
	AssetID        string
	Amount         float64
	Sender         string
	Receiver       string
	Memo           string
	Fee            float64
	Expiry         int64
	Nonce          int64
	ChainID        string
	Channel        string
	AssetType      string
	CoingeckoID    string
	Controller     string
	IsSubsidiary   bool
	IsValidator    bool
	IsDelegator    bool
	IsAccountable  bool
	IsTransferable bool
	IsBurnable     bool
	IsMintable     bool
	IsUpgradeable  bool
	IsRebasable    bool
}
