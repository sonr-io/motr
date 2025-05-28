-- PROFILE QUERIES
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

-- name: GetProfileByHandle :one
SELECT * FROM profiles
WHERE handle = ? 
AND deleted_at IS NULL
LIMIT 1;

-- name: CheckHandleExists :one
SELECT COUNT(*) > 0 as handle_exists FROM profiles 
WHERE handle = ? 
AND deleted_at IS NULL;

-- name: UpdateProfile :one
UPDATE profiles
SET 
    name = ?,
    handle = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE address = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteProfile :exec
UPDATE profiles
SET deleted_at = CURRENT_TIMESTAMP
WHERE address = ?;

-- name: ListProfiles :many
SELECT * FROM profiles
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- VAULT QUERIES
-- name: InsertVault :one
INSERT INTO vaults (
    handle,
    origin,
    address,
    cid,
    config,
    session_id,
    redirect_uri
) VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetVaultByID :one
SELECT * FROM vaults
WHERE id = ? 
AND deleted_at IS NULL
LIMIT 1;

-- name: GetVaultsByHandle :many
SELECT * FROM vaults
WHERE handle = ? 
AND deleted_at IS NULL
ORDER BY created_at DESC;

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

-- name: UpdateVault :one
UPDATE vaults
SET 
    config = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteVault :exec
UPDATE vaults
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- ACCOUNT QUERIES
-- name: InsertAccount :one
INSERT INTO accounts (
    number,
    sequence,
    address,
    public_key,
    chain_id,
    block_created,
    controller,
    label,
    is_subsidiary,
    is_validator,
    is_delegator,
    is_accountable
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetAccountByID :one
SELECT * FROM accounts
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountByAddress :one
SELECT * FROM accounts
WHERE address = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountsByHandle :many
SELECT * FROM accounts
WHERE handle = ? AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetAccountByController :one
SELECT * FROM accounts
WHERE controller = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountByPublicKey :one
SELECT * FROM accounts
WHERE public_key = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountByNumber :one
SELECT * FROM accounts
WHERE number = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountBySequence :one
SELECT * FROM accounts
WHERE sequence = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountsByChainID :many
SELECT * FROM accounts
WHERE chain_id = ? AND deleted_at IS NULL
ORDER BY sequence DESC;

-- name: GetAccountsByController :many
SELECT * FROM accounts
WHERE controller = ? AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: GetAccountsByLabel :many
SELECT * FROM accounts
WHERE label = ? AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: UpdateAccountSequence :one
UPDATE accounts
SET 
    sequence = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE address = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateAccountLabel :one
UPDATE accounts
SET 
    label = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteAccount :exec
UPDATE accounts
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: ListValidatorAccounts :many
SELECT * FROM accounts
WHERE is_validator = 1
AND deleted_at IS NULL
ORDER BY created_at DESC;

-- name: ListDelegatorAccounts :many
SELECT * FROM accounts
WHERE is_delegator = 1
AND deleted_at IS NULL
ORDER BY created_at DESC;

-- CREDENTIAL QUERIES
-- name: InsertCredential :one
INSERT INTO credentials (
    handle,
    credential_id,
    authenticator_attachment,
    origin,
    type,
    transports
) VALUES (?, ?, ?, ?, ?, ?)
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

