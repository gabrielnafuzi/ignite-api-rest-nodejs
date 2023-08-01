import { type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('transactions')
    .addColumn('session_id', 'uuid')
    .execute()

  await db.schema
    .createIndex('transactions_session_id_index')
    .on('transactions')
    .column('session_id')
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('transactions_session_id_index').execute()

  await db.schema.alterTable('transactions').dropColumn('session_id').execute()
}
