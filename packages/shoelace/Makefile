# Shoelace Makefile
# -----------------------------------------------

.PHONY: build install publish

build: install
	@gum spin --show-error --title "[SHOELACE] Running pnpm build..." -- sh -c "pnpm run build"
	@gum log --level info --time kitchen "[SHOELACE] Completed pnpm build successfully."

install:
	@gum spin --show-error --title "[SHOELACE] Running pnpm install..." -- sh -c "pnpm install"
	@gum log --level info --time kitchen "[SHOELACE] Completed pnpm install successfully."

publish:
	@gum spin --show-error --title "[SHOELACE] Running pnpm publish..." -- sh -c "npm publish"
	@gum log --level info --time kitchen "[SHOELACE] Completed npm publish successfully."

bump:
	@gum spin --show-error --title "[COSMES] Running bump..." -- sh -c "npm version patch"
	@gum log --level info --time kitchen "[COSMES] Completed bump successfully."
