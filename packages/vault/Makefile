# Vault Makefile
# -----------------------------------------------

.PHONY: build install publish

build: install
	@gum spin --show-error --title "[VAULT] Running pnpm build..." -- sh -c "pnpm run build"
	@gum log --level info --time kitchen "[VAULT] Completed pnpm build successfully."

install: plugins
	@gum spin --show-error --title "[VAULT] Running pnpm install..." -- sh -c "pnpm install"
	@gum log --level info --time kitchen "[VAULT] Completed pnpm install successfully."

plugins:
	@earthly github.com/sonr-io/crypto+signer
	@mv ./signer.wasm ./src/signer.wasm

publish:
	@gum spin --show-error --title "[VAULT] Running pnpm publish..." -- sh -c "npm publish"
	@gum log --level info --time kitchen "[VAULT] Completed npm publish successfully."
