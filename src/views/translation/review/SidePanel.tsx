import { useMemo } from 'react'
import { ThemeButton } from '../../../components/ThemeButton'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { LaunchGameButton } from '../edit/SidePanel/LaunchGameButton'
import { ApproveButtonButton } from './ApproveButton'
import { ReviewFileType } from './ReviewTranslationView'
import { makeLineKey } from '../edit/changes'
import { SaveChangesButton } from '../edit/SidePanel/SaveChangesButton'
import { LineType } from '../edit/types'

export type FileType = {
  name: string
  translatedPath: string
  lines: { lineNumber: number; original: string; translated: string }[]
  pathsInGameFolder: {
    windows: string
  }
  isYours: boolean
}

type SidePanelProps = {
  title: string
  categories: Record<string, ReviewFileType[]>
  onSelected: (file: ReviewFileType) => void
  selected: ReviewFileType | null
  editedLines: Map<string, string>
  branch: string
  isYours: boolean
}

export const SidePanel = ({
  categories,
  isYours,
  editedLines,
  onSelected,
  selected,
  title,
  branch
}: SidePanelProps) => {
  const files = useMemo(() => Object.values(categories).flat(), [categories])

  const filesForLaunchingGame = useMemo(() => {
    return files.map((file) => {
      return {
        pathsInGameFolder: file.pathsInGameFolder,
        content: file.lines
          .map((line) => editedLines.get(makeLineKey(file.translatedPath, line.lineNumber)) ?? line.newTranslated)
          .join('\n'),
        pathInGitFolder: file.translatedPath
      }
    })
  }, [files, editedLines])

  const filesForSavingChanges = useMemo(() => {
    return files.map((f) => ({
      ...f,
      lines: f.lines.map((l) => ({ ...l, translated: l.newTranslated } as LineType))
    }))
  }, [files, editedLines])

  return (
    <>
      <div className="drawer lg:drawer-open w-fit z-30">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
            Open drawer
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 h-full">
            <div className="flex flex-row justify-between w-full items-center mb-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              <ThemeButton />
            </div>

            {Object.entries(categories).map(([category, files]) => (
              <li key={category}>
                <summary>
                  <FolderIcon />
                  {category}
                </summary>
                <ul>
                  {files.map((file) => (
                    <li key={file.translatedPath}>
                      <button
                        className={
                          selected?.translatedPath === file.translatedPath && selected?.translatedPath === category
                            ? 'menu-active'
                            : ''
                        }
                        onClick={() => onSelected(file)}
                      >
                        {file.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <div className="mt-auto flex flex-col gap-3">
              <LaunchGameButton files={filesForLaunchingGame} />
              {isYours && <SaveChangesButton branch={branch} files={filesForSavingChanges} changes={editedLines} />}
              {!isYours && <ApproveButtonButton branch={branch} />}
            </div>
          </ul>
        </div>
      </div>
    </>
  )
}
