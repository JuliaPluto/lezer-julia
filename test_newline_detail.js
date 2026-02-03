import { parser } from "./dist/index.js";

// Let's look at exactly where the newlines are
const code1 = "function f()\n    mean ~ MvNormal()\n    for i in z\n    end\nend"; // Works
const code2 = "function f()\n    mean ~ MvNormal() \n    for i in z\n    end\nend"; // Fails

console.log("=== Code without trailing space (works) ===");
console.log(JSON.stringify(code1));
const tree1 = parser.parse(code1);
console.log(tree1.toString());

console.log("\n=== Code with trailing space (fails) ===");
console.log(JSON.stringify(code2));
const tree2 = parser.parse(code2);
console.log(tree2.toString());

// Try with explicit semicolon
const code3 = "function f()\n    mean ~ MvNormal() ;\n    for i in z\n    end\nend";
console.log("\n=== Code with semicolon terminator ===");
const tree3 = parser.parse(code3);
console.log(tree3.toString());

let hasError = false;
tree3.iterate({
  enter(node) {
    if (node.type.isError || node.name === '⚠') {
      hasError = true;
    }
  }
});
console.log(hasError ? "❌ HAS ERRORS" : "✅ OK");
