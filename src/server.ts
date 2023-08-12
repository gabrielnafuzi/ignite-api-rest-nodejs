/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
!process.env.SKIP_ENV_VALIDATION && require('./env')

import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server listening on port ${env.PORT}`)
  })
