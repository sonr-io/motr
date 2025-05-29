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

CREATE INDEX idx_global_market_last_updated ON global_market(last_updated);
CREATE INDEX idx_global_market_deleted_at ON global_market(deleted_at);


