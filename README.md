# Parsers for first-order languages

A set of parser for first order languages with many ways of writing
connectives and several alternative grammars.

## Factories

Most parsers take a plain object consisting of factory functions that
are expected to create representations of syntactic elements recognized
by the parser. The required set of factories depends on the parser.

The most basic sets consists of factories producing terms:
```typescript
interface TermFactories<Term> {
    variable: (symbol: string, ee: ErrorExpected) => Term,
    constant: (symbol: string, ee: ErrorExpected) => Term,
    functionApplication: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Term
}
```

Parsers of formulas need term factories and factories producing the various
cases of formulas:
```typescript
interface FormulaFactories<Term, Formula>
extends TermFactories<Term> {
    variable: (symbol: string, ee: ErrorExpected) => Term,
    constant: (symbol: string, ee: ErrorExpected) => Term,
    functionApplication: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Term,
    predicateAtom: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Formula,
    equalityAtom: (lhs: Term, rhs: Term, ee: ErrorExpected) => Formula,
    negation: (subf: Formula, ee: ErrorExpected) => Formula,
    conjunction: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    disjunction: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    implication: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    equivalence: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    existentialQuant: (variable: string, subf: Formula, ee: ErrorExpected) => Formula,
    universalQuant: (variable: string, subf: Formula, ee: ErrorExpected) => Formula
}
```

Parsers of clauses require term factories and factories producing literals
and clauses:
```typescript
interface ClauseFactories<Term, Literal, Clause>
extends TermFactories<Term> {
    literal: (negated: boolean, symbol: string, args: Array<Term>, ee: ErrorExpected) => Literal,
    clause: (literals: Array<Literal>) => Clause,
}
```

Typically, each factory will construct a node of an abstract syntax tree
representing the given case.
However, factories can produce any output.
For instance,
they can directly generate canonical string representations
of terms and formulas,
or directly evaluate them, returning domain elements for terms
and booleans for formulas, respectively.

Factories can use two callbacks to the parser provided in the `ee` argument
to throw a syntax error.
```typescript
interface ErrorExpected {
    error: (message: string) => void,
    expected: (expectation: string) => void
}
```
Throwing syntax errors is useful, e.g.,
if the number of arguments provided
in a function application or a predicate atom
differs from the symbol arity.
This can be seen in the examples of parser usage below.

Note that `ee.error(message)` generates a syntax error with `message`
while `ee.expected(expectation)` generates a syntax error with the message
<code>\`Expected ${expectation} but "${actual_input}" found.\`</code>.
The latter should be preferred.

## Language callbacks

Some parsers take a plain object of callbacks that recognize the three types
of non-logical symbols and the variables of a first-order language.
```typescript
interface Language {
    isConstant: (symbol: string) => boolean,
    isFunction: (symbol: string) => boolean,
    isPredicate: (symbol: string) => boolean,
    isVariable: (symbol: string) => boolean,
}
```
When the parser encounters a JavaScript identifier,
it uses these callbacks to determine the type of the symbol.

## Clauses

The parser of clauses recognizes (possibly nested) disjunctions of
first-order predicate literals. Equality literals are not allowed.
Literals can be joined by any disjunction symbol (typically `∨` or `|`)
or the comma (`,`).
The empty clause can be given by several symbols (typically `□` or `[]`).
The empty string is not considered the empty clause.
The empty clause cannot be used as a literal.

The clause parser could be typed as follows:
```typescript
function parseClause<Term, Literal, Clause>(input: String, language: Language, factories: ClauseFactories<Term, Literal, Clause>): Clause
```

The parser is typically used as follows:
Suppose that we have classes `Literal` and `Clause`
defined in a module `clauses.js`,
classes `Variable`, `Constant`, and `FunctionApplication`
defined in a module `terms.js`,
and that we use the clause parser in a function
that obtains the set of symbols `constants`,
and two maps of symbols to arities `functions` and `predicates`.
The clause parser is then set up and called as follows:
```javascript
import {parseClause} from '@fmfi-uk-1-ain-412/js-fol-parser';
import {Constant, Variable, FunctionApplication} from "./terms.js";
import {Literal, Clause} from './clauses.js';

function usingTheClauseParser(constants, functions, predicates) {
    ...
    const nonLogicalSymbols =
        new Set([...constants, ...functions.keys(), ...predicates.keys()])

    const language = {
        isConstant: (symbol) =>
            constants.has(symbol),
        isFunction: (symbol) =>
            functions.has(symbol),
        isPredicate: (symbol) =>
            predicates.has(symbol),
        isVariable: (symbol) =>
            !nonLogicalSymbols.has(symbol),
    }

    function checkArity(symbol, args, arityMap, {expected}) {
        const a = arityMap.get(symbol);
        if (args.length !== a) {
            expected(`${a} argument${(a == 1 ? '' : 's')} to ${symbol}`);
        }
    }

    const factories = {
        variable: (symbol, _) =>
            new Variable(symbol),
        constant: (symbol, _) =>
            new Constant(symbol),
        functionApplication: (funSymbol, args, ee) => {
            checkArity(funSymbol, args, functions, ee);
            return new FunctionApplication(funSymbol, args);
        },
        literal: (negated, predSymbol, args, ee) => {
            checkArity(predSymbol, args, predicates, ee);
            return new Literal(negated, predSymbol, args);
        },
        clause: (literals, _) =>
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
