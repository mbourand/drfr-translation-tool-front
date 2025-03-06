import { z } from 'zod'

export const ConfirmAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  refreshTokenExpiresIn: z.number(),
  scope: z.string()
})
