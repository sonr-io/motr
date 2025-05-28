.PHONY: tidy templ sqlc worker radar

all: help 

help:
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  help        Show this help message"
	@echo "  tidy        Tidy up the project"
	@echo "  templ       Generate templates"
	@echo "  sqlc        Generate SQL schema"
	@echo "  worker      Build and deploy worker"
	@echo "  radar       Build and deploy radar"

templ:
	@devbox run gen:templ

sqlc:
	@devbox run gen:sqlc

dev: 
	@devbox run dev

deploy: 
	@devbox run deploy

release: 
	@devbox run release
