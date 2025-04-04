-- name: InsertCredential :one
INSERT INTO credentials (
    handle,
    credential_id,
    origin,
    type,
    transports
) VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: InsertProfile :one
INSERT INTO profiles (
    address,
    handle,
    origin,
    name
) VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetProfileByID :one
SELECT * FROM profiles
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetProfileByAddress :one
SELECT * FROM profiles
WHERE address = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetChallengeBySessionID :one
SELECT challenge FROM sessions
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetHumanVerificationNumbers :one
SELECT is_human_first, is_human_last FROM sessions
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetSessionByID :one
SELECT * FROM sessions
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetSessionByClientIP :one
SELECT * FROM sessions
WHERE client_ipaddr = ? AND deleted_at IS NULL
LIMIT 1;

-- name: UpdateSessionHumanVerification :one
UPDATE sessions
SET 
    is_human_first = ?,
    is_human_last = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: UpdateSessionWithProfileID :one
UPDATE sessions
SET 
    profile_id = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: CheckHandleExists :one
SELECT COUNT(*) > 0 as handle_exists FROM profiles 
WHERE handle = ? 
AND deleted_at IS NULL;

-- name: GetCredentialsByHandle :many
SELECT * FROM credentials
WHERE handle = ?
AND deleted_at IS NULL;

-- name: GetCredentialByID :one
SELECT * FROM credentials
WHERE credential_id = ?
AND deleted_at IS NULL
LIMIT 1;

-- name: SoftDeleteCredential :exec
UPDATE credentials
SET deleted_at = CURRENT_TIMESTAMP
WHERE credential_id = ?;

-- name: SoftDeleteProfile :exec
UPDATE profiles
SET deleted_at = CURRENT_TIMESTAMP
WHERE address = ?;

-- name: UpdateProfile :one
UPDATE profiles
SET 
    name = ?,
    handle = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE address = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: GetProfileByHandle :one
SELECT * FROM profiles
WHERE handle = ? 
AND deleted_at IS NULL
LIMIT 1;

-- name: GetVaultConfigByCID :one
SELECT * FROM vaults
WHERE cid = ? 
AND deleted_at IS NULL
LIMIT 1;

-- name: GetVaultRedirectURIBySessionID :one
SELECT redirect_uri FROM vaults
WHERE session_id = ? 
AND deleted_at IS NULL
LIMIT 1;

-- name: CreateSession :one
INSERT INTO sessions (
    id,
    browser_name,
    browser_version,
    client_ipaddr,
    platform,
    is_desktop,
    is_mobile,
    is_tablet,
    is_tv,
    is_bot,
    challenge,
    is_human_first,
    is_human_last,
    profile_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
RETURNING *;

-- Balance table methods
-- name: CreateBalance :one
INSERT INTO balances (
    id,
    account_id,
    asset_id,
    amount,
    last_updated_height,
    is_delegated,
    is_staked,
    is_vesting
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetBalanceByID :one
SELECT * FROM balances
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetBalanceByAccountAndAsset :one
SELECT * FROM balances
WHERE account_id = ? AND asset_id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListBalancesByAccount :many
SELECT * FROM balances
WHERE account_id = ? AND deleted_at IS NULL
ORDER BY asset_id;

-- name: UpdateBalance :one
UPDATE balances
SET 
    amount = ?,
    last_updated_height = ?,
    is_delegated = ?,
    is_staked = ?,
    is_vesting = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteBalance :exec
UPDATE balances
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Device table methods
-- name: CreateDevice :one
INSERT INTO devices (
    id,
    profile_id,
    credential_id,
    name,
    device_type,
    os_name,
    os_version,
    browser_name,
    browser_version,
    is_trusted,
    is_current,
    fingerprint,
    user_agent,
    ip_address
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetDeviceByID :one
SELECT * FROM devices
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetDeviceByFingerprint :one
SELECT * FROM devices
WHERE profile_id = ? AND fingerprint = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListDevicesByProfile :many
SELECT * FROM devices
WHERE profile_id = ? AND deleted_at IS NULL
ORDER BY last_used_at DESC;

-- name: GetTrustedDevicesByProfile :many
SELECT * FROM devices
WHERE profile_id = ? AND is_trusted = true AND deleted_at IS NULL
ORDER BY last_used_at DESC;

-- name: UpdateDevice :one
UPDATE devices
SET 
    name = ?,
    is_trusted = ?,
    is_current = ?,
    last_used_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: UpdateDeviceLastUsed :one
UPDATE devices
SET 
    last_used_at = CURRENT_TIMESTAMP,
    ip_address = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteDevice :exec
UPDATE devices
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Additional credential methods for better integration with devices
-- name: UpdateCredential :one
UPDATE credentials
SET 
    authenticator_attachment = ?,
    transports = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE credential_id = ? AND deleted_at IS NULL
RETURNING *;

-- name: GetCredentialsByProfile :many
SELECT c.* FROM credentials c
JOIN devices d ON c.credential_id = d.credential_id
WHERE d.profile_id = ? AND c.deleted_at IS NULL AND d.deleted_at IS NULL;
