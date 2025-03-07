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
    }
  }
} as const
