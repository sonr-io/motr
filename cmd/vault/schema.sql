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
    controller TEXT NOT NULL,
    is_subsidiary BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_subsidiary IN (0,1)),
    is_validator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_validator IN (0,1)),
    is_delegator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_delegator IN (0,1)),
    is_accountable BOOLEAN NOT NULL DEFAULT TRUE CHECK(is_accountable IN (0,1))
);

-- Indexes for common queries
CREATE INDEX idx_accounts_address ON accounts(address);
CREATE INDEX idx_accounts_chain_id ON accounts(chain_id);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);

