export type MatchPos = {
  rowIndex: number
  charIndex: number
}

export type StringSearchResult = {
  pattern: string
  matches: Map<number, number[]>
  selectedMatch: MatchPos | null
}
