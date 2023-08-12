import cookie from '@fastify/cookie'
import fastify from 'fastify'

import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, { prefix: '/transactions' })

// eslint-disable-next-line require-await -- Fastify requires this to be async
app.get('/health', async (_req, reply) => {
  reply.send({ status: 'ok' })
})
