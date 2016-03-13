'use strict'
require('babel-register')

let log = require('./log').default

function exitHandler(options, err) {
  if (options.cleanup) {
    log.warn('Application is shutting down')
  }
  if (err) {
    log.error('An unhandled error occured')
    log.error(err)
  }
  if (options.exit) {
    log.warn('Application is exiting')
    process.exit()
  }
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }))

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }))

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

// Run the database script automatically.
log.info('Running database integrity scan.')
let setup = require('./script/setup')

setup().then(() => {
  require('./server')
}).catch((error) => {
  log.error(error, 'Error while preparing database')
  process.exit(1)
})
