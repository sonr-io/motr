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
