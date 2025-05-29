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


-- name: GetGlobalMarketByID :one
SELECT * FROM global_market
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetLatestGlobalMarket :one
SELECT * FROM global_market
WHERE deleted_at IS NULL
ORDER BY last_updated DESC
LIMIT 1;

-- name: ListGlobalMarketHistory :many
SELECT * FROM global_market
WHERE deleted_at IS NULL
ORDER BY last_updated DESC
LIMIT ? OFFSET ?;

-- name: UpdateGlobalMarket :one
UPDATE global_market
SET 
    total_market_cap_usd = ?,
    total_24h_volume_usd = ?,
    bitcoin_percentage_of_market_cap = ?,
    active_currencies = ?,
    active_assets = ?,
    active_markets = ?,
    last_updated = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteGlobalMarket :exec
UPDATE global_market
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- FEAR AND GREED INDEX QUERIES (NEW)
-- name: InsertFearGreedIndex :one
INSERT INTO fear_greed_index (
    value,
    value_classification,
    timestamp,
    time_until_update
) VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetFearGreedIndexByID :one
SELECT * FROM fear_greed_index
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetLatestFearGreedIndex :one
SELECT * FROM fear_greed_index
WHERE deleted_at IS NULL
ORDER BY timestamp DESC
LIMIT 1;

-- name: ListFearGreedIndexHistory :many
SELECT * FROM fear_greed_index
WHERE deleted_at IS NULL
ORDER BY timestamp DESC
LIMIT ? OFFSET ?;

-- name: UpdateFearGreedIndex :one
UPDATE fear_greed_index
SET 
    value = ?,
    value_classification = ?,
    timestamp = ?,
    time_until_update = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: InsertGlobalMarket :one
INSERT INTO global_market (
    total_market_cap_usd,
    total_24h_volume_usd,
    bitcoin_percentage_of_market_cap,
    active_currencies,
    active_assets,
    active_markets,
    last_updated
) VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING *;


-- name: SoftDeleteFearGreedIndex :exec
UPDATE fear_greed_index
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- CRYPTO LISTINGS QUERIES (NEW)
-- name: InsertCryptoListing :one
INSERT INTO crypto_listings (
    api_id,
    name,
    symbol,
    website_slug
) VALUES (?, ?, ?, ?)
RETURNING *;

-- name: GetCryptoListingByID :one
SELECT * FROM crypto_listings
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetCryptoListingByApiID :one
SELECT * FROM crypto_listings
WHERE api_id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetCryptoListingBySymbol :one
SELECT * FROM crypto_listings
WHERE symbol = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetCryptoListingByWebsiteSlug :one
SELECT * FROM crypto_listings
WHERE website_slug = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListCryptoListings :many
SELECT * FROM crypto_listings
WHERE deleted_at IS NULL
ORDER BY name ASC
LIMIT ? OFFSET ?;

-- name: UpdateCryptoListing :one
UPDATE crypto_listings
SET 
    name = ?,
    symbol = ?,
    website_slug = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteCryptoListing :exec
UPDATE crypto_listings
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;
