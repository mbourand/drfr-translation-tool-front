import { FileType } from './SidePanel/SidePanel'

export const makeLineKey = (file: FileType, line: number) => `${file.translatedPath}:${line}`
