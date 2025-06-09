export const getParts = (matches: number[], patternLength: number, stringLength: number) => {
  const parts: { start: number; end: number; isMatch: boolean }[] = []

  let currentIndex = 0

  for (const matchStart of matches) {
    if (matchStart > currentIndex) {
      parts.push({ start: currentIndex, end: matchStart, isMatch: false })
    }

    parts.push({ start: matchStart, end: matchStart + patternLength, isMatch: true })
    currentIndex = matchStart + patternLength
  }

  if (currentIndex < stringLength) {
    parts.push({ start: currentIndex, end: stringLength, isMatch: false })
  }

  return parts
}
