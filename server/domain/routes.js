import Domain from './model'

export async function deleteDomain(ctx) {
  let domain = await Domain.getSingle(ctx.request.body.domain)

  let now = new Date().getTime()

  if (now - domain.get('created').getTime() > 1000 * 60 * 60 * 24) {
    throw new Error(`Cannot delete domain ${domain.get('domain')}, too long has passed.`)
  }

  await domain.remove()

  ctx.redirect('/')
}

export async function createDomain(ctx) {
  let body = ctx.request.body

  if (!body.domain ||
      !body.domain.match(/[a-z0-9]+\.[a-z]+/)) {
    throw new Error('Domain was invalid')
  }

  await Domain.create({ domain: ctx.request.body.domain })

  ctx.redirect('/')
}
