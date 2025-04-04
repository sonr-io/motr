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

-- Indexes for common queries
CREATE INDEX idx_profiles_handle ON profiles(handle);
CREATE INDEX idx_profiles_address ON profiles(address);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at);

-- Sessions track user authentication state
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    browser_name TEXT NOT NULL,
    browser_version TEXT NOT NULL,
    client_ipaddr TEXT NOT NULL,
    platform TEXT NOT NULL,
    is_desktop BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_desktop IN (0,1)),
    is_mobile BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_mobile IN (0,1)), 
    is_tablet BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_tablet IN (0,1)),
    is_tv BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_tv IN (0,1)),
    is_bot BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_bot IN (0,1)),
    challenge TEXT NOT NULL,
    is_human_first BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_human_first IN (0,1)),
    is_human_last BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_human_last IN (0,1)),
    profile_id INTEGER NOT NULL
);

CREATE INDEX idx_sessions_profile_id ON sessions(profile_id);
CREATE INDEX idx_sessions_client_ipaddr ON sessions(client_ipaddr);
CREATE INDEX idx_sessions_deleted_at ON sessions(deleted_at);


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
