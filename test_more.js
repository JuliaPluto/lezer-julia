import { parser } from "./dist/index.js";

const testCases = [
  {
    name: "For with empty body",
    code: `function f()
    for i in z
    end
end`
  },
  {
    name: "For with simple statement in body",
    code: `function f()
    for i in z
        x
    end
end`
  },
  {
    name: "For with tilde in body",
    code: `function f()
    for i in z
        x ~ y
    end
end`
  },
  {
    name: "Statement then for",
    code: `function f()
    x
    for i in z
    end
end`
  },
  {
    name: "Tilde then for (like original)",
    code: `function f()
    mean ~ MvNormal() 
    for i in z
    end
end`
  },
  {
    name: "Assignment then for",
    code: `function f()
    mean = MvNormal() 
    for i in z
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
