# Root Makefile
# -----------------------------------------------
.PHONY: build gen gen-types

all: gen build

# Main targets
build:
	@$(MAKE) -C wallet build
	@$(MAKE) -C packages/cosmes build
	@$(MAKE) -C packages/shoelace build
	@$(MAKE) -C packages/vault build
	@$(MAKE) -C resolver build

gen:
	@$(MAKE) -C nebula gen
	@$(MAKE) -C resolver gen

gen-types:
	@$(MAKE) -C packages/cosmes gen
