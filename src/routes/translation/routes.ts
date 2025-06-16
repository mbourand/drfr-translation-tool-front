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
    SUBMIT_TO_REVIEW: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/translation/submit-to-review`,
      method: 'POST',
      bodySchema: z.object({ branch: z.string() }),
      responseSchema: z.object({ success: z.boolean() })
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
            category: z.string(),
            originalPath: z.string(),
            translatedPath: z.string(),
            pathsInGameFolder: z.object({
              windows: z.string()
            })
          })
          .array()
      } as const),
    FILES_AT_BRANCH_CREATION: (branch: string) =>
      ({
        url: `${ENV.TRANSLATION_API_BASE_URL}/translation/files-at-branch-creation?branch=${branch}`,
        method: 'GET',
        responseSchema: z
          .object({
            original: z.string(),
            translated: z.string(),
            name: z.string(),
            category: z.string(),
            originalPath: z.string(),
            translatedPath: z.string(),
            pathsInGameFolder: z.object({
              windows: z.string()
            })
          })
          .array()
      } as const),
    SAVE_FILES: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/translation/files`,
      method: 'POST',
      responseSchema: z.object({ success: z.boolean() }),
      bodySchema: z.object({
        branch: z.string(),
        message: z.string(),
        files: z.array(
          z.object({
            path: z.string(),
            content: z.string()
          })
        )
      })
    },
    APPROVE: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/translation/approve`,
      method: 'POST',
      bodySchema: z.object({ branch: z.string() }),
      responseSchema: z.object({ success: z.boolean() })
    },
    LIST_COMMENTS: (branch: string) =>
      ({
        url: `${ENV.TRANSLATION_API_BASE_URL}/translation/comments?branch=${branch}`,
        method: 'GET',
        responseSchema: z
          .object({
            subject_type: z.string(),
            path: z.string(),
            line: z.number(),
            user: z.object({ login: z.string(), avatar_url: z.string() }),
            body: z.string(),
            id: z.number()
          })
          .passthrough()
          .array()
      } as const),
    ADD_COMMENT: {
      url: `${ENV.TRANSLATION_API_BASE_URL}/translation/comment`,
      method: 'POST',
      bodySchema: z.object({
        branch: z.string(),
        line: z.number(),
        body: z.string(),
        filePath: z.string(),
        inReplyTo: z.number().optional()
      }),
      responseSchema: z.object({
        success: z.boolean()
      })
    },
    DELETE_COMMENT: (commentId: number) =>
      ({
        url: `${ENV.TRANSLATION_API_BASE_URL}/translation/comment?commentId=${commentId}`,
        method: 'DELETE',
        responseSchema: z.object({
          success: z.boolean()
        })
      } as const)
  }
} as const
