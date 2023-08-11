/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
!process.env.SKIP_ENV_VALIDATION && require('./env')

import fastify from 'fastify'

import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(transactionsRoutes, { prefix: '/transactions' })

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server listening on port ${env.PORT}`)
  })
