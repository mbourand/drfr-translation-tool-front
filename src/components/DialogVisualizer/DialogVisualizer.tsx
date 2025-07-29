import { useEffect, useMemo, useRef, useState } from 'react'
import { PreviewOffIcon } from '../icons/PreviewOffIcon'
import { PreviewIcon } from '../icons/PreviewIcon'
import { twMerge } from 'tailwind-merge'
import { MoreHorizIcon } from '../icons/MoreHorizIcon'
import { useInterval } from 'react-use'

const FORCED_LINE_BREAK_CHAR = ['&', '#']

type BoxKind = 'legendoftenna' | 'classic' | 'shoptalk' | 'shop' | 'battle'

type BoxType = {
  name: string
  maxCharactersPerLine: number
  maxCharactersWithHead: number
  maxLines: number
  characterWidth: number
  lineHeight: number
  hasAsteriskHandling?: boolean
}

const BOX_CONFIGS = {
  classic: {
    name: 'Classique',
    maxCharactersPerLine: 33,
    maxCharactersWithHead: 26,
    characterWidth: 17.8,
    maxLines: 3,
    lineHeight: 44,
    hasAsteriskHandling: true
  },
  legendoftenna: {
    name: 'The Legend of Tenna',
    maxCharactersPerLine: 22,
    maxCharactersWithHead: 22,
    characterWidth: 17.8,
    maxLines: 3,
    lineHeight: 44,
    hasAsteriskHandling: false
  },
  shoptalk: {
    name: 'Shop pleine taille',
    maxCharactersPerLine: 33,
    maxCharactersWithHead: 33,
    characterWidth: 17.8,
    maxLines: 5,
    lineHeight: 44,
    hasAsteriskHandling: true
  },
  shop: {
    name: 'Shop partie gauche',
    maxCharactersPerLine: 23,
    maxCharactersWithHead: 23,
    characterWidth: 17.8,
    maxLines: 5,
    lineHeight: 44,
    hasAsteriskHandling: true
  },
  battle: {
    name: 'Combat',
    maxCharactersPerLine: Infinity,
    maxCharactersWithHead: Infinity,
    characterWidth: 17.8,
    maxLines: Infinity,
    lineHeight: 44,
    hasAsteriskHandling: false
  }
} as const satisfies Record<BoxKind, BoxType>

type DialogVisualizerProps = {
  getDialog: () => string
}

export const DialogVisualizer = ({ getDialog }: DialogVisualizerProps) => {
  const [dialog, setDialog] = useState(getDialog())
  const [internalDialog, setInternalDialog] = useState(dialog)
  const [isVisible, setIsVisible] = useState(false)
  const [boxKind, setBoxKind] = useState<BoxKind>('classic')

  const config = BOX_CONFIGS[boxKind]

  useEffect(() => {
    setInternalDialog(dialog)
  }, [dialog])

  useInterval(() => setDialog(getDialog()), 100)

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

  const isHeadDialog = /^\\[A-Z][A-Za-z0-9]/.test(internalDialog)

  const sanitizedDialog = internalDialog
    .replace(/\[RETOUR A LA LIGNE\]/g, '&')
    .replace(/\r/g, '')
    .replace(/\^\d/g, '')
    .replace(/\\c[A-Z0-9]/g, '')
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
        maxCharactersPerLineThisDialog - (config.hasAsteriskHandling && !hasLeadingAsterisk ? 2 : 0)

      const char = sanitizedDialog[i]

      if (currentLine.length + currentWord.length > maxCharactersThisLine) {
        if (currentLine) lines.push(currentLine)
        currentLine = ''
        currentWord += char
        continue
      }

      if (FORCED_LINE_BREAK_CHAR.includes(char)) {
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
      const hasLeadingAsterisk = currentLine.startsWith('*')
      const maxCharactersThisLine =
        maxCharactersPerLineThisDialog - (config.hasAsteriskHandling && !hasLeadingAsterisk ? 2 : 0)

      if (currentLine.length + currentWord.length > maxCharactersThisLine) {
        lines.push(currentLine)
        currentLine = ''
      }

      if (currentLine === '') currentLine = currentWord.replace(/^\s(\S)/, '$1')
      else currentLine += currentWord
      currentWord = ''
    }

    if (currentLine) lines.push(currentLine)

    return lines
  }, [sanitizedDialog, boxKind])

  const selectRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const onClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        selectRef.current.removeAttribute('open')
      }
    }

    document.addEventListener('click', onClickOutside, { signal })

    return () => {
      abortController.abort()
    }
  }, [])

  return (
    <>
      <div className="fixed z-20 bottom-4 right-4">
        {isVisible && (
          <div className="join join-vertical">
            <div
              className="font-dtm-mono text-[28px] bg-black leading-10 relative border-white border-5 px-4 py-2 overflow-hidden text-white whitespace-nowrap join-item"
              style={{
                width:
                  config.maxLines !== Infinity ? config.characterWidth * config.maxCharactersPerLine + 32 : undefined, // 32 for padding
                height: config.maxLines !== Infinity ? config.lineHeight * config.maxLines + 16 : undefined,
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
            <input
              className="input join-item w-full !outline-none"
              type="text"
              value={internalDialog}
              onChange={(e) => setInternalDialog(e.target.value)}
            />
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
          <div>
            <details ref={selectRef} className="dropdown absolute z-100 top-0 left-0 -translate-x-1/2 -translate-y-1/2">
              <summary className="btn btn-circle btn-soft btn-sm">
                <MoreHorizIcon />
              </summary>
              <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm top-0 -translate-y-[calc(100%+4px)]">
                {(Object.keys(BOX_CONFIGS) as BoxKind[]).map((kind) => (
                  <li key={kind}>
                    <a
                      className={twMerge(boxKind === kind && 'bg-primary text-primary-content')}
                      onClick={() => {
                        selectRef.current?.removeAttribute('open')
                        setBoxKind(kind)
                      }}
                    >
                      {BOX_CONFIGS[kind].name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    </>
  )
}
