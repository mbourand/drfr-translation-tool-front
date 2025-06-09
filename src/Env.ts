const ENV_STRING = (value: string) => value

const ENV_VARIABLES = {
  VITE_GITHUB_BASE_URL: ENV_STRING,
  VITE_GITHUB_APP_CLIENT_ID: ENV_STRING,
  VITE_TRANSLATION_API_BASE_URL: ENV_STRING,
  VITE_DRFR_WEBSITE_URL: ENV_STRING
} as const

type EnvVariablesType = typeof ENV_VARIABLES

type EnvType = {
  [Key in keyof EnvVariablesType]: ReturnType<EnvVariablesType[Key]>
}

function getValue<Key extends keyof EnvVariablesType>(key: Key): EnvType[Key] {
  const env = import.meta.env

  if (env[key] === undefined) {
    throw new Error(`Environment variable ${key} doesn't exist.`)
  }

  const caster = ENV_VARIABLES[key]
  const environmentValue = caster(env[key])

  return environmentValue as EnvType[Key]
}

type RemovePrefix<T extends object, Prefix extends string> = {
  [Key in keyof T as Key extends `${Prefix}${infer Rest}` ? Rest : Key]: T[Key]
}

export const ENV = {
  DRFR_WEBSITE_URL: getValue('VITE_DRFR_WEBSITE_URL'),
  GITHUB_BASE_URL: getValue('VITE_GITHUB_BASE_URL'),
  GITHUB_APP_CLIENT_ID: getValue('VITE_GITHUB_APP_CLIENT_ID'),
  TRANSLATION_API_BASE_URL: getValue('VITE_TRANSLATION_API_BASE_URL')
} as const satisfies RemovePrefix<EnvType, 'VITE_'>
