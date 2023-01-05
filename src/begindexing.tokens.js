// Tokens.js

import { ExternalTokenizer, ContextTracker } from "@lezer/lr";
import * as terms from "./index.terms.js";

// TERMINATOR

let { BracketL, BracketR, immediateBracket } = terms;

export const trackIsIndexing = new ContextTracker({
  start: {
    depth: 0,
    is_in_index: false,
    did_get_immediate: false,
    parent: null,
  },
  reduce(context, term) {
    // return context.depth < 0 && bracketed.has(term) ? context.parent : context;
    return context;
  },
  shift(context, term, stack, input) {
    if (term === immediateBracket) {
      return {
        depth: context.depth,
        is_in_index: false,
        did_get_immediate: true,
        parent: context,
      };
    }
    if (term === BracketL) {
      if (context.did_get_immediate) {
        return {
          depth: context.depth + 1,
          is_in_index: true,
          did_get_immediate: false,
          parent: context.parent,
        };
      } else {
        return {
          depth: context.depth + 1,
          is_in_index: false,
          did_get_immediate: false,
          parent: context,
        };
      }
    }
    if (term === BracketR) {
      return context.parent;
    }

    // if (term == indent)
    //   return new IndentLevel(
    //     context,
    //     countIndent(input.read(input.pos, stack.pos))
    //   );
    // if (term == dedent) return context.parent;
    // if (term == ParenL || term == BracketL || term == BraceL)
    //   return new IndentLevel(context, -1);
    // return context;
    return context;
  },
  // hash(context) {
  //   return context.depth;
  // },
});

export const begin_end_but_cool = (input, stack) => {
  if (input === "begin") {
    if (stack.context.is_in_index) {
      return terms.BeginIndex;
    } else {
      return terms.begin;
    }
  }
  if (input === "end") {
    if (stack.context.is_in_index) {
      return terms.EndIndex;
    } else {
      return terms.end;
    }
  }
  return -1;
};