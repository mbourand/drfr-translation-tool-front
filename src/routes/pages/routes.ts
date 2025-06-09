export const TRANSLATION_APP_PAGES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    CONFIRM: '/auth/confirm'
  },
  TRANSLATION: {
    EDIT: (branch: string, name?: string) => `/translation/edit/${branch}${name ? `?name=${name}` : ''}`,
    REVIEW: (number: string) => `/translation/review/${number}`
  },
  OVERVIEW: '/overview',
  PATCH_FILES: '/translation-tool/scripts.zip'
} as const
