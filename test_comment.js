import { parser } from "./dist/index.js";

const code = `-A' # adjoint > unary`;

console.log("Code:", code);
const tree = parser.parse(code);
console.log("Tree:", tree.toString());

function walk(node, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(`${indent}${node.name} [${node.from}-${node.to}]`);
  const cursor = node.cursor();
  if (cursor.firstChild()) {
    do {
      walk(cursor.node, depth + 1);
    } while (cursor.nextSibling());
  }
}

console.log("\nDetailed tree:");
walk(tree.topNode);
