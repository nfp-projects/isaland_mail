import assert from 'assert-extended'

import * as helper from '../helper.db'

describe('Domain (Model)', () => {
  const Domain = require('../../server/domain/model').default

  before(() =>
    helper.clear(['domains'])
  )

  after(() =>
    helper.clear(['domains'])
  )

  describe('#getSingle()', () => {
    let testDomain

    before(() =>
      helper.clear(['domains'])
        .then(() => Domain.create({ domain: 'nfp.is' }))
        .then(domain => (testDomain = domain))
    )

    it('should support getting a domain', async () => {
      let domain = await Domain.getSingle(testDomain.get('domain'))
      assert.ok(domain)
    })
  })

  describe('#remove()', () => {
    let testDomain

    before(() =>
      helper.clear(['domains'])
        .then(() => Domain.create({ domain: 'test.is' }))
        .then(domain => (testDomain = domain))
    )

    it('should support deleting a domain', async () => {
      let domain = await Domain.getSingle(testDomain.get('domain'))

      await domain.remove()

      await assert.isRejected(Domain.getSingle(testDomain.get('domain')))
    })
  })
})
