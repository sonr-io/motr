package types

type DepositOptions struct {
	Address        string
	Amount         float64
	Memo           string
	ConversionRate float64
	Fee            float64
	Expiry         int64
	Ledger         string
	Account        string
	ChainID        string
	Base           string
}
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
