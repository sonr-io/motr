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


CREATE INDEX idx_crypto_listings_api_id ON crypto_listings(api_id);
CREATE INDEX idx_crypto_listings_symbol ON crypto_listings(symbol);
CREATE INDEX idx_crypto_listings_website_slug ON crypto_listings(website_slug);
CREATE INDEX idx_crypto_listings_deleted_at ON crypto_listings(deleted_at);
