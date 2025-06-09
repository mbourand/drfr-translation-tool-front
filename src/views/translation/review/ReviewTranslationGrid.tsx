import { AgGridReact } from 'ag-grid-react'
import { GridReadyEvent, ICellRendererParams } from 'ag-grid-community'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { getParts } from '../../../string-search/get-parts'
import { MatchLanguages, ReviewLineType } from '../edit/types'
import { myTheme } from '../edit/grid-theme'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpIcon } from '../../../components/icons/ArrowUpIcon'
import { ArrowDownIcon } from '../../../components/icons/ArrowDownIcon'
import { binarySearch } from '../../../utils'
import { twMerge } from 'tailwind-merge'

type TranslationGridProps = {
  filteredLines: ReviewLineType[]
  changedLineNumbers: number[]
  onReady?: (event: GridReadyEvent<ReviewLineType>) => void
  translatedStringSearchResult: StringSearchResult | null
  matchLanguage: MatchLanguages
  linesToShow: ReviewLineType[]
}

type TranslationContext = {
  upperContext: string[]
  bottomContext: string[]
}

export const ReviewTranslationGrid = ({
  filteredLines,
  changedLineNumbers,
  onReady,
  translatedStringSearchResult,
  matchLanguage
}: TranslationGridProps) => {
  const [contextMap, setContextMap] = useState<Map<number, TranslationContext>>(new Map<number, TranslationContext>())

  const initLineNumbersToShow = () => {
    // The boolean value is true if the line has been changed in the PR
    const map = new Map<number, boolean>()
    for (const lineNumber of changedLineNumbers) map.set(lineNumber, true)
    return map
  }

  const lineNumbersToShow = useRef(initLineNumbersToShow())

  const addUpperContext = (rowIndex: number) => {
    const map = new Map(contextMap)

    if (!map.has(rowIndex)) map.set(rowIndex, { upperContext: [], bottomContext: [] })

    const translationContext = map.get(rowIndex)
    if (translationContext == undefined) return

    const currentUpperIndex = rowIndex - translationContext.upperContext.length

    translationContext.upperContext = filteredLines
      .slice(currentUpperIndex - 5, currentUpperIndex)
      .map((a) => a.newTranslated)
      .concat(translationContext.upperContext)

    for (let i = currentUpperIndex - 5; i < currentUpperIndex; i++) {
      if (!lineNumbersToShow.current.has(filteredLines[i].lineNumber)) {
        lineNumbersToShow.current.set(filteredLines[i].lineNumber, false)
      }
    }

    setContextMap(map)
  }

  const addBottomContext = (rowIndex: number) => {
    const map = new Map(contextMap)

    if (!map.has(rowIndex)) map.set(rowIndex, { upperContext: [], bottomContext: [] })

    const translationContext = map.get(rowIndex)
    if (translationContext == undefined) return

    const currentBottomIndex = rowIndex + 1 + translationContext.bottomContext.length

    translationContext.bottomContext = translationContext.bottomContext.concat(
      filteredLines.map((a) => a.newTranslated).slice(currentBottomIndex, currentBottomIndex + 5)
    )

    for (let i = currentBottomIndex; i < currentBottomIndex + 5; i++) {
      if (!lineNumbersToShow.current.has(filteredLines[i].lineNumber)) {
        lineNumbersToShow.current.set(filteredLines[i].lineNumber, false)
      }
    }

    setContextMap(map)
  }

  const customCellRenderer = (params: ICellRendererParams) => {
    const cellText: string = params.value

    if (params.node.rowIndex == null) return cellText

    const indexInFilteredLines = binarySearch(filteredLines, (current) => current.lineNumber - params.data.lineNumber)

    const rowMatches = translatedStringSearchResult?.matches.get(indexInFilteredLines)

    const pattern = translatedStringSearchResult?.pattern
    const parts = rowMatches && pattern ? getParts(rowMatches, pattern.length, cellText.length) : undefined

    const getMatchColor = (rowIndex: number, charIndex: number) => {
      return translatedStringSearchResult?.selectedMatch?.rowIndex == rowIndex &&
        translatedStringSearchResult.selectedMatch?.charIndex == charIndex
        ? 'orange'
        : 'yellow'
    }

    return (
      <div className={twMerge('flex items-center justify-between w-full')}>
        <p className="block h-full leading-6">
          {parts?.map(({ start, end, isMatch }, i) => {
            const part = cellText.slice(start, end)
            if (isMatch) {
              return (
                <span key={i} style={{ backgroundColor: getMatchColor(indexInFilteredLines, start), color: 'black' }}>
                  {part}
                </span>
              )
            }
            return <span key={i}>{part}</span>
          }) ?? cellText}
        </p>
        {lineNumbersToShow.current.get(params.data.lineNumber) === true && (
          <div className="flex gap-2 h-full items-center">
            <button className="btn btn-square btn-sm" onClick={() => addUpperContext(indexInFilteredLines)}>
              <ArrowUpIcon />
            </button>
            <button className="btn btn-square btn-sm" onClick={() => addBottomContext(indexInFilteredLines)}>
              <ArrowDownIcon />
            </button>
          </div>
        )}
      </div>
    )
  }

  const getContextBorders = (lineNumber: number) => {
    let hasBottomBorder = false
    let hasTopBorder = false
    let count = 0

    const indexInFilteredLines = binarySearch(filteredLines, (current) => current.lineNumber - lineNumber)
    for (const [contextIndexInFilteredLines, context] of contextMap.entries()) {
      if (
        indexInFilteredLines >= contextIndexInFilteredLines - context.upperContext.length &&
        indexInFilteredLines <= contextIndexInFilteredLines + context.bottomContext.length
      ) {
        count++
        if (indexInFilteredLines === contextIndexInFilteredLines - context.upperContext.length) hasTopBorder = true
        else if (indexInFilteredLines === contextIndexInFilteredLines + context.bottomContext.length)
          hasBottomBorder = true
      }
    }

    return {
      hasTopBorder: hasTopBorder && count === 1,
      hasBottomBorder: hasBottomBorder && count === 1,
      isContained: count > 0
    }
  }

  return (
    <AgGridReact
      onGridReady={onReady}
      theme={myTheme}
      headerHeight={36}
      className="w-full max-w-[1700px] relative h-[calc(100svh-200px)]"
      rowData={filteredLines.filter((line) => lineNumbersToShow.current.has(line.lineNumber))}
      rowClassRules={{
        'ag-cell-changed': ({ data }) => !!data && changedLineNumbers.includes(data.lineNumber),
        'ag-top-border': ({ data }) => !!data && getContextBorders(data.lineNumber).hasTopBorder,
        'ag-bottom-border': ({ data }) => !!data && getContextBorders(data.lineNumber).hasBottomBorder,
        'ag-x-border': ({ data }) => !!data && getContextBorders(data.lineNumber).isContained
      }}
      columnDefs={[
        { field: 'lineNumber', headerName: 'N°', width: 80, sortable: false },
        {
          field: 'original',
          headerName: 'Version anglaise',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellRenderer: customCellRenderer
        },
        {
          field: 'oldTranslated',
          headerName: 'Version française précédente',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellRenderer: customCellRenderer
        },
        {
          field: 'newTranslated',
          headerName: 'Nouvelle version française',
          autoHeight: true,
          wrapText: true,
          flex: 1,
          sortable: false,
          cellRenderer: customCellRenderer
        }
      ]}
    />
  )
}
