# Root Makefile
# -----------------------------------------------
.PHONY: build gen proto publish

all: gen build

# Main targets
build:
	@$(MAKE) -C packages/cosmes build
	@$(MAKE) -C packages/shoelace build
	@$(MAKE) -C packages/vault build
	@cd resolver && pnpm run build

gen:
	@$(MAKE) -C nebula gen
	@cd resolver && pnpm run gen:templ

proto:
	@$(MAKE) -C packages/cosmes gen

publish:
	@$(MAKE) -C packages/cosmes publish
	@$(MAKE) -C packages/shoelace publish
	@$(MAKE) -C packages/vault publish
