
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


