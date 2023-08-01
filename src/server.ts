/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
!process.env.SKIP_ENV_VALIDATION && require('./env')

import fastify from 'fastify'

import { db } from './database'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const transactions = await db
    .selectFrom('transactions')
    .selectAll()
    .where('amount', '=', 1000)
    .execute()

  return transactions
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('HTTP Server Running!')
  })
