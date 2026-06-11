// Standalone experiment: parse snippets and report whether they contain errors.
// Usage: node experiments/parse.js [--tree] [file-with-snippets]
import { parser } from "../dist/index.js";

const showTree = process.argv.includes("--tree");

const snippets = [
  // From issue #15
  ["data[begin]", true],
  ["data[end]", true],
  ["data[max(begin,i-1)]", true],
  ["data[min(end,i+1)]", true],
  // begin/end in nested expressions inside brackets
  ["x[(begin)]", true],
  ["x[(end)]", true],
  ["x[end-1]", true],
  ["x[begin+1]", true],
  ["x[f(g(end))]", true],
  ["x[(() -> begin)()]", true],
  ["x[a ? begin : end]", true],
  ["x[[begin for i in 1:3]]", true],
  ["x[begin...]", true],
  ["x[f(end; a=2)]", true],
  ["x[f(a=end)]", true],
  ["x[{end}]", true],
  ["x[y[end]]", true],
  ["x[end, begin]", true],
  ["x[end end]", true], // matrix row: x[end end] is hvcat -> valid julia? `x[end end]` parse: yes matrix syntax
  // Julia rejects begin-blocks in index position, but accepts them in array
  // literals (`[begin 1 end]`); the grammar cannot distinguish the two
  // contexts, so we leniently accept both.
  ["x[begin\n1\nend]", true],
  // Control: normal begin blocks outside brackets still work
  ["begin\nx = 1\nend", true],
  ["f(begin\nx\nend)", true],
  ["let\nx[begin]\nend", true],
  // From the issue, full example
  [
    `let
	left = data[begin]
	right = data[end]

	left = data[max(begin,i-1)]
	right = data[min(end,i+1)]

	left < x > right
end`,
    true,
  ],
];

let pass = 0, fail = 0;
for (const [code, shouldParse] of snippets) {
  const tree = parser.parse(code);
  let hasError = false;
  tree.iterate({
    enter(n) {
      if (n.type.isError) hasError = true;
    },
  });
  const ok = hasError !== shouldParse;
  if (ok) pass++; else fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${hasError ? "(error)  " : "(no err) "} ${JSON.stringify(code.length > 60 ? code.slice(0, 60) + "…" : code)}`
  );
  if (showTree || !ok) {
    console.log("      " + tree.toString());
  }
}
console.log(`\n${pass} pass, ${fail} fail`);
