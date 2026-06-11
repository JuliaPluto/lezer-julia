// Like diff-corpus.js, but diffs dist/ against a standalone build of the
// grammar at HEAD (or any other ref) instead of the published package, to
// isolate the effect of working-tree changes. Setup (from the repo root):
//
//   mkdir -p tmp-main-build
//   git show HEAD:src/julia.grammar > tmp-main-build/julia.grammar
//   git show HEAD:src/highlight.js > tmp-main-build/highlight.js
//   git show HEAD:src/tokens.js \
//     | sed 's|"./julia.grammar.terms"|"./julia.grammar.terms.js"|' \
//     > tmp-main-build/tokens.js
//   node_modules/.bin/lezer-generator tmp-main-build/julia.grammar \
//     -o tmp-main-build/julia.grammar.js
//
// Usage: node experiments/diff-vs-main.mjs /tmp/julia-corpus.txt
import { readFileSync } from "node:fs";

const newP = (await import("../dist/index.js")).parser;
const oldP = (await import("../tmp-main-build/julia.grammar.js")).parser;

const files = readFileSync(process.argv[2], "utf8").trim().split("\n");

function errorCount(tree) {
  let n = 0;
  tree.iterate({ enter(node) { if (node.type.isError) n++; } });
  return n;
}

let same = 0, improved = 0, regressed = 0, changedSameErrs = 0;
let oldTotalErrs = 0, newTotalErrs = 0;
const regressions = [];

for (const file of files) {
  let code;
  try { code = readFileSync(file, "utf8"); } catch { continue; }
  const ot = oldP.parse(code), nt = newP.parse(code);
  const oe = errorCount(ot), ne = errorCount(nt);
  oldTotalErrs += oe; newTotalErrs += ne;
  const sameTree = ot.toString() === nt.toString();
  if (sameTree) same++;
  else if (ne < oe) improved++;
  else if (ne > oe) { regressed++; regressions.push([file, oe, ne]); }
  else changedSameErrs++;
}

console.log(`files: ${files.length}`);
console.log(`identical trees: ${same}`);
console.log(`different trees, fewer errors (improved): ${improved}`);
console.log(`different trees, same error count: ${changedSameErrs}`);
console.log(`different trees, MORE errors (regressed): ${regressed}`);
console.log(`total error nodes: old=${oldTotalErrs} new=${newTotalErrs}`);
for (const [f, oe, ne] of regressions.slice(0, 20)) {
  console.log(`  REGRESSED ${f}: ${oe} -> ${ne}`);
}
