import { NavLink, useParams, useSearchParams } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../../../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { useMemo, useState } from 'react'
import { SidePanel, SidePanelFileType } from './SidePanel'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'

export const myTheme = themeQuartz.withParams({
  backgroundColor: 'var(--color-base-100)',
  foregroundColor: 'var(--color-base-200)',
  headerTextColor: 'var(--color-base-content)',
  textColor: 'var(--color-base-content)',
  headerBackgroundColor: 'var(--color-base-200)',
  oddRowBackgroundColor: 'var(--color-base-200)',
  borderColor: 'rgb(from var(--color-base-content) r g b / 0.1)'
})

type FileType = {
  category: string
  name: string
  lines: { lineNumber: number; original: string; translated: string }[]
}

const makeLineKey = (file: SidePanelFileType, line: number) => `${file.category}/${file.name}:${line}`

const computeFileContentsAfterChanges = async (files: FileType[], changes: Map<string, string>) => {
  const newFiles = [...files]
  for (const [key, value] of changes.entries()) {
    const matches = key.match(/(.+)\/(.+):(\d+)/)
    if (!matches) continue
    const category = matches[1]
    const name = matches[2]
    const lineNumber = parseInt(matches[3])

    const fileIndex = newFiles.findIndex((file) => file.category === category && file.name === name)
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

          const afterChanges = await computeFileContentsAfterChanges([{ ...file, lines }], changedLines)

          return { ...afterChanges[0] }
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
        onSelected={(selected) => setSelectedFile(selected)}
        selected={selectedFile}
      />
      <div className="flex flex-col items-center w-full px-4">
        <NavLink to={TRANSLATION_APP_PAGES.OVERVIEW}>Retour à l'accueil</NavLink>
        <h1 className="text-3xl font-semibold text-center mb-8">{prName}</h1>
        {fileContents.isPending && <div>Téléchargement des fichiers...</div>}
        {fileContents.isError && <div>Erreur lors du téléchargement des fichiers {fileContents.error.message}</div>}
        {selectedFileContents && selectedFile && (
          <div className="w-full h-full pb-4">
            <AgGridReact
              theme={myTheme}
              className="w-full max-w-[1700px] relative h-[calc(100svh-200px)]"
              rowData={selectedFileContents.lines}
              rowClassRules={{
                'ag-cell-changed': ({ data }) =>
                  !!data && changedLines.has(`${selectedFile?.category}/${selectedFile?.name}:${data.lineNumber}`)
              }}
              columnDefs={[
                { field: 'lineNumber', headerName: '', width: 80 },
                {
                  field: 'original',
                  headerName: 'Version anglaise',
                  autoHeight: true,
                  wrapText: true,
                  flex: 1,
                  cellClass: 'leading-6!'
                },
                {
                  field: 'translated',
                  headerName: 'Version française',
                  autoHeight: true,
                  wrapText: true,
                  flex: 1,
                  editable: true,
                  cellEditor: 'agTextCellEditor',
                  cellClass: 'leading-6!',
                  onCellValueChanged: async ({ data, newValue }) => {
                    const key = makeLineKey(selectedFile, data.lineNumber)
                    setChangedLines((prev) => {
                      if (data.original === newValue) prev.delete(key)
                      else prev.set(key, newValue)
                      return new Map(prev)
                    })
                  }
                }
              ]}
            />
          </div>
        )}
      </div>
    </div>
  )
}
