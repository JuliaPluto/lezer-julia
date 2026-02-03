import { parser } from "./dist/index.js";

const code = `@model function single_source_model()
    mean ~ MvNormal() 
    for i in z
    end
end`;

console.log("Testing parse of:");
console.log(code);
console.log("\nParsing...");

const tree = parser.parse(code);
console.log("\nParse tree:");
console.log(tree.toString());

// Check for errors
let hasError = false;
tree.iterate({
  enter(node) {
    if (node.type.isError || node.name === '⚠') {
      hasError = true;
      console.log(`\nERROR at position ${node.from}-${node.to}:`);
      console.log(`  Node: ${node.name}`);
      console.log(`  Text: "${code.substring(node.from, node.to)}"`);
    }
  }
});

if (hasError) {
  console.log("\n❌ Parse has errors!");
  process.exit(1);
} else {
  console.log("\n✅ Parse successful!");
}
