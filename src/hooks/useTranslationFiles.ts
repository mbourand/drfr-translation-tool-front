import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../modules/fetching/fetcher'
import { store, STORE_KEYS, StoreUserInfos } from '../store/store'
import { TRANSLATION_API_URLS } from '../routes/translation/routes'

export const useTranslationFiles = (branch?: string, options?: { atBranchCreation: boolean }) => {
  const { atBranchCreation = false } = options ?? {}

  const filesDownloadUrls = useQuery({
    queryKey: ['files', branch, atBranchCreation],
    queryFn: async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')
      if (!branch) throw new Error('No branch provided')

      return await fetchData({
        route: atBranchCreation
          ? TRANSLATION_API_URLS.TRANSLATIONS.FILES_AT_BRANCH_CREATION(branch)
          : TRANSLATION_API_URLS.TRANSLATIONS.FILES(branch),
        headers: { Authorization: `Bearer ${userInfos.accessToken}` }
      })
    }
  })

  const translationFiles = useQuery({
    queryKey: ['files-content', branch, atBranchCreation],
    queryFn: async () => {
      if (!filesDownloadUrls.data) throw new Error('No files download url found')

      return await Promise.all(
        filesDownloadUrls.data.map(async (file) => {
          const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
          if (!userInfos) throw new Error('No token found')

          const originalResponse = await fetch(file.original)
          if (!originalResponse.ok) throw new Error('Could not fetch original file')
          const original = await originalResponse.text()

          const translatedResponse = await fetch(file.translated)
          if (!translatedResponse.ok) throw new Error('Could not fetch translated file')
          const translated = await translatedResponse.text()

          const splittedOriginal = original.split('\n')
          const splittedTranslated = translated.split('\n')

          const lines = Array.from<{ original: string; translated: string }[]>({
            length: Math.max(splittedOriginal.length, splittedTranslated.length)
          }).map((_, i) => ({
            lineNumber: i,
            original: splittedOriginal[i] ?? '',
            translated: splittedTranslated[i] ?? ''
          }))

          return { ...file, lines }
        })
      )
    },
    enabled: !!filesDownloadUrls.data
  })

  return { translationFiles, filesDownloadUrls }
}
