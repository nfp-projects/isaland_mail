import User from './model'

export async function deleteUser(ctx) {
  let user = await User.getSingle(ctx.request.body.id)

  let now = new Date().getTime()

  if (now - user.get('created').getTime() > 1000 * 60 * 60 * 24) {
    throw new Error(`Cannot delete user ${user.get('email')}, too long has passed.`)
  }

  await user.remove()

  ctx.redirect('/')
}

export async function createUser(ctx) {
  let body = ctx.request.body

  if (!body.email ||
      !body.email.match(/.+\@.+\..+/)) {
    throw new Error('Email was invalid')
  }

  if (!body.password ||
      body.password.length < 6) {
    throw new Error('Password was too short')
  }

  body.password = User.hash(body.password)

  await User.create(body)

  ctx.redirect('/')
}
