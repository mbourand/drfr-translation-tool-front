import { load } from '@tauri-apps/plugin-store'
import { z } from 'zod'
import { UserSchema } from '../routes/translation/schemas'

export const STORE_KEYS = {
  USER_INFOS: 'user_infos',
  GAME_FOLDER_PATH: 'game_folder_path',
  UTMT_CLI_FOLDER_PATH: 'utmt_cli_folder_path',
  GIT_FOLDER_PATH: 'git_folder_path'
} as const

export const store = await load('stor3.json')

export type StoreUserInfos = Pick<z.infer<typeof UserSchema>, 'id' | 'login' | 'avatar_url'> & {
  accessToken: string
}
