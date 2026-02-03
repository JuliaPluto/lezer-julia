import { parser } from "./dist/index.js";

// Test several variations to understand the issue
const testCases = [
  {
    name: "Function with for loop (no macro)",
    code: `function single_source_model()
    mean ~ MvNormal() 
    for i in z
    end
end`
  },
  {
    name: "Macro with function and for loop (original issue)",
    code: `@model function single_source_model()
    mean ~ MvNormal() 
    for i in z
    end
end`
  },
  {
    name: "Macro with function and empty for loop",
    code: `@model function f()
    for i in z
    end
end`
  },
  {
    name: "Function with begin block",
    code: `function f()
    begin
        x
    end
end`
  },
  {
    name: "Macro with function and begin block",
    code: `@model function f()
    begin
        x
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
    console.log(tree.toString());
  } else {
    console.log("✅ OK");
  }
}
