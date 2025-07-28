import { AgGridReact } from 'ag-grid-react'
import { CellFocusedEvent, GridApi, GridReadyEvent, ICellRendererParams, NewValueParams } from 'ag-grid-community'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { MatchLanguages, ReviewLineType } from '../edit/types'
import { myTheme } from '../edit/grid-theme'
import { useEffect, useMemo, useRef, useState } from 'react'
import { UnfoldMoreIcon } from '../../../components/icons/UnfoldMoreIcon'
import { UnfoldLessIcon } from '../../../components/icons/UnfoldLessIcon'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { z } from 'zod'
import { SendIcon } from '../../../components/icons/SendIcon'
import { TrashIcon } from '../../../components/icons/TrashIcon'
import { AddCommentIcon } from '../../../components/icons/AddCommentIcon'
import { getParts } from '../../../string-search/get-parts'

type TranslationGridProps = {
  filteredLines: ReviewLineType[]
  changedLineNumbers: number[]
  onReady?: (event: GridReadyEvent<ReviewLineType>) => void
  matchLanguage: MatchLanguages
  comments: z.infer<ReturnType<(typeof TRANSLATION_API_URLS)['TRANSLATIONS']['LIST_COMMENTS']>['responseSchema']>
  onSendComment: (params: { body: string; line: number; inReplyTo?: number }) => void
  onDeleteCommentClicked: (params: { commentId: number; pullRequestNumber: number }) => void
  userLogin: string
  conflictedLinesNumber: number[]
  editable: boolean
  showAllLines?: boolean
  onLineEdited: (event: NewValueParams<ReviewLineType, any>) => void
  onCellFocused: (event: CellFocusedEvent<ReviewLineType, any>) => void
  onRowDataChanged: (value: ReviewLineType[]) => void
  stringSearchResult: StringSearchResult | null
}

const RESOLVED_COMMENT = '[RESOLVED]'

const LANGUAGE_COLUMNS = {
  en: 'original',
  fr: 'translated'
} as const

