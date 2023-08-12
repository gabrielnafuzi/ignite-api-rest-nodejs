import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../app'
import { type CreateTransactionBody } from '../routes/transactions'

describe('Transactions routes', () => {
  const createTransaction = (override?: Partial<CreateTransactionBody>) => {
    return request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
        ...override,
      })
  }

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run migrate:rollback-all')
    execSync('npm run migrate:latest')
  })

  it('user can create a new transaction and receive it back', async () => {
    const createTransactionResponse = await createTransaction().expect(201)

    expect(createTransactionResponse.body.transaction).toEqual({
      id: expect.any(String),
      title: 'New transaction',
      amount: 5000,
      created_at: expect.any(String),
      session_id: expect.any(String),
    })
  })

  it('user can list all transactions', async () => {
    const createTransactionResponse = await createTransaction()

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      {
        id: expect.any(String),
        title: 'New transaction',
        amount: 5000,
        created_at: expect.any(String),
        session_id: expect.any(String),
      },
    ])
  })

  it("user can get a transaction by it's id", async () => {
    const createTransactionResponse = await createTransaction()

    const cookies = createTransactionResponse.get('Set-Cookie')

    const transactionId = createTransactionResponse.body.transaction.id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual({
      id: expect.any(String),
      title: 'New transaction',
      amount: 5000,
      created_at: expect.any(String),
      session_id: expect.any(String),
    })
  })

  it('user can get the summary of all transactions', async () => {
    const createTransactionResponse = await createTransaction({ amount: 3000 })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({ title: 'Other transaction', amount: 5000, type: 'credit' })

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({ title: 'Another transaction', amount: 2000, type: 'debit' })

    const getSummaryResponse = await request(app.server)
      .get(`/transactions/summary`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getSummaryResponse.body.summary).toEqual({
      amount: 3000 + 5000 - 2000,
    })
  })
})
