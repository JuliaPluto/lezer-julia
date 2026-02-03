// Manually trace through what should happen

const code = "mean ~ MvNormal() \nfor";
console.log("Code:", JSON.stringify(code));
console.log("\nPositions:");
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  const code_pt = ch.charCodeAt(0);
  console.log(`${i}: '${ch === '\n' ? '\\n' : ch}' (${code_pt})`);
}

console.log("\nAt position 18 (newline):");
console.log("  Previous char (pos 17):", JSON.stringify(code[17]), "- is space?", code[17] === ' ');
console.log("  Next char after newline (pos 19):", JSON.stringify(code[19]));

// Check if 'for' matches
const keyword = 'for';
let matches = true;
for (let i = 0; i < keyword.length; i++) {
  if (code.charCodeAt(19 + i) !== keyword.charCodeAt(i)) {
    matches = false;
    break;
  }
}
console.log("  'for' matches?", matches);
