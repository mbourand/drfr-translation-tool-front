import { AgGridReact } from 'ag-grid-react'
import { GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { MatchLanguages, ReviewLineType } from '../edit/types'
import { myTheme } from '../edit/grid-theme'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { UnfoldMoreIcon } from '../../../components/icons/UnfoldMoreIcon'
import { UnfoldLessIcon } from '../../../components/icons/UnfoldLessIcon'

type TranslationGridProps = {
  filteredLines: ReviewLineType[]
  changedLineNumbers: number[]
  onReady?: (event: GridReadyEvent<ReviewLineType>) => void
  translatedStringSearchResult: StringSearchResult | null
  matchLanguage: MatchLanguages
  linesToShow: ReviewLineType[]
}

export const ReviewTranslationGrid = ({ filteredLines, changedLineNumbers, onReady }: TranslationGridProps) => {
  const gridApi = useRef<GridApi | null>(null)
  const [selectedChangedLine, setSelectedChangedLine] = useState<ReviewLineType | null>(null)
  const lineToFocus = useRef<ReviewLineType | null>(null)

  const [pinnedPosition, setPinnedPosition] = useState<'Top' | 'Bottom' | 'None'>('None')

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

  const initLineNumbersToShow = () => {
    // The boolean value is true if the line has been changed in the PR
    const map = new Map<number, boolean>()
    for (const lineNumber of changedLineNumbers) map.set(lineNumber, true)
    return map
  }

  const lineNumbersToShow = useRef(initLineNumbersToShow())

  const customCellRenderer = (params: ICellRendererParams) => {
    const cellText: string = params.value

    if (params.node.rowIndex == null || !params.data || params.colDef?.field !== 'newTranslated') return cellText

    return (
      <div className={twMerge('flex items-center justify-between w-full')}>
        <p className="block h-full leading-6">{cellText}</p>
        {lineNumbersToShow.current.get(params.data.lineNumber) === true && (
          <div className="flex gap-2 h-full items-center">
            <button
              className="btn btn-square btn-sm swap swap-active"
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
    )
  }

  return (
    <AgGridReact
      onGridReady={(e) => {
        gridApi.current = e.api
        onReady?.(e)
      }}
      theme={myTheme}
      headerHeight={36}
      className="w-full max-w-[1700px] relative h-[calc(100svh-200px)]"
      rowData={
        selectedChangedLine !== null
          ? filteredLines
          : filteredLines.filter((line) => lineNumbersToShow.current.has(line.lineNumber))
      }
      rowClassRules={{
        'ag-cell-changed': ({ data }) => !!data && changedLineNumbers.includes(data.lineNumber)
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
          headerName: 'Version française précédente',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellClass: 'leading-6!',
          cellRenderer: customCellRenderer
        },
        {
          field: 'newTranslated',
          headerName: 'Nouvelle version française',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellClass: 'leading-6!',
          cellRenderer: customCellRenderer
        }
      ]}
    />
  )
}
