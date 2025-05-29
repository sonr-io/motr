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

CREATE INDEX idx_health_endpoint_url ON health(endpoint_url);
CREATE INDEX idx_health_endpoint_type ON health(endpoint_type);
CREATE INDEX idx_health_chain_id ON health(chain_id);
CREATE INDEX idx_health_status ON health(status);
CREATE INDEX idx_health_last_checked ON health(last_checked);
CREATE INDEX idx_health_next_check ON health(next_check);
CREATE INDEX idx_health_deleted_at ON health(deleted_at);

