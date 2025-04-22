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

-- Credentials store WebAuthn credentials
CREATE TABLE credentials (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    handle TEXT NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    authenticator_attachment TEXT NOT NULL,
    origin TEXT NOT NULL,
    type TEXT NOT NULL,
    transports TEXT NOT NULL
);

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_chain_id ON assets(chain_id);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);

CREATE INDEX idx_credentials_handle ON credentials(handle);
CREATE INDEX idx_credentials_origin ON credentials(origin);
CREATE INDEX idx_credentials_deleted_at ON credentials(deleted_at);

-- Accounts represent blockchain accounts
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    number INTEGER NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 0,
    address TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL CHECK(json_valid(public_key)),
    chain_id TEXT NOT NULL,
    block_created INTEGER NOT NULL,
    controller TEXT NOT NULL,
    label TEXT NOT NULL,
    handle TEXT NOT NULL,
    is_subsidiary BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_subsidiary IN (0,1)),
    is_validator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_validator IN (0,1)),
    is_delegator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_delegator IN (0,1)),
    is_accountable BOOLEAN NOT NULL DEFAULT TRUE CHECK(is_accountable IN (0,1))
);

-- Indexes for common queries
CREATE INDEX idx_accounts_address ON accounts(address);
CREATE INDEX idx_accounts_chain_id ON accounts(chain_id);
CREATE INDEX idx_accounts_block_created ON accounts(block_created);
CREATE INDEX idx_accounts_label ON accounts(label);
CREATE INDEX idx_accounts_handle ON accounts(handle);
CREATE INDEX idx_accounts_controller ON accounts(controller);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);

-- Profiles represent user identities
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    address TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    origin TEXT NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(address, origin)
);

-- Vaults store encrypted data
CREATE TABLE vaults (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    handle TEXT NOT NULL,
    origin TEXT NOT NULL,
    address TEXT NOT NULL,
    cid TEXT NOT NULL UNIQUE,
    config TEXT NOT NULL CHECK(json_valid(config)),
    session_id TEXT NOT NULL,
    redirect_uri TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_profiles_handle ON profiles(handle);
CREATE INDEX idx_profiles_address ON profiles(address);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at);

CREATE INDEX idx_vaults_handle ON vaults(handle);
CREATE INDEX idx_vaults_session_id ON vaults(session_id);
CREATE INDEX idx_vaults_deleted_at ON vaults(deleted_at);

-- NEW TABLES BELOW

-- Prices entity based on the free api for crypto prices from alternativeto.me
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
    percent_change_1h REAL,
    percent_change_24h REAL,
    percent_change_7d REAL,
    last_updated TIMESTAMP NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE INDEX idx_prices_asset_id ON prices(asset_id);
CREATE INDEX idx_prices_last_updated ON prices(last_updated);
CREATE INDEX idx_prices_deleted_at ON prices(deleted_at);

-- Service for Service Records sourced on chain
CREATE TABLE services (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    name TEXT NOT NULL,
    description TEXT,
    chain_id TEXT NOT NULL,
    address TEXT NOT NULL,
    owner_address TEXT NOT NULL,
    metadata TEXT CHECK(json_valid(metadata)),
    status TEXT NOT NULL,
    block_height INTEGER NOT NULL,
    FOREIGN KEY (chain_id) REFERENCES assets(chain_id),
    UNIQUE(chain_id, address)
);

CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_chain_id ON services(chain_id);
CREATE INDEX idx_services_address ON services(address);
CREATE INDEX idx_services_owner_address ON services(owner_address);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);

-- Activity table for basic transaction broadcast activity
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    account_id TEXT NOT NULL,
    tx_hash TEXT,
    tx_type TEXT NOT NULL,
    status TEXT NOT NULL,
    amount TEXT,
    fee TEXT,
    gas_used INTEGER,
    gas_wanted INTEGER,
    memo TEXT,
    block_height INTEGER,
    timestamp TIMESTAMP NOT NULL,
    raw_log TEXT,
    error TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX idx_activities_account_id ON activities(account_id);
CREATE INDEX idx_activities_tx_hash ON activities(tx_hash);
CREATE INDEX idx_activities_tx_type ON activities(tx_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);
CREATE INDEX idx_activities_block_height ON activities(block_height);
CREATE INDEX idx_activities_deleted_at ON activities(deleted_at);

-- Health table for scheduled checks for API endpoints
CREATE TABLE health (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    endpoint_url TEXT NOT NULL,
    endpoint_type TEXT NOT NULL,
    chain_id TEXT,
    status TEXT NOT NULL,
    response_time_ms INTEGER,
    last_checked TIMESTAMP NOT NULL,
    next_check TIMESTAMP,
    failure_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    response_data TEXT,
    error_message TEXT,
    FOREIGN KEY (chain_id) REFERENCES assets(chain_id)
);

CREATE INDEX idx_health_endpoint_url ON health(endpoint_url);
CREATE INDEX idx_health_endpoint_type ON health(endpoint_type);
CREATE INDEX idx_health_chain_id ON health(chain_id);
CREATE INDEX idx_health_status ON health(status);
CREATE INDEX idx_health_last_checked ON health(last_checked);
CREATE INDEX idx_health_next_check ON health(next_check);
CREATE INDEX idx_health_deleted_at ON health(deleted_at);


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

-- Indexes for common queries
CREATE INDEX idx_blockchains_chain_name ON blockchains(chain_name);
CREATE INDEX idx_blockchains_chain_id_cosmos ON blockchains(chain_id_cosmos);
CREATE INDEX idx_blockchains_chain_id_evm ON blockchains(chain_id_evm);
CREATE INDEX idx_blockchains_main_asset_symbol ON blockchains(main_asset_symbol);
CREATE INDEX idx_blockchains_deleted_at ON blockchains(deleted_at);
