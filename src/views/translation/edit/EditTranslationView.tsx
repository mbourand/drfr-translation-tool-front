import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'
import { useMemo, useState } from 'react'
import { SidePanel, FileType } from './SidePanel/SidePanel'
import { TranslationGrid } from './TranslationGrid'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { GridApi } from 'ag-grid-community'
import { LineType, MatchLanguages } from './types'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { TranslationStringSearch } from './TranslationStringSearch'
import { makeLineKey } from './changes'
import { isTechnicalString } from '../../../modules/game/strings'
import { useTranslationFiles } from '../../../hooks/useTranslationFiles'
import { isCellVisible } from '../isCellVisible'

export const EditTranslationView = () => {
  const branch = useParams().branch
  const [searchParams] = useSearchParams()
  const prName = searchParams.get('name') ?? ''
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)

  const [changedLines, setChangedLines] = useState(new Map<string, string>())

  const [gridApi, setGridApi] = useState<GridApi<LineType> | null>(null)

  const [stringSearchResult, setStringSearchResult] = useState<StringSearchResult | null>(null)
  const [matchLanguage, setMatchLanguage] = useState<MatchLanguages>('fr')

  const {
    translationFiles: { data: files, isPending, isError, error }
  } = useTranslationFiles(branch)

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
          <h1 className="text-3xl font-semibold text-center w-full">Traduction de : {prName}</h1>
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
                const key = makeLineKey(selectedFile.translatedPath, data.lineNumber)
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
