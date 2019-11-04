import { arity } from './language'

const applicationWithArityCheck = (sym, args, expected, _error) => {
  const a = arity(sym);
  if (args.length !== a) {
    expected(`${a} argument${(a == 1 ? '' : 's')} to ${sym}`);
  }
  return `${sym}(${args.join(',')})`;
}

export default {
  variable: (v, _expected, _error) => `v:${v}`,
  constant: (c, _expected, _error) => `c:${c}`,
  functionApplication: applicationWithArityCheck,
}
