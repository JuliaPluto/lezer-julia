// Locate new error nodes in a file: print source context around errors that
// the new parser produces but the old one doesn't.
import { readFileSync } from "node:fs";

const newP = (await import("../dist/index.js")).parser;
const oldP = (await import("old-lezer-julia")).parser;

const file = process.argv[2];
const code = readFileSync(file, "utf8");

function errorPositions(tree) {
  const out = [];
  tree.iterate({ enter(n) { if (n.type.isError) out.push(n.from); } });
  return out;
}

const oldErrs = new Set(errorPositions(oldP.parse(code)));
const newErrs = errorPositions(newP.parse(code));

for (const pos of newErrs) {
  if (oldErrs.has(pos)) continue;
  const line = code.slice(0, pos).split("\n").length;
  console.log(`--- new error at offset ${pos} (line ${line}):`);
  console.log(code.slice(Math.max(0, pos - 160), pos + 80).replace(/^/gm, "  "));
}
