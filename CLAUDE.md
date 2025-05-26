# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Build: `task build` - Compile WASM with Go
- Generate templates: `task gen:templ` - Generate Go code from templ templates
- Generate SQL: `task gen:sqlc` - Generate Go code from SQL queries
- Serve: `task serve` - Run development server with Air
- Test: `task test` or `go test -v ./...` - Run all tests
- Single test: `go test -v ./path/to/package -run TestName` - Run specific test

## Code Style
- **Imports**: Standard library first, external packages second, local packages last
- **Formatting**: Use gofmt for code formatting
- **Types**: Prefer explicit types over interface{}
- **Naming**: Follow Go conventions (CamelCase for exported, camelCase for unexported)
- **Error Handling**: Always check errors and return them when appropriate
- **Domain Structure**: Keep domain logic in separate entity directories
- **Templates**: Use templ for HTML templating
- **Database**: Use sqlc for type-safe SQL queries
- **Middleware**: Place middleware in internal/middleware directory