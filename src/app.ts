/* eslint-disable require-await -- Fastify requires all handlers to be async */
import cookie from '@fastify/cookie'
import fastify from 'fastify'

import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)

app.addHook('onRequest', async (req) => {
  // eslint-disable-next-line no-console
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`)
})

app.register(transactionsRoutes, { prefix: '/transactions' })

app.get('/health', async (_req, reply) => {
  reply.send({ status: 'ok' })
})
