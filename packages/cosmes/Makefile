# COSMES Makefile
# -----------------------------------------------

.PHONY: build gen install publish

build: install
	@gum spin --show-error --title "[COSMES] Running pnpm build..." -- sh -c "pnpm run build"
	@gum log --level info --time kitchen "[COSMES] Completed pnpm build successfully."

gen:
	@gum spin --show-error --title "[COSMES] Running gen:registry..." -- sh -c "pnpm run gen:registry"
	@gum log --level info --time kitchen "[COSMES] Completed gen:registry successfully."
	@gum spin --show-error --title "[COSMES] Running gen:protobufs..." -- sh -c "pnpm run gen:protobufs"
	@gum log --level info --time kitchen "[COSMES] Completed gen:protobufs successfully."

install:
	@gum spin --show-error --title "[COSMES] Running pnpm install..." -- sh -c "pnpm install"
	@gum log --level info --time kitchen "[COSMES] Completed pnpm install successfully."

publish:
	@gum spin --show-error --title "[COSMES] Running npm publish..." -- sh -c "npm publish"
	@gum log --level info --time kitchen "[COSMES] Completed npm publish successfully."

bump:
	@gum spin --show-error --title "[COSMES] Running bump..." -- sh -c "npm version patch"
	@gum log --level info --time kitchen "[COSMES] Completed bump successfully."
