import { AgGridReact } from 'ag-grid-react'
import { NewValueParams } from 'ag-grid-community'
import { myTheme } from './grid-theme'

type LineType = { lineNumber: number; original: string; translated: string }

type TranslationGridProps = {
  linesToShow: LineType[]
  changedLineNumbers: number[]
  onLineEdited: (event: NewValueParams<LineType, any>) => void
}

export const TranslationGrid = ({ linesToShow, changedLineNumbers, onLineEdited }: TranslationGridProps) => (
  <AgGridReact
    theme={myTheme}
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
        filter: 'agTextColumnFilter',
        suppressHeaderFilterButton: true,
        floatingFilter: true
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
        filter: 'agTextColumnFilter',
        suppressHeaderFilterButton: true,
        floatingFilter: true
      }
    ]}
  />
)
