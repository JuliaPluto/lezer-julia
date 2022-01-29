# julia-lezer-tuples-arguments-and-parenthesis

Because building `julia-lezer` in full takes long and it is a very complex grammar to browse through, this is a separate experiment.

The mission: Make something that parses julia Tuples (`()`, `(x,)`, `(x, y; a)`), Inline "blocks" (`(x)`, `(x; y; z)`) and argument lists (`()`, `(x)`, `(x, y; a)`).

I came to having 2 `~split-the-parser` statements because there really isn't a way for these things to resolve between tuples, inline-blocks and argument lists.

## Setup

```
npm install
make && make test
```

> If you crash and it looks like there is too little memory, trying running `export NODE_OPTIONS="--max-old-space-size=8192"` before running `make`
