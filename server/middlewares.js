import uuid from 'node-uuid'

export function bunyanLogger(logger) {
  return async (ctx, next) => {
    ctx.log = logger.child({
      req_id: uuid.v4()
    })
    
    ctx.log.info(`--> ${ctx.request.method} ${ctx.request.url}`)

    const d1 = new Date().getTime()

    await next()

    const d2 = new Date().getTime()

    let level = 'info'
    if (ctx.status >= 400) {
      level = 'warn'
    }
    if (ctx.status >= 500) {
      level = 'error'
    }

    ctx.log[level]({
      duration: (d2 - d1),
      status: ctx.res.statusCode,
    }, `<-- ${ctx.request.method} ${ctx.request.url}`)
  }
}

export function errorHandler() {
  return async (ctx, next) => {
    try {
      await next()
    } catch(err) {
      ctx.log.error(err, 'Unknown error occured')
      ctx.status = 500
      ctx.render('error', {
        error: err,
      })
    }
  }
}
