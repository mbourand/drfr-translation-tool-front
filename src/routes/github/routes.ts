import { ENV } from '../../Env'

export const GITHUB_URLS = {
  AUTHORIZE_APP: `${ENV.GITHUB_BASE_URL}/apps/drfr-translation-local/installations/new`
} as const
