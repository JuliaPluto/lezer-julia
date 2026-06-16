# CLAUDE.md

Lezer grammar for Julia, used by Pluto.jl. Lenient by design: it's an editor
grammar, so over-accepting invalid Julia is fine; mis-parsing or erroring on
valid Julia is not.

## Build & test workflow

- `npm run prepare` — full build via rollup, **~2 minutes**. Required before
  `npm test` picks up grammar changes (tests run against `dist/`, which is
  gitignored).
- Fast iteration: `node_modules/.bin/lezer-generator src/julia.grammar -o /tmp/out.js`
  (~30–60s) reports grammar conflicts without bundling. Always do this first
  after grammar edits; only run the full build once it's conflict-free.
- `npm test` itself is instant (~50ms). Test files are `test/*.txt` in
  `@lezer/generator/test` fileTests format; anonymous tokens like `"["` are
  omitted from expectations, named nodes like `begin`, `AssignmentOp(in)` appear.

## Validation beyond unit tests (do this for any grammar change)

`experiments/` contains a differential-testing harness (see its README):
parse thousands of real `.jl` files from `~/.julia/packages` with the
published parser and the new build, compare error-node counts per file.
Setup: `npm pack @plutojl/lezer-julia@<old-version>`, unpack into
`node_modules/old-lezer-julia`. **Demand 0 regressed files** before
considering a change done. Files "changed with same error count" need
spot-checking — GLR tie flips hide there. `experiments/find-regression.js`
shows source context of new error nodes in a file.

Don't use `julia -e` to cross-check semantics: startup takes minutes here.
Issue threads + JuliaSyntax behavior knowledge are faster oracles.

## Grammar architecture (non-obvious)

