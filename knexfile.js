'use strict'
require('babel-register')

const _ = require('lodash')
const config = require('./config')

let out = {}

// This is important for setup to run cleanly.
let knexConfig = _.cloneDeep(config.get('knex'))
knexConfig.pool = { min: 1, max: 1 }

out[config.get('NODE_ENV')] = knexConfig

module.exports = out
