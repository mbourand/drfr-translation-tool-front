import { useEffect, useMemo, useState } from 'react'
import { PreviewOffIcon } from '../icons/PreviewOffIcon'
import { PreviewIcon } from '../icons/PreviewIcon'
import { twMerge } from 'tailwind-merge'

const FORCED_LINE_BREAK_CHAR = '&'

type BoxKind = 'legendoftenna' | 'classic'

type BoxType = {
  maxCharactersPerLine: number
  maxCharactersWithHead: number
  maxLines: number
  characterWidth: number
  lineHeight: number
  hasAsteriskHandling?: boolean
}

const BOX_CONFIGS = {
  classic: {
    maxCharactersPerLine: 33,
    maxCharactersWithHead: 26,
    characterWidth: 19.7,
    maxLines: 3,
    lineHeight: 44,
    hasAsteriskHandling: true
  },
  legendoftenna: {
    maxCharactersPerLine: 22,
    maxCharactersWithHead: 22,
    characterWidth: 19.7,
    maxLines: 3,
    lineHeight: 44,
    hasAsteriskHandling: false
  }
} as const satisfies Record<BoxKind, BoxType>

type DialogVisualizerProps = {
  dialog: string
}

export const DialogVisualizer = ({ dialog }: DialogVisualizerProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [boxKind, setBoxKind] = useState<BoxKind>('classic')

  const config = BOX_CONFIGS[boxKind]

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F8') {
        event.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', onKeyDown, { signal })

    return () => {
      abortController.abort()
    }
  }, [])

  const isHeadDialog = /^\\[A-Z][A-Za-z0-9]/.test(dialog)

  const sanitizedDialog = dialog
    .replace(/\r/g, '')
    .replace(/\^\d/g, '')
    .replace(/\\c[A-Z]/g, '')
    .replace(/^\\[A-Z][a-zA-Z0-9]/g, '')
    .replace(/\/%?$/g, '')

  const lines = useMemo(() => {
    const lines: string[] = []
    let currentLine = ''
    let currentWord = ''
    const maxCharactersPerLineThisDialog = isHeadDialog ? config.maxCharactersWithHead : config.maxCharactersPerLine
    for (let i = 0; i < sanitizedDialog.length; i++) {
      const hasLeadingAsterisk = currentLine.startsWith('*')
      const maxCharactersThisLine =
        hasLeadingAsterisk && lines.length > 0 ? maxCharactersPerLineThisDialog - 2 : maxCharactersPerLineThisDialog

      const char = sanitizedDialog[i]

      if (currentLine.length + currentWord.length > maxCharactersThisLine) {
        if (currentLine) lines.push(currentLine)
        currentLine = ''
        currentWord += char
        continue
      }

      if (char === FORCED_LINE_BREAK_CHAR) {
        if (currentLine === '') currentLine = currentWord.replace(/^\s(\S)/, '$1')
        else currentLine += currentWord
        lines.push(currentLine)
        currentLine = ''
        currentWord = ''
        continue
      }

      if (char === ' ') {
        if (currentLine === '') currentLine = currentWord.replace(/^\s(\S)/, '$1')
        else currentLine += currentWord
        currentWord = char
        continue
      }

      currentWord += char
    }

    if (currentWord) {
      if (currentLine === '') currentLine = currentWord.replace(/^\s(\S)/, '$1')
      else currentLine += currentWord
      currentWord = ''
    }

    if (currentLine) lines.push(currentLine)

    return lines
  }, [sanitizedDialog, boxKind])

  return (
    <>
      <div className="fixed z-20 bottom-4 right-4">
        {isVisible && (
          <div
            className="font-dtm-mono text-[32px] bg-black leading-11 relative w-full h-full outline-white outline-5 px-4 py-2 overflow-hidden text-white whitespace-nowrap"
            style={{
              width: config.characterWidth * config.maxCharactersPerLine + 32, // 32 for padding
              height: config.lineHeight * config.maxLines + 16,
              paddingLeft: isHeadDialog
                ? (config.maxCharactersPerLine - config.maxCharactersWithHead) * config.characterWidth + 16
                : undefined
            }}
          >
            {lines.map((line, index) => (
              <>
                <span key={index}>
                  {config.hasAsteriskHandling && !line.startsWith('*') && <>&nbsp;&nbsp;</>}
                  {line.replace(/\s/g, '\u00A0')}
                </span>
                <br />
              </>
            ))}
          </div>
        )}
        <button
          className={twMerge(
            'btn btn-soft btn-circle absolute z-100 btn-sm',
            isVisible ? 'btn-error top-0 right-0 translate-x-1/2! -translate-y-1/2!' : 'btn-secondary bottom-0 right-0'
          )}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? <PreviewOffIcon /> : <PreviewIcon />}
        </button>
        {isVisible && (
          <button
            className={twMerge(
              'swap btn btn-circle btn-primary absolute z-100 btn-sm top-5 right-0 translate-x-1/2!',
              boxKind === 'classic' && 'btn-soft'
            )}
            onClick={() => setBoxKind(boxKind === 'classic' ? 'legendoftenna' : 'classic')}
          >
            <input type="checkbox" />
            <span>TV</span>
          </button>
        )}
      </div>
    </>
  )
}
