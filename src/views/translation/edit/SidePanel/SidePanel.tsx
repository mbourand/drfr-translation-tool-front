import { useMemo } from 'react'
import { FolderIcon } from '../../../../components/icons/FolderIcon'
import { SaveChangesButton } from './SaveChangesButton'
import { SubmitToReviewButton } from './SubmitToReviewButton'
import { ThemeButton } from '../../../../components/ThemeButton'
import { LaunchGameButton } from './LaunchGameButton'
import { makeLineKey } from '../changes'

export type FileType = {
  name: string
  translatedPath: string
  lines: { lineNumber: number; original: string; translated: string }[]
  pathsInGameFolder: {
    windows: string
  }
}

type SidePanelProps = {
  title: string
  categories: Record<string, FileType[]>
  onSelected: (file: FileType) => void
  selected: FileType | null
  branch: string
  changes: Map<string, string>
  onSaveSuccess: () => void
}

export const SidePanel = ({
  categories,
  onSelected,
  onSaveSuccess,
  selected,
  title,
  branch,
  changes
}: SidePanelProps) => {
  const files = useMemo(() => Object.values(categories).flat(), [categories])

  const filesForLaunchingGame = useMemo(() => {
    return files.map((file) => {
      return {
        pathsInGameFolder: file.pathsInGameFolder,
        content: file.lines
          .map((line) => changes.get(makeLineKey(file.translatedPath, line.lineNumber)) ?? line.translated)
          .join('\n'),
        pathInGitFolder: file.translatedPath
      }
    })
  }, [files, changes])

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
              <SubmitToReviewButton branch={branch} />
              <SaveChangesButton branch={branch} changes={changes} files={files} onSaveSuccess={onSaveSuccess} />
            </div>
          </ul>
        </div>
      </div>
    </>
  )
}
