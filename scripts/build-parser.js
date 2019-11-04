const path = require('path')

const here = (p) => path.join(__dirname, p)

const spawn = require('cross-spawn')

const {resolveBin} = require('kcd-scripts/dist/utils')

const _startRules = require('../src/parser/startRules')

const startRules = _startRules.default

const grammar = here('../src/parser/grammar.pegjs')

const outputModule = here('../src/parser/index.js')

const allowedStartRules =
  startRules.length === 0 ? [] :
    ['--allowed-start-rules', startRules.join(',')]

const output = ['--output', outputModule]

const result = spawn.sync(
  resolveBin('pegjs'),
  [...output, ...allowedStartRules, grammar],
  {stdio: 'inherit'},
)

/* eslint-disable-next-line no-process-exit */
process.exit(result.status)
