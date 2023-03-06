import { ContextTracker, LRParser } from "@lezer/lr";
import { NodeProp } from "@lezer/common";
import { BeginIndex, EndIndex, begin, end } from "./index.terms.js";

let context_from_prop = (context, prop) => {
  if (prop === "[") {
    return {
      depth: context.depth + 1,
      is_in_index: true,
      parent: context,
    };
  }
  if (prop === "]") {
    return context.parent;
  }
  if (prop === "begin") {
    return {
      depth: context.depth + 1,
      is_in_index: false,
      parent: context,
    };
  }
  if (prop === "end") {
    return context.parent;
  }
  return context;
};

/** @type {WeakMap<LRParser, Object<number, string>>} */
let begindex_nodes_cache = new WeakMap();

let parser_to_begindex_nodes = (/** @type {LRParser} */ parser) => {
  let cached = begindex_nodes_cache.get(parser);
  if (cached != null) {
    return cached;
  }

  let nodes = parser.nodeSet.types;
  /** @type {Object<number, string>} */
  let begindex_node_to_propvalue = {};

  for (let node of nodes) {
    let prop = node.prop(begindexing);
    if (prop != null) {
      begindex_node_to_propvalue[node.id] = prop;
    }
  }

  begindex_nodes_cache.set(parser, begindex_node_to_propvalue);

  return begindex_node_to_propvalue;
};

export const trackIsIndexing = new ContextTracker({
  start: {
    depth: 0,
    is_in_index: false,
    parent: null,
  },
  reduce(context, term, stack) {
    let prop = parser_to_begindex_nodes(stack.parser)[term];

    // let x = stack.parser.nodeSet.types.find((x) => x.id === term);
    // let prop = x?.prop(begindexing);

    if (prop != null) {
      return context_from_prop(context, prop);
    }
    return context;
  },
  shift(context, term, stack, input) {
    let prop = parser_to_begindex_nodes(stack.parser)[term];
    if (prop != null) {
      return context_from_prop(context, prop);
    } else {
      return context;
    }
  },
});

export const begindexing = new NodeProp({
  deserialize: (x) => {
    return x;
  },
});

export const begin_end_but_cool = (input, stack) => {
  if (input === "begin") {
    if (stack.context.is_in_index) {
      return BeginIndex;
    } else {
      return begin;
    }
  }
  if (input === "end") {
    if (stack.context.is_in_index) {
      return EndIndex;
    } else {
      return end;
    }
  }
  return -1;
};
