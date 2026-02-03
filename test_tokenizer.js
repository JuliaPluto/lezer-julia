// Test to understand how the tokenizer sees the input
const code = "x = y \nfor";
console.log("Code:", JSON.stringify(code));
console.log("Characters:");
for (let i = 0; i < code.length; i++) {
  console.log(`  ${i}: ${JSON.stringify(code[i])} (${code.charCodeAt(i)})`);
}
