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
    if (rowAbsolutePos >= bodyTop && firstVisibleRowIndex === -1 && rowIndex) firstVisibleRowIndex = parseInt(rowIndex)
    if (rowAbsolutePos + row.clientHeight * 2 > bodyBottom && lastVisibleRowIndex === -1 && rowIndex)
      lastVisibleRowIndex = parseInt(rowIndex)
  })

  return { firstVisibleRowIndex, lastVisibleRowIndex }
}

export const isCellVisible = (rowIndex: number): boolean => {
  const indexes = getFirstAndLastVisibleRowsIndexes()
  if (!indexes) return false
  return rowIndex >= indexes.firstVisibleRowIndex && rowIndex <= indexes.lastVisibleRowIndex
}
