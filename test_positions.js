const code = "x = y \nfor";
console.log("Positions:");
for (let i = 0; i < code.length; i++) {
  console.log(`${i}: '${code[i]}' (${code.charCodeAt(i)})`);
}
