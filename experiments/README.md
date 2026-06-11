# Experiments

Standalone scripts used to validate the grammar changes for
[issue #15](https://github.com/JuliaPluto/lezer-julia/issues/15)
(`begin`/`end` indices inside larger expressions). They are not part of the
test suite, but are useful for validating future grammar changes against
real-world code.

All scripts run against the built parser, so run `npm run prepare` first.

## parse.js

Parses a list of inline snippets (the cases from issue #15 plus related
constructs) and checks whether each parses without error nodes.

```
node experiments/parse.js [--tree]
```

## diff-corpus.js, find-regression.js, perf.mjs

Differential testing against the previously published parser, over a corpus
of real Julia files. Setup:

```
# Old parser, unpacked where node can resolve it:
cd /tmp && npm pack @plutojl/lezer-julia@0.12.7 && tar xf plutojl-lezer-julia-0.12.7.tgz
cp -r /tmp/package node_modules/old-lezer-julia

# Corpus: any list of .jl files, e.g.
find ~/.julia/packages -name "*.jl" -size -200k | head -2000 > /tmp/julia-corpus-big.txt
```

Then:

```
# Compare trees and error-node counts old vs new (must report 0 regressed):
node experiments/diff-corpus.js /tmp/julia-corpus-big.txt

# Show source context of error nodes that are new in one file:
node experiments/find-regression.js path/to/file.jl

# Compare parse speed:
node experiments/perf.mjs /tmp/julia-corpus-big.txt
```

## diff-vs-main.mjs

Same as diff-corpus.js, but compares against a standalone build of the
grammar at HEAD instead of the published package — useful for isolating the
effect of uncommitted changes when main itself is ahead of the last release.
Setup instructions are in the header comment of the script.
