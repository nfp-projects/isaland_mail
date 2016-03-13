import bookshelf from '../bookshelf'

const Domain = bookshelf.createModel({
  tableName: 'domains',
  idAttribute: null,

  remove() {
    return this.query({ where: { domain: this.get('domain') } }).destroy()
  },
}, {
  getSingle(domain, withRelated = [], required = true) {
    let where = { domain }

    return this.query({ where })
      .fetch({ require, withRelated })
  },
})

export default Domain
