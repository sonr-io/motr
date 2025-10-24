#!/usr/bin/env bash
set -euo pipefail

# Smart Asset Bundling Script
# This script:
# 1. Copies all app builds to public/{app}/ directories
# 2. Extracts shared vendor chunks to public/shared/
# 3. Copies WASM files to dedicated locations
# 4. Copies shared assets from @pkgs/config/public/

echo "🧹 Cleaning public directory..."
rm -rf public
mkdir -p public/wasm public/shared

echo "📦 Copying app builds..."

# Copy auth app (complete with WASM files and service worker)
echo "  ├─ auth (with WASM + Service Worker)"
mkdir -p public/auth
cp -r apps/auth/dist/* public/auth/

# Copy console, profile, search apps
for app in console profile search; do
  echo "  ├─ $app"
  mkdir -p public/$app
  cp -r apps/$app/dist/* public/$app/
done

echo "♻️  Extracting shared vendor chunks..."

# Find and copy vendor chunks to shared directory
# These will have consistent hashing across builds
for vendor in vendor-react vendor-router vendor-query vendor-ui; do
  # Find the first vendor chunk from any app (they're identical due to content hashing)
  vendor_file=$(find apps/*/dist/assets/ -name "${vendor}-*.js" 2>/dev/null | head -1 || echo "")

  if [ -n "$vendor_file" ]; then
    cp "$vendor_file" public/shared/
    echo "  ✓ Extracted $(basename "$vendor_file")"
  fi
done

echo "🔧 Copying WASM files..."
cp libs/vault/dist/vault.wasm public/wasm/vault.wasm
cp libs/enclave/dist/enclave.wasm public/wasm/enclave.wasm
cp libs/vault/dist/wasm_exec.js public/wasm/wasm_exec.js
echo "  ✓ vault.wasm (6.8MB)"
echo "  ✓ enclave.wasm (8.6MB)"
echo "  ✓ wasm_exec.js"

# Also copy WASM files to root for auth app (required for service worker)
cp apps/auth/dist/sw.js public/sw.js 2>/dev/null || true
cp apps/auth/dist/wasm_exec.js public/wasm_exec.js 2>/dev/null || true
cp apps/auth/dist/vault.wasm public/vault.wasm 2>/dev/null || true
cp apps/auth/dist/enclave.wasm public/enclave.wasm 2>/dev/null || true

echo "🎨 Copying shared assets (favicons, manifests)..."
cp pkgs/config/public/*.{png,ico,svg,txt,webmanifest} public/ 2>/dev/null || true
echo "  ✓ Favicons, PWA icons, robots.txt"

echo ""
echo "✨ Bundle complete!"
echo ""
echo "📊 Build Summary:"
du -sh public/auth | awk '{print "  Auth:      " $1}'
du -sh public/console | awk '{print "  Console:   " $1}'
du -sh public/profile | awk '{print "  Profile:   " $1}'
du -sh public/search | awk '{print "  Search:    " $1}'
du -sh public/shared | awk '{print "  Shared:    " $1}'
du -sh public/wasm | awk '{print "  WASM:      " $1}'
echo ""
du -sh public | awk '{print "  Total:     " $1}'
