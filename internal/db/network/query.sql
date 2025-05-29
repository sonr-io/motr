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

-- PRICE QUERIES (UPDATED)
-- name: InsertPrice :one
INSERT INTO prices (
    asset_id,
    price_usd,
    price_btc,
    volume_24h_usd,
    market_cap_usd,
    available_supply,
    total_supply,
    max_supply,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
    rank,
    last_updated
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
       p.available_supply, p.total_supply, p.max_supply,
       p.percent_change_1h, p.percent_change_24h, p.percent_change_7d, 
       p.rank, p.last_updated
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
       p.available_supply, p.total_supply, p.max_supply,
       p.percent_change_1h, p.percent_change_24h, p.percent_change_7d, 
       p.rank, p.last_updated
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
ORDER BY p.rank ASC, a.symbol ASC
LIMIT ? OFFSET ?;

-- name: UpdatePrice :one
UPDATE prices
SET 
    price_usd = ?,
    price_btc = ?,
    volume_24h_usd = ?,
    market_cap_usd = ?,
    available_supply = ?,
    total_supply = ?,
    max_supply = ?,
    percent_change_1h = ?,
    percent_change_24h = ?,
    percent_change_7d = ?,
    rank = ?,
    last_updated = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- PRICE CONVERSION QUERIES (NEW)
-- name: InsertPriceConversion :one
INSERT INTO price_conversions (
    price_id,
    currency_code,
    price,
    volume_24h,
    market_cap,
    last_updated
) VALUES (?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetPriceConversionByID :one
SELECT * FROM price_conversions
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetPriceConversionsByPriceID :many
SELECT * FROM price_conversions
WHERE price_id = ? AND deleted_at IS NULL
ORDER BY currency_code ASC;

-- name: GetPriceConversionByCurrency :one
SELECT * FROM price_conversions
WHERE price_id = ? AND currency_code = ? AND deleted_at IS NULL
LIMIT 1;

-- name: UpdatePriceConversion :one
UPDATE price_conversions
SET 
    price = ?,
    volume_24h = ?,
    market_cap = ?,
    last_updated = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeletePriceConversion :exec
UPDATE price_conversions
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- BLOCKCHAIN QUERIES
-- name: InsertBlockchain :one
INSERT INTO blockchains (
    id,
    chain_name,
    chain_id_cosmos,
    chain_id_evm,
    api_name,
    bech_account_prefix,
    bech_validator_prefix,
    main_asset_symbol,
    main_asset_denom,
    staking_asset_symbol,
    staking_asset_denom,
    is_stake_enabled,
    chain_image,
    main_asset_image,
    staking_asset_image,
    chain_type,
    is_support_mobile_wallet,
    is_support_extension_wallet,
    is_support_erc20,
    description_en,
    description_ko,
    description_ja,
    origin_genesis_time,
    account_type,
    btc_staking,
    cosmos_fee_info,
    evm_fee_info,
    lcd_endpoint,
    grpc_endpoint,
    evm_rpc_endpoint,
    explorer,
    about,
    forum
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetBlockchainByID :one
SELECT * FROM blockchains
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetBlockchainByChainName :one
SELECT * FROM blockchains
WHERE chain_name = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetBlockchainByCosmosChainID :one
SELECT * FROM blockchains
WHERE chain_id_cosmos = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetBlockchainByEvmChainID :one
SELECT * FROM blockchains
WHERE chain_id_evm = ? AND deleted_at IS NULL
LIMIT 1;

-- name: ListAllBlockchains :many
SELECT * FROM blockchains
WHERE deleted_at IS NULL
ORDER BY chain_name ASC;

-- name: ListBlockchainsByChainType :many
SELECT * FROM blockchains
WHERE chain_type LIKE '%' || ? || '%' AND deleted_at IS NULL
ORDER BY chain_name ASC;

-- name: ListBlockchainsWithStaking :many
SELECT * FROM blockchains
WHERE is_stake_enabled = 1 AND deleted_at IS NULL
ORDER BY chain_name ASC;

-- name: ListBlockchainsWithMobileSupport :many
SELECT * FROM blockchains
WHERE is_support_mobile_wallet = 1 AND deleted_at IS NULL
ORDER BY chain_name ASC;

-- name: ListBlockchainsWithExtensionSupport :many
SELECT * FROM blockchains
WHERE is_support_extension_wallet = 1 AND deleted_at IS NULL
ORDER BY chain_name ASC;

-- name: ListBlockchainsWithERC20Support :many
SELECT * FROM blockchains
WHERE is_support_erc20 = 1 AND deleted_at IS NULL
ORDER BY chain_name ASC;

-- name: UpdateBlockchain :one
UPDATE blockchains
SET 
    chain_name = ?,
    chain_id_cosmos = ?,
    chain_id_evm = ?,
    api_name = ?,
    bech_account_prefix = ?,
    bech_validator_prefix = ?,
    main_asset_symbol = ?,
    main_asset_denom = ?,
    staking_asset_symbol = ?,
    staking_asset_denom = ?,
    is_stake_enabled = ?,
    chain_image = ?,
    main_asset_image = ?,
    staking_asset_image = ?,
    chain_type = ?,
    is_support_mobile_wallet = ?,
    is_support_extension_wallet = ?,
    is_support_erc20 = ?,
    description_en = ?,
    description_ko = ?,
    description_ja = ?,
    origin_genesis_time = ?,
    account_type = ?,
    btc_staking = ?,
    cosmos_fee_info = ?,
    evm_fee_info = ?,
    lcd_endpoint = ?,
    grpc_endpoint = ?,
    evm_rpc_endpoint = ?,
    explorer = ?,
    about = ?,
    forum = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateBlockchainEndpoints :one
UPDATE blockchains
SET 
    lcd_endpoint = ?,
    grpc_endpoint = ?,
    evm_rpc_endpoint = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateBlockchainExplorer :one
UPDATE blockchains
SET 
    explorer = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateBlockchainFeeInfo :one
UPDATE blockchains
SET 
    cosmos_fee_info = ?,
    evm_fee_info = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateBlockchainImages :one
UPDATE blockchains
SET 
    chain_image = ?,
    main_asset_image = ?,
    staking_asset_image = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateBlockchainDescriptions :one
UPDATE blockchains
SET 
    description_en = ?,
    description_ko = ?,
    description_ja = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: UpdateBlockchainSocialLinks :one
UPDATE blockchains
SET 
    about = ?,
    forum = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? 
AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteBlockchain :exec
UPDATE blockchains
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetBlockchainWithAssetInfo :one
SELECT b.*, a.id as asset_id, a.symbol, a.decimals, p.price_usd, p.price_btc
FROM blockchains b
LEFT JOIN assets a ON b.main_asset_symbol = a.symbol
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
WHERE b.id = ? AND b.deleted_at IS NULL
LIMIT 1;

-- name: ListBlockchainsWithAssetInfo :many
SELECT b.*, a.id as asset_id, a.symbol, a.decimals, p.price_usd, p.price_btc
FROM blockchains b
LEFT JOIN assets a ON b.main_asset_symbol = a.symbol
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
WHERE b.deleted_at IS NULL
ORDER BY b.chain_name ASC
LIMIT ? OFFSET ?;

-- name: SearchBlockchains :many
SELECT * FROM blockchains
WHERE (
    chain_name LIKE '%' || ? || '%' OR
    main_asset_symbol LIKE '%' || ? || '%' OR
    staking_asset_symbol LIKE '%' || ? || '%' OR
    description_en LIKE '%' || ? || '%'
) AND deleted_at IS NULL
ORDER BY chain_name ASC
LIMIT ? OFFSET ?;

-- name: CountBlockchainsByChainType :one
SELECT COUNT(*) as count FROM blockchains
WHERE chain_type LIKE '%' || ? || '%' AND deleted_at IS NULL;

-- name: GetBlockchainEndpoints :one
SELECT id, chain_name, lcd_endpoint, grpc_endpoint, evm_rpc_endpoint 
FROM blockchains
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;

-- name: GetBlockchainExplorer :one
SELECT id, chain_name, explorer 
FROM blockchains
WHERE id = ? AND deleted_at IS NULL
LIMIT 1;
