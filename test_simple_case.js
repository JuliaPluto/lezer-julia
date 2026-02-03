import { parser } from "./dist/index.js";

// Without macro
const code1 = `x = y 
for i in z
end`;

console.log("=== Without macro ===");
const tree1 = parser.parse(code1);
console.log(tree1.toString());

// With function
const code2 = `function f()
    x = y 
    for i in z
    end
end`;

console.log("\n=== Inside function ===");
const tree2 = parser.parse(code2);
console.log(tree2.toString());

// Check if tree2 has errors
let hasError = false;
tree2.iterate({
  enter(node) {
    if (node.type.isError || node.name === '⚠') {
      hasError = true;
    }
  }
});
console.log(hasError ? "❌ HAS ERRORS" : "✅ OK");
