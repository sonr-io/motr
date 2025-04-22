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

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_chain_id ON assets(chain_id);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);

CREATE INDEX idx_credentials_handle ON credentials(handle);
CREATE INDEX idx_credentials_origin ON credentials(origin);
CREATE INDEX idx_credentials_deleted_at ON credentials(deleted_at);

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
    block_created INTEGER NOT NULL,
    controller TEXT NOT NULL,
    label TEXT NOT NULL,
    is_subsidiary BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_subsidiary IN (0,1)),
    is_validator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_validator IN (0,1)),
    is_delegator BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_delegator IN (0,1)),
    is_accountable BOOLEAN NOT NULL DEFAULT TRUE CHECK(is_accountable IN (0,1))
);

-- Indexes for common queries
CREATE INDEX idx_accounts_address ON accounts(address);
CREATE INDEX idx_accounts_chain_id ON accounts(chain_id);
CREATE INDEX idx_accounts_block_created ON accounts(block_created);
CREATE INDEX idx_accounts_label ON accounts(label);
CREATE INDEX idx_accounts_controller ON accounts(controller);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);

-- Profiles represent user identities
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    address TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    origin TEXT NOT NULL,
    name TEXT NOT NULL,
    UNIQUE(address, origin)
);


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
    config TEXT NOT NULL CHECK(json_valid(config)),
    session_id TEXT NOT NULL,
    redirect_uri TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_profiles_handle ON profiles(handle);
CREATE INDEX idx_profiles_address ON profiles(address);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at);

CREATE INDEX idx_sessions_profile_id ON sessions(profile_id);
CREATE INDEX idx_sessions_client_ipaddr ON sessions(client_ipaddr);
CREATE INDEX idx_sessions_deleted_at ON sessions(deleted_at);

CREATE INDEX idx_vaults_handle ON vaults(handle);
CREATE INDEX idx_vaults_session_id ON vaults(session_id);
CREATE INDEX idx_vaults_deleted_at ON vaults(deleted_at);
