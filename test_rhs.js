import { parser } from "./dist/index.js";

const testCases = [
  {
    name: "Assignment with for on RHS (single line)",
    code: `x = for i in z end`
  },
  {
    name: "Assignment with for on RHS (multi-line)",  
    code: `x = for i in z
    end`
  },
  {
    name: "Tilde with for on RHS",
    code: `x ~ for i in z
    end`
  },
  {
    name: "Assignment, newline, then for",
    code: `x = y
for i in z
end`
  }
];

for (const testCase of testCases) {
  console.log(`\n=== ${testCase.name} ===`);
  console.log(testCase.code);
  const tree = parser.parse(testCase.code);
  
  let hasError = false;
  tree.iterate({
    enter(node) {
      if (node.type.isError || node.name === '⚠') {
        hasError = true;
      }
    }
  });
  
  if (hasError) {
    console.log("❌ HAS ERRORS");
  } else {
    console.log("✅ OK");
  }
  console.log(tree.toString());
}
