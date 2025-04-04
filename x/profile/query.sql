
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


