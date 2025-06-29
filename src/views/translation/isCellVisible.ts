import { GridApi } from 'ag-grid-community'

export const isRowVisible = (api: GridApi, rowLineNumber: number) => {
  const rowNode = api.getRowNode(rowLineNumber.toString())
  if (!rowNode) return

  const rowTop = rowNode.rowTop
  const scrollTop = api.getVerticalPixelRange().top
  const scrollBottom = api.getVerticalPixelRange().bottom
  const rowHeight = rowNode.rowHeight

  if (rowTop == null || rowHeight == null) return

  const isTooHigh = scrollTop > rowTop + rowHeight
  const isTooLow = scrollBottom < rowTop

  return !isTooHigh && !isTooLow
}
