import {parseTerm, SyntaxError} from '../index'

import language, {constants} from './helpers/language'

import factories from './helpers/factories'

const parse = str => parseTerm(str, language, factories)

describe('term parsing', () => {
  test.each(['x', 'F', '$v', '_', '$_', '__proměnná$'])
    ('variable %s', (v) => {
      expect(parse(v)).toBe(`v:${v}`)
    });

  test.each(constants)('constant %s', (c) => {
    expect(parse(c)).toBe(`c:${c}`)
  })

  test('function application term', () => {
    expect(parse('f(1)')).toBe('f(c:1)');
    expect(parse('G(x,1)')).toBe('G(v:x,c:1)');
    expect(parse('f ( 1 ) ')).toBe('f(c:1)');
    expect(parse('aFunction(\n\tG(\n\t  f(x),\n\t  G(1,aConstant)\n),\n\t$v,\n\t1,\n\tf(c))'))
      .toBe('aFunction(G(f(v:x),G(c:1,c:aConstant)),v:$v,c:1,f(c:c))');
  })

  test('non-terms', () => {
    expect(() => parse('x(x)')).toThrow(SyntaxError);
    expect(() => parse('c(x)')).toThrow(SyntaxError);
    expect(() => parse('f()')).toThrow(SyntaxError);
    expect(() => parse('f(x,)')).toThrow(SyntaxError);
    expect(() => parse('f(,x)')).toThrow(SyntaxError);
    expect(() => parse('G(x,)')).toThrow(SyntaxError);
    expect(() => parse('G(,x)')).toThrow(SyntaxError);
    expect(() => parse('f(x,y)')).toThrow(/1 argument to f/);
    expect(() => parse('G(x)')).toThrow(/2 arguments to G/);
    expect(() => parse('aFunction(1,c)')).toThrow(/4 arguments to aFunction/);
  })
})
