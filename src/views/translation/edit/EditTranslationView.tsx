import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../../../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { useMemo, useState } from 'react'
import { SidePanel, SidePanelFileType } from './SidePanel'
import { TranslationGrid } from './TanslationGrid'

type FileType = {
  category: string
  name: string
  lines: { lineNumber: number; original: string; translated: string }[]
  originalPath: string
  translatedPath: string
}

const makeLineKey = (file: SidePanelFileType, line: number) => `${file.path}:${line}`

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
  const [searchParams] = useSearchParams()
  const prName = searchParams.get('name') ?? ''
  const [selectedFile, setSelectedFile] = useState<SidePanelFileType | null>(null)

  const [changedLines, setChangedLines] = useState(new Map<string, string>())

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

  const {
    data: files,
    isPending,
    isError,
    error
  } = useQuery({
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

  const filesByCategory = useMemo(
    () =>
      filesDownloadUrls.data?.reduce((acc, file) => {
        if (!acc[file.category]) acc[file.category] = []
        acc[file.category].push({ ...file, path: file.translatedPath })
        return acc
      }, {} as Record<string, SidePanelFileType[]>) ?? {},
    [filesDownloadUrls.data]
  )

  const selectedFileContents = useMemo(
    () => files?.find((file) => file.translatedPath === selectedFile?.path),
    [files, selectedFile]
  )

  const filteredLines = useMemo(
    () => selectedFileContents?.lines.filter((line) => !isTechnicalString(line.original)),
    [selectedFileContents]
  )

  const navigate = useNavigate()

  if (!branch) {
    navigate(TRANSLATION_APP_PAGES.OVERVIEW)
    return null
  }

  return (
    <div className="flex flex-row">
      <SidePanel
        title="Fichiers de traduction"
        categories={filesByCategory}
        onSelected={(selected) => setSelectedFile(selected)}
        selected={selectedFile}
        branch={branch}
        newFilesAfterChange={() => {
          const filesThatChanged = files?.filter((file) =>
            Array.from(changedLines.entries()).find(([key]) => key.startsWith(file.translatedPath))
          )
          const withAppliedChanges = computeFileContentsAfterChanges(filesThatChanged ?? [], changedLines)
          return withAppliedChanges.map((file) => ({
            path: file.translatedPath,
            content: file.lines.map((line) => line.translated).join('\n')
          }))
        }}
      />
      <div className="flex flex-col items-center w-full px-4">
        <NavLink to={TRANSLATION_APP_PAGES.OVERVIEW}>Retour à l'accueil</NavLink>
        <h1 className="text-3xl font-semibold text-center mb-8">{prName}</h1>
        {isPending && <div>Téléchargement des fichiers...</div>}
        {isError && <div>Erreur lors du téléchargement des fichiers {error.message}</div>}
        {selectedFileContents && selectedFile && (
          <div className="w-full h-full pb-4">
            <TranslationGrid
              onLineEdited={({ data, newValue }) => {
                const key = makeLineKey(selectedFile, data.lineNumber)
                setChangedLines((prev) => {
                  if (data.original === newValue) prev.delete(key)
                  else prev.set(key, newValue)
                  return new Map(prev)
                })
              }}
              linesToShow={filteredLines ?? []}
              changedLineNumbers={Array.from(changedLines.keys())
                .filter((c) => c.startsWith(selectedFile.path))
                .map((key) => parseInt(key.split(':')[1], 10))}
            />
          </div>
        )}
      </div>
    </div>
  )
}
