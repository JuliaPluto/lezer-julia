// Benchmark: parse a corpus of real Julia files with the old (published)
// and new (dist/) parsers and compare wall-clock time.
// Usage: node experiments/perf.mjs [file-list]   (default: /tmp/julia-corpus-big.txt)
// See experiments/README.md for how to set up the corpus and old parser.
import { readFileSync } from "node:fs";
const newP = (await import("../dist/index.js")).parser;
const oldP = (await import("old-lezer-julia")).parser;
const files = readFileSync(process.argv[2] ?? "/tmp/julia-corpus-big.txt", "utf8").trim().split("\n");
const codes = [];
let bytes = 0;
for (const f of files) { try { const c = readFileSync(f, "utf8"); codes.push(c); bytes += c.length; } catch {} }
for (const [name, p] of [["old", oldP], ["new", newP], ["old", oldP], ["new", newP]]) {
  const t0 = performance.now();
  for (const c of codes) p.parse(c);
  console.log(name, (performance.now() - t0).toFixed(0) + "ms", "for", (bytes/1e6).toFixed(1) + "MB");
}
