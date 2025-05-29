-- Service for Service Records sourced on chain
CREATE TABLE services (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    name TEXT NOT NULL,
    description TEXT,
    chain_id TEXT NOT NULL,
    address TEXT NOT NULL,
    owner_address TEXT NOT NULL,
    metadata TEXT CHECK(json_valid(metadata)),
    status TEXT NOT NULL,
    block_height INTEGER NOT NULL,
    FOREIGN KEY (chain_id) REFERENCES assets(chain_id),
    UNIQUE(chain_id, address)
);

CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_chain_id ON services(chain_id);
CREATE INDEX idx_services_address ON services(address);
CREATE INDEX idx_services_owner_address ON services(owner_address);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);
