import { z } from 'zod'
import { ENV } from '../../Env'

export const STATIC_ROUTES = {
  SAVES: {
    INDEX: {
      url: `${ENV.DRFR_WEBSITE_URL}/translation-tool/saves/index.json`,
      method: 'GET',
      responseSchema: z.object({ name: z.string(), path: z.string(), files: z.string().array() }).array()
    }
  }
} as const
