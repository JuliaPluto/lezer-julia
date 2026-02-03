import { parser } from "./dist/index.js";

const code = `@model function single_source_model()
    mean ~ MvNormal() 
    for i in z
    end
end`;

console.log("Code:", code);
console.log("\n=== Full Parse Tree ===");

const tree = parser.parse(code);

function printTree(node, indent = 0) {
  const prefix = "  ".repeat(indent);
  const text = code.substring(node.from, node.to);
  const displayText = text.length > 40 ? text.substring(0, 40) + "..." : text;
  console.log(`${prefix}${node.name} (${node.from}-${node.to}) "${displayText.replace(/\n/g, '\\n')}"`);
  
  const cursor = node.cursor();
  if (cursor.firstChild()) {
    do {
      printTree(cursor.node, indent + 1);
    } while (cursor.nextSibling());
  }
}

printTree(tree.topNode);
