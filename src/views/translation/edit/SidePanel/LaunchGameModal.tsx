import { Modal } from '../../../../components/Modal'
import { patchAndLaunchGame } from '../../../../modules/game/launch'
import { open } from '@tauri-apps/plugin-dialog'
import { store, STORE_KEYS } from '../../../../store/store'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type LaunchGameModalProps = {
  isVisible: boolean
  onClose: () => void
  files: Parameters<typeof patchAndLaunchGame>[3]
}

export const LaunchGameModal = ({ onClose, isVisible, files }: LaunchGameModalProps) => {
  const { data: gameFolder, refetch: refetchGameFolder } = useQuery({
    queryKey: [STORE_KEYS.GAME_FOLDER_PATH],
    queryFn: async () => {
      const folder = await store.get<string>(STORE_KEYS.GAME_FOLDER_PATH)
      return folder ?? null
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const { data: utmtCliFolder, refetch: refetchUtmtCliFolder } = useQuery({
    queryKey: [STORE_KEYS.UTMT_CLI_FOLDER_PATH],
    queryFn: async () => {
      const folder = await store.get<string>(STORE_KEYS.UTMT_CLI_FOLDER_PATH)
      return folder ?? null
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const { data: gitFolder, refetch: refetchGitFolder } = useQuery({
    queryKey: [STORE_KEYS.GIT_FOLDER_PATH],
    queryFn: async () => {
      const folder = await store.get<string>(STORE_KEYS.GIT_FOLDER_PATH)
      return folder ?? null
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const [isLoading, setIsLoading] = useState(false)

  return (
    <Modal
      onClose={onClose}
      isVisible={isVisible}
      label="Lancer le jeu"
      actions={
        <>
          <button className="float-right btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            disabled={!gameFolder || !utmtCliFolder}
            className="float-right btn btn-primary"
            onClick={async () => {
              if (!gameFolder || !utmtCliFolder || !gitFolder) return

              setIsLoading(true)
              await patchAndLaunchGame(gameFolder, utmtCliFolder, gitFolder, files)
              setIsLoading(false)
              onClose()
            }}
          >
            {isLoading && <span className="loading loading-spinner" />}
            Lancer le jeu
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="select-game-folder">Sélectionnez le dossier de Deltarune</label>
        <button
          id="select-game-folder"
          className="btn btn-soft"
          onClick={async () => {
            const selected = await open({
              multiple: false,
              directory: true,
              title: 'Sélectionnez le dossier de votre jeu'
            })

            if (selected && typeof selected === 'string') {
              await store.set(STORE_KEYS.GAME_FOLDER_PATH, selected)
              await store.save()
              refetchGameFolder()
            }
          }}
        >
          {gameFolder ?? 'Sélectionner un dossier'}
        </button>
        <label htmlFor="select-utmt-folder">Sélectionnez le dossier d'UTMT CLI</label>
        <button
          id="select-utmt-folder"
          className="btn btn-soft"
          onClick={async () => {
            const selected = await open({
              multiple: false,
              directory: true,
              title: "Sélectionnez le dossier d'UTMT CLI"
            })

            if (selected && typeof selected === 'string') {
              await store.set(STORE_KEYS.UTMT_CLI_FOLDER_PATH, selected)
              await store.save()
              refetchUtmtCliFolder()
            }
          }}
        >
          {utmtCliFolder ?? 'Sélectionner un dossier'}
        </button>
        <label htmlFor="select-git-folder">Sélectionnez le dossier du repo git du Patch FR</label>
        <button
          id="select-git-folder"
          className="btn btn-soft"
          onClick={async () => {
            const selected = await open({
              multiple: false,
              directory: true,
              title: 'Sélectionnez le dossier du dépôt git'
            })

            if (selected && typeof selected === 'string') {
              await store.set(STORE_KEYS.GIT_FOLDER_PATH, selected)
              await store.save()
              refetchGitFolder()
            }
          }}
        >
          {gitFolder ?? 'Sélectionner un dossier'}
        </button>
      </div>
    </Modal>
  )
}
