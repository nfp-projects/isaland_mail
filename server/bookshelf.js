import _ from 'lodash'
import knex from 'knex'
import bookshelf from 'bookshelf'

import config from '../config'
import log from '../log'

let host = config.get('knex:connection')
/* istanbul ignore if  */
if (host.match && host.match(/@[^/]+/)) {
  host = host.match(/@[^/]+/)[0]
}

log.info(host, 'Connecting to DB')

const client = knex(config.get('knex'))

// Check if we're running tests while connected to
// potential production environment.
/* istanbul ignore if  */
if (config.get('NODE_ENV') === 'test' &&
    config.get('knex:connection:database') !== 'test' ||
    config.get('knex:connection:connection')) {
  // There is an offchance that we're running tests on
  // production database. Exit NOW!
  log.error('Critical: potentially running test on production enviroment. Shutting down.')
  process.exit(1)
}

let shelf = bookshelf(client)

// Helper method to create models
shelf.createModel = (attr, opts) => {
  // Create default attributes to all models
  let attributes = _.defaults(attr, {
    initialize() {
      this.on('fetching', this.checkFetching)
    },

    remove() {
      return this.destroy()
    },

    checkFetching(model, columns, options) {
      // options.query.where({ is_deleted: false })
    },
  })

  // Create default options for all models
  let options = _.defaults(opts, {
    create(data) {
      return this.forge(data).save()
    },

    getSingle(id, withRelated = [], required = true) {
      let where = { id: Number(id) || 0 }

      return this.query({ where })
        .fetch({ require, withRelated })
    },

    getAll(where = {}, withRelated = []) {
      return this.query({ where })
        .fetchAll({ withRelated })
    },
  })

  return shelf.Model.extend(attributes, options)
}

export default shelf
