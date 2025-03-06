import { ENV } from './Env'

export const GITHUB_URLS = {
  AUTHORIZE_APP: `${ENV.GITHUB_BASE_URL}/login/oauth/authorize?client_id=${ENV.GITHUB_APP_CLIENT_ID}`
} as const

export const TRANSLATION_APP_PAGES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    CONFIRM: '/auth/confirm'
  }
} as const

export const TRANSLATION_API_URLS = {
  AUTH: {
    CONFIRM: `${ENV.TRANSLATION_API_BASE_URL}/auth/confirm`
  }
} as const
