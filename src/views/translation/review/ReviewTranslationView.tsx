import { NavLink, useParams, useSearchParams } from 'react-router'
import { useTranslationFiles } from '../../../hooks/useTranslationFiles'
import { ReviewTranslationGrid } from './ReviewTranslationGrid'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { MatchLanguages, ReviewLineType } from '../edit/types'
import { useMemo, useState } from 'react'
import { GridApi } from 'ag-grid-community'
import { isTechnicalString } from '../../../modules/game/strings'
import { isCellVisible } from '../isCellVisible'
import { SidePanel } from './SidePanel'
import { TranslationStringSearch } from './TranslationStringSearch'
import { binarySearch } from '../../../utils'
import { ENV } from '../../../Env'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchData } from '../../../modules/fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { z } from 'zod'

export type ReviewFileType = {
  name: string
  category: string
  translatedPath: string
  lines: ReviewLineType[]
  pathsInGameFolder: {
    windows: string
  }
}

export const ReviewTranslationView = () => {
  const [searchParams] = useSearchParams()
  const branch = useParams().branch
  const prName = searchParams.get('name') ?? ''

  const {
    translationFiles: {
      data: branchTranslationFiles,
      isLoading: isBranchTranslationFilesLoading,
      isError: isBranchTranslationFilesError,
      error: branchTranslationFilesError
    }
  } = useTranslationFiles(branch)

  const {
    translationFiles: {
      data: masterTranslationFiles,
      isLoading: isMasterTranslationFilesLoading,
      isError: isMasterTranslationFilesError,
      error: masterTranslationFilesError
    }
  } = useTranslationFiles(ENV.GITHUB_BASE_BRANCH)

  const {
    translationFiles: {
      data: translationFilesAtCreation,
      isLoading: isTranslationFilesAtCreationLoading,
      isError: isTranslationFilesAtCreationError,
      error: translationFilesAtCreationError
    }
  } = useTranslationFiles(branch, { atBranchCreation: true })

  const {
    data: comments,
    isPending: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['comments', branch],
    queryFn: async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')
      if (!branch) throw new Error('No branch provided')

      const response = await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.LIST_COMMENTS(branch),
        headers: { Authorization: `Bearer ${userInfos.accessToken}` }
      })

      return response
    }
  })

  const userLogin = useQuery({
    queryKey: ['user-login'],
    queryFn: async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No user infos found')
      return userInfos.login
    }
  })

  const deleteComments = useMutation({
    mutationKey: ['delete-comment'],
    mutationFn: async (commentId: number) => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) return

      await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.DELETE_COMMENT(commentId),
        headers: { Authorization: `Bearer ${userInfos.accessToken}` }
      })

      refetchComments()
    }
  })

  const sendComment = useMutation({
    mutationKey: ['send-comment'],
    mutationFn: async ({
      line,
      body,
      inReplyTo,
      filePath
    }: z.infer<typeof TRANSLATION_API_URLS.TRANSLATIONS.ADD_COMMENT.bodySchema>) => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No user infos found')
      if (!branch) throw new Error('No branch provided')

      await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.ADD_COMMENT,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` },
        body: {
          branch,
          filePath,
          body,
          line,
          inReplyTo
        }
      })

      refetchComments()
    }
  })

  const isPending =
    isBranchTranslationFilesLoading ||
    isMasterTranslationFilesLoading ||
    isTranslationFilesAtCreationLoading ||
    isCommentsLoading
  const isError =
    isBranchTranslationFilesError ||
    isMasterTranslationFilesError ||
    isTranslationFilesAtCreationError ||
    isCommentsError
  const error =
    branchTranslationFilesError ?? masterTranslationFilesError ?? translationFilesAtCreationError ?? commentsError

  const [stringSearchResult, setStringSearchResult] = useState<StringSearchResult | null>(null)
  const [matchLanguage, setMatchLanguage] = useState<MatchLanguages>('fr')
  const [gridApi, setGridApi] = useState<GridApi<ReviewLineType> | null>(null)
  const [selectedFile, setSelectedFile] = useState<ReviewFileType | null>(null)

  const gridFiles = useMemo(() => {
    if (!branchTranslationFiles || !translationFilesAtCreation || !masterTranslationFiles) return undefined

    const result: ReviewFileType[] = []

    for (let i = 0; i < branchTranslationFiles?.length; i++) {
      const branchFile = branchTranslationFiles[i]
      const masterFile = masterTranslationFiles[i]

      result.push({
        ...branchFile,
        lines: branchFile.lines.map((line, j) => {
          return {
            category: branchFile.category,
            lineNumber: line.lineNumber,
            original: line.original,
            oldTranslated: masterFile.lines[j].translated,
            newTranslated: line.translated
          }
        })
      })
    }

    return result
  }, [branchTranslationFiles, masterTranslationFiles, translationFilesAtCreation])

  const filesByCategory = useMemo(
    () =>
      gridFiles?.reduce((acc, file) => {
        if (!acc[file.category]) acc[file.category] = []
        acc[file.category].push(file)
        return acc
      }, {} as Record<string, ReviewFileType[]>) ?? {},
    [gridFiles]
  )

  const selectedFileContents = useMemo(
    () => gridFiles?.find((file) => file.translatedPath === selectedFile?.translatedPath),
    [gridFiles, selectedFile]
  )

  const filteredLines = useMemo(
    () => selectedFileContents?.lines.filter((line) => !isTechnicalString(line.original)),
    [selectedFileContents]
  )

  const changedLines = useMemo(() => {
    if (!filteredLines) return []
    const fileFromMasterAtCreation = translationFilesAtCreation?.find(
      (f) => f.translatedPath === selectedFileContents?.translatedPath
    )
    if (!fileFromMasterAtCreation) return []
    return filteredLines
      .filter((line) => {
        const indexInMasterLines = binarySearch(
          fileFromMasterAtCreation.lines,
          (masterLine) => masterLine.lineNumber - line.lineNumber
        )
        return (
          line.oldTranslated !== line.newTranslated &&
          line.newTranslated !== fileFromMasterAtCreation.lines[indexInMasterLines].translated
        )
      })
      .map((line) => line.lineNumber)
  }, [selectedFileContents])

  const conflictedLines = useMemo(() => {
    if (!filteredLines) return []
    const fileFromMasterAtCreation = translationFilesAtCreation?.find(
      (f) => f.translatedPath === selectedFileContents?.translatedPath
    )
    if (!fileFromMasterAtCreation) return []
    return filteredLines
      .filter((line) => {
        const indexInMasterLines = binarySearch(
          fileFromMasterAtCreation.lines,
          (masterLine) => masterLine.lineNumber - line.lineNumber
        )
        return (
          line.oldTranslated !== line.newTranslated &&
          line.oldTranslated !== fileFromMasterAtCreation.lines[indexInMasterLines].translated
        )
      })
      .map((line) => line.lineNumber)
  }, [selectedFileContents])

  const linesToShow = useMemo(() => {
    if (!selectedFileContents || !changedLines || changedLines.length === 0) return []
    return changedLines.map((lineNumber) => selectedFileContents.lines[lineNumber]).filter((line) => line !== undefined)
  }, [changedLines, selectedFileContents])

  return (
    <div className="flex flex-row">
      <SidePanel
        branch={branch ?? ''}
        title="Fichiers de traduction"
        categories={filesByCategory}
        onSelected={(selected) => setSelectedFile(selected)}
        selected={selectedFile}
      />
      <div className="flex flex-col items-center w-full px-4">
        <div className="flex flex-row w-full items-center mb-4 pt-2">
          <NavLink to={TRANSLATION_APP_PAGES.OVERVIEW} className="btn btn-circle btn-ghost">
            <ArrowLeftIcon />
          </NavLink>
          <h1 className="text-3xl font-semibold text-center w-full">Correction de : {prName}</h1>
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
        {isError && <div>Erreur lors du téléchargement des fichiers {error?.message}</div>}
        {filteredLines && selectedFileContents && selectedFile && (
          <div className="w-full h-full pb-4 flex flex-row justify-center">
            <ReviewTranslationGrid
              userLogin={userLogin.data ?? ''}
              comments={comments?.filter((comment) => comment.path === selectedFile.translatedPath) ?? []}
              filteredLines={filteredLines}
              linesToShow={linesToShow}
              changedLineNumbers={changedLines}
              conflictedLinesNumber={conflictedLines}
              onReady={(e) => setGridApi(e.api)}
              onSendComment={({ line, body, inReplyTo }) => {
                sendComment.mutate({
                  line,
                  body,
                  branch: branch ?? '',
                  filePath: selectedFile.translatedPath,
                  inReplyTo: inReplyTo ?? undefined
                })
              }}
              onDeleteCommentClicked={(commentId) => deleteComments.mutate(commentId)}
              translatedStringSearchResult={stringSearchResult}
              matchLanguage={matchLanguage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
