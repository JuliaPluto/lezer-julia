import { styleTags, tags as t } from "@lezer/highlight";

export const juliaHighlighting = styleTags({
  "String TripleString CommandString": t.string,

  // The interpolation brackets (`$(` and `)`)
  "String/$ TripleString/$ CommandString/$": t.special(t.bracket),
  "String/( TripleString/( CommandString/(": t.special(t.bracket),
  "String/) TripleString/) CommandString/)": t.special(t.bracket),

  Comment: t.lineComment,
  BlockComment: t.comment,

  "mutable struct StructDefinition/end": t.definitionKeyword,
  "primitive type PrimitiveDefinition/end": t.definitionKeyword,
  "const local global": t.definitionKeyword,
  // "module ModuleDefinition/end import using export": t.moduleKeyword,

  "ForStatement/for ForBinding/in ForStatement/end": t.controlKeyword,
  "WhileStatement/while WhileStatement/end": t.controlKeyword,
  "IfClause/if IfClause/elseif ElseClause/else IfStatement/end":
    t.controlKeyword,
  "default break return": t.controlKeyword,
  "TryStatement/try CatchClause/catch FinallyClause/finally TryStatement/end":
    t.controlKeyword,

  "( )": t.paren,
  "[ ]": t.squareBracket,
  "{ }": t.brace,
  keyword: t.keyword,

  BooleanLiteral: t.bool,
  Number: t.number,
  "Coefficient/PrefixedString!": t.unit,

  // Look at us being rascals
  "Type! TypeParameters!": t.typeName,
  // "StructDefinition/Definition! PrimitiveDefinition/Definition! AbstractDefinition/Definition!":
  //   t.definition(t.typeName),
  "StructDefinition/Identifier StructDefinition/AssignmentExpression/Identifier StructDefinition/TypedExpression/Identifier StructDefinition/AssignmentExpression/TypedExpression/Identifier":
    t.definition(t.propertyName),

  ":: <:": t.typeOperator,

  Identifier: t.variableName,

  "MacroIdentifier! MacroFieldExpression!": t.macroName,
  "MacroDefinition/Definition!": t.definition(t.macroName),

  "FieldName!": t.propertyName,
  FieldExpression: t.propertyName,
  "FieldExpression .": t.derefOperator,
  "Symbol!": t.atom,

  "BeginIndex EndIndex": t.special(t.variableName),
});
