import { AgGridReact } from 'ag-grid-react'
import { GridReadyEvent, ICellRendererParams, NewValueParams } from 'ag-grid-community'
import { myTheme } from './grid-theme'
import { LineType, MatchLanguages } from './types'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { getParts } from '../../../string-search/get-parts'
import { ArrowUpIcon } from '../../../components/icons/ArrowUpIcon'
import { ArrowDownIcon } from '../../../components/icons/ArrowDownIcon'
import { useState } from 'react'
import { SunIcon } from '../../../components/icons/SunIcon'

type TranslationGridProps = {
  linesToShow: LineType[]
  changedLineNumbers: number[]
  onLineEdited: (event: NewValueParams<LineType, any>) => void
  onReady?: (event: GridReadyEvent<LineType>) => void
  translatedStringSearchResult: StringSearchResult | null
  matchLanguage: MatchLanguages
}

type TranslationContext = {
  upperContext: string[]
  bottomContext: string[]
  isVisible: boolean
}

export const TranslationGrid = ({
  linesToShow,
  changedLineNumbers,
  onLineEdited,
  onReady,
  translatedStringSearchResult,
  matchLanguage
}: TranslationGridProps) => {
  const [contextMap, setContextMap] = useState<Map<number, TranslationContext>>(new Map<number, TranslationContext>())

  const toggleVisibleContext = (rowIndex: number) => {
    const map = new Map(contextMap)

    const translationContext = map.get(rowIndex)
    if (!translationContext) return map

    translationContext.isVisible = !translationContext.isVisible

    setContextMap(map)
  }

  const addUpperContext = (rowIndex: number) => {
    const map = new Map(contextMap)

    if (!map.has(rowIndex)) map.set(rowIndex, { upperContext: [], bottomContext: [], isVisible: false })

    const translationContext = map.get(rowIndex)
    if (translationContext == undefined) return

    const currentUpperIndex = rowIndex - translationContext.upperContext.length

    translationContext.upperContext = translationContext.upperContext.concat(
      linesToShow.map((a) => a.translated).slice(currentUpperIndex - 5, currentUpperIndex)
    )

    setContextMap(map)
  }

  const addBottomContext = (rowIndex: number) => {
    const map = new Map(contextMap)

    if (!map.has(rowIndex)) map.set(rowIndex, { upperContext: [], bottomContext: [], isVisible: false })

    const translationContext = map.get(rowIndex)
    if (translationContext == undefined) return

    const currentBottomIndex = rowIndex + translationContext.bottomContext.length

    translationContext.bottomContext = translationContext.bottomContext.concat(
      linesToShow.map((a) => a.translated).slice(currentBottomIndex, currentBottomIndex + 5)
    )

    setContextMap(map)
  }

  const customCellRenderer = (params: ICellRendererParams) => {
    const cellText: string = params.value

    if (params.node.rowIndex == null) return cellText

    const rowIndex = params.node.rowIndex

    const isVisible = contextMap.get(rowIndex)?.isVisible
    const upperContext = contextMap.get(rowIndex)?.upperContext
    const bottomContext = contextMap.get(rowIndex)?.bottomContext

    if (!translatedStringSearchResult) {
      return (
        <div>
          {isVisible && upperContext && (
            <div className="w-full border-b">
              {upperContext.map((str) => (
                <div>{str}</div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between w-full px-4">
            <span>{cellText}</span>
            <div className="flex gap-2">
              <button className="btn btn-square btn-sm" onClick={() => addUpperContext(rowIndex)}>
                <ArrowUpIcon />
              </button>
              <button className="btn btn-square btn-sm" onClick={() => addBottomContext(rowIndex)}>
                <ArrowDownIcon />
              </button>
              <button className="btn btn-square btn-sm" onClick={() => toggleVisibleContext(rowIndex)}>
                <SunIcon />
              </button>
            </div>
          </div>
          {isVisible && bottomContext && (
            <div className="w-full border-t">
              {bottomContext.map((str) => (
                <div>{str}</div>
              ))}
            </div>
          )}
        </div>
      )
    }

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
              <span key={i} style={{ backgroundColor: getMatchColor(rowIndex, start) }}>
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
