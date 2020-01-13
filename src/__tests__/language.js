import language, {constants, functions, predicates} from './helpers/language'

describe('language used for testing', () => {
  test('variables', () => {
    ['x', 'F', '$v', '_', '$_', '__proměnná$'].forEach(v =>
      expect(language.isVariable(v)).toBe(true)
    );
  });

  test('constants', () => {
    constants.forEach(c =>
      expect(language.isConstant(c)).toBe(true)
    );
  });

  test('functions', () => {
    functions.forEach(f =>
      expect(language.isFunction(f)).toBe(true)
    );
  });

  test('predicates', () => {
    predicates.forEach(p =>
      expect(language.isPredicate(p)).toBe(true)
    );
  });
})
