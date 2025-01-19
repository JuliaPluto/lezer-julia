# NPM ?= npm
# NPM ?= pnpm
NPM ?= yarn

# Written by humans
SRC = src/*

# Bundled by rollup
INDEX = dist/index.js dist/index.cjs

$(INDEX): $(SRC) # Generate parser and bundle into usable JS files
	$(NPM) run prepare

.PHONY: install test check clean

install:
	$(NPM) install

test: $(INDEX) test/*
	$(NPM) run test

check: # Ensure tooling is installed
	node --version
	$(NPM) --version

clean: # Remove generated files
	rm -f $(INDEX)

release:
	$(NPM) publish
	git tag v$(cat package.json | jq -r .version)
