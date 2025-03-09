import { NavLink, useParams } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../../../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { SidePanel } from './SidePanel'
import { PageSelector } from './PageSelector'

const PAGE_SIZE = 5000

const isTechnicalString = (line: string) =>
  line.trim() === '' ||
  line.startsWith('obj_') ||
  line.startsWith('scr_') ||
  line.startsWith('gml_') ||
  line.startsWith('DEVICE_') ||
  /^[a-z]+$/.test(line) ||
  /^[A-Za-z]*_[a-zA-Z0-9_]*$/.test(line) ||
  /^[a-z]+[A-Z0-9][a-zA-Z0-9]*$/.test(line)

export const EditTranslationView = () => {
  const branch = useParams().branch
  const [currentPage, setCurrentPage] = useState(0)
  const linesRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<{ category: string; name: string } | null>(null)

  const filesDownloadUrls = useQuery({
    queryKey: ['files', branch],
    queryFn: async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')
      if (!branch) throw new Error('No branch provided')

      return await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.FILES(branch),
        headers: { Authorization: `Bearer ${userInfos.accessToken}` }
      })
    }
  })

  const fileContents = useQuery({
    queryKey: ['files-content', branch],
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
          })
            .map((_, i) => ({
              lineNumber: i,
              original: splittedOriginal[i] ?? '',
              translated: splittedTranslated[i] ?? ''
            }))
            .filter(({ original, translated }) => !isTechnicalString(original) || !isTechnicalString(translated))

          return {
            lines,
            name: file.name,
            category: file.category
          }
        })
      )
    },
    enabled: !!filesDownloadUrls.data
  })

  const fileNamesByCategory =
    filesDownloadUrls.data?.reduce((acc, { name, category }) => {
      if (!acc[category]) acc[category] = []
      acc[category].push(name)
      return acc
    }, {} as Record<string, string[]>) ?? {}

  const selectedFileContents = useMemo(
    () =>
      fileContents.data?.find((file) => file.name === selectedFile?.name && file.category === selectedFile?.category),
    [fileContents.data, selectedFile]
  )

  return (
    <div className="flex flex-row">
      <SidePanel
        title="Fichiers de traduction"
        categories={fileNamesByCategory}
        onSelected={(selected) => {
          setSelectedFile(selected)
          setCurrentPage(0)
        }}
        selected={selectedFile}
      />
      <div className="mx-auto px-4">
        <NavLink to={TRANSLATION_APP_PAGES.OVERVIEW}>Retour à l'accueil</NavLink>
        <h1 className="text-3xl font-semibold text-center mb-8">{branch}</h1>
        {fileContents.isPending && <div>Téléchargement des fichiers...</div>}
        {fileContents.isError && <div>Erreur lors du téléchargement des fichiers {fileContents.error.message}</div>}
        {selectedFileContents && (
          <div className="w-full max-w-[1700px] mx-auto relative">
            <div
              className="w-full h-[calc(100svh-200px)] overflow-auto border-x border-y border-base-200 mb-2 rounded-lg"
              ref={linesRef}
            >
              <div className="sticky top-0 left-0 w-full bg-base-100 z-10 shadow">
                <span className="inline-block w-[60px] pr-1 border-r border-base-200 break-words text-right opacity-70 py-2"></span>
                <span className="inline-block w-[calc(50%-30px)] border-r border-base-200 break-words py-2 pl-4 font-semibold text-lg">
                  Version anglaise
                </span>
                <span className="inline-block w-[calc(50%-30px)] py-2 pl-4 font-semibold text-lg">
                  Version française
                </span>
              </div>
              {selectedFileContents.lines
                .slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
                .map(({ translated, original, lineNumber }, i) => (
                  <>
                    <span
                      className={twMerge(
                        'inline-block w-[60px] pr-1 break-words text-right opacity-70 py-2 border-r border-base-200',
                        i % 2 === 1 ? 'bg-base-100' : 'bg-base-200'
                      )}
                    >
                      {lineNumber}
                    </span>
                    {/* Va savoir pourquoi min-w-0 répare les word break ??? */}
                    <span
                      className={twMerge(
                        'inline-block min-w-0 w-[calc(50%-30px)] break-words py-2 pl-4 border-r border-base-200',
                        i % 2 === 1 ? 'bg-base-100' : 'bg-base-200'
                      )}
                    >
                      {original}
                    </span>
                    <span
                      className={twMerge(
                        'inline-block min-w-0 w-[calc(50%-30px)] break-words py-2 pl-4',
                        i % 2 === 1 ? 'bg-base-100' : 'bg-base-200'
                      )}
                    >
                      {translated}
                    </span>
                    <br />
                  </>
                ))}
            </div>
            <PageSelector
              currentPage={currentPage}
              entryCount={selectedFileContents.lines.length}
              pageSize={PAGE_SIZE}
              onPageSelected={(page) => {
                linesRef.current?.scrollTo({ top: 0 })
                setCurrentPage(page)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