- The expression layer is **parameterized on index context**:
  `expression<e>` / `primary-expr<e>` / `CallExpression<e>` / `tuple<e>` etc.
  are instantiated with `expr` (normal) or `expr-idx` (inside `[...]`, where
  `begin`/`end` are index values at any depth — issue #15). Index context
  propagates through calls/parens/tuples/braces/arrow bodies and **resets**
  inside block bodies (compound statements, do-blocks), matching Julia.
- If you add a rule reachable from `expression<e>` that mentions
  `primary-expr<expr>` (or anything expr-instantiated), you will get mass
  reduce/reduce conflicts in idx states. Parameterize the rule instead
  (this is why `OpenMacrocallExpression<e>` and `macro-head<e>` are parametric).
- `compound-statement-idx` duplicates `compound-statement` for bracket
  context. The `~bgn` marker after `kw<'begin'>` (in both `expr-idx` and the
  idx `BeginStatement`) is what lets GLR fork begin-as-index vs begin-block.
- `MatrixRow` elements are separated by the zero-length external token
  `spaceSep` (whitespace containing no newline). This is what makes `[f(x)]`
  a call instead of the juxtaposition `f`,`(x)`. `MatrixRow` carries
  `@dynamicPrecedence=-1` purely to break GLR ties toward non-matrix readings.
- The generator `for` is its own external token (`genFor`, `extend: true` +
  `canShift`), distinct from the `for` keyword. This is what lets
  `sum(@show x for x in y)` fork: one branch shifts `genFor` (macro args end,
  generator starts, matching Julia's `for_generator` rule), the other shifts
  keyword `for` (a for-loop as the next macro argument, `f(@m x for i in y
  end)`); the loser dies on error. A grammar-level fix is impossible — see
  the conflict-marker gotcha below.
- `..` lexes via the external `trailingInt` token: built-in `FloatLiteral`
  accepts a trailing dot, so `1..2` would otherwise lex as `1.` `.2`.
  External tokenizers run before `@tokens`, so `trailingInt` (decimal digits
  immediately followed by two dots) wins there and only there. Leading dots
  of relative imports (`import ..A`, `...A`) lex as `..`/`...` by maximal
  munch; `ImportPath` accepts them, with `~impdots` forking against
  `import Base: ..` (operator importable).

## Hard-won gotchas

- **The `newline` external tokenizer must treat `\r` as a line break.** Julia
  ends lines with `\n`, `\r`, or `\r\n`; the tokenizer's newline-consume loop
  accepts `\r`/`\n` (and its trailing-whitespace skip is space/tab only, so
  `\r` is consumed as part of the newline, not skipped). Otherwise a CRLF file
  produces no newline token and every statement boundary + matrix/vcat row past
  the first errors (`spaceSep`'s "is this a row separator?" check also tests
  `\r`). Found by the 40k-file corpus sweep; mostly-LF corpora hide it.
- **Soft keywords use `kwid<>` (`@extend`), hard keywords use `kw<>`
  (`@specialize`).** `kw<'public'>` made `public` unusable as an identifier
  (`x = public`, `f(public)`, `@public`, `macro public`); `kwid<'public'>`
  (like `as`/`outer`/`in`) keeps the `public x, y` statement working while
  letting `public` be an ordinary identifier elsewhere.
- **`const` uses `top-level`, not `OpenAssignment`** (matching `global`/`local`)
  so a bare `const x::T` field declaration parses (Julia 1.8+ const struct
  fields, used throughout Base). A narrower rule is impossible: `const` is
  reachable inside `expr` (via `simple-statement`), so any new rule reducing
  from a shared expr-nonterminal is a *fatal* reduce/reduce conflict. The cost:
  `const $$sym = $$scall` (double-interp inside a quote) flips to the bare-decl
  reading — a pre-existing `$$`-as-juxtaposition weakness surfacing, not a const
  bug (1 corpus file, a non-interactive MLStyle benchmark).
- **External tokenizers that call `stack.canShift` MUST be `contextual: true`.**
  Otherwise their token is cached per-position and shared across GLR
  branches; a branch where the token is invalid silently dies. This bug hid
  for years in the `newline` tokenizer and only surfaced once brackets could
  contain begin-blocks.
- Even with contextual tokenizers, a GLR fork can only survive a newline if
  **both branches can shift it**. That's why `begin`/`quote`/`try`/`else`/
  `finally` have explicit `newline?` after the keyword. Use `newline?`, not
  `_t?`: `_t` includes the `semicolon` token (`';'+`) which **overlaps the
  `';'` literal** in ParenExpression/tuple separators → generator error
  "Overlapping tokens semicolon and ';'". (Hence `begin; 1; end` still
  doesn't parse — known pre-existing limitation.)
- **`@dynamicPrecedence` is a global footgun.** Putting it on
  `CallExpression` to win the matrix-juxtaposition ambiguity broke `:(x)`
  and `$(x)` (they fork against call-with-Operator-head). Prefer making the
  losing fork *impossible* (e.g. spaceSep) over dp; if you must use dp,
  run the full corpus diff.
- GLR ties (equal dp, both branches errorless) are resolved **arbitrarily
  and context-dependently** — the same snippet can parse differently
  depending on *following* lines. If a corpus file changes tree without
  changing error count, suspect a tie and break it deterministically.
  The corpus also can't clear you of tie bugs it never exercises:
  `x[begin:end]` misparsed as a begin-block with a bare-`Operator` body
  (`:` is a valid expression!) and no corpus file contained it. Pluto cells
  are short snippets, so snippet-level parses are what matter. Fixed with
  `@dynamicPrecedence=-1` on the idx `BeginStatement`; the whole class is
  `x[begin <op> end]` for any standalone-operator `<op>`.
- **Precedence beats `~markers` in lezer-generator** (`addActionInner`):
  a conflict already resolved by `!prec` ignores ambiguity markers
  silently. Equalizing precedence on both sides activates the marker, but
  for *every* lookahead token at that boundary, not just the one you care
  about — for macro-args-vs-generator this exploded the table ("Goto table
  too large"). When you need a fork on one specific token, give that token
  its own contextual external tokenizer (`extend: true`) instead — that's
  why `genFor` exists; same family of trick as `spaceSep`.
- JuliaSyntax's `ParseState` flags are the oracle for context rules:
  `for_generator=true` (set in `parse_call_arglist`) is why `for`
  terminates open macro arguments inside any call/bracket/paren, while
  `@simd for ... end` at statement level keeps the loop as an argument.
- Token selection is parse-state-dependent: `'''` as CharLiteral and `x'''`
  as triple adjoint coexist without conflict because the CharLiteral token
  isn't valid in post-expression states.
- `[a -1]` vs `[a - 1]` whitespace-sensitivity (Julia hvcat) is NOT modeled;
  both parse as BinaryExpression. Same class: `[a ~b]` parses as binding.
  Accepted leniency.

## Project conventions

- `memory/MEMORY.md` (untracked) has session notes overlapping this file.
- Maintainer (fonsp) handles version bumps and `make release`; don't bump
  `package.json` in PRs unless asked.
- PRs: branch off `main`, `gh pr create --draft`. dist/ is never committed.
