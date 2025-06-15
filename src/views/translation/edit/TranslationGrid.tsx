import { AgGridReact } from 'ag-grid-react'
import { GridReadyEvent, ICellRendererParams, NewValueParams } from 'ag-grid-community'
import { myTheme } from './grid-theme'
import { LineType, MatchLanguages } from './types'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { getParts } from '../../../string-search/get-parts'

type TranslationGridProps = {
  linesToShow: LineType[]
  changedLineNumbers: number[]
  onLineEdited: (event: NewValueParams<LineType, any>) => void
  onReady?: (event: GridReadyEvent<LineType>) => void
  translatedStringSearchResult: StringSearchResult | null
  matchLanguage: MatchLanguages
}

export const TranslationGrid = ({
  linesToShow,
  changedLineNumbers,
  onLineEdited,
  onReady,
  translatedStringSearchResult,
  matchLanguage
}: TranslationGridProps) => {
  const customCellRenderer = (params: ICellRendererParams) => {
    const cellText: string = params.value

    if (params.node.rowIndex == null || !translatedStringSearchResult) return cellText

    const rowIndex = params.node.rowIndex

    const rowMatches = translatedStringSearchResult.matches.get(rowIndex)

    if (!rowMatches) return cellText

    const pattern = translatedStringSearchResult.pattern
    const parts = getParts(rowMatches, pattern.length, cellText.length)

    const getMatchColor = (rowIndex: number, charIndex: number) => {
      return translatedStringSearchResult.selectedMatch?.rowIndex == rowIndex &&
        translatedStringSearchResult.selectedMatch?.charIndex == charIndex
        ? 'orange'
        : 'yellow'
    }

    return (
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
    )
  }

  return (
    <AgGridReact
      onGridReady={onReady}
      theme={myTheme}
      headerHeight={36}
      className="w-full max-w-[1700px] relative h-[calc(100svh-200px)]"
      rowData={linesToShow}
      rowClassRules={{
        'ag-cell-changed': ({ data }) => !!data && changedLineNumbers.includes(data.lineNumber)
      }}
      columnDefs={[
        { field: 'lineNumber', headerName: 'N°', width: 80, sortable: false },
        {
          field: 'original',
          headerName: 'Version anglaise',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          cellClass: 'leading-6!',
          sortable: false,
          cellRenderer: matchLanguage === 'en' ? customCellRenderer : undefined
        },
        {
          field: 'translated',
          headerName: 'Version française',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          editable: true,
          sortable: false,
          cellEditor: 'agTextCellEditor',
          cellClass: 'leading-6!',
          onCellValueChanged: onLineEdited,
          cellRenderer: matchLanguage === 'fr' ? customCellRenderer : undefined
        }
      ]}
    />
  )
}
