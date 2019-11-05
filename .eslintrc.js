module.exports = {
  extends: [
      require.resolve('kcd-scripts/eslint.js')
  ],
  overrides: [
    {
      files: ['src/parser/index.js'],
      rules: {
        'babel/new-cap': 'off',
        'babel/no-invalid-this': 'off',
        'babel/quotes': 'off',
        'complexity': 'off',
        'func-names': 'off',
        'id-match': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'max-statements-per-line': 'off',
        'max-depth': 'off',
        'no-control-regex': 'off',
        'no-negated-condition': 'off',
        'no-shadow': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'no-var': 'off',
        'no-void': 'off',
        'one-var': 'off',
        'object-shorthand': 'off',
        'prefer-template': 'off',
        'strict': 'off',
        'vars-on-top': 'off',
      }
    }
  ]
}