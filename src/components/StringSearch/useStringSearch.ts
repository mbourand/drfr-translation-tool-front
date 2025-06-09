import { useEffect, useRef, useState } from 'react'
import { MatchPos, StringSearchResult } from './types'

type UseStringSearchParams = {
  lines: string[]
  onMatchChanged: (result: StringSearchResult | null) => void
}

export const useStringSearch = ({ lines, onMatchChanged }: UseStringSearchParams) => {
  const stringSearchResult = useRef<StringSearchResult | null>(null)

  const [matchesList, setMatchesList] = useState<MatchPos[]>([])
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0)

  const [matchCase, setMatchCase] = useState(false)
  const [matchWord, setMatchWord] = useState(false)

  useEffect(() => {
    if (stringSearchResult.current) searchStrings(stringSearchResult.current.pattern)
  }, [matchCase, matchWord])

  const previousMatch = () => {
    const newIndex = selectedMatchIndex <= 0 ? Math.max(matchesList.length - 1, 0) : selectedMatchIndex - 1
    changeMatch(newIndex)
  }

  const nextMatch = () => {
    const newIndex = selectedMatchIndex >= matchesList.length - 1 ? 0 : selectedMatchIndex + 1
    changeMatch(newIndex)
  }

  const changeMatch = (newIndex: number) => {
    if (stringSearchResult.current) {
      stringSearchResult.current.selectedMatch = matchesList[newIndex]
      onMatchChanged(stringSearchResult.current)
    }
    setSelectedMatchIndex(newIndex)
  }

  const getMatchesOnLine = (line: string, pattern: string) => {
    const matches: number[] = []

    if (!matchCase) {
      line = line.toLowerCase()
      pattern = pattern.toLowerCase()
    }

    let matchPos = line.indexOf(pattern)
    while (matchPos > -1) {
      if (matchWord) {
        const previousChar = matchPos - 1 < 0 ? ' ' : line[matchPos - 1]
        const nextChar = matchPos + pattern.length >= line.length ? ' ' : line[matchPos + pattern.length]
        if (/[^\wéèêûôîïçàùü]{2}/i.test(previousChar + nextChar)) matches.push(matchPos)
      } else matches.push(matchPos)
      matchPos = line.indexOf(pattern, matchPos + pattern.length)
    }

    return matches
  }

  const getMatchesFromPattern = (pattern: string): [Map<number, number[]>, MatchPos[]] => {
    const matchesMap = new Map<number, number[]>()
    const matchesList: MatchPos[] = []

    for (let i = 0; i < lines.length; i++) {
      const matches = getMatchesOnLine(lines[i], pattern)

      if (matches.length > 0) {
        matchesMap.set(i, matches)
        for (let j = 0; j < matches.length; j++) {
          matchesList.push({ rowIndex: i, charIndex: matches[j] })
        }
      }
    }

    return [matchesMap, matchesList]
  }

  const getNearestMatchFromLastSelectedMatch = (newMatchesMap: Map<number, number[]>, newMatchesList: MatchPos[]) => {
    if (!stringSearchResult.current || !matchesList.length) return null

    const targetRowIndex = matchesList[selectedMatchIndex].rowIndex
    const targetCharIndex = matchesList[selectedMatchIndex].charIndex

    let nearestRowIndex = -1
    let closestDistance = Infinity

    for (const rowIndex of newMatchesMap.keys()) {
      const distance = Math.abs(rowIndex - targetRowIndex)
      if (distance < closestDistance) {
        nearestRowIndex = rowIndex
        closestDistance = distance
      }
    }

    const matchesOfNearestRow = newMatchesMap.get(nearestRowIndex)

    if (matchesOfNearestRow == null) return null

    let nearestCharIndex = -1
    closestDistance = Infinity

    for (const charIndex of matchesOfNearestRow) {
      const distance = Math.abs(charIndex - targetCharIndex)
      if (distance < closestDistance) {
        nearestCharIndex = charIndex
        closestDistance = distance
      }
    }

    return newMatchesList.findIndex((elem) => elem.rowIndex === nearestRowIndex && elem.charIndex === nearestCharIndex)
  }

  const searchStrings = async (pattern: string) => {
    if (!pattern) {
      stringSearchResult.current = null
      setMatchesList([])
      setSelectedMatchIndex(0)
      onMatchChanged(null)
      return
    }

    const [matchesMap, matchesList] = getMatchesFromPattern(pattern)

    const nearestMatchFromLastSelectedMatch = getNearestMatchFromLastSelectedMatch(matchesMap, matchesList) ?? 0
    const selectedMatch = matchesList[nearestMatchFromLastSelectedMatch]

    const result: StringSearchResult = {
      pattern,
      matches: matchesMap,
      selectedMatch
    }

    stringSearchResult.current = result

    setMatchesList(matchesList)
    setSelectedMatchIndex(nearestMatchFromLastSelectedMatch)
    onMatchChanged(result)
  }

  return {
    matchesList,
    selectedMatchIndex,
    stringSearchResult,
    matchCase,
    matchWord,
    searchStrings,
    nextMatch,
    previousMatch,
    setMatchCase,
    setMatchWord
  }
}
