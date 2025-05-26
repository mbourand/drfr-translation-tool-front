import { z } from 'zod'

export const ConfirmAuthResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  scope: z.string()
})

export const TranslationLabelSchema = z
  .object({
    id: z.number(),
    url: z.string(),
    name: z.string(),
    description: z.string(),
    color: z.string(),
    default: z.boolean()
  })
  .passthrough()

export const TranslationSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    labels: TranslationLabelSchema.array(),
    user: z
      .object({
        id: z.number(),
        login: z.string(),
        avatar_url: z.string()
      })
      .passthrough(),
    head: z
      .object({
        ref: z.string()
      })
      .passthrough(),
    state: z.string(),
    merged_at: z.string().nullish()
  })
  .passthrough()

export type TranslationType = z.infer<typeof TranslationSchema>

export const UserSchema = z
  .object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  })
  .passthrough()
