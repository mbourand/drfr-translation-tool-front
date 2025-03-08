export const TRANSLATION_APP_PAGES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    CONFIRM: '/auth/confirm'
  },
  TRANSLATION: {
    EDIT: (number: string) => `/translation/edit/${number}`,
    REVIEW: (number: string) => `/translation/review/${number}`
  },
  OVERVIEW: '/overview'
} as const
