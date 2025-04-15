# Nebula Makefile
# -----------------------------------------------

.PHONY: gen

# Generate nebula code
gen:
	@gum spin --show-error --title "[NEBULA] Running templ generate..." -- templ generate
	@gum log --level info --time kitchen "[NEBULA] Completed templ generate successfully."
