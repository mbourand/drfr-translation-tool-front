import { useState } from 'react'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { SaveChangesModal } from './SaveChangesModal'

export type SidePanelFileType = {
  category: string
  name: string
}

type SidePanelProps = {
  title: string
  categories: Record<string, string[]>
  onSelected: (file: SidePanelFileType) => void
  selected: SidePanelFileType | null
}

export const SidePanel = ({ categories, onSelected, selected, title }: SidePanelProps) => {
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false)

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
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            {Object.entries(categories).map(([category, files]) => (
              <li key={category}>
                <summary>
                  <FolderIcon />
                  {category}
                </summary>
                <ul>
                  {files.map((file) => (
                    <li key={file}>
                      <button
                        className={selected?.name === file && selected?.category === category ? 'menu-active' : ''}
                        onClick={() => onSelected({ category, name: file })}
                      >
                        {file}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <div className="mt-auto flex flex-col gap-3">
              <button className="btn btn-soft btn-primary">Lancer le jeu</button>
              <button className="btn btn-soft btn-primary">Soumettre à la correction</button>
              <button className="btn btn-primary" onClick={() => setIsSaveModalVisible(true)}>
                Sauvegarder
              </button>
            </div>
          </ul>
        </div>
      </div>
      <SaveChangesModal isVisible={isSaveModalVisible} onClose={() => setIsSaveModalVisible(false)} />
    </>
  )
}
