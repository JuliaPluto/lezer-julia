import { styleTags, tags as t } from "@lezer/highlight";

export const juliaHighlighting = styleTags({
  LineComment: t.lineComment,
  BlockComment: t.blockComment,

  Identifier: t.variableName,
  "Type/...": t.typeName,
  "Field/Identifier": t.propertyName,
  "MacroIdentifier!": t.macroName,
  "NsStringLiteral/Identifier": t.macroName,
  "NsCommandLiteral/Identifier": t.macroName,
  "Symbol!": t.atom,
  "begin end": t.constant(t.variableName), // begin/end indices

  CharLiteral: t.character,
  EscapeSequence: t.escape,
  IntegerLiteral: t.integer,
  FloatLiteral: t.float,
  BoolLiteral: t.bool,

  "BeginStatement/begin BeginStatement/end": t.keyword,
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
  "export public import using as": t.moduleKeyword,

  "in isa where": t.operatorKeyword,

  /// String content
  StringLiteral: t.string,
  CommandLiteral: t.special(t.string),
  NsStringLiteral: t.string,
  NsCommandLiteral: t.special(t.string),

  /// String quotation marks
  'StringLiteral/"\\""    StringLiteral/"\\"\\"\\""': t.string,
  "CommandLiteral/`       CommandLiteral/```": t.special(t.string),
  'NsStringLiteral/"\\""  NsStringLiteral/"\\"\\"\\""': t.special(t.macroName),
  "NsCommandLiteral/`     NsCommandLiteral/```": t.special(t.macroName),

  /// String interpolations
  "StringLiteral/$": t.special(t.bracket),
  "CommandLiteral/$": t.special(t.bracket),
  "StringLiteral/ParenExpression/( StringLiteral/ParenExpression/)": t.special(t.bracket),
  "CommandLiteral/ParenExpression/( CommandLiteral/ParenExpression/)": t.special(t.bracket),
  "CommandLiteral/VectorExpression/[ CommandLiteral/VectorExpression/]": t.special(t.bracket),

  PowerOp: t.arithmeticOperator,
  "UnaryOp UnaryPlusOp": t.arithmeticOperator,
  // juxt
  BitshiftOp: t.operator,
  RationalOp: t.arithmeticOperator,
  TimesOp: t.arithmeticOperator,
  "PlusOp Dollar": t.arithmeticOperator,
  "EllipsisOp Colon": t.operator,
  "PipeLeftOp PipeRightOp": t.operator,
  "ComparisonOp TypeComparisonOp": t.compareOperator,
  "LazyAndOp LazyOrOp": t.logicOperator,
  ArrowOp: t.operator,
  'TernaryExpression/"?" TernaryExpression/":"': t.controlOperator,
  PairOp: t.operator,
  AssignmentOp: t.definitionOperator,
  UpdateOp: t.updateOperator,

  "->": t.definitionOperator,
  ". ... ::": t.punctuation,

  "( )": t.paren,
  "[ ]": t.squareBracket,
  "{ }": t.brace,
});
