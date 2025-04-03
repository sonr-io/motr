# Sonr Motr

[![GoDoc](https://godoc.org/github.com/sonr-io/motr?status.svg)](https://godoc.org/github.com/sonr-io/motr)
[![Go Report Card](https://goreportcard.com/badge/github.com/sonr-io/motr)](https://goreportcard.com/report/github.com/sonr-io/motr)

Motr is Sonr's decentralized vault and identity management system. It provides secure credential and profile management with online/offline capabilities through a progressive web application architecture.

## Features

- **Secure Identity Management**: WebAuthn credential storage and verification
- **Progressive Web App**: Works online and offline with service worker integration
- **WASM Architecture**: Core functionality compiled to WebAssembly for cross-platform compatibility
- **Local-First Design**: Data stored locally with sync capabilities to the Sonr blockchain

## Installation

```bash
git clone https://github.com/sonr-io/motr.git
cd motr
go mod tidy
```

## Usage

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
# Build the vault application as WASM
GOOS=js GOARCH=wasm go build -o public/app.wasm ./cmd/vault/main.go

# Build the proxy application for Cloudflare Workers
GOOS=js GOARCH=wasm go build -o workers/proxy.wasm ./cmd/proxy/main.go
```

### Progressive Web App Integration

Motr can be integrated into progressive web applications, providing:

- Offline functionality via service workers
- Secure credential storage
- Seamless blockchain account management
- Cross-device synchronization

## Architecture

Motr consists of several components:

- **Echo Server**: REST API for authentication and account management
- **WASM Runtime**: Core logic compiled to WebAssembly
- **Service Worker**: Handles offline capabilities and request caching
- **IndexedDB Storage**: Local data persistence
- **Sonr Blockchain Integration**: Identity verification and data synchronization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)  

Copyright (c) 2024, Sonr Labs, Inc.
