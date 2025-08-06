import { useMutation } from '@tanstack/react-query'
import { store, STORE_KEYS, StoreUserInfos } from '../store/store'
import { fetchData } from '../modules/fetching/fetcher'
import { TRANSLATION_API_URLS } from '../routes/translation/routes'
import { FileType } from '../views/translation/edit/SidePanel/SidePanel'

const computeFileContentsAfterChanges = (files: FileType[], changes: Map<string, string>) => {
  const newFiles = [...files]
  for (const [key, value] of changes.entries()) {
    const matches = key.match(/(.+):(\d+)/)
    if (!matches) continue
    const path = matches[1]
    const lineNumber = parseInt(matches[2], 10)

    const fileIndex = newFiles.findIndex((file) => file.translatedPath === path)
    if (fileIndex === -1) continue

    newFiles[fileIndex].lines[lineNumber].translated = value
  }

  return newFiles
}

export const useSaveChanges = ({
  changes,
  files,
  branch,
  onSaveSuccess
}: {
  changes: Map<string, string>
  files: FileType[]
  branch: string
  onSaveSuccess?: () => void
}) => {
  return useMutation({
    mutationKey: ['save-changes'],
    mutationFn: async () => {
      if (changes.size === 0) return

      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')

      const filesThatChanged = files.filter((file) =>
        Array.from(changes.entries()).find(([key]) => key.startsWith(file.translatedPath))
      )
      const withAppliedChanges = computeFileContentsAfterChanges(filesThatChanged ?? [], changes)

      await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.SAVE_FILES,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` },
        body: {
          branch,
          message: `Sauvegarde ${new Date().toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris'
          })}`,
          files: withAppliedChanges.map((file) => ({
            path: file.translatedPath,
            content: file.lines.map((line) => line.translated).join('\n')
          }))
        }
      })
    },
    onSuccess: onSaveSuccess
  })
}
