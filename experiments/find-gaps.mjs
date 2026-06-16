// Find valid Julia the parser errors on. Real package code is valid Julia, so
// every error node on a corpus file is a candidate grammar gap. Clusters error
// lines by a normalized skeleton and ranks clusters by how many DISTINCT
// packages they span: a cluster across many packages is a systematic gap; a
// single-package cluster is usually a macro DSL or data file.
//
// Usage: node experiments/find-gaps.mjs /tmp/corpus.txt [minPkgs=3]
//   where corpus.txt is a list of .jl paths, e.g.
//   find ~/.julia/packages -name '*.jl' > /tmp/corpus.txt
import { readFileSync } from "node:fs";
const { parser } = await import("../dist/index.js");

const files = readFileSync(process.argv[2], "utf8").trim().split("\n");
const minPkgs = process.argv[3] ? +process.argv[3] : 3;

function skeleton(line) {
  let s = line.trim();
  s = s.replace(/"(?:[^"\\]|\\.)*"/g, '"S"').replace(/'(?:[^'\\]|\\.)'/g, "'C'").replace(/#.*$/, "");
  s = s.replace(/\b\d[\d_.eE+\-]*\b/g, "N");
  const kw = new Set(["function","end","for","while","if","else","elseif","begin","let","do","try","catch","finally","return","const","global","local","struct","mutable","module","using","import","export","macro","quote","where","in","isa"]);
  s = s.replace(/[A-Za-z_¡-￿][\w!¡-￿]*/g, (m) => kw.has(m) ? m : "i");
  s = s.replace(/\s+/g, " ").replace(/(?:i[.,] ?)+i/g, "i");
  return s.slice(0, 80);
}
function pkgOf(f) {
  const m = f.match(/\/packages\/([^/]+)\//); if (m) return "pkg:" + m[1];
  const j = f.match(/\/share\/julia\/(\w+)/); if (j) return "julia:" + j[1];
  return f;
}

const clusters = new Map();
for (const f of files) {
  let code; try { code = readFileSync(f, "utf8"); } catch { continue; }
  code = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n"); // ignore CRLF noise
  const errLines = new Set();
  parser.parse(code).iterate({ enter(n) { if (n.type.isError) errLines.add(code.slice(0, n.from).split("\n").length); } });
  if (!errLines.size) continue;
  const lines = code.split("\n"), pkg = pkgOf(f);
  for (const ln of errLines) {
    const src = (lines[ln - 1] || "").trim(); if (!src) continue;
    const sk = skeleton(src);
    if (!clusters.has(sk)) clusters.set(sk, { lines: 0, pkgs: new Set(), examples: [] });
    const c = clusters.get(sk);
    c.lines++; c.pkgs.add(pkg);
    if (c.examples.length < 3 && !c.examples.some((e) => e.pkg === pkg))
      c.examples.push({ pkg, f: f.replace(/.*\/(packages|julia)\//, "$1:"), ln, src: src.slice(0, 90) });
  }
}

const sorted = [...clusters.entries()].filter(([, c]) => c.pkgs.size >= minPkgs).sort((a, b) => b[1].pkgs.size - a[1].pkgs.size);
console.log(`clusters spanning >=${minPkgs} packages (systematic candidates): ${sorted.length}\n`);
for (const [sk, c] of sorted) {
  console.log(`[${c.pkgs.size} pkgs, ${c.lines} lines]  ${sk}`);
  for (const ex of c.examples.slice(0, 2)) console.log(`    ${ex.f}:${ex.ln}  ${ex.src}`);
}
