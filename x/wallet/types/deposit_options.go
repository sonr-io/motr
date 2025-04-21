package options

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
