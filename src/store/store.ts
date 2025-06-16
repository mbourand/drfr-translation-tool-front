import { load } from '@tauri-apps/plugin-store'
import { z } from 'zod'
import { UserSchema } from '../routes/translation/schemas'

export const STORE_KEYS = {
  USER_INFOS: 'user_infos',
  GAME_FOLDER_PATH: 'game_folder_path',
  UTMT_CLI_FOLDER_PATH: 'utmt_cli_folder_path',
  GIT_FOLDER_PATH: 'git_folder_path',
  SAVES_FOLDER_PATH: 'saves_folder_path',
  LAST_SELECTED_SAVE_NAME: 'last_selected_save_name'
} as const

export const store = await load('stor5.json')

export type StoreUserInfos = Pick<z.infer<typeof UserSchema>, 'id' | 'login' | 'avatar_url'> & {
  accessToken: string
}
