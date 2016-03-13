import sinon from 'sinon'
import appRoot from 'app-root-path'
import bookshelf from '../server/bookshelf'

export function latest() {
  return bookshelf.knex.migrate.latest({
    directory: appRoot.resolve('/migrations'),
  })
}

before(() =>
  bookshelf.knex.raw('drop schema public cascade')
  .then(() =>
    bookshelf.knex.raw('create schema public')
  )
  .then(() =>
    latest()
  )
)

after(() => true
  // bookshelf.knex.migrate.rollback({
  //   directory: appRoot.resolve('/migrations'),
  // })
)

export function model(sandbox, name, data = {}, related) {
  const Model = require(`../server/${name}/model`).default

  let m = new Model(data)
  if (sandbox) {
    sandbox.stub(m, 'save').resolves(m)
    sandbox.stub(m, 'remove').resolves(m)
  }

  if (related) {
    let stub = sandbox && sandbox.stub || sinon.stub
    let stubRelated = stub(m, 'related')

    for (let key of Object.keys(related)) {
      stubRelated.withArgs(key).returns(
        model(sandbox, key, related[key])
      )
    }
  }

  return m
}

export function clear(names) {
  let clearing = names
  if (typeof(clearing) === 'string') {
    clearing = [clearing]
  }
  return Promise.all(clearing.map((name) =>
      bookshelf.knex(name).del()
    ))
}
