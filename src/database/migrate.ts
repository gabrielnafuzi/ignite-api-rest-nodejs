/* eslint-disable no-console */
import { program } from 'commander'
import {
  FileMigrationProvider,
  Migrator,
  type MigrationResultSet,
  NO_MIGRATIONS,
} from 'kysely'
import fs from 'node:fs/promises'
import path from 'path'

import { db } from './database'

const showResults = ({ error, results }: MigrationResultSet) => {
  if (results) {
    results.forEach((it) =>
      console.log(`> ${it.status}: ${it.migrationName} (${it.direction})`),
    )

    if (results.length === 0) {
      console.log('> No pending migrations to execute')
    }
  }

  if (error) {
    console.error(error)
    process.exit(1)
  }
}

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    // This needs to be an absolute path.
    migrationFolder: path.join(__dirname, 'migrations'),
  }),
})

const run = () => {
  program
    .command('up')
    .description('Run a pending migration if any')
    .action(async () => {
      console.log('Running single migration')
      const results = await migrator.migrateUp()
      showResults(results)
    })

  program
    .command('down')
    .description('Revert the latest migration with a down file')
    .action(async () => {
      console.log('Reverting migrations')
      const results = await migrator.migrateDown()
      showResults(results)
    })

  program
    .command('latest')
    .description('Run all pending migrations')
    .action(async () => {
      console.log('Running migrations')
      const results = await migrator.migrateToLatest()
      showResults(results)
    })

  program
    .command('down-to')
    .argument('<migration-name>')
    .description(
      'Migrates down to the specified migration name. Specify "NO_MIGRATIONS" to migrate all the way down.',
    )
    .action(async (name) => {
      let results: MigrationResultSet

      if (name === 'NO_MIGRATIONS') {
        console.log(`Migrating all the way down`)
        results = await migrator.migrateTo(NO_MIGRATIONS)
      } else {
        console.log(`Migrating down to ${name}`)
        results = await migrator.migrateTo(name)
      }

      showResults(results)
    })

  program.parseAsync().then(() => db.destroy())
}

run()
