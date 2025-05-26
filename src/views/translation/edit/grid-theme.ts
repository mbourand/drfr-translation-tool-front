import { themeQuartz } from 'ag-grid-community'

export const myTheme = themeQuartz.withParams({
  backgroundColor: 'var(--color-base-100)',
  foregroundColor: 'var(--color-base-200)',
  headerTextColor: 'var(--color-base-content)',
  textColor: 'var(--color-base-content)',
  headerBackgroundColor: 'var(--color-base-200)',
  oddRowBackgroundColor: 'var(--color-base-200)',
  borderColor: 'rgb(from var(--color-base-content) r g b / 0.1)',
  iconColor: 'var(--color-base-content)',
  menuTextColor: 'var(--color-base-content)',
  inputPlaceholderTextColor: 'var(--color-base-content)'
})
