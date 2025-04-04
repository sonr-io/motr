-- name: CreateAccount :one
INSERT INTO accounts (
    id,
    number,
    sequence,
    address,
    public_key,
    chain_id,
    controller,
    is_subsidiary,
    is_validator,
    is_delegator,
    is_accountable
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetAccountByID :one
SELECT * FROM accounts
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountByAddress :one
SELECT * FROM accounts
WHERE address = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountsByChainID :many
SELECT * FROM accounts
WHERE chain_id = ? AND deleted_at IS NULL
ORDER BY number;

-- name: ListAccounts :many
SELECT * FROM accounts
WHERE deleted_at IS NULL
ORDER BY chain_id, number;

-- name: UpdateAccountSequence :one
UPDATE accounts
SET 
    sequence = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: UpdateAccount :one
UPDATE accounts
SET 
    public_key = ?,
    controller = ?,
    is_subsidiary = ?,
    is_validator = ?,
    is_delegator = ?, 
    is_accountable = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteAccount :exec
UPDATE accounts
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetAccountsByController :many
SELECT * FROM accounts
WHERE controller = ? AND deleted_at IS NULL
ORDER BY chain_id, number;

-- name: GetValidatorAccounts :many
SELECT * FROM accounts
WHERE is_validator = true AND deleted_at IS NULL
ORDER BY chain_id, number;

-- name: GetDelegatorAccounts :many
SELECT * FROM accounts
WHERE is_delegator = true AND deleted_at IS NULL
ORDER BY chain_id, number;

-- name: InsertCredential :one
INSERT INTO credentials (
    handle,
    credential_id,
    origin,
    type,
    transports
) VALUES (?, ?, ?, ?, ?)
RETURNING *;

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
