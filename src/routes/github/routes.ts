import { ENV } from '../../Env'

export const GITHUB_URLS = {
  AUTHORIZE_APP: `${ENV.GITHUB_BASE_URL}/login/oauth/authorize?client_id=${ENV.GITHUB_APP_CLIENT_ID}`
} as const
