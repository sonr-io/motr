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
