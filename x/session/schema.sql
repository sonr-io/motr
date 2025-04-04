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


