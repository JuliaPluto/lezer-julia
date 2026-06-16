# Production-readiness report

_Corpus sweep run 2026-06-16 against the build at commit `cd23f4c`._

## Method

For an editor grammar the production metric is **"does it error on valid
Julia?"** — real package code is valid Julia, so every error node on a corpus
file is a candidate bug.

- **Corpus:** 40,402 real `.jl` files — Julia 1.12 Base + stdlib (883 files, the
  gold-standard idiomatic corpus) plus every file in `~/.julia/packages`
  (39,527).
- **Pipeline:** parse each file → collect error-node positions → cluster the
  source lines by a normalized skeleton → rank clusters by **how many distinct
  packages** they span (a gap across many packages is systematic; a one-package
  cluster is DSL/data noise) → confirm each candidate with an isolated minimal
  snippet → measure blast radius by patching the source and re-counting errors.
- **Tooling:** `find-gaps.mjs` (cluster error lines + rank by package span) and
  `error-summary.mjs` (corpus error totals + CRLF attribution + worst files).

## Headline

- **0 hard parse exceptions** across 40k files.
- **92.9%** of files parse with **zero** error nodes.
- A 121-construct isolated sweep (comprehensions, generators, `where` chains,
  broadcasting, `ccall`, operator method defs, nested destructuring, every
  literal form, …) passes everything **except** the gaps below.
- Most of the erroring 7.1% are **not** grammar bugs: macro DSLs
  (DataFramesMeta `:col`, GraphPPL `@meta`), intentionally-invalid test
  fixtures, embedded-DSL string macros, and non-code data files.

## Confirmed gaps (valid Julia that errors)

| # | Gap | Minimal repro | Reach | Severity |
|---|-----|---------------|-------|----------|
| 1 | **CRLF line endings** | `x = 1⏎y = 2` (`\r\n`) | 87 files / **14,877 error nodes = 17% of all** | Critical |
| 2 | **`public` soft-keyword over-reach** | `x = public`, `@public x`, `macro public(…)` | common word → broad | High |
| 3 | **`const` typed struct fields** (1.8+) | `mutable struct S; const x::Int; end` | in Base; cascades hard | High |
| 4 | **Trailing comma in assignment LHS** | `I, J, = f()` | 21 pkgs / ~358 files | High |
| 5 | **Interpolated / keyword fn & macro names** | `function Mod.$op(…)`, `function $f end`, `@try` | 8+ pkgs | Medium |
| 6 | **Dotted macro import** | `import Base.@kwdef` | 9 pkgs incl. stdlib | Medium |
| 7 | **Interpolated `export`** | `export $sym`, `:(export $x)` | 5 pkgs | Medium |
| 8 | **`abstract type T; end`** (semicolon) | `abstract type T; end` | 5 pkgs | Low |
| 9 | **Arrow with non-trivial LHS** | `f() -> body`, `a.b -> body` | rare (DSLs) | Low |

### Root causes traced

- **#1 CRLF** — the `newline` external tokenizer in `src/tokens.js` skips
  trailing spaces/tabs but **not `\r`**, and only matches `\n`. So `\r\n`
  produces no newline token. Blocks survive (their trailing separator is
  optional) but the top level and matrix/vcat rows break. This was the mystery
  11k-line PolygonOps cluster (a `[(float,float)⏎…]` data file saved with CRLF).
- **#2 `public`** — `src/julia.grammar` uses `kw<'public'>` (a *hard* keyword)
  where `as`/`outer` correctly use the soft `kwid<>` form, so `public` can never
  be an identifier or macro name. `public x, y` (the actual statement) still works.
- **#3 `const` field** — `ConstStatement` requires an assignment, so a bare
  `const x::T` field declaration fails and cascades through the whole struct and
  the rest of the file (base/lock.jl: 11 error nodes → 0 once removed).

Fixing just **#1 + #3** takes 131 corpus files from erroring to fully clean.

## Recommendation

