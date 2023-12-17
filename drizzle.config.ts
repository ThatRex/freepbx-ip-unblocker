import type { Config } from 'drizzle-kit'

export default {
    schema: './src/lib/db/schema.ts',
    out: './src/lib/db/migrations',
    driver: 'better-sqlite',
    dbCredentials: { url: './database.db' }
} satisfies Config
