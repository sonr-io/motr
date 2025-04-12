# COSMES Makefile
# -----------------------------------------------

.PHONY: build gen

build:
	@gum spin --title "[COSMES] Running pnpm build..." -- sh -c "pnpm run build"
	@gum log --level info --time kitchen "[COSMES] Completed pnpm build successfully."

gen:
	@gum spin --title "[COSMES] Running gen:registry..." -- sh -c "pnpm run gen:registry"
	@gum log --level info --time kitchen "[COSMES] Completed gen:registry successfully."
	@gum spin --title "[COSMES] Running gen:protobufs..." -- sh -c "pnpm run gen:protobufs"
	@gum log --level info --time kitchen "[COSMES] Completed gen:protobufs successfully."

