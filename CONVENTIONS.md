# MOTR Development Guide

## Commands
- Build: `task build` - Compiles WASM with `GOOS=js GOARCH=wasm go build -o web/vault.wasm .`
- Generate: `task gen:templ` - Generate Go code from templ templates
- Generate: `task gen:sqlc` - Generate Go code from SQL queries
- Test: `task test` - Run all tests with `go test -v ./...`
- Run single test: `go test -v ./path/to/package -run TestName`
- Serve: `task serve` - Run development server with `bunx live-server` in web directory

## Code Style
- **Imports**: Standard library first, external packages second, local packages last
- **Formatting**: Use gofmt
- **Types**: Prefer explicit types over interface{}
- **Naming**: Follow Go conventions (CamelCase for exported, camelCase for unexported)
- **Error Handling**: Always check errors and return them when appropriate
- **Domain Structure**: Keep domain logic in `/x` directory with handler.go, model/ and view/ subdirectories
- **Templates**: Use templ for HTML templating
- **Database**: Use sqlc for type-safe SQL queries
- **Middleware**: Place middleware in pkg/[service]/middleware.go

## Architecture
MOTR follows a modular architecture with domain-driven design principles. WebAssembly is used for browser execution with progressive web app capabilities.