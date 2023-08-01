import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export type TransactionsTable = {
  id: string
  title: string
  amount: number
  created_at: Generated<Date>
  session_id: string | undefined
}

export type Database = {
  transactions: TransactionsTable
}

export type Transaction = Selectable<TransactionsTable>
export type NewTransaction = Insertable<TransactionsTable>
export type TransactionUpdate = Updateable<TransactionsTable>
