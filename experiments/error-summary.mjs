// Corpus-wide error summary: how many files error, how many error nodes, and
// how much is attributable to CRLF (the one always-safe mechanical patch — a
// useful confound to subtract before reading `find-gaps.mjs` output). Also
// lists the worst files so you can drill in with `find-regression.js`.
//
// Usage: node experiments/error-summary.mjs /tmp/corpus.txt
import { readFileSync } from "node:fs";
const { parser } = await import("../dist/index.js");
const files = readFileSync(process.argv[2], "utf8").trim().split("\n");

function errs(code) { let n = 0; parser.parse(code).iterate({ enter(x) { if (x.type.isError) n++; } }); return n; }

let processed = 0, errFiles = 0, totalErr = 0, crlfCleaned = 0, crlfErrNodes = 0;
const worst = [];
for (const f of files) {
  let code; try { code = readFileSync(f, "utf8"); } catch { continue; }
  processed++;
  const e0 = errs(code);
  if (e0 === 0) continue;
  errFiles++; totalErr += e0;
  worst.push([f, e0]);
  const e1 = errs(code.replace(/\r\n/g, "\n").replace(/\r/g, "\n"));
  if (e1 === 0) crlfCleaned++;
  crlfErrNodes += e0 - e1;
}

console.log(`files processed:        ${processed}`);
console.log(`files with error nodes: ${errFiles} (${(100 * errFiles / processed).toFixed(1)}%)`);
console.log(`total error nodes:      ${totalErr}`);
console.log(`-> cleaned by CRLF norm:  ${crlfCleaned} files / ${crlfErrNodes} error nodes`);
console.log(`\nworst files (top 25):`);
for (const [f, e] of worst.sort((a, b) => b[1] - a[1]).slice(0, 25))
  console.log(`  ${e}\t${f.replace(/.*\/(packages|share\/julia)\//, "$1/")}`);
