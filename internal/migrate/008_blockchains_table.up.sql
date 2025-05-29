-- Blockchains table to store chain configuration parameters
CREATE TABLE blockchains (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Basic chain information
    chain_name TEXT NOT NULL,
    chain_id_cosmos TEXT,
    chain_id_evm TEXT,
    api_name TEXT,
    bech_account_prefix TEXT,
    bech_validator_prefix TEXT,
    
    -- Chain assets
    main_asset_symbol TEXT,
    main_asset_denom TEXT,
    staking_asset_symbol TEXT,
    staking_asset_denom TEXT,
    is_stake_enabled BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_stake_enabled IN (0,1)),
    
    -- Chain images
    chain_image TEXT,
    main_asset_image TEXT,
    staking_asset_image TEXT,
    
    -- Chain types and features
    chain_type TEXT NOT NULL CHECK(json_valid(chain_type)),
    is_support_mobile_wallet BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_support_mobile_wallet IN (0,1)),
    is_support_extension_wallet BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_support_extension_wallet IN (0,1)),
    is_support_erc20 BOOLEAN NOT NULL DEFAULT FALSE CHECK(is_support_erc20 IN (0,1)),
    
    -- Descriptions in multiple languages
    description_en TEXT,
    description_ko TEXT,
    description_ja TEXT,
    
    -- Genesis information
    origin_genesis_time TIMESTAMP,
    
    -- Account types configuration
    account_type TEXT NOT NULL CHECK(json_valid(account_type)),
    
    -- BTC staking specific
    btc_staking TEXT CHECK(json_valid(btc_staking)),
    
    -- Cosmos fee information
    cosmos_fee_info TEXT CHECK(json_valid(cosmos_fee_info)),
    
    -- EVM fee information
    evm_fee_info TEXT CHECK(json_valid(evm_fee_info)),
    
    -- Endpoints
    lcd_endpoint TEXT CHECK(json_valid(lcd_endpoint)),
    grpc_endpoint TEXT CHECK(json_valid(grpc_endpoint)),
    evm_rpc_endpoint TEXT CHECK(json_valid(evm_rpc_endpoint)),
    
    -- Explorer information
    explorer TEXT CHECK(json_valid(explorer)),
    
    -- Social and documentation links
    about TEXT CHECK(json_valid(about)),
    forum TEXT CHECK(json_valid(forum))
);

CREATE INDEX idx_blockchains_chain_name ON blockchains(chain_name);
CREATE INDEX idx_blockchains_chain_id_cosmos ON blockchains(chain_id_cosmos);
CREATE INDEX idx_blockchains_chain_id_evm ON blockchains(chain_id_evm);
CREATE INDEX idx_blockchains_main_asset_symbol ON blockchains(main_asset_symbol);
CREATE INDEX idx_blockchains_deleted_at ON blockchains(deleted_at);
