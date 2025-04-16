# COSMES Makefile
# -----------------------------------------------

.PHONY: gen install bind

D1_DB=motr-global-db

gen:
	@gum spin --show-error --title "[SINK] Running sqlc generate..." -- sh -c "sqlc generate"
	@gum log --level info --time kitchen "[SINK] Completed sqlc generate successfully."

install:
	@gum spin --show-error --title "[SINK] Running go install..." -- sh -c "go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest"
	@gum log --level info --time kitchen "[SINK] Completed go install successfully."
