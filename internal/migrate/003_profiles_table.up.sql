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

CREATE INDEX idx_profiles_handle ON profiles(handle);
CREATE INDEX idx_profiles_address ON profiles(address);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at);


