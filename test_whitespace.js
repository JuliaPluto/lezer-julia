import { parser } from "./dist/index.js";

const testCases = [
  {
    name: "No trailing space",
    code: `function f()
    mean ~ MvNormal()
    for i in z
    end
end`
  },
  {
    name: "Trailing space (original)",
    code: `function f()
    mean ~ MvNormal() 
    for i in z
    end
end`
  },
  {
    name: "Two statements on same line",
    code: `function f()
    mean ~ MvNormal(); for i in z
    end
end`
  }
];

for (const testCase of testCases) {
  console.log(`\n=== ${testCase.name} ===`);
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
}
