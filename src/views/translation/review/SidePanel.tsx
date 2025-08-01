import { useMemo } from 'react'
import { ThemeButton } from '../../../components/ThemeButton'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { LaunchGameButton } from '../edit/SidePanel/LaunchGameButton'
import { ApproveButtonButton } from './ApproveButton'
import { ReviewFileType } from './ReviewTranslationView'
import { makeLineKey } from '../edit/changes'
import { SaveChangesButton } from '../edit/SidePanel/SaveChangesButton'
import { DifferenceIcon } from '../../../components/icons/DifferenceIcon'
import { AskForChangesButton } from './AskForChangesButton'
import { SubmitToReviewButton } from '../edit/SidePanel/SubmitToReviewButton'

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
  isReviewed: boolean
  onSaveSuccess: () => void
}

export const SidePanel = ({
  categories,
  isYours,
  editedLines,
  onSelected,
  onSaveSuccess,
  selected,
  title,
  isReviewed,
  branch
}: SidePanelProps) => {
  const files = useMemo(() => Object.values(categories).flat(), [categories])

  const filesForLaunchingGame = useMemo(() => {
    return files.map((file) => {
      return {
        pathsInGameFolder: file.pathsInGameFolder,
        content: file.lines
          .map((line) => editedLines.get(makeLineKey(file.translatedPath, line.lineNumber)) ?? line.translated)
          .join('\n'),
        pathInGitFolder: file.translatedPath
      }
    })
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
                            ? 'menu-active flex items-center'
                            : ''
                        }
                        onClick={() => onSelected(file)}
                      >
                        {file.name}
                        {file.hasChanges && (
                          <div className="text-success">
                            <DifferenceIcon />
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <div className="mt-auto flex flex-col gap-3">
              <LaunchGameButton files={filesForLaunchingGame} />
              {isYours && isReviewed && <SubmitToReviewButton branch={branch} />}
              {isYours && (
                <SaveChangesButton branch={branch} files={files} changes={editedLines} onSaveSuccess={onSaveSuccess} />
              )}
              {!isYours && <AskForChangesButton branch={branch} />}
              {!isYours && <ApproveButtonButton branch={branch} />}
            </div>
          </ul>
        </div>
      </div>
    </>
  )
}
