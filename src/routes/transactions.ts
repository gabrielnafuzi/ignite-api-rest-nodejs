import { randomUUID } from 'crypto'
import { type FastifyInstance } from 'fastify'
import { z } from 'zod'

import { db } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

const getTransactionParamsSchema = z.object({
  id: z.string(),
})

// eslint-disable-next-line require-await -- Fastify requires routes to be async
export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    const { sessionId } = req.cookies

    const transactions = await db
      .selectFrom('transactions')
      .selectAll()
      .where('session_id', '=', sessionId)
      .execute()

    return reply.send({ transactions })
  })

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const params = getTransactionParamsSchema.parse(req.params)

      const transaction = await db
        .selectFrom('transactions')
        .selectAll()
        .where('id', '=', params.id)
        .where('session_id', '=', sessionId)
        .executeTakeFirst()

      if (!transaction) {
        return reply.status(404).send({ message: 'Transaction not found' })
      }

      return reply.send({ transaction })
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (_res, reply) => {
      const { sessionId } = _res.cookies

      const summary = await db
        .selectFrom('transactions')
        .where('session_id', '=', sessionId)
        .select(({ fn }) => fn.sum('amount').as('amount'))
        .executeTakeFirst()

      return reply.send({ summary })
    },
  )

  app.post('/', async (req, reply) => {
    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: SEVEN_DAYS_IN_MS,
      })
    }

    const transaction = await db
      .insertInto('transactions')
      .values({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      .returningAll()
      .executeTakeFirst()

    return reply.status(201).send({ transaction })
  })
}