The two with the widest real-world blast radius are **CRLF** (any
Windows-authored or pasted cell) and **`public`** (an ordinary English word real
code uses as a variable); both are small, well-isolated fixes. **`const` struct
fields** is next — a standard since Julia 1.8, present in Base, and it cascades.
Items #4–#9 are a metaprogramming long tail.

Every grammar change must be validated with the `experiments/` corpus diff
demanding **0 regressions** before merge.

## Outcome (PR #49)

Landed CRLF, the `public` soft-keyword, `const` struct fields, and a fourth gap
found during this analysis — **uppercase-`P` hex floats** (`0x1.8P3`; `hex-exp`
matched only lowercase `p`). Remaining gaps are tracked as issues #51–#57.

### Completeness (40,402-file corpus)

| Metric | Pre-PR baseline | After PR #49 |
|--------|-----------------|--------------|
| Files parsing clean (zero error nodes) | 92.9% (37,518) | **93.4% (37,751)** |
| Base + stdlib clean | — | **85.9% (756 / 880)** |
| Total error nodes | 85,192 | **37,479 (−56%)** |
| Files improved vs baseline | — | **256** |
| Regressions | — | 1 (accepted, pathological `$$` benchmark) |

Hard parse exceptions: 0 (both builds).

### Reproducing the table

Two committed scripts over a corpus, comparing this branch's `dist/` against a
build of the baseline ref. Runtime is a few minutes per corpus pass.

**1. Build the corpus list** (paths are for macOS `juliaup`; adjust for your
Julia install — `base/` + `stdlib/` live under `<julia>/share/julia/`):

```sh
J='~/.julia/juliaup'   # find the active version's base + stdlib
find $J -path '*/julia-1.12*/share/julia/base/*'   -name '*.jl' >  /tmp/corpus-base.txt
find $J -path '*/julia-1.12*/share/julia/stdlib/*' -name '*.jl' >> /tmp/corpus-base.txt
cat /tmp/corpus-base.txt              >  /tmp/corpus-all.txt
find ~/.julia/packages -name '*.jl'   >> /tmp/corpus-all.txt
```

**2. Build "after" (this branch) and "before" (the baseline ref):**

```sh
npm run prepare                       # "after" → dist/ (~2 min)

BASE=origin/main                      # the commit this branch forked from
mkdir -p tmp-main-build
git show $BASE:src/julia.grammar > tmp-main-build/julia.grammar
git show $BASE:src/highlight.js  > tmp-main-build/highlight.js
git show $BASE:src/tokens.js \
  | sed 's|"./julia.grammar.terms"|"./julia.grammar.terms.js"|' > tmp-main-build/tokens.js
node_modules/.bin/lezer-generator tmp-main-build/julia.grammar -o tmp-main-build/julia.grammar.js
```

**3. Generate the numbers:**

```sh
node experiments/diff-vs-main.mjs   /tmp/corpus-all.txt                            # before-vs-after diff
node experiments/error-summary.mjs  /tmp/corpus-all.txt                            # "after" clean rate
node experiments/error-summary.mjs  /tmp/corpus-all.txt tmp-main-build/julia.grammar.js  # "before" clean rate
node experiments/error-summary.mjs  /tmp/corpus-base.txt                           # Base+stdlib clean rate
```

**Row → source mapping:**

| Table row | Command | Output line |
|-----------|---------|-------------|
| Files parsing clean | `error-summary.mjs <corpus> [parser]` | `files with error nodes: N (P%)` → clean = `processed − N`, `(100 − P)%` |
| Base + stdlib clean | `error-summary.mjs /tmp/corpus-base.txt` | same line |
| Total error nodes | `diff-vs-main.mjs` | `total error nodes: old=… new=…` |
| Files improved | `diff-vs-main.mjs` | `different trees, fewer errors (improved): …` |
| Regressions | `diff-vs-main.mjs` | `different trees, MORE errors (regressed): …` |

`error-summary.mjs` takes an optional second arg (a parser build, relative to
the repo root) so the same script measures the baseline build without a rebuild.
