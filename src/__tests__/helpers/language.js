export const constants = ['c', 'aConstant', '1']

const _functions = new Map(Object.entries({
  'f': 1,
  'G': 2,
  'aFunction': 4
}))

export const functions = [..._functions.keys()]

const _predicates = new Map(Object.entries({
  'p': 1,
  'Q': 2,
  'aPredicate': 5
}))

export const predicates = [..._predicates.keys()]

const symbolsWithArity =
  new Map([..._functions].concat([..._predicates]))

const isConstant = i => constants.includes(i)
const isFunction = i => functions.includes(i)
const isPredicate = i => predicates.includes(i)
const isVariable = i =>
  !(isConstant(i) || isFunction(i) || isPredicate(i))
export const arity = s => symbolsWithArity.get(s)

export default {
  isConstant,
  isFunction,
  isPredicate,
  isVariable
}
