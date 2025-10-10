#!/bin/bash
set -e

echo "🔄 Generating protobufs with git clone approach..."

cd "$(dirname "$0")/.."
PROTOBUFS_DIR="src/protobufs"
TMP_DIR="$PROTOBUFS_DIR/.tmp"

# Clean and setup
echo "📁 Setting up directories..."
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
mkdir -p "$PROTOBUFS_DIR"

# Clean existing generated dirs
rm -rf "$PROTOBUFS_DIR"/{cosmos,tendermint,ibc,cosmwasm,osmosis,ethermint,sonr}

# Clone repos
echo "📥 Cloning repositories..."

git clone --depth 1 --branch v0.50.10 https://github.com/cosmos/cosmos-sdk.git "$TMP_DIR/cosmos-sdk" 2>/dev/null || echo "cosmos-sdk clone failed"
git clone --depth 1 --branch v0.38.12 https://github.com/cometbft/cometbft.git "$TMP_DIR/cometbft" 2>/dev/null || echo "cometbft clone failed"
git clone --depth 1 --branch v8.5.1 https://github.com/cosmos/ibc-go.git "$TMP_DIR/ibc-go" 2>/dev/null || echo "ibc-go clone failed"
git clone --depth 1 --branch master https://github.com/sonr-io/sonr.git "$TMP_DIR/sonr" 2>/dev/null || echo "sonr clone failed"
git clone --depth 1 --branch v0.53.0 https://github.com/CosmWasm/wasmd.git "$TMP_DIR/wasmd" 2>/dev/null || echo "wasmd clone failed"
git clone --depth 1 --branch v27.0.0 https://github.com/osmosis-labs/osmosis.git "$TMP_DIR/osmosis" 2>/dev/null || echo "osmosis clone failed"
git clone --depth 1 --branch v0.22.0 https://github.com/evmos/ethermint.git "$TMP_DIR/ethermint" 2>/dev/null || echo "ethermint clone failed"

# Generate protobufs
echo "⚙️  Generating TypeScript from proto files..."

[[ -d "$TMP_DIR/cosmos-sdk/proto" ]] && pnpm buf generate "$TMP_DIR/cosmos-sdk/proto" --output "$PROTOBUFS_DIR" && echo "✓ cosmos-sdk"
[[ -d "$TMP_DIR/cometbft/proto" ]] && pnpm buf generate "$TMP_DIR/cometbft/proto" --output "$PROTOBUFS_DIR" && echo "✓ cometbft"
[[ -d "$TMP_DIR/ibc-go/proto" ]] && pnpm buf generate "$TMP_DIR/ibc-go/proto" --output "$PROTOBUFS_DIR" && echo "✓ ibc-go"
[[ -d "$TMP_DIR/sonr/proto" ]] && pnpm buf generate "$TMP_DIR/sonr/proto" --output "$PROTOBUFS_DIR/sonr" && echo "✓ sonr"
[[ -d "$TMP_DIR/wasmd/proto" ]] && pnpm buf generate "$TMP_DIR/wasmd/proto" --output "$PROTOBUFS_DIR" && echo "✓ wasmd"
[[ -d "$TMP_DIR/osmosis/proto" ]] && pnpm buf generate "$TMP_DIR/osmosis/proto" --output "$PROTOBUFS_DIR" && echo "✓ osmosis"
[[ -d "$TMP_DIR/ethermint/proto" ]] && pnpm buf generate "$TMP_DIR/ethermint/proto" --output "$PROTOBUFS_DIR" && echo "✓ ethermint"

# Generate index
echo "📝 Generating index.ts..."
node scripts/gen-protobufs.mjs --skip-clone

# Cleanup
echo "🧹 Cleaning up..."
rm -rf "$TMP_DIR"

echo "✅ Protobuf generation complete!"
