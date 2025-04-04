
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


-- name: CreateAsset :one
INSERT INTO assets (
    id,
    name,
    symbol,
    decimals,
    chain_id,
    channel,
    asset_type,
    coingecko_id
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetAssetByID :one
SELECT * FROM assets
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAssetBySymbolAndChain :one
SELECT * FROM assets
WHERE symbol = ? AND chain_id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListAssets :many
SELECT * FROM assets
WHERE deleted_at IS NULL
ORDER BY chain_id, symbol;

-- name: ListAssetsByChain :many
SELECT * FROM assets
WHERE chain_id = ? AND deleted_at IS NULL
ORDER BY symbol;

-- name: ListAssetsByType :many
SELECT * FROM assets
WHERE asset_type = ? AND deleted_at IS NULL
ORDER BY chain_id, symbol;

-- name: SearchAssetsByName :many
SELECT * FROM assets
WHERE name LIKE ? AND deleted_at IS NULL
ORDER BY chain_id, name
LIMIT 100;

-- name: UpdateAsset :one
UPDATE assets
SET 
    name = ?,
    decimals = ?,
    channel = ?,
    asset_type = ?,
    coingecko_id = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteAsset :exec
UPDATE assets
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetAssetByCoingeckoID :one
SELECT * FROM assets
WHERE coingecko_id = ? AND deleted_at IS NULL
LIMIT 1;
