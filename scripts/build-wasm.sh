#!/bin/bash

# This script builds the wasm files for our ./libs/* packages

set -e

TARGET="$1" # enclave or vault
GIT_ROOT="$(git rev-parse --show-toplevel)"
ROOTDIR="${GIT_ROOT}/libs/${TARGET}"
OUTPUT="${GIT_ROOT}/libs/${TARGET}/dist" # output directory
GOARCH="wasm"

# If target is enclave os is wasip1 if it is vault its js
if [ "${TARGET}" == "enclave" ]; then
  GOOS="wasip1"
  INPUT="."
  OUTPUT="dist/enclave.wasm"
elif [ "${TARGET}" == "vault" ]; then
  GOOS="js"
  INPUT="."
  OUTPUT="dist/vault.wasm"
fi

function info() {
  echo "# Build $TARGET"
  echo "- **OS**: $GOOS"
  echo "- **Arch**: $GOARCH"
  echo "- **Dir**: $ROOTDIR"
}

cd "$ROOTDIR" || exit
info | gum format

mkdir -p dist
GOOS="${GOOS}" GOARCH="${GOARCH}" go build -ldflags='-s -w' -trimpath -o "${OUTPUT}" "${INPUT}"
