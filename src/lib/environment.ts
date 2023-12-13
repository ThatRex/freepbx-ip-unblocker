import { z } from 'zod'

export const env = process.env
export const dev = env.NODE_ENV?.toLowerCase() !== 'production'

const envSchema = z.object({
    BOT_TOKEN: z.string(),
    IPINFO_TOKEN: z.string().optional(),
    ABUSEIPDB_KEY: z.string().optional(),
    REJECT_NON_ISP_IPS: z.enum(['false', 'true']).optional().default('true').transform(Boolean),
    IP_ABUSE_CONFIDENCE_SCORE_REJECTION_PERCENTAGE: z
        .string()
        .optional()
        .default('50')
        .transform(Number)
})

envSchema.parse(process.env)

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}
