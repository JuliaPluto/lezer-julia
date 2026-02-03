# Trailing Whitespace Parsing Issue - Analysis

## Problem Summary

The parser fails when there's trailing whitespace before a newline in code like:

```julia
@model function single_source_model()
    mean ~ MvNormal() 
    for i in z
    end
end
```

Note the trailing space after `MvNormal()`. Without this space, the code parses correctly.

## Root Cause

This is a **shift/reduce conflict** in the generated LR parser:

1. The grammar allows `OpenAssignment` to have any `top-level` on its RHS
2. `top-level` includes `expr`, which includes `compound-statement` (like `ForStatement`)
3. So `mean ~ MvNormal() for...` could theoretically be parsed as an assignment with a for-expression on the RHS

When parsing `mean ~ MvNormal() \nfor...`:
- Without trailing space: The newline is immediately after `)`, and the parser correctly recognizes it as a terminator
- With trailing space: The whitespace is skipped by `@skip`, but this somehow puts the parser in a state where `stack.canShift(terms.newline)` returns false, preventing the newline from being tokenized as a terminator

## Attempts to Fix

### 1. Modify newline tokenizer to look ahead
- Added logic to peek ahead and check if the next token is a keyword like 'for'
- If so, force accept the newline even if `canShift` returns false
- **Result**: FAILED - the parser still produces errors

### 2. Remove canShift check entirely
- Made the tokenizer always accept newlines
- **Result**: FAILED - breaks other tests AND still doesn't fix the issue
- This confirms the issue is not in the tokenizer but in the parser itself

### 3. Add precedence hints
- Tried adding dynamic precedence to make certain paths preferred
- **Result**: Not fully explored due to complexity

### 4. Modify grammar
- Considered restricting what can appear on RHS of OpenAssignment
- **Result**: Would break valid Julia syntax like `x = for i in 1:3; end`

## Why It's Hard to Fix

1. Julia DOES allow `x = for ... end` (for-expression on RHS)
2. Julia does NOT allow `x = y for ... end` (extra tokens error)
3. The difference is whether there's a terminator between `y` and `for`
4. The parser needs to recognize the newline as a terminator, but with trailing whitespace, it doesn't

The issue appears to be in how the lezer LR parser generator creates the parser tables for this ambiguous case.

## Potential Solutions

1. **Wait for lezer update**: File an issue with the lezer project about this shift/reduce conflict
2. **Workaround in grammar**: Add a special case for this pattern, though unclear how
3. **GLR parsing**: Enable generalized LR parsing for ambiguous cases (may have performance impact)
4. **Lint rule**: Add a linter rule to flag trailing whitespace (workaround, not a fix)

## Testing

Created test files to reproduce and debug:
- `test_parse_issue.js` - Original failing case
- `test_whitespace.js` - Various whitespace scenarios
- `test_variations.js` - Different code patterns

All confirm the issue is specific to trailing whitespace before newlines.
