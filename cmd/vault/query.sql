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

