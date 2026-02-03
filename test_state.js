import { parser } from "./dist/index.js";

// Test more variations
const tests = [
  ["Assignment + newline + for", "x = y\nfor i in z\nend"],
  ["Assignment + space + newline + for", "x = y \nfor i in z\nend"],
  ["Assignment + tilde + newline + for", "x ~ y\nfor i in z\nend"],
  ["Assignment + tilde + space + newline + for", "x ~ y \nfor i in z\nend"],
  ["Call + space + newline + for", "f() \nfor i in z\nend"],
  ["Call + newline + for", "f()\nfor i in z\nend"],
];

for (const [name, code] of tests) {
  const tree = parser.parse(code);
  let hasError = false;
  tree.iterate({
    enter(node) {
      if (node.type.isError || node.name === '⚠') {
        hasError = true;
      }
    }
  });
  console.log(`${hasError ? "❌" : "✅"} ${name}`);
  if (hasError) {
    console.log(`   ${tree.toString()}`);
  }
}
