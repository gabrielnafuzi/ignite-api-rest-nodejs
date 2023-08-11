import { randomUUID } from 'crypto'
import { type FastifyInstance } from 'fastify'
import { z } from 'zod'

import { db } from '../database'

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
  app.get('/', async (_req, reply) => {
    const transactions = await db
      .selectFrom('transactions')
      .selectAll()
      .execute()

    return reply.send({ transactions })
  })

  app.get('/:id', async (req, reply) => {
    const params = getTransactionParamsSchema.parse(req.params)

    const transaction = await db
      .selectFrom('transactions')
      .selectAll()
      .where('id', '=', params.id)
      .executeTakeFirst()

    if (!transaction) {
      return reply.status(404).send({ message: 'Transaction not found' })
    }

    return reply.send({ transaction })
  })

  app.get('/summary', async (_res, reply) => {
    const summary = await db
      .selectFrom('transactions')
      .select(({ fn }) => fn.sum('amount').as('amount'))
      .executeTakeFirst()

    return reply.send({ summary })
  })

  app.post('/', async (req, reply) => {
    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    const transaction = await db
      .insertInto('transactions')
      .values({
        id: randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
      })
      .returningAll()
      .executeTakeFirst()

    return reply.status(201).send({ transaction })
  })
}
