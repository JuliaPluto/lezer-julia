# lezer-julia

This is a [Julia](https://julialang.org) grammar for the
[lezer](https://lezer.codemirror.net) parser system.

The grammar was initially based on [tree-sitter-julia](https://github.com/tree-sitter/tree-sitter-julia).

The code is licensed under an MIT license.


## Contributing

To initialize your development environment:
```
yarn install
```
This will install dependencies and build the parser.


To rebuild the parser after changing the grammar or the tokenizer:
```
yarn run prepare
```
If the build crashes with a GC related error, run `export NODE_OPTIONS='--max-old-space-size=8192'` and try again.


To test the parser:
```
yarn test
```


The same commands should also work fine with `npm` or `pnpm` instead of `yarn`.
The repository also includes a makefile for convenience.
