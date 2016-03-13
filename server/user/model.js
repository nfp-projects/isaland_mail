import crypto from 'crypto'
import bookshelf from '../bookshelf'

const Email = bookshelf.createModel({
  tableName: 'users',
}, {
  hash(password) {
    let hashed = crypto
      .createHash('sha512')
      .update(password)
      .digest('base64')

    return `{SHA512}${hashed}`
  },
})

export default Email
