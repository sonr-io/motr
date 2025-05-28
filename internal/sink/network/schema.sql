-- Assets represent tokens and coins
CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    decimals INTEGER NOT NULL CHECK(decimals >= 0),
    chain_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    coingecko_id TEXT,
    UNIQUE(chain_id, symbol)
);

-- Prices entity based on the Alternative.me API for crypto prices
CREATE TABLE prices (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    asset_id TEXT NOT NULL,
    price_usd REAL,
    price_btc REAL,
    volume_24h_usd REAL,
    market_cap_usd REAL,
    available_supply REAL,
    total_supply REAL,
    max_supply REAL,
    percent_change_1h REAL,
    percent_change_24h REAL,
    percent_change_7d REAL,
    rank INTEGER,
    last_updated TIMESTAMP NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Currency conversion rates for crypto prices
CREATE TABLE price_conversions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    price_id TEXT NOT NULL,
    currency_code TEXT NOT NULL,
    price REAL,
    volume_24h REAL,
    market_cap REAL,
    last_updated TIMESTAMP NOT NULL,
    FOREIGN KEY (price_id) REFERENCES prices(id),
    UNIQUE(price_id, currency_code)
);

-- Global market data from Alternative.me API
CREATE TABLE global_market (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    total_market_cap_usd REAL,
    total_24h_volume_usd REAL,
    bitcoin_percentage_of_market_cap REAL,
    active_currencies INTEGER,
    active_assets INTEGER,
    active_markets INTEGER,
    last_updated TIMESTAMP NOT NULL
);

-- Fear and Greed Index data from Alternative.me
CREATE TABLE fear_greed_index (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    value INTEGER NOT NULL,
    value_classification TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    time_until_update TEXT
);

-- Listings data from Alternative.me API
CREATE TABLE crypto_listings (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    api_id TEXT NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    website_slug TEXT NOT NULL,
    UNIQUE(api_id)
);

-- Blockchains table to store chain configuration parameters
CREATE TABLE blockchains (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Basic chain information
    chain_name TEXT NOT NULL,
    chain_id_cosmos TEXT,
    chain_id_evm TEXT,
    api_name TEXT,
    bech_account_prefix TEXT,
    bech_validator_prefix TEXT,
    
    -- Chain assets
    main_asset_symbol TEXT,
    main_asset_denom TEXT,
    staking_asset_symbol TEXT,
    staking_asset_denom TEXT,
    is_stake_enabled BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_stake_enabled IN (0,1)),
    
    -- Chain images
    chain_image TEXT,
    main_asset_image TEXT,
    staking_asset_image TEXT,
    
    -- Chain types and features
    chain_type TEXT NOT NULL CHECK(json_valid(chain_type)),
    is_support_mobile_wallet BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_support_mobile_wallet IN (0,1)),
    is_support_extension_wallet BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_support_extension_wallet IN (0,1)),
    is_support_erc20 BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_support_erc20 IN (0,1)),
    
    -- Descriptions in multiple languages
    description_en TEXT,
    description_ko TEXT,
    description_ja TEXT,
    
    -- Genesis information
    origin_genesis_time TIMESTAMP,
    
    -- Account types configuration
    account_type TEXT NOT NULL CHECK(json_valid(account_type)),
    
    -- BTC staking specific
    btc_staking TEXT CHECK(json_valid(btc_staking)),
    
    -- Cosmos fee information
    cosmos_fee_info TEXT CHECK(json_valid(cosmos_fee_info)),
    
    -- EVM fee information
    evm_fee_info TEXT CHECK(json_valid(evm_fee_info)),
    
    -- Endpoints
    lcd_endpoint TEXT CHECK(json_valid(lcd_endpoint)),
    grpc_endpoint TEXT CHECK(json_valid(grpc_endpoint)),
    evm_rpc_endpoint TEXT CHECK(json_valid(evm_rpc_endpoint)),
    
    -- Explorer information
    explorer TEXT CHECK(json_valid(explorer)),
    
    -- Social and documentation links
    about TEXT CHECK(json_valid(about)),
    forum TEXT CHECK(json_valid(forum))
);

-- Add all necessary indexes
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_chain_id ON assets(chain_id);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);

CREATE INDEX idx_prices_asset_id ON prices(asset_id);
CREATE INDEX idx_prices_rank ON prices(rank);
CREATE INDEX idx_prices_last_updated ON prices(last_updated);
CREATE INDEX idx_prices_deleted_at ON prices(deleted_at);

CREATE INDEX idx_price_conversions_price_id ON price_conversions(price_id);
CREATE INDEX idx_price_conversions_currency_code ON price_conversions(currency_code);
CREATE INDEX idx_price_conversions_deleted_at ON price_conversions(deleted_at);

CREATE INDEX idx_global_market_last_updated ON global_market(last_updated);
CREATE INDEX idx_global_market_deleted_at ON global_market(deleted_at);

CREATE INDEX idx_fear_greed_index_timestamp ON fear_greed_index(timestamp);
CREATE INDEX idx_fear_greed_index_value ON fear_greed_index(value);
CREATE INDEX idx_fear_greed_index_deleted_at ON fear_greed_index(deleted_at);

CREATE INDEX idx_crypto_listings_api_id ON crypto_listings(api_id);
CREATE INDEX idx_crypto_listings_symbol ON crypto_listings(symbol);
CREATE INDEX idx_crypto_listings_website_slug ON crypto_listings(website_slug);
CREATE INDEX idx_crypto_listings_deleted_at ON crypto_listings(deleted_at);

CREATE INDEX idx_blockchains_chain_name ON blockchains(chain_name);
CREATE INDEX idx_blockchains_chain_id_cosmos ON blockchains(chain_id_cosmos);
CREATE INDEX idx_blockchains_chain_id_evm ON blockchains(chain_id_evm);
CREATE INDEX idx_blockchains_main_asset_symbol ON blockchains(main_asset_symbol);
CREATE INDEX idx_blockchains_deleted_at ON blockchains(deleted_at);
