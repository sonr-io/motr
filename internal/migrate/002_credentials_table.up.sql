-- Credentials store WebAuthn credentials
CREATE TABLE credentials (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    handle TEXT NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    authenticator_attachment TEXT NOT NULL,
    origin TEXT NOT NULL,
    type TEXT NOT NULL,
    transports TEXT NOT NULL
);

CREATE INDEX idx_credentials_handle ON credentials(handle);
CREATE INDEX idx_credentials_origin ON credentials(origin);
CREATE INDEX idx_credentials_deleted_at ON credentials(deleted_at);


