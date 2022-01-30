LEZER_ARGS :=
ifdef DEBUG
	LEZER_ARGS := --names $(LEZER_ARGS)
endif

.DELETE_ON_ERROR:

.PHONY: default
default: build

.PHONY: build
build: dist/index.cjs dist/index.es.js

.PHONY: test
test:
	npx mocha test/test-julia.js

.PRECIOUS: src/%.js src/%.terms.js
src/%.js src/%.terms.js: src/%.grammar
	@echo 'Compiling $(<)'
	npx lezer-generator $(LEZER_ARGS) $< -o $(<:%.grammar=%)

dist/%.cjs dist/%.es.js: src/%.js src/%.tokens.js src/%.terms.js
	@echo 'Bunding $(<)'
	ROLLUP_IN="$(<)" \
	ROLLUP_OUT="$(<:src/%.js=dist/%)" \
	npx rollup -c
