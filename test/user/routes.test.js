import assert from 'assert-extended'
import sinon from 'sinon'
import 'sinon-as-promised'

import { model } from '../helper.db'

describe('User (Routes)', () => {
  const routes = require('../../server/user/routes')
  const User = require('../../server/user/model').default

  let ctx
  let sandbox
  let testUser

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

  describe('#deleteUser()', () => {
    let stubGetSingle
    let dateNow

    beforeEach(() => {
      stubGetSingle = sandbox.stub(User, 'getSingle')
      dateNow = new Date().getTime()
    })

    it('should fetch user and fail if too long has passed', async () => {
      const assertId = '123'
      const assertEmail = 'asdf@asdf.com'
      testUser = model(sandbox, 'domain', {
        id: assertId,
        email: assertEmail,
        created: new Date(dateNow - 1000 * 60 * 60 * 24 - 1),
      })
      stubGetSingle.resolves(testUser)
      ctx.request.body.id = assertId

      let err = await assert.isRejected(routes.deleteUser(ctx))

      assert.strictEqual(stubGetSingle.firstCall.args[0], assertId)
      assert.notOk(testUser.remove.called)
      assert.match(err.message, /delete/)
      assert.match(err.message, new RegExp(assertEmail))
    })

    it('delete errors should propogate', async () => {
      const assertError = new Error('testety')
      testUser = model(sandbox, 'domain', {
        created: new Date(),
      })
      stubGetSingle.resolves(testUser)
      testUser.remove.rejects(assertError)

      let err = await assert.isRejected(routes.deleteUser(ctx))

      assert.strictEqual(err, assertError)
    })

    it('should delete user if within 24 hours', async () => {
      testUser = model(sandbox, 'domain', {
        created: new Date(dateNow - 1000 * 60 * 60 * 24 + 2000),
      })
      stubGetSingle.resolves(testUser)

      await assert.isFulfilled(routes.deleteUser(ctx))

      assert.ok(testUser.remove.called)
      assert.ok(ctx.redirect.called)
      assert.strictEqual(ctx.redirect.firstCall.args[0], '/')
    })
  })

  describe('#createUser()', () => {
    let stubCreate

    beforeEach(() => {
      stubCreate = sandbox.stub(User, 'create')
      ctx.request.body = {
        email: 'asdf@asdf.com',
        password: 'testetytest',
      }
    })

    it('should fail if body does not have correct email format', async () => {
      delete ctx.request.body.email

      await assert.isRejected(routes.createUser(ctx))

      ctx.request.body.email = ''

      await assert.isRejected(routes.createUser(ctx))

      ctx.request.body.email = 'testety'

      await assert.isRejected(routes.createUser(ctx))
    })

    it('should fail if password is not defined or too short', async () => {
      delete ctx.request.body.password

      await assert.isRejected(routes.createUser(ctx))

      ctx.request.body.password = ''

      await assert.isRejected(routes.createUser(ctx))

      ctx.request.body.password = 'teste'

      await assert.isRejected(routes.createUser(ctx))
    })

    it('create errors should propogate', async () => {
      const assertError = new Error('bla bla')
      stubCreate.rejects(assertError)

      let err = await assert.isRejected(routes.createUser(ctx))

      assert.strictEqual(err, assertError)
    })

    it('should otherwise call create and redirect', async () => {
      const assertPassword = 'asdfasdf'
      ctx.request.body.password = assertPassword

      await assert.isFulfilled(routes.createUser(ctx))

      assert.ok(stubCreate.called)
      assert.notStrictEqual(assertPassword, ctx.request.body.password)
      assert.deepEqual(stubCreate.firstCall.args[0], ctx.request.body)
      assert.ok(ctx.redirect.called)
      assert.strictEqual(ctx.redirect.firstCall.args[0], '/')
    })
  })
})
