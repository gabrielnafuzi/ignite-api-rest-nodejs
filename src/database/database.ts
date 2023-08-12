import SQLite from 'better-sqlite3'
import { Kysely, PostgresDialect, SqliteDialect } from 'kysely'
import { Pool } from 'pg'

import { env } from '../env'
import type { Database } from './types'

const getDialect = () => {
  if (env.DATABASE_CLIENT === 'sqlite') {
    return new SqliteDialect({
      database: new SQLite(env.DATABASE_URL),
    })
  }

  if (env.DATABASE_CLIENT === 'pg') {
    return new PostgresDialect({
      pool: new Pool({
        connectionString: env.DATABASE_URL,
      }),
    })
  }

  throw new Error(`Unsupported database client: ${env.DATABASE_CLIENT}`)
}

export const db = new Kysely<Database>({
  dialect: getDialect(),
})
