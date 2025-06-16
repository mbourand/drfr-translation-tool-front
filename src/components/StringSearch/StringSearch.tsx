import { ReactNode, useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { MatchCaseIcon } from '../icons/MatchCaseIcon'
import { ArrowUpIcon } from '../icons/ArrowUpIcon'
import { ArrowDownIcon } from '../icons/ArrowDownIcon'
import { MatchWordIcon } from '../icons/MatchWordIcon'
import { useStringSearch } from './useStringSearch'

type StringSearchProps = {
  className?: string
  extraButtons?: ReactNode
} & ReturnType<typeof useStringSearch>

export const StringSearch = ({
  className,
  extraButtons,
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
}: StringSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF' && (e.ctrlKey || e.metaKey) && inputRef.current) {
        e.preventDefault()
        inputRef.current.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown, { signal })

    return () => abortController.abort()
  })

  return (
    <div className={twMerge('join', className)}>
      <div>
        <div className="relative">
          <input
            ref={inputRef}
            className="input input-sm join-item pr-16"
            type="text"
            onChange={(e) => searchStrings(e.target.value)}
            onKeyDown={(e) => {
              if (e.code === 'Enter') e.shiftKey ? previousMatch() : nextMatch()
            }}
          />
          <div className="text-xs whitespace-nowrap absolute top-1/2 right-2 -translate-y-1/2">
            {!stringSearchResult.current
              ? ''
              : (matchesList.length ? selectedMatchIndex + 1 : 0) + ' / ' + (matchesList.length ?? 0)}
          </div>
        </div>
      </div>

      <button
        onClick={() => setMatchCase((prev) => !prev)}
        className={twMerge('btn btn-square btn-sm join-item', matchCase && 'bg-base-content/10')}
      >
        <MatchCaseIcon />
      </button>
      <button
        onClick={() => setMatchWord((prev) => !prev)}
        className={twMerge('btn btn-square btn-sm join-item', matchWord && 'bg-base-content/10')}
      >
        <MatchWordIcon />
      </button>

      {extraButtons}

      <button className="btn btn-square btn-sm join-item" onClick={previousMatch}>
        <ArrowUpIcon />
      </button>
      <button className="btn btn-square btn-sm join-item" onClick={nextMatch}>
        <ArrowDownIcon />
      </button>
    </div>
  )
}
