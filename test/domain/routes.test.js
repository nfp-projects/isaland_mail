import assert from 'assert-extended'
import sinon from 'sinon'
import 'sinon-as-promised'

import { model } from '../helper.db'

describe('Domain (Routes)', () => {
  const routes = require('../../server/domain/routes')
  const Domain = require('../../server/domain/model').default

  let ctx
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    ctx = {
      request: { body: {} },
      body: null,
      redirect: sandbox.spy(),
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#deleteDomain()', () => {
    let stubGetSingle
    let dateNow

    beforeEach(() => {
      stubGetSingle = sandbox.stub(Domain, 'getSingle')
      dateNow = new Date().getTime()
    })

    it('should fetch domain and return error if too long has passed', async () => {
      const assertDomain = 'asdf'
      const testDomain = model(sandbox, 'domain', {
        domain: assertDomain,
        created: new Date(dateNow - 1000 * 60 * 60 * 24 - 1),
      })
      stubGetSingle.resolves(testDomain)
      ctx.request.body.domain = assertDomain

      let err = await assert.isRejected(routes.deleteDomain(ctx))

      assert.strictEqual(stubGetSingle.firstCall.args[0], assertDomain)
      assert.notOk(testDomain.remove.called)
      assert.match(err.message, /delete/)
      assert.match(err.message, new RegExp(assertDomain))
    })

    it('delete errors should propogate', async () => {
      const assertError = new Error('testety')
      const testDomain = model(sandbox, 'domain', {
        created: new Date(),
      })
      stubGetSingle.resolves(testDomain)
      testDomain.remove.rejects(assertError)

      let err = await assert.isRejected(routes.deleteDomain(ctx))

      assert.strictEqual(err, assertError)
    })

    it('should delete domain if within 24 hours', async () => {
      const testDomain = model(sandbox, 'domain', {
        domain: 'test',
        created: new Date(dateNow - 1000 * 60 * 60 * 24 + 2000),
      })
      stubGetSingle.resolves(testDomain)

      await assert.isFulfilled(routes.deleteDomain(ctx))

      assert.ok(testDomain.remove.called)
      assert.ok(ctx.redirect.called)
      assert.strictEqual(ctx.redirect.firstCall.args[0], '/')
    })
  })

  describe('#createDomain()', () => {
    let stubCreate

    beforeEach(() => {
      stubCreate = sandbox.stub(Domain, 'create')
      ctx.request.body.domain = 'testety.com'
    })

    it('should fail if body does not have correct domain format', async () => {
      delete ctx.request.body.domain

      await assert.isRejected(routes.createDomain(ctx))

      ctx.request.body.domain = ''

      await assert.isRejected(routes.createDomain(ctx))

      ctx.request.body.domain = 'testety'

      await assert.isRejected(routes.createDomain(ctx))
    })

    it('create errors should propogate', async () => {
      const assertError = new Error('bla bla')
      stubCreate.rejects(assertError)

      let err = await assert.isRejected(routes.createDomain(ctx))

      assert.strictEqual(err, assertError)
    })

    it('should otherwise call create and redirect', async () => {
      const assertDomain = 'testetytest.com'
      ctx.request.body.domain = assertDomain

      await assert.isFulfilled(routes.createDomain(ctx))

      assert.ok(stubCreate.called)
      assert.deepEqual(stubCreate.firstCall.args[0], { domain: assertDomain })
      assert.ok(ctx.redirect.called)
      assert.strictEqual(ctx.redirect.firstCall.args[0], '/')
    })
  })
})
