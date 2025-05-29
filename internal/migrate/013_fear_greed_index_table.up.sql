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

CREATE INDEX idx_fear_greed_index_timestamp ON fear_greed_index(timestamp);
CREATE INDEX idx_fear_greed_index_value ON fear_greed_index(value);
CREATE INDEX idx_fear_greed_index_deleted_at ON fear_greed_index(deleted_at);
