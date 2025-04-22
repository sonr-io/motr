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

-- name: GetAccountsByHandle :many
SELECT * FROM accounts
WHERE handle = ? AND deleted_at IS NULL
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

-- ASSET QUERIES
-- name: InsertAsset :one
INSERT INTO assets (
    name,
    symbol,
    decimals,
    chain_id,
    channel,
    asset_type,
    coingecko_id
) VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetAssetByID :one
SELECT * FROM assets
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAssetBySymbol :one
SELECT * FROM assets
WHERE symbol = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAssetByChainAndSymbol :one
SELECT * FROM assets
WHERE chain_id = ? AND symbol = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListAssetsByChain :many
SELECT * FROM assets
WHERE chain_id = ? AND deleted_at IS NULL
ORDER BY symbol ASC;

-- name: UpdateAsset :one
UPDATE assets
SET 
    name = ?,
    decimals = ?,
    channel = ?,
    asset_type = ?,
    coingecko_id = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteAsset :exec
UPDATE assets
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- PRICE QUERIES
-- name: InsertPrice :one
INSERT INTO prices (
    asset_id,
    price_usd,
    price_btc,
    volume_24h_usd,
    market_cap_usd,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
    last_updated
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetPriceByAssetID :one
SELECT * FROM prices
WHERE asset_id = ? AND deleted_at IS NULL
ORDER BY last_updated DESC
LIMIT 1;

-- name: GetPriceByID :one
SELECT * FROM prices
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListPriceHistoryByAssetID :many
SELECT * FROM prices
WHERE asset_id = ? AND deleted_at IS NULL
ORDER BY last_updated DESC
LIMIT ? OFFSET ?;

-- name: GetAssetWithLatestPrice :one
SELECT a.*, p.price_usd, p.price_btc, p.volume_24h_usd, p.market_cap_usd, 
       p.percent_change_24h, p.last_updated
FROM assets a
LEFT JOIN (
    SELECT p1.*
    FROM prices p1
    INNER JOIN (
        SELECT asset_id, MAX(last_updated) as max_date
        FROM prices
        WHERE deleted_at IS NULL
        GROUP BY asset_id
    ) p2 ON p1.asset_id = p2.asset_id AND p1.last_updated = p2.max_date
    WHERE p1.deleted_at IS NULL
) p ON a.id = p.asset_id
WHERE a.id = ? AND a.deleted_at IS NULL
LIMIT 1;

-- name: ListAssetsWithLatestPrices :many
SELECT a.*, p.price_usd, p.price_btc, p.volume_24h_usd, p.market_cap_usd, 
       p.percent_change_24h, p.last_updated
FROM assets a
LEFT JOIN (
    SELECT p1.*
    FROM prices p1
    INNER JOIN (
        SELECT asset_id, MAX(last_updated) as max_date
        FROM prices
        WHERE deleted_at IS NULL
        GROUP BY asset_id
    ) p2 ON p1.asset_id = p2.asset_id AND p1.last_updated = p2.max_date
    WHERE p1.deleted_at IS NULL
) p ON a.id = p.asset_id
WHERE a.deleted_at IS NULL
ORDER BY a.symbol ASC
LIMIT ? OFFSET ?;

-- name: UpdatePrice :one
UPDATE prices
SET 
    price_usd = ?,
    price_btc = ?,
    volume_24h_usd = ?,
    market_cap_usd = ?,
    percent_change_1h = ?,
    percent_change_24h = ?,
    percent_change_7d = ?,
    last_updated = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- SERVICE QUERIES
-- name: InsertService :one
INSERT INTO services (
    name,
    description,
    chain_id,
    address,
    owner_address,
    metadata,
    status,
    block_height
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetServiceByID :one
SELECT * FROM services
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetServiceByAddress :one
SELECT * FROM services
WHERE address = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetServiceByChainAndAddress :one
SELECT * FROM services
WHERE chain_id = ? AND address = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListServicesByChain :many
SELECT * FROM services
WHERE chain_id = ? AND deleted_at IS NULL
ORDER BY name ASC
LIMIT ? OFFSET ?;

-- name: ListServicesByOwner :many
SELECT * FROM services
WHERE owner_address = ? AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: UpdateService :one
UPDATE services
SET 
    name = ?,
    description = ?,
    owner_address = ?,
    metadata = ?,
    status = ?,
    block_height = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteService :exec
UPDATE services
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- ACTIVITY QUERIES
-- name: InsertActivity :one
INSERT INTO activities (
    account_id,
    tx_hash,
    tx_type,
    status,
    amount,
    fee,
    gas_used,
    gas_wanted,
    memo,
    block_height,
    timestamp,
    raw_log,
    error
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetActivityByID :one
SELECT * FROM activities
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetActivityByTxHash :one
SELECT * FROM activities
WHERE tx_hash = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListActivitiesByAccount :many
SELECT * FROM activities
WHERE account_id = ? AND deleted_at IS NULL
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;

-- name: ListActivitiesByType :many
SELECT * FROM activities
WHERE tx_type = ? AND deleted_at IS NULL
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;

-- name: ListActivitiesByStatus :many
SELECT * FROM activities
WHERE status = ? AND deleted_at IS NULL
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;

-- name: UpdateActivityStatus :one
UPDATE activities
SET 
    status = ?,
    tx_hash = ?,
    block_height = ?,
    gas_used = ?,
    raw_log = ?,
    error = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteActivity :exec
UPDATE activities
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- HEALTH QUERIES
-- name: InsertHealth :one
INSERT INTO health (
    endpoint_url,
    endpoint_type,
    chain_id,
    status,
    response_time_ms,
    last_checked,
    next_check,
    failure_count,
    success_count,
    response_data,
    error_message
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetHealthByID :one
SELECT * FROM health
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetHealthByEndpoint :one
SELECT * FROM health
WHERE endpoint_url = ? AND deleted_at IS NULL
ORDER BY last_checked DESC
LIMIT 1;

-- name: ListHealthByChain :many
SELECT * FROM health
WHERE chain_id = ? AND deleted_at IS NULL
ORDER BY last_checked DESC
LIMIT ? OFFSET ?;

-- name: ListHealthByStatus :many
SELECT * FROM health
WHERE status = ? AND deleted_at IS NULL
ORDER BY last_checked DESC
LIMIT ? OFFSET ?;

-- name: ListHealthChecksNeedingUpdate :many
SELECT * FROM health
WHERE next_check <= CURRENT_TIMESTAMP AND deleted_at IS NULL
ORDER BY next_check ASC
LIMIT ?;

-- name: UpdateHealthCheck :one
UPDATE health
SET 
    status = ?,
    response_time_ms = ?,
    last_checked = CURRENT_TIMESTAMP,
    next_check = ?,
    failure_count = CASE WHEN status = 'failed' THEN failure_count + 1 ELSE failure_count END,
    success_count = CASE WHEN status = 'success' THEN success_count + 1 ELSE success_count END,
    response_data = ?,
    error_message = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteHealth :exec
UPDATE health
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;
