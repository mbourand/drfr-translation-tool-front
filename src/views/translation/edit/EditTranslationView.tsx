import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../../../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { useMemo, useState } from 'react'
import { SidePanel, FileType } from './SidePanel/SidePanel'
import { TranslationGrid } from './TanslationGrid'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { GridApi } from 'ag-grid-community'
import { LineType, MatchLanguages } from './types'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { TranslationStringSearch } from './TranslationStringSearch'

const makeLineKey = (file: FileType, line: number) => `${file.translatedPath}:${line}`

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
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)

  const [changedLines, setChangedLines] = useState(new Map<string, string>())

  const [gridApi, setGridApi] = useState<GridApi<LineType> | null>(null)

  const [stringSearchResult, setStringSearchResult] = useState<StringSearchResult | null>(null)
  const [matchLanguage, setMatchLanguage] = useState<MatchLanguages>('fr')

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
      files?.reduce((acc, file) => {
        if (!acc[file.category]) acc[file.category] = []
        acc[file.category].push(file)
        return acc
      }, {} as Record<string, FileType[]>) ?? {},
    [files]
  )

  const selectedFileContents = useMemo(
    () => files?.find((file) => file.translatedPath === selectedFile?.translatedPath),
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

  function getFirstAndLastVisibleRowsIndexes(): { firstVisibleRowIndex: number; lastVisibleRowIndex: number } | null {
    const rows = document.querySelectorAll<HTMLElement>('.ag-center-cols-container .ag-row')
    const body = document.querySelector('.ag-body')

    if (!rows || !body) return null

    const bodyTop = body.getBoundingClientRect().top
    const bodyBottom = bodyTop + body.clientHeight

    let firstVisibleRowIndex = -1
    let lastVisibleRowIndex = -1

    const sortedRows = Array.from(rows).sort((a, b) => {
      const indexA = parseInt(a.getAttribute('row-index') || '0')
      const indexB = parseInt(b.getAttribute('row-index') || '0')
      return indexA - indexB
    })

    sortedRows.forEach((row) => {
      const rowAbsolutePos = row.getBoundingClientRect().top
      const rowIndex = row.getAttribute('row-index')
      if (rowAbsolutePos >= bodyTop && firstVisibleRowIndex === -1 && rowIndex)
        firstVisibleRowIndex = parseInt(rowIndex)
      if (rowAbsolutePos + row.clientHeight * 2 > bodyBottom && lastVisibleRowIndex === -1 && rowIndex)
        lastVisibleRowIndex = parseInt(rowIndex)
    })

    return { firstVisibleRowIndex, lastVisibleRowIndex }
  }

  const isCellVisible = (rowIndex: number): boolean => {
    const indexes = getFirstAndLastVisibleRowsIndexes()
    if (!indexes) return false
    return rowIndex >= indexes.firstVisibleRowIndex && rowIndex <= indexes.lastVisibleRowIndex
  }

  return (
    <div className="flex flex-row">
      <SidePanel
        title="Fichiers de traduction"
        categories={filesByCategory}
        onSelected={(selected) => setSelectedFile(selected)}
        selected={selectedFile}
        branch={branch}
        changes={changedLines}
      />
      <div className="flex flex-col items-center w-full px-4">
        <div className="flex flex-row w-full items-center mb-4 pt-2">
          <NavLink to={TRANSLATION_APP_PAGES.OVERVIEW} className="btn btn-circle btn-ghost">
            <ArrowLeftIcon />
          </NavLink>
          <h1 className="text-3xl font-semibold text-center w-full">{prName}</h1>
        </div>
        {filteredLines && (
          <TranslationStringSearch
            filteredLines={filteredLines}
            matchLanguage={matchLanguage}
            onMatchChanged={(result) => {
              setStringSearchResult(result)
              if (!result || !result.selectedMatch || !gridApi) return
              const rowIndex = result.selectedMatch.rowIndex
              if (!isCellVisible(rowIndex)) gridApi.ensureIndexVisible(rowIndex, 'middle')
              gridApi.refreshCells({ force: true })
            }}
            onMatchLanguageChanged={setMatchLanguage}
          />
        )}
        {isPending && <div>Téléchargement des fichiers...</div>}
        {isError && <div>Erreur lors du téléchargement des fichiers {error.message}</div>}
        {selectedFileContents && selectedFile && (
          <div className="w-full h-full pb-4 flex flex-row justify-center">
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
                .filter((c) => c.startsWith(selectedFile.translatedPath))
                .map((key) => parseInt(key.split(':')[1], 10))}
              onReady={(e) => setGridApi(e.api)}
              translatedStringSearchResult={stringSearchResult}
              matchLanguage={matchLanguage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
