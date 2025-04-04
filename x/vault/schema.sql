-- Vaults store encrypted data
CREATE TABLE vaults (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    handle TEXT NOT NULL,
    origin TEXT NOT NULL,
    address TEXT NOT NULL,
    cid TEXT NOT NULL UNIQUE,
    config TEXT NOT NULL,
    session_id TEXT NOT NULL,
    redirect_uri TEXT NOT NULL
);

CREATE INDEX idx_vaults_handle ON vaults(handle);
CREATE INDEX idx_vaults_session_id ON vaults(session_id);
CREATE INDEX idx_vaults_deleted_at ON vaults(deleted_at);
