# Written by humans
SRC = src/julia.grammar src/tokens.js

# Bundled by rollup
INDEX = dist/index.js dist/index.cjs

$(INDEX): $(SRC) # Generate parser and bundle into usable JS files
	npm run prepare

.PHONY: test check clean

test: $(INDEX) test/*
	npm run test

check: # Ensure tooling is installed
	node --version
	npm --version

clean: # Remove generated files
	rm -f $(INDEX)

release:
	npm publish
	git tag v$(shell cat package.json | jq -r .version)
