#!/bin/bash

# Set up environment variables
export GOPATH=$HOME/go
export GOBIN=$GOPATH/bin
export PATH=$GOBIN:$PATH

# Setup Motr specific environment variables
export ROOT_DIR=$(git rev-parse --show-toplevel)
export RADAR_ROOT=$ROOT_DIR/cmd/radar
export WORKER_ROOT=$ROOT_DIR/cmd/worker

# Setup Build Outputs
export RADAR_OUT=$RADAR_ROOT/build/app.wasm
export WORKER_OUT=$WORKER_ROOT/build/app.wasm

function go_tidy() {
  cd $ROOT_DIR
  go mod tidy
  go mod download
  go install github.com/syumai/workers/cmd/workers-assets-gen@latest
}

function npm_install() {
  cd $1
  npm install
}

function wrangler_deploy() {
  cd $1
  wrangler deploy
}

function wrangler_dev() {
  cd $1
  wrangler dev
}

function check_deps() {
  command -v go >/dev/null 2>&1 || { echo >&2 "go is required but not installed. Aborting."; exit 1; }
  command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }
  command -v npx >/dev/null 2>&1 || { echo >&2 "npx is required but not installed. Aborting."; exit 1; }
  command -v task >/dev/null 2>&1 || { echo >&2 "task is required but not installed. Aborting."; exit 1; }
  command -v wrangler >/dev/null 2>&1 || { echo >&2 "wrangler is required but not installed. Aborting."; exit 1; }
}

function check_vars() {
  if [ -z "$ROOT_DIR" ]; then
    echo "ROOT_DIR is not set. Aborting."
    exit 1
  fi

  if [ -z "$RADAR_ROOT" ]; then
    echo "RADAR_ROOT is not set. Aborting."
    exit 1
  fi

  if [ -z "$WORKER_ROOT" ]; then
    echo "WORKER_ROOT is not set. Aborting."
    exit 1
  fi

  if [ -z "$RADAR_OUT" ]; then
    echo "RADAR_OUT is not set. Aborting."
    exit 1
  fi

  if [ -z "$WORKER_OUT" ]; then
    echo "WORKER_OUT is not set. Aborting."
    exit 1
  fi
}

function check_secrets() {
  if [ -z "$DOCKER_HUB_USERNAME" ]; then
    echo "DOCKER_HUB_USERNAME is not set. Aborting."
    exit 1
  fi

  if [ -z "$DOCKER_HUB_TOKEN" ]; then
    echo "DOCKER_HUB_TOKEN is not set. Aborting."
    exit 1
  fi

  if [ -z "$GITHUB_TOKEN" ]; then
    echo "GITHUB_TOKEN is not set. Aborting."
    exit 1
  fi

  if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "CLOUDFLARE_API_TOKEN is not set. Aborting."
    exit 1
  fi

  if [ -z "$NPM_TOKEN" ]; then
    echo "NPM_TOKEN is not set. Aborting."
    exit 1
  fi
}

function publish_release() {
  check_secrets
  goreleaser check
  goreleaser release --clean
}

