import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'

import { env } from '../env'
import type { Database } from './types'

const dialect = new SqliteDialect({
  database: new SQLite(env.DATABASE_URL),
})

export const db = new Kysely<Database>({
  dialect,
})
