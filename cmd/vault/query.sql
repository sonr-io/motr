-- name: GetAccountByID :one
SELECT * FROM accounts
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountByAddress :one
SELECT * FROM accounts
WHERE address = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetAccountByChainID :one
SELECT * FROM accounts
WHERE chain_id = ? AND deleted_at IS NULL
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

-- name: GetAccountsByController :many
SELECT * FROM accounts
WHERE controller = ? AND deleted_at IS NULL

