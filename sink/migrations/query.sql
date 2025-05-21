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

-- GLOBAL MARKET QUERIES (NEW)
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
