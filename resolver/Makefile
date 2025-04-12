# Resolver Makefile
# -----------------------------------------------

.PHONY: build gen

# Build the resolver module
build:
	@gum spin --title "[RESOLVER] Running workers-assets-gen..." -- go run github.com/syumai/workers/cmd/workers-assets-gen -mode=go
	@gum log --level info --time kitchen "[RESOLVER] Completed workers-assets-gen successfully."
	
	@gum spin --title "[RESOLVER] Running go build..." -- sh -c "GOOS=js GOARCH=wasm go build -o build/app.wasm ."
	@gum log --level info --time kitchen "[RESOLVER] Completed go build successfully."

# Generate resolver code
gen:
	@gum spin --title "[RESOLVER] Running templ generate..." -- templ generate
	@gum log --level info --time kitchen "[RESOLVER] Completed templ generate successfully."
