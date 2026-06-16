// CRLF (`\r\n`) line endings must work like LF. Kept as a JS test rather than
// a `.txt` fileTest because literal carriage returns in a text fixture are
// fragile (editors/git normalize them). Julia treats `\n`, `\r` and `\r\n` all
// as line breaks; the `newline` external tokenizer used to recognize only `\n`,
// so every statement boundary and matrix/vcat row past the first errored in a
// CRLF file.
import { parser } from "../dist/index.js";
import assert from "node:assert";

function errorCount(code) {
  let n = 0;
  parser.parse(code).iterate({ enter(node) { if (node.type.isError) n++; } });
  return n;
}

describe("crlf", () => {
  const CR = "\r\n";
  const cases = {
    "two top-level statements": `x = 1${CR}y = 2`,
    "three top-level statements": `a()${CR}b()${CR}c()`,
    "begin block, two statements": `begin${CR}x = 1${CR}y = 2${CR}end`,
    "function body": `function f()${CR}  x${CR}  y${CR}end`,
    "vcat, one element per line": `[1${CR}2${CR}3]`,
    "matrix rows": `[1 2${CR}3 4]`,
    "vcat of tuples": `[(1,2)${CR}(3,4)${CR}(5,6)]`,
    "blank line between statements": `x = 1${CR}${CR}y = 2`,
  };

  for (const [name, code] of Object.entries(cases)) {
    it(name, () => {
      assert.strictEqual(
        errorCount(code),
        0,
        `expected no error nodes for CRLF input ${JSON.stringify(code)}`,
      );
    });
  }

  it("parses CRLF the same as LF", () => {
    for (const code of Object.values(cases)) {
      const crlf = parser.parse(code).toString();
      const lf = parser.parse(code.replace(/\r\n/g, "\n")).toString();
      assert.strictEqual(crlf, lf, `tree differs for ${JSON.stringify(code)}`);
    }
  });
});
