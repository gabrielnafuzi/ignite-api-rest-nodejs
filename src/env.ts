import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

let env = process.env as unknown as z.infer<typeof envSchema>

const shouldSkipEnvValidation = process.env.SKIP_ENV_VALIDATION === 'true'

if (!shouldSkipEnvValidation) {
  const result = envSchema.safeParse(process.env)

  if (result.success === false) {
    console.error(
      '❌ Invalid environment variables:',
      result.error.flatten().fieldErrors,
    )

    throw new Error('Invalid environment variables')
  }

  env = result.data
}

export { env }
