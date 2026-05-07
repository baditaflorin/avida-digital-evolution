.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview docker-build docker-push release compose-up compose-down clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the local frontend dev server
	npm run dev

build: ## Build the Pages-ready static site into docs/
	npm run build

data: ## Mode A has no offline data-generation pipeline
	@echo "No data pipeline in Mode A; live data is generated in the browser."

test: ## Run unit tests
	npm run test

test-integration: ## No separate integration suite in Mode A v1
	@echo "No integration tests configured for Mode A v1."

smoke: ## Build, serve docs/, and run Playwright smoke tests
	npm run smoke

lint: ## Run eslint, prettier check, and TypeScript
	npm run lint

fmt: ## Format source files
	npm run fmt

pages-preview: ## Serve docs/ locally as GitHub Pages would
	npm run pages-preview

docker-build: ## Mode C only
	@echo "Docker backend is not used in Mode A."

docker-push: ## Mode C only
	@echo "Docker backend is not used in Mode A."

release: ## Tag a local Pages release
	@test -n "$(VERSION)" || (echo "Usage: make release VERSION=v0.1.0" && exit 1)
	git tag "$(VERSION)"
	git push origin "$(VERSION)"

compose-up: ## Mode C only
	@echo "Docker Compose is not used in Mode A."

compose-down: ## Mode C only
	@echo "Docker Compose is not used in Mode A."

clean: ## Remove local build/cache outputs except committed Pages docs
	rm -rf dist coverage tmp .vite playwright-report test-results

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	@test -n "$(MSG)" || (echo "Usage: make hooks-commit-msg MSG=.git/COMMIT_EDITMSG" && exit 1)
	.githooks/commit-msg "$(MSG)"

hooks-pre-push:
	.githooks/pre-push
