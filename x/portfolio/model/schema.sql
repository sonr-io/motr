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

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_chain_id ON assets(chain_id);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);


-- Balances track asset holdings for accounts
CREATE TABLE balances (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    account_id TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    amount TEXT NOT NULL, -- Stored as string to handle large decimal numbers precisely
    last_updated_height INTEGER NOT NULL DEFAULT 0,
    is_delegated BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_delegated IN (0,1)),
    is_staked BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_staked IN (0,1)),
    is_vesting BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_vesting IN (0,1)),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(account_id, asset_id)
);

CREATE INDEX idx_balances_account_id ON balances(account_id);
CREATE INDEX idx_balances_asset_id ON balances(asset_id);
CREATE INDEX idx_balances_deleted_at ON balances(deleted_at);

-- Chains table following Cosmos chain registry specification
CREATE TABLE chains (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    chain_id TEXT NOT NULL UNIQUE,
    chain_name TEXT NOT NULL,
    pretty_name TEXT NOT NULL,
    network_type TEXT NOT NULL, -- mainnet, testnet, devnet
    bech32_prefix TEXT NOT NULL,
    daemon_name TEXT NOT NULL,
    node_home TEXT NOT NULL,
    slip44 INTEGER NOT NULL,
    fees TEXT NOT NULL, -- JSON structure for fee information
    staking_denom TEXT NOT NULL,
    logo_uri TEXT,
    apis TEXT NOT NULL, -- JSON structure for API endpoints (rpc, rest, grpc)
    explorers TEXT, -- JSON structure for block explorers
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE CHECK(is_enabled IN (0,1)),
    status TEXT NOT NULL DEFAULT 'live', -- live, upcoming, killed
    codebase TEXT -- JSON structure for GitHub repos, etc.
);

CREATE INDEX idx_chains_chain_id ON chains(chain_id);
CREATE INDEX idx_chains_network_type ON chains(network_type);
CREATE INDEX idx_chains_deleted_at ON chains(deleted_at);
CREATE INDEX idx_chains_is_enabled ON chains(is_enabled);

