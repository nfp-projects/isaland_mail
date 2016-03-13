import assert from 'assert-extended'

import * as helper from '../helper.db'

describe('User (Model)', () => {
  const User = require('../../server/user/model').default

  before(() =>
    helper.clear(['users'])
  )

  after(() =>
    helper.clear(['users'])
  )

  describe('#getSingle()', () => {
    let testUser

    before(() =>
      helper.clear(['users'])
        .then(() => User.create({ email: 'test@test.com' }))
        .then(user => (testUser = user))
    )

    it('should support getting a user', async () => {
      let user = await User.getSingle(testUser.id)
      assert.ok(user)
    })
  })

  describe('#remove()', () => {
    let testUser

    before(() =>
      helper.clear(['users'])
        .then(() => User.create({ email: 'test@test.com' }))
        .then(user => (testUser = user))
    )

    it('should support deleting a user', async () => {
      let user = await User.getSingle(testUser.id)

      await user.remove()

      await assert.isRejected(User.getSingle(testUser.id))
    })
  })

  describe('#hash()', () => {
    it('should return different but same result for hashing', () => {
      const assertPassword = 'asdfasdf'
      const test1 = User.hash(assertPassword)

      assert.notStrictEqual(test1, assertPassword)

      const test2 = User.hash(assertPassword)

      assert.strictEqual(test2, test1)
    })

    it('should prefix with sha512', () => {
      const test1 = User.hash('test')

      assert.match(test1, /^\{SHA512\}/)
    })
  })
})
