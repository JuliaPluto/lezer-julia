import { parser } from "./dist/index.js";

// From earlier test - we know this works
const code = "x = for i in z\n    end";
console.log("Code:", JSON.stringify(code));
const tree = parser.parse(code);
console.log(tree.toString());

let hasError = false;
tree.iterate({
  enter(node) {
    if (node.type.isError || node.name === '⚠') {
      hasError = true;
    }
  }
});
console.log(hasError ? "❌ HAS ERRORS" : "✅ OK");
