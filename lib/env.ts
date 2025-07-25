import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ROOT_DOMAIN: z.string().default('localhost:3000'),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().default('localhost:3000'),
})

export const env = envSchema.parse(process.env)