import { parser } from "./dist/index.js";

// Test assignment inside brackets
const code = `[x = for i in 1:10 end]`;

console.log("Code:", code);
const tree = parser.parse(code);
console.log("Tree:", tree.toString());

let hasError = false;
tree.iterate({
  enter(node) {
    if (node.type.isError || node.name === '⚠') {
      hasError = true;
    }
  }
});
console.log(hasError ? "❌ HAS ERRORS" : "✅ OK");
