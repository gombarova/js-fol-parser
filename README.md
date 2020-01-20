# Parsers for first-order languages

A set of parser for first order languages with many ways of writing
connectives and several alternative grammars.

## Factories

Most parsers take a plain object consisting of factory functions that
are expected to create representations of syntactic elements recognized
by the parser. The full set of factories is as follows:
```typescript
type Factories = {
  variable: (symbol: string, ee: ErrorExpected) => any,
  constant: (symbol: string, ee: ErrorExpected) => any,
  functionApplication: (symbol: string, args: Array<any>, ee: ErrorExpected) => any,
  predicateAtom: (symbol: string, args: Array<any>, ee: ErrorExpected) => any,
  equalityAtom: (lhs: any, rhs: any, ee: ErrorExpected) => any,
  negation: (subf: any, ee: ErrorExpected) => any,
  conjunction: (lhs: any, rhs: any, ee: ErrorExpected) => any,
  disjunction: (lhs: any, rhs: any, ee: ErrorExpected) => any,
  implication: (lhs: any, rhs: any, ee: ErrorExpected) => any,
  equivalence: (lhs: any, rhs: any, ee: ErrorExpected) => any,
  existentialQuant: (variable: string, subf: any, ee: ErrorExpected) => any,
  universalQuant: (variable: string, subf: any, ee: ErrorExpected) => any,
  literal: (negated: boolean, symbol: string, args: Array<any>, ee: ErrorExpected) => any,
  clause: (literals: Array<any>) => any,
}
type ErrorExpected = {
    error: (message: string) => (),
    expected: (expectation: string) => ()
}
```
Not all parsers need all factories.

Typically, each factory will construct a node in an abstract syntax tree
representing the given case. In case of function applications and predicate
atoms, the factory can use two callbacks to the parser provided in the `ee`
argument to throw a syntax error if the number of arguments provided
differs from the symbol arity.
```javascript
{
  variable: (symbol, _) => new Variable(symbol),
  ...,
  predicateAtom: (symbol, args, {expected}) => {
    const a = arity(symbol);
    if (args.length !== a) {
        expected(`${a} argument${(a == 1 ? '' : 's')} to ${symbol}`);
    }
    return new PredicateAtom(symbol, args);
  }
  ...
}
```
Note that `ee.error(message)` generates a syntax error with `message`
while `ee.expected(expectation)` generates a syntax error with the message
<code>\`Expected ${expectation} but ${actual_input} found.\`</code>.

## Language callbacks

Some of the parsers takes a plain object of callbacks that recognize the
three types of non-logical symbols and variables.
```typescript
type Language = {
    isConstant: (symbol: string) => boolean,
    isFunction: (symbol: string) => boolean,
    isPredicate: (symbol: string) => boolean,
    isVariable: (symbol: string) => boolean
}
```
When the parser encounters a JavaScript identifier, it uses these callbacks
to determine the type of the non-logical symbol.

## Clauses

The parser of clauses recognizes disjunctions of first-order predicate
literals (equality literals are not allowed). Literals can be join
by any disjunction symbol (typically `∨` or `|`) or the comma (`,`).
The empty clause can be given by several symbols (typically `□` or `[]`).
The empty string is not considered the empty clause. The empty clause cannot
be used as a literal.

The clause parser could be typed as follows:
```typescript
function parseClause(input: string, language: Language, factories: Factories): any
```
The parser only needs two factories: `literal` and `clause`.

The parser is typically used as follows: Suppose we have classes `Literal`
and `Clause` defined in a module `clauses.js` and that we use the
parser in a function that obtain the sets of symbols `constants`,
`functions`, and `predicates`. The clause parser is then set up and called
as follows:
```javascript
import {parseClause} from 'js-fol-parser';
import {Literal, Clause} from './clauses.js';

function someFunctionUsingTheParser(constants, functions, predicates) {
    ...
    const language = {
        isConstant: (symbol) => constants.has(symbol),
        isFunction: (symbol) => functions.has(symbol),
        isPredicate: (symbol) => predicates.has(symbol),
        isVariable: (symbol) =>
            !constants.has(symbol) && !functions.has(symbol) &&
            !predicates.has(symbol),
    }
    const factories = {
        literal: (negated, symbol, args, _) =>
            new Literal(negated, symbol, args),
        clause: (literals) =>
            new Clause(literals)
    }
    const clause = parseClause(input, language, factories);
    ...
}
```

## Logical symbols

The parser recognizes many alternative ways of writing logical symbols.
The alternatives are listed below directly in the PEGjs syntax.

```pegjs
EqualitySymbol
    "equality symbol"
    = "="

ConjunctionSymbol
    "conjunction symbol"
    = "∧"
    / "&&"
    / "&"
    / "/\\"
    / "\\land" ! IdentifierPart
    / "\\wedge" ! IdentifierPart

DisjunctionSymbol
    "disjunction symbol"
    = "∨"
    / "||"
    / "|"
    / "\\/"
    / "\\lor" ! IdentifierPart
    / "\\vee" ! IdentifierPart

ImplicationSymbol
    "implication symbol"
    = "→" / "⇒" / "⟶" / "⟹" / "⊃"
    / "->" / "=>" / "-->" / "==>"
    / "\\limpl" ! IdentifierPart
    / "\\implies" ! IdentifierPart
    / "\\rightarrow" ! IdentifierPart
    / "\\to" ! IdentifierPart

EquivalenceSymbol
    "equivalence symbol"
    = "↔︎" / "⟷" / "⇔" / "⟺" / "≡"
    / "<->" / "<-->" / "<=>" / "<==>" / "==="
    / "\\lequiv" ! IdentifierPart
    / "\\leftrightarrow" ! IdentifierPart
    / "\\equivalent" ! IdentifierPart
    / "\\equiv" ! IdentifierPart

ExistsSymbol
    "existential quantifier"
    = "∃"
    / "\\e" ( "x" "ists"? )? ! IdentifierPart
    / "\\E" ! IdentifierPart

ForallSymbol
    "universal quantifier"
    = "∀"
    / "\\forall" ! IdentifierPart
    / "\\all" ! IdentifierPart
    / "\\a" ! IdentifierPart
    / "\\A" ! IdentifierPart

NegationSymbol
    "negation symbol"
    = "¬"
    / "-" / "!" / "~"
    / "\\neg" ! IdentifierPart
    / "\\lnot" ! IdentifierPart

NonEqualitySymbol
    "non-equality symbol"
    = "≠"
    / "!=" / "<>" / "/="
    / "\\neq" ! IdentifierPart

EmptyClause
    "empty clause symbol"
    = "□" / "▫︎" / "◽︎" / "◻︎" / "⬜︎" / "▢" / "⊥"
    / "[]" / "_|_"
    / "\\square" ! IdentifierPart
    / "\\Box"  ! IdentifierPart
    / "\\qed" ! IdentifierPart
```
