import { styleTags, tags as t } from "@lezer/highlight";

export const juliaHighlighting = styleTags({
  LineComment: t.lineComment,
  BlockComment: t.blockComment,

  Identifier: t.variableName,
  // TODO: typeName
  // TODO: propertyName
  "MacroIdentifier!": t.macroName,
  "Symbol!": t.atom,

  StringLiteral: t.string,
  CommandLiteral: t.string,
  NsStringLiteral: t.string,
  NsCommandLiteral: t.string,
  CharLiteral: t.character,
  EscapeSequence: t.escape,
  IntegerLiteral: t.integer,
  FloatLiteral: t.float,
  BoolLiteral: t.bool,

  "begin BeginStatement/end": t.keyword,
  "quote QuoteStatement/end": t.keyword,
  "let LetStatement/end": t.keyword,

  "for ForBinding/outer ForBinding/in ForStatement/end": t.controlKeyword,
  "while WhileStatement/end": t.controlKeyword,
  "if else elseif IfStatement/end": t.controlKeyword,
  "try catch finally TryStatement/end": t.controlKeyword,
  "break continue return": t.controlKeyword,

  "abstract primitive type AbstractDefinition/end PrimitiveDefinition/end": t.definitionKeyword,
  "mutable struct StructDefinition/end": t.definitionKeyword,
  "function FunctionDefinition/end": t.definitionKeyword,
  "do DoClause/end": t.definitionKeyword,
  "macro MacroDefinition/end": t.definitionKeyword,
  "const global local": t.definitionKeyword,

  "module baremodule ModuleDefinition/end": t.moduleKeyword,
  "export import using as": t.moduleKeyword, // TODO: Public

  "in isa where": t.operatorKeyword,

  // TODO: Operators

  "( )": t.paren,
  "[ ]": t.squareBracket,
  "{ }": t.brace,
});