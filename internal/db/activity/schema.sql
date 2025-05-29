
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


CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_chain_id ON services(chain_id);
CREATE INDEX idx_services_address ON services(address);
CREATE INDEX idx_services_owner_address ON services(owner_address);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);

CREATE INDEX idx_activities_account_id ON activities(account_id);
CREATE INDEX idx_activities_tx_hash ON activities(tx_hash);
CREATE INDEX idx_activities_tx_type ON activities(tx_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);
CREATE INDEX idx_activities_block_height ON activities(block_height);
CREATE INDEX idx_activities_deleted_at ON activities(deleted_at);

CREATE INDEX idx_health_endpoint_url ON health(endpoint_url);
CREATE INDEX idx_health_endpoint_type ON health(endpoint_type);
CREATE INDEX idx_health_chain_id ON health(chain_id);
CREATE INDEX idx_health_status ON health(status);
CREATE INDEX idx_health_last_checked ON health(last_checked);
CREATE INDEX idx_health_next_check ON health(next_check);
CREATE INDEX idx_health_deleted_at ON health(deleted_at);

CREATE INDEX idx_global_market_last_updated ON global_market(last_updated);
CREATE INDEX idx_global_market_deleted_at ON global_market(deleted_at);

CREATE INDEX idx_fear_greed_index_timestamp ON fear_greed_index(timestamp);
CREATE INDEX idx_fear_greed_index_value ON fear_greed_index(value);
CREATE INDEX idx_fear_greed_index_deleted_at ON fear_greed_index(deleted_at);

CREATE INDEX idx_crypto_listings_api_id ON crypto_listings(api_id);
CREATE INDEX idx_crypto_listings_symbol ON crypto_listings(symbol);
CREATE INDEX idx_crypto_listings_website_slug ON crypto_listings(website_slug);
CREATE INDEX idx_crypto_listings_deleted_at ON crypto_listings(deleted_at);
