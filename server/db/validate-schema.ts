import { z } from "zod"
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { 
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
} from "./schema";


export const userInsertSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
})
export const userUpdateSchema = userInsertSchema.pick(
  {
    email: true,
  }
)

export const accountInsertSchema = createInsertSchema(accounts)
export const sessionInsertSchema = createInsertSchema(sessions)
export const authenticatorInsertSchema = createInsertSchema(authenticators)
export const verificationTokenInsertSchema = createInsertSchema(verificationTokens)
export function validateSchema(schema: z.ZodSchema, data: any) {
  const result = schema.safeParse(data)
  if (!result.success) {
    return { error: JSON.parse(result.error.message) }
  }
  return result.data
}