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

CREATE INDEX idx_prices_asset_id ON prices(asset_id);
CREATE INDEX idx_prices_rank ON prices(rank);
CREATE INDEX idx_prices_last_updated ON prices(last_updated);
CREATE INDEX idx_prices_deleted_at ON prices(deleted_at);


