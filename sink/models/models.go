// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package models

import (
	"database/sql"
	"time"
)

type Account struct {
	ID            string       `json:"id"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
	DeletedAt     sql.NullTime `json:"deleted_at"`
	Number        int64        `json:"number"`
	Sequence      int64        `json:"sequence"`
	Address       string       `json:"address"`
	PublicKey     string       `json:"public_key"`
	ChainID       string       `json:"chain_id"`
	BlockCreated  int64        `json:"block_created"`
	Controller    string       `json:"controller"`
	Label         string       `json:"label"`
	Handle        string       `json:"handle"`
	IsSubsidiary  bool         `json:"is_subsidiary"`
	IsValidator   bool         `json:"is_validator"`
	IsDelegator   bool         `json:"is_delegator"`
	IsAccountable bool         `json:"is_accountable"`
}

type Activity struct {
	ID          string         `json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   sql.NullTime   `json:"deleted_at"`
	AccountID   string         `json:"account_id"`
	TxHash      sql.NullString `json:"tx_hash"`
	TxType      string         `json:"tx_type"`
	Status      string         `json:"status"`
	Amount      sql.NullString `json:"amount"`
	Fee         sql.NullString `json:"fee"`
	GasUsed     sql.NullInt64  `json:"gas_used"`
	GasWanted   sql.NullInt64  `json:"gas_wanted"`
	Memo        sql.NullString `json:"memo"`
	BlockHeight sql.NullInt64  `json:"block_height"`
	Timestamp   time.Time      `json:"timestamp"`
	RawLog      sql.NullString `json:"raw_log"`
	Error       sql.NullString `json:"error"`
}

type Asset struct {
	ID          string         `json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   sql.NullTime   `json:"deleted_at"`
	Name        string         `json:"name"`
	Symbol      string         `json:"symbol"`
	Decimals    int64          `json:"decimals"`
	ChainID     string         `json:"chain_id"`
	Channel     string         `json:"channel"`
	AssetType   string         `json:"asset_type"`
	CoingeckoID sql.NullString `json:"coingecko_id"`
}

type Blockchain struct {
	ID                       string         `json:"id"`
	CreatedAt                time.Time      `json:"created_at"`
	UpdatedAt                time.Time      `json:"updated_at"`
	DeletedAt                sql.NullTime   `json:"deleted_at"`
	ChainName                string         `json:"chain_name"`
	ChainIDCosmos            sql.NullString `json:"chain_id_cosmos"`
	ChainIDEvm               sql.NullString `json:"chain_id_evm"`
	ApiName                  sql.NullString `json:"api_name"`
	BechAccountPrefix        sql.NullString `json:"bech_account_prefix"`
	BechValidatorPrefix      sql.NullString `json:"bech_validator_prefix"`
	MainAssetSymbol          sql.NullString `json:"main_asset_symbol"`
	MainAssetDenom           sql.NullString `json:"main_asset_denom"`
	StakingAssetSymbol       sql.NullString `json:"staking_asset_symbol"`
	StakingAssetDenom        sql.NullString `json:"staking_asset_denom"`
	IsStakeEnabled           bool           `json:"is_stake_enabled"`
	ChainImage               sql.NullString `json:"chain_image"`
	MainAssetImage           sql.NullString `json:"main_asset_image"`
	StakingAssetImage        sql.NullString `json:"staking_asset_image"`
	ChainType                string         `json:"chain_type"`
	IsSupportMobileWallet    bool           `json:"is_support_mobile_wallet"`
	IsSupportExtensionWallet bool           `json:"is_support_extension_wallet"`
	IsSupportErc20           bool           `json:"is_support_erc20"`
	DescriptionEn            sql.NullString `json:"description_en"`
	DescriptionKo            sql.NullString `json:"description_ko"`
	DescriptionJa            sql.NullString `json:"description_ja"`
	OriginGenesisTime        sql.NullTime   `json:"origin_genesis_time"`
	AccountType              string         `json:"account_type"`
	BtcStaking               sql.NullString `json:"btc_staking"`
	CosmosFeeInfo            sql.NullString `json:"cosmos_fee_info"`
	EvmFeeInfo               sql.NullString `json:"evm_fee_info"`
	LcdEndpoint              sql.NullString `json:"lcd_endpoint"`
	GrpcEndpoint             sql.NullString `json:"grpc_endpoint"`
	EvmRpcEndpoint           sql.NullString `json:"evm_rpc_endpoint"`
	Explorer                 sql.NullString `json:"explorer"`
	About                    sql.NullString `json:"about"`
	Forum                    sql.NullString `json:"forum"`
}

type Credential struct {
	ID                      string       `json:"id"`
	CreatedAt               time.Time    `json:"created_at"`
	UpdatedAt               time.Time    `json:"updated_at"`
	DeletedAt               sql.NullTime `json:"deleted_at"`
	Handle                  string       `json:"handle"`
	CredentialID            string       `json:"credential_id"`
	AuthenticatorAttachment string       `json:"authenticator_attachment"`
	Origin                  string       `json:"origin"`
	Type                    string       `json:"type"`
	Transports              string       `json:"transports"`
}

type CryptoListing struct {
	ID          string       `json:"id"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	ApiID       string       `json:"api_id"`
	Name        string       `json:"name"`
	Symbol      string       `json:"symbol"`
	WebsiteSlug string       `json:"website_slug"`
}