export const ReviewTranslationGrid = ({
  filteredLines,
  changedLineNumbers,
  onReady,
  comments,
  onSendComment,
  onDeleteCommentClicked,
  userLogin,
  conflictedLinesNumber,
  editable,
  onLineEdited,
  onCellFocused,
  showAllLines,
  onRowDataChanged,
  stringSearchResult,
  matchLanguage
}: TranslationGridProps) => {
  const gridApi = useRef<GridApi | null>(null)
  const [selectedChangedLine, setSelectedChangedLine] = useState<ReviewLineType | null>(null)
  const lineToFocus = useRef<ReviewLineType | null>(null)

  const [pinnedPosition, setPinnedPosition] = useState<'Top' | 'Bottom' | 'None'>('None')

  const commentAnswers = useRef(new Map<number, string>())
  const textAreaRefs = useRef(new Map<number, HTMLTextAreaElement | null>())

  const [addCommentToLine, setAddCommentToLine] = useState<number | null>(null)

  useEffect(() => {
    if (!gridApi.current || !lineToFocus.current) return
    const rowNode = gridApi.current.getRowNode(lineToFocus.current.lineNumber.toString())
    if (rowNode?.rowIndex == null) return
    gridApi.current.ensureIndexVisible(rowNode.rowIndex, 'middle')
    lineToFocus.current = null
  }, [selectedChangedLine?.lineNumber])

  const checkRowVisibility = (api: GridApi) => {
    if (selectedChangedLine == null) return
    const rowNode = api.getRowNode(selectedChangedLine.lineNumber.toString())
    if (!rowNode) return

    const rowTop = rowNode.rowTop
    const scrollTop = api.getVerticalPixelRange().top
    const scrollBottom = api.getVerticalPixelRange().bottom
    const rowHeight = rowNode.rowHeight

    if (rowTop == null || rowHeight == null) return

    const isTooHigh = scrollTop > rowTop + rowHeight
    const isTooLow = scrollBottom < rowTop

    if (isTooHigh) setPinnedPosition('Top')
    else if (isTooLow) setPinnedPosition('Bottom')
    else setPinnedPosition('None')
  }

  const lineNumbersToShow = useMemo(() => {
    const map = new Map<number, boolean>()
    for (const lineNumber of changedLineNumbers) map.set(lineNumber, true)
    return map
  }, [changedLineNumbers])

  const shouldOnlyShowChangedLines = selectedChangedLine === null && !showAllLines

  const rowData = useMemo(() => {
    return shouldOnlyShowChangedLines
      ? filteredLines.filter((line) => lineNumbersToShow.has(line.lineNumber))
      : filteredLines
  }, [shouldOnlyShowChangedLines, filteredLines, lineNumbersToShow])

  useEffect(() => {
    onRowDataChanged(rowData)
  }, [shouldOnlyShowChangedLines, filteredLines, lineNumbersToShow])

  const customCellRenderer = (params: ICellRendererParams) => {
    const cellText: string = params.value

    if (params.node.rowIndex == null || !params.data || params.colDef?.field === 'oldTranslated') return cellText

    const rowIndex = params.node.rowIndex

    const rowMatches = stringSearchResult?.matches.get(rowIndex)

    const pattern = stringSearchResult?.pattern
    const parts =
      params.colDef?.field === LANGUAGE_COLUMNS[matchLanguage] && pattern && rowMatches
        ? getParts(rowMatches, pattern.length, cellText.length)
        : []

    const getMatchColor = (rowIndex: number, charIndex: number) => {
      return stringSearchResult?.selectedMatch?.rowIndex == rowIndex &&
        stringSearchResult?.selectedMatch?.charIndex == charIndex
        ? 'orange'
        : 'yellow'
    }

    const textWithMatches =
      parts.length > 0 ? (
        <span>
          {parts.map(({ start, end, isMatch }, i) => {
            const part = cellText.slice(start, end)
            if (isMatch) {
              return (
                <span key={i} style={{ backgroundColor: getMatchColor(rowIndex, start), color: 'black' }}>
                  {part}
                </span>
              )
            }
            return <span key={i}>{part}</span>
          })}
        </span>
      ) : (
        <p className="block h-full leading-6">{cellText}</p>
      )

    if (params.colDef?.field === 'original') return textWithMatches

    const lineComments = comments.filter((comment) => comment.line - 1 === params.data.lineNumber)
    const isResolved = lineComments[lineComments.length - 1]?.body === RESOLVED_COMMENT

    return (
      <div className="w-full">
        <div className="flex items-center justify-between w-full">
          {textWithMatches}
          {lineNumbersToShow.get(params.data.lineNumber) === true && (
            <div className="flex gap-1 h-full items-center">
              {(isResolved || lineComments.length === 0) && (
                <button className="btn btn-square btn-xs" onClick={() => setAddCommentToLine(params.data.lineNumber)}>
                  <AddCommentIcon />
                </button>
              )}
              <button
                className="btn btn-square btn-xs swap swap-active"
                onClick={() => {
                  if (!selectedChangedLine) {
                    lineToFocus.current = params.data
                    setSelectedChangedLine(params.data)
                  } else {
                    lineToFocus.current = params.data
                    setSelectedChangedLine(null)
                  }
                }}
              >
                <div className={selectedChangedLine ? 'swap-off' : 'swap-on'}>
                  <UnfoldMoreIcon />
                </div>
                <div className={selectedChangedLine ? 'swap-on' : 'swap-off'}>
                  <UnfoldLessIcon />
                </div>
              </button>
            </div>
          )}
        </div>
        {((!isResolved && lineComments.length > 0) || addCommentToLine === params.data.lineNumber) && (
          <div
            className="flex flex-col border-2 rounded-md border-base-content/10 mt-4 gap-2 mb-2 bg-base-100"
            onDoubleClickCapture={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between px-2 pt-2">
              <h2 className="font-bold text-lg">Commentaires</h2>
              <button
                onClick={() => {
                  setAddCommentToLine(null)
                  onSendComment({
                    body: RESOLVED_COMMENT,
                    line: params.data.lineNumber + 1,
                    inReplyTo:
                      addCommentToLine === params.data.lineNumber ? undefined : lineComments[lineComments.length - 1].id
                  })
                }}
                className="btn btn-sm btn-soft"
              >
                <p className="h-fit">Marquer comme résolu</p>
              </button>
            </div>
            {lineComments.map((comment) => (
              <div key={comment.id}>
                <div className="border-b border-base-content/10" />
                <div className="flex flex-col gap-2 py-3 px-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="avatar w-7">
                        <img className="rounded-full" src={comment.user.avatar_url} alt="" />
                      </div>
                      <h3 className="font-semibold">{comment.user.login}</h3>
                    </div>
                    <div className="flex gap-2">
                      {comment.user.login === userLogin && (
                        <>
                          <button
                            className="btn btn-ghost btn-circle btn-neutral text-error btn-xs p-0.5"
                            onClick={() => {
                              const pullRequestNumber = parseInt(comment.pull_request_url.split('/').pop() ?? '', 10)
                              if (isNaN(pullRequestNumber)) return

                              onDeleteCommentClicked({
                                commentId: comment.id,
                                pullRequestNumber
                              })
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="ml-4">{comment.body}</p>
                </div>
              </div>
            ))}
            <div className="p-2 flex flex-col gap-2 items-end">
              <textarea
                onKeyDownCapture={(e) => e.stopPropagation()}
                ref={(elem) => textAreaRefs.current.set(params.data.lineNumber, elem)}
                onChange={(e) => commentAnswers.current.set(params.data.lineNumber, e.target.value)}
                className="textarea w-full pr-14 "
                placeholder={addCommentToLine ? 'Ajouter un commentaire...' : 'Répondre...'}
                defaultValue={commentAnswers.current.get(params.data.lineNumber) || ''}
              />
              <div className="flex gap-2">
                {addCommentToLine === params.data.lineNumber && (
                  <button
                    className="btn btn-sm btn-soft"
                    onClick={() => {
                      setAddCommentToLine(null)
                      commentAnswers.current.delete(params.data.lineNumber)
                      const textArea = textAreaRefs.current.get(params.data.lineNumber)
                      if (textArea) textArea.value = ''
                    }}
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={() => {
                    const comment = commentAnswers.current.get(params.data.lineNumber)

                    commentAnswers.current.delete(params.data.lineNumber)
                    const textArea = textAreaRefs.current.get(params.data.lineNumber)
                    if (textArea) textArea.value = ''

                    if (!comment || comment.trim() === '') return

                    setAddCommentToLine(null)
                    onSendComment({
                      body: comment,
                      line: params.data.lineNumber + 1,
                      inReplyTo:
                        addCommentToLine === params.data.lineNumber
                          ? undefined
                          : lineComments[lineComments.length - 1].id
                    })
                  }}
                  className="btn btn-sm btn-primary"
                >
                  <p className="h-fit">Envoyer</p>
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <AgGridReact
      animateRows={false}
      onCellFocused={onCellFocused}
      onGridReady={(e) => {
        gridApi.current = e.api
        onReady?.(e)
      }}
      theme={myTheme}
      headerHeight={36}
      className="w-full max-w-[1700px] relative h-[calc(100svh-200px)]"
      rowData={rowData}
      rowClassRules={{
        'ag-cell-changed': ({ data }) => !!data && changedLineNumbers.includes(data.lineNumber),
        'ag-cell-conflict': ({ data }) => !!data && conflictedLinesNumber.includes(data.lineNumber)
      }}
      pinnedTopRowData={pinnedPosition === 'Top' ? [selectedChangedLine] : undefined}
      pinnedBottomRowData={pinnedPosition === 'Bottom' ? [selectedChangedLine] : undefined}
      getRowId={({ data }) => !!data && data.lineNumber.toString()}
      onBodyScroll={(e) => {
        checkRowVisibility(e.api)
      }}
      columnDefs={[
        { field: 'lineNumber', headerName: 'N°', width: 80, sortable: false, cellClass: 'leading-6!' },
        {
          field: 'original',
          headerName: 'Version anglaise',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellClass: 'leading-6!',
          cellRenderer: customCellRenderer
        },
        {
          field: 'oldTranslated',
          headerName: 'Version précédente',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellClass: 'leading-6!',
          cellRenderer: customCellRenderer
        },
        {
          field: 'translated',
          headerName: 'Nouvelle version française',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellClass: 'leading-6!',
          editable: editable,
          cellEditor: editable ? 'agTextCellEditor' : undefined,
          onCellValueChanged: editable ? onLineEdited : undefined,
          cellRenderer: customCellRenderer
        }
      ]}
    />
  )
}
