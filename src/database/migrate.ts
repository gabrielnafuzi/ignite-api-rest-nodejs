/* eslint-disable no-console */
import { FileMigrationProvider, type Kysely, Migrator } from 'kysely'
import fs from 'node:fs/promises'
import path from 'path'

import { db } from './database'

export async function migrateToLatest<T>(
  db: Kysely<T>,
  migrationFolder: string,
) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder,
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  console.log('💫 Migrated successfully')

  await db.destroy()
}

const migrationFolder = path.join(__dirname, 'migrations')
migrateToLatest(db, migrationFolder)