type FearGreedIndex struct {
	ID                  string         `json:"id"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           sql.NullTime   `json:"deleted_at"`
	Value               int64          `json:"value"`
	ValueClassification string         `json:"value_classification"`
	Timestamp           time.Time      `json:"timestamp"`
	TimeUntilUpdate     sql.NullString `json:"time_until_update"`
}

type GlobalMarket struct {
	ID                           string          `json:"id"`
	CreatedAt                    time.Time       `json:"created_at"`
	UpdatedAt                    time.Time       `json:"updated_at"`
	DeletedAt                    sql.NullTime    `json:"deleted_at"`
	TotalMarketCapUsd            sql.NullFloat64 `json:"total_market_cap_usd"`
	Total24hVolumeUsd            sql.NullFloat64 `json:"total_24h_volume_usd"`
	BitcoinPercentageOfMarketCap sql.NullFloat64 `json:"bitcoin_percentage_of_market_cap"`
	ActiveCurrencies             sql.NullInt64   `json:"active_currencies"`
	ActiveAssets                 sql.NullInt64   `json:"active_assets"`
	ActiveMarkets                sql.NullInt64   `json:"active_markets"`
	LastUpdated                  time.Time       `json:"last_updated"`
}

type Health struct {
	ID             string         `json:"id"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      sql.NullTime   `json:"deleted_at"`
	EndpointUrl    string         `json:"endpoint_url"`
	EndpointType   string         `json:"endpoint_type"`
	ChainID        sql.NullString `json:"chain_id"`
	Status         string         `json:"status"`
	ResponseTimeMs sql.NullInt64  `json:"response_time_ms"`
	LastChecked    time.Time      `json:"last_checked"`
	NextCheck      sql.NullTime   `json:"next_check"`
	FailureCount   int64          `json:"failure_count"`
	SuccessCount   int64          `json:"success_count"`
	ResponseData   sql.NullString `json:"response_data"`
	ErrorMessage   sql.NullString `json:"error_message"`
}

type Price struct {
	ID               string          `json:"id"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        sql.NullTime    `json:"deleted_at"`
	AssetID          string          `json:"asset_id"`
	PriceUsd         sql.NullFloat64 `json:"price_usd"`
	PriceBtc         sql.NullFloat64 `json:"price_btc"`
	Volume24hUsd     sql.NullFloat64 `json:"volume_24h_usd"`
	MarketCapUsd     sql.NullFloat64 `json:"market_cap_usd"`
	AvailableSupply  sql.NullFloat64 `json:"available_supply"`
	TotalSupply      sql.NullFloat64 `json:"total_supply"`
	MaxSupply        sql.NullFloat64 `json:"max_supply"`
	PercentChange1h  sql.NullFloat64 `json:"percent_change_1h"`
	PercentChange24h sql.NullFloat64 `json:"percent_change_24h"`
	PercentChange7d  sql.NullFloat64 `json:"percent_change_7d"`
	Rank             sql.NullInt64   `json:"rank"`
	LastUpdated      time.Time       `json:"last_updated"`
}

type PriceConversion struct {
	ID           string          `json:"id"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	DeletedAt    sql.NullTime    `json:"deleted_at"`
	PriceID      string          `json:"price_id"`
	CurrencyCode string          `json:"currency_code"`
	Price        sql.NullFloat64 `json:"price"`
	Volume24h    sql.NullFloat64 `json:"volume_24h"`
	MarketCap    sql.NullFloat64 `json:"market_cap"`
	LastUpdated  time.Time       `json:"last_updated"`
}

type Profile struct {
	ID        string       `json:"id"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	DeletedAt sql.NullTime `json:"deleted_at"`
	Address   string       `json:"address"`
	Handle    string       `json:"handle"`
	Origin    string       `json:"origin"`
	Name      string       `json:"name"`
}

type Service struct {
	ID           string         `json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    sql.NullTime   `json:"deleted_at"`
	Name         string         `json:"name"`
	Description  sql.NullString `json:"description"`
	ChainID      string         `json:"chain_id"`
	Address      string         `json:"address"`
	OwnerAddress string         `json:"owner_address"`
	Metadata     sql.NullString `json:"metadata"`
	Status       string         `json:"status"`
	BlockHeight  int64          `json:"block_height"`
}

type Vault struct {
	ID          string       `json:"id"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	DeletedAt   sql.NullTime `json:"deleted_at"`
	Handle      string       `json:"handle"`
	Origin      string       `json:"origin"`
	Address     string       `json:"address"`
	Cid         string       `json:"cid"`
	Config      string       `json:"config"`
	SessionID   string       `json:"session_id"`
	RedirectUri string       `json:"redirect_uri"`
}
