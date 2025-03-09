import { z } from 'zod'
import { ENV } from '../../Env'
import { ConfirmAuthResponseSchema, TranslationSchema, UserSchema } from './schemas'

export const TRANSLATION_API_URLS = {
  AUTH: {
    CONFIRM: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/auth/confirm`,
      responseSchema: ConfirmAuthResponseSchema,
      method: 'POST',
      bodySchema: z.object({ code: z.string() })
    },
    USER: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/auth/user`,
      responseSchema: UserSchema,
      method: 'GET'
    }
  },
  TRANSLATIONS: {
    LIST: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/translation/list`,
      method: 'GET',
      responseSchema: TranslationSchema.array()
    },
    CREATE: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/translation`,
      method: 'POST',
      bodySchema: z.object({ name: z.string() }),
      responseSchema: TranslationSchema
    },
    FILES: (branch: string) =>
      ({
        url: `${ENV.TRANSLATION_API_BASE_URL}/translation/files?branch=${branch}`,
        method: 'GET',
        responseSchema: z
          .object({
            original: z.string(),
            translated: z.string(),
            name: z.string(),
            category: z.string()
          })
          .array()
      } as const)
  }
} as const
