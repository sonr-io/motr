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

CREATE INDEX idx_price_conversions_price_id ON price_conversions(price_id);
CREATE INDEX idx_price_conversions_currency_code ON price_conversions(currency_code);
CREATE INDEX idx_price_conversions_deleted_at ON price_conversions(deleted_at);


