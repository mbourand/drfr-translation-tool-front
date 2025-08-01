import { useEffect } from 'react'
import { StringSearch } from '../../../components/StringSearch/StringSearch'
import { StringSearchResult } from '../../../components/StringSearch/types'
import { useStringSearch } from '../../../components/StringSearch/useStringSearch'
import { LineType, MatchLanguages } from './types'

type TranslationStringSearchProps = {
  filteredLines: LineType[]
  matchLanguage: MatchLanguages
  onMatchChanged: (result: StringSearchResult | null) => void
  onMatchLanguageChanged: (language: MatchLanguages) => void
}

export const TranslationStringSearch = ({
  filteredLines,
  matchLanguage,
  onMatchChanged,
  onMatchLanguageChanged
}: TranslationStringSearchProps) => {
  const stringSearch = useStringSearch({
    lines: matchLanguage === 'fr' ? filteredLines.map((l) => l.translated) : filteredLines.map((l) => l.original),
    onMatchChanged
  })

  useEffect(() => {
    if (stringSearch.stringSearchResult.current)
      stringSearch.searchStrings(stringSearch.stringSearchResult.current?.pattern)
  }, [matchLanguage, filteredLines])

  return (
    <StringSearch
      className="ml-auto mb-2"
      extraButtons={
        <label className="swap btn btn-square btn-sm join-item">
          <input
            type="checkbox"
            checked={matchLanguage === 'en'}
            onChange={(e) => onMatchLanguageChanged(e.target.checked ? 'en' : 'fr')}
          />
          <div className="swap-off">VF</div>
          <div className="swap-on">VO</div>
        </label>
      }
      {...stringSearch}
    />
  )
}
