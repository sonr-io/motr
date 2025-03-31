# CLAUDE.md - Guidelines for Agentic Coding

## Build/Run/Test Commands
- **Build WASM binary**: `task build` or `make build`
- **Generate code**: `task gen` or `make generate`
- **Run tests**: `task test`
- **Run single test**: `go test -v ./path/to/package -run TestName`
- **Development workflow**: `task` (runs test, generate, build sequence)

## Code Style Guidelines
- **Formatting**: Standard Go formatting with `gofmt`
- **Imports**: Group standard library, third-party, and project imports
- **Types**: Use descriptive type names; alias complex types (e.g., `type Vault = *echo.Echo`)
- **Error Handling**: Always check errors; wrap with context when propagating
- **Naming**:
  - Packages: lowercase, concise nouns (e.g., `handlers`, `models`)
  - Interfaces: action+er (e.g., `Querier`)
  - Variables: camelCase for local, PascalCase for exported
- **Structure**: Follow Go's standard project layout
- **Comments**: Add godoc comments for all exported functions/types
- **WASM Context**: Use internal/context package for WASM-specific context