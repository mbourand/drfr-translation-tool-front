import { load } from '@tauri-apps/plugin-store'
import { z } from 'zod'
import { UserSchema } from '../routes/translation/schemas'

export const STORE_KEYS = {
  USER_INFOS: 'user_infos'
} as const

export const store = await load('store.json')

export type StoreUserInfos = Pick<z.infer<typeof UserSchema>, 'id' | 'login' | 'avatar_url'> & {
  accessToken: string
}
