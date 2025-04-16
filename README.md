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

### Run Using Docker

The simplest way to run the full Motr system is with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Run as a Local Server

```go
package main

import (
	"database/sql"
	"log"
	
	"github.com/sonr-io/motr/app"
	"github.com/sonr-io/motr/pkg/models"
	"github.com/sonr-io/motr/pkg/types"
)

func main() {
	dbq, err := setupDatabase()
	if err != nil {
		log.Fatal(err)
	}
	
	config := &types.Config{
		MotrToken: "your-token",
		SonrChainID: "sonr-testnet-1",
		// Other configuration options
	}
	
	vault, err := app.New(config, dbq)
	if err != nil {
		log.Fatal(err)
	}
	
	// Start the server
	vault.Start(":8080")
}

func setupDatabase() (*models.Queries, error) {
	// Initialize your database connection
	// ...
}
```

### Compile to WebAssembly

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

- **Controller**: Manages WebAuthn credential creation and verification
- **Resolver**: Handles name resolution and identity lookups
- **Signer**: WebAssembly-based cryptographic operations for secure signing
- **Service Worker**: Handles offline capabilities and request caching
- **IndexedDB Storage**: Local data persistence
- **Sonr Blockchain Integration**: Identity verification and data synchronization

### Component Details

1. **Controller**
   - Manages user credentials and authentication
   - Integrates with WebAuthn for credential storage
   - Containerized for easy deployment

2. **Resolver**
   - Resolves Sonr names to addresses and profiles
   - Serves as a gateway to the Sonr network
   - Implemented as a Cloudflare Worker

3. **Signer**
   - Secure cryptographic operations
   - WebAssembly-based for cross-platform compatibility
   - Handles key management and signatures

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)  

Copyright (c) 2024, Sonr Labs, Inc.
