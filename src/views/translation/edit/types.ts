export type LineType = { lineNumber: number; original: string; translated: string }
export type ReviewLineType = { lineNumber: number; original: string; oldTranslated: string; newTranslated: string }

export type MatchLanguages = 'fr' | 'en'
