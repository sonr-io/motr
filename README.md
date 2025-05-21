# Sonr Motr

[![GoDoc](https://godoc.org/github.com/sonr-io/motr?status.svg)](https://godoc.org/github.com/sonr-io/motr)
[![Go Report Card](https://goreportcard.com/badge/github.com/sonr-io/motr)](https://goreportcard.com/report/github.com/sonr-io/motr)

Motr is Sonr's decentralized vault and identity management system. It provides secure credential and profile management with online/offline capabilities through a progressive web application architecture.

## Features

- **Secure Identity Management**: WebAuthn credential storage and verification
- **Progressive Web App**: Works online and offline with service worker integration
- **WASM Architecture**: Core functionality compiled to WebAssembly for cross-platform compatibility
- **Local-First Design**: Data stored locally with sync capabilities to the Sonr blockchain
- **Containerized Deployment**: Docker-based deployment for all components

## Installation

### Standard Installation

```bash
git clone https://github.com/sonr-io/motr.git
cd motr
go mod tidy
```

### Docker Installation

```bash
git clone https://github.com/sonr-io/motr.git
cd motr
docker-compose up -d
```

## Usage

### Development Setup

Motr uses [Task](https://taskfile.dev) for managing development workflows. Here are the primary commands:

```bash
# Clean build artifacts
task clean

# Build all components
task build

# Deploy all components to Cloudflare
task deploy

# Start the local development server
task serve
```

### Component-specific commands

```bash
# Start the Vault component (Cloudflare Worker)
task start:vault

# Start the Frontend component
task start:front

# Build specific components
task build:vault
task build:front

# Deploy specific components to Cloudflare
task deploy:vault
task deploy:front
```

### Database operations

```bash
# Generate SQL models using sqlc
task gen:sqlc

# Migrate the database
task db:migrate
```

### Compile to WebAssembly

The project uses WebAssembly for cross-platform compatibility. Components are compiled automatically when using the Task commands above, but you can also build manually:

```sh
# Build the signer as WASM
GOOS=js GOARCH=wasm go build -o build/signer.wasm ./cmd/signer/main.go

# Build the controller application as WASM
GOOS=js GOARCH=wasm go build -o build/controller.wasm ./controller/main.go

# Build the resolver application for Cloudflare Workers
GOOS=js GOARCH=wasm go build -o build/resolver.wasm ./resolver/main.go
```

### Progressive Web App Integration

Motr can be integrated into progressive web applications, providing:

- Offline functionality via service workers
- Secure credential storage
- Seamless blockchain account management
- Cross-device synchronization

## Architecture

Motr consists of several components:

- **Vault**: Core component deployed as a Cloudflare Worker with WebAssembly
- **Controller**: Manages WebAuthn credential creation and verification
- **Resolver**: Handles name resolution and identity lookups
- **Signer**: WebAssembly-based cryptographic operations for secure signing
- **Service Worker**: Handles offline capabilities and request caching
- **IndexedDB Storage**: Local data persistence
- **Sonr Blockchain Integration**: Identity verification and data synchronization

### Component Details

1. **Vault**
   - Core component deployed as a Cloudflare Worker
   - Manages decentralized identity and authentication
   - Integrates with IPFS/Helia for decentralized storage
   - Uses WebAssembly plugins for cryptographic operations
   - Package located at `cmd/vault/`

2. **Controller**
   - Manages user credentials and authentication
   - Integrates with WebAuthn for credential storage
   - Uses SQLite via D1 database for persistent storage

3. **Resolver**
   - Resolves Sonr names to addresses and profiles
   - Serves as a gateway to the Sonr network
   - Implemented as a Cloudflare Worker

4. **Signer**
   - Secure cryptographic operations
   - WebAssembly-based for cross-platform compatibility
   - Handles key management and signatures

## Development

### Build System

Motr uses the following build tools:

- **Task**: Task runner for development workflows
- **GoReleaser**: Handles building and releasing Go applications
- **SQLC**: Generates type-safe Go code from SQL
- **Templ**: Template engine for Go HTML templates
- **Air**: Live reload for Go applications during development
- **Bun**: JavaScript runtime and package manager

### Release Process

```bash
# Create a new release
task release
```

The release process uses GoReleaser with configuration in `.goreleaser.yaml`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

Copyright (c) 2024, Sonr Labs, Inc.
