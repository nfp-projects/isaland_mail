#!/usr/bin/env node
/* eslint-disable no-console */
'use strict'

const _ = require('lodash')
const appRoot = require('app-root-path')
const config = require(appRoot.resolve('/config'))
let log = require(appRoot.resolve('/log')).default

// This is important for setup to run cleanly.
let knexConfig = _.cloneDeep(config.get('knex'))
knexConfig.pool = { min: 1, max: 1 }

let knex = require('knex')(knexConfig)

log.info(knexConfig, 'Connected to database')

let setup = module.exports = () =>
  knex.migrate.latest({
    directory: appRoot.resolve('/migrations'),
  })
  .then((result) => {
    if (result[1].length === 0) {
      return log.info('Database is up to date')
    }
    for (let i = 0; i < result[1].length; i++) {
      log.info('Applied migration from', result[1][i].substr(result[1][i].lastIndexOf('\\') + 1))
    }
    return knex.destroy()
  })

if (require.main === module) {
  // Since we're running this as a script, we should output
  // directly to the console.
  log = console
  log.info = console.log.bind(console)

  setup().then(() => {
    log.info('Setup ran successfully.')
  }).catch((error) => {
    log.error(error, 'Error while running setup.')
  }).then(() => {
    process.exit(0)
  })
}
