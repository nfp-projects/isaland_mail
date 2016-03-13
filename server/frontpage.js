import Domain from './domain/model'
import User from './user/model'

export default async function frontpage(ctx) {
  let domains = await Domain.getAll()
  let emails = await User.getAll()

  ctx.render('frontpage', {
    domains: domains.toJSON(),
    emails: emails.toJSON(),
    now: new Date().getTime()
  })
}
