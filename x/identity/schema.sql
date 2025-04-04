-- Accounts represent blockchain accounts
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    number INTEGER NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 0,
    address TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    chain_id TEXT NOT NULL,
    controller TEXT NOT NULL,
    is_subsidiary BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_subsidiary IN (0,1)),
    is_validator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_validator IN (0,1)),
    is_delegator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_delegator IN (0,1)),
    is_accountable BOOLEAN NOT NULL DEFAULT TRUE CHECK(is_accountable IN (0,1))
);

CREATE INDEX idx_accounts_address ON accounts(address);
CREATE INDEX idx_accounts_chain_id ON accounts(chain_id);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);



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

-- Devices link profiles to their authenticated devices
CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    profile_id TEXT NOT NULL,
    credential_id TEXT NOT NULL,
    name TEXT NOT NULL,                   -- User-friendly device name
    device_type TEXT NOT NULL,            -- mobile, desktop, tablet, etc.
    os_name TEXT NOT NULL,                -- iOS, Android, Windows, macOS, etc.
    os_version TEXT NOT NULL,             -- OS version string
    browser_name TEXT,                    -- Browser name if applicable
    browser_version TEXT,                 -- Browser version if applicable
    last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_trusted BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_trusted IN (0,1)),
    is_current BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_current IN (0,1)),
    fingerprint TEXT NOT NULL,            -- Device fingerprint for additional verification
    user_agent TEXT,                      -- Full user agent string
    ip_address TEXT,                      -- Last known IP address
    FOREIGN KEY (profile_id) REFERENCES profiles(id),
    FOREIGN KEY (credential_id) REFERENCES credentials(id),
    UNIQUE(profile_id, fingerprint)
);

CREATE INDEX idx_devices_profile_id ON devices(profile_id);
CREATE INDEX idx_devices_credential_id ON devices(credential_id);
CREATE INDEX idx_devices_is_trusted ON devices(is_trusted);
CREATE INDEX idx_devices_last_used_at ON devices(last_used_at);
CREATE INDEX idx_devices_deleted_at ON devices(deleted_at);
