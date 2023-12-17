import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db, sqlite } from './'

await migrate(db, { migrationsFolder: './src/lib/db/migrations' })
await sqlite.close()
