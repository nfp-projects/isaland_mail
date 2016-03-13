import Koa from 'koa'
import koaRouter from 'koa-router'
import Jade from 'koa-jade'
import koaBody from 'koa-bodyparser'
import config from '../config'
import log from '../log'
import { bunyanLogger, errorHandler } from './middlewares'

import frontpage from './frontpage'
import * as domain from './domain/routes'
import * as user from './user/routes'

const app = new Koa()
const router = koaRouter()

app.use(bunyanLogger(log))
app.use(errorHandler())
app.use(router.routes())
app.use(router.allowedMethods())

const jade = new Jade({
  viewPath: './views',
  debug: false,
  pretty: true,
  compileDebug: false,
  helperPath: [
    { _: require('lodash') },
  ],
  app,
})


jade.locals.config = config

router.get('/', frontpage)

router.post('/domains', koaBody(), domain.createDomain)
router.post('/domains/:id/delete', koaBody(), domain.deleteDomain)

router.post('/users', koaBody(), user.createUser)
router.post('/users/:id/delete', koaBody(), user.deleteUser)

app.listen(config.get('server:port'), () => {
  log.info(`Server is running on ${config.get('NODE_ENV')} at ${config.get('server:port')}`)
})
