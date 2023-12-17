import cron from 'node-cron'
import { db, schema } from '../lib/db'
import { sql } from 'drizzle-orm'
import { dev, env } from '../lib/environment'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

const { ipLogs } = schema

const untrustTimedOutIPs = async () => {
    if (!env.IP_TRUST_TIMEOUT_HOURS) return

    console.log('Untrusting Timedout IPs.')
    try {
        const hours = env.IP_TRUST_TIMEOUT_HOURS.toString()

        const records = await db
            .update(ipLogs)
            .set({ timestamp_untrusted: sql`CURRENT_TIMESTAMP` })
            .where(
                sql`${ipLogs.timestamp} <= datetime('now', '-${sql.raw(hours)} hours') 
                    AND ${ipLogs.timestamp_untrusted} == ''`
            )
            .returning({ ip: ipLogs.ipv4 })

        for (const { ip } of records) await execPromise(`fwconsole firewall untrust ${ip}`)
    } catch (err: any) {
        console.error('Something went wrong untrusting IPs. Error:', err)
    }
}

if (dev) {
    console.log('Dev Mode Detected. Running Jobs Immediately.')
    untrustTimedOutIPs()
}

cron.schedule('0 * * * *', untrustTimedOutIPs)
