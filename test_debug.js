import { parser } from "./dist/index.js";

// The simplest failing case
const code = `x = y 
for i in z
end`;

console.log("Code:");
console.log(JSON.stringify(code));

const tree = parser.parse(code);

// Walk the tree
function walk(node, depth = 0) {
  const indent = "  ".repeat(depth);
  const start = node.from;
  const end = node.to;
  const text = code.substring(start, end).replace(/\n/g, "\\n");
  console.log(`${indent}${node.name} [${start}-${end}] "${text}"`);
  const cursor = node.cursor();
  if (cursor.firstChild()) {
    do {
      walk(cursor.node, depth + 1);
    } while (cursor.nextSibling());
  }
}

walk(tree.topNode);
