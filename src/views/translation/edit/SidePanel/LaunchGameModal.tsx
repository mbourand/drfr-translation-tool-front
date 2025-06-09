import { Modal } from '../../../../components/Modal'
import { patchAndLaunchGame, PatchGameTranslationFile } from '../../../../modules/game/launch'
import { open } from '@tauri-apps/plugin-dialog'
import { store, STORE_KEYS } from '../../../../store/store'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchData } from '../../../../modules/fetching/fetcher'
import { STATIC_ROUTES } from '../../../../routes/static/routes'

type LaunchGameModalProps = {
  isVisible: boolean
  onClose: () => void
  files: PatchGameTranslationFile[]
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

  const { data: savesFolder, refetch: refetchSavesFolder } = useQuery({
    queryKey: [STORE_KEYS.SAVES_FOLDER_PATH],
    queryFn: async () => {
      const folder = await store.get<string>(STORE_KEYS.SAVES_FOLDER_PATH)
      return folder ?? null
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const { data: selectedSaveFiles, refetch: refetchSelectedSaveFiles } = useQuery({
    queryKey: [STORE_KEYS.LAST_SELECTED_SAVE_NAME],
    queryFn: async () => {
      const folder = await store.get<string>(STORE_KEYS.LAST_SELECTED_SAVE_NAME)
      return folder ?? null
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  const { data: deltaruneSavesIndex } = useQuery({
    queryKey: ['deltaruneSavesIndex'],
    queryFn: async () => {
      const response = await fetchData({ route: STATIC_ROUTES.SAVES.INDEX })
      return response
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
              if (!gameFolder || !utmtCliFolder || !gitFolder || !savesFolder || !selectedSaveFiles) return
              const selectedSaveFilesData = deltaruneSavesIndex?.find((save) => save.name === selectedSaveFiles)
              if (!selectedSaveFilesData) return

              setIsLoading(true)
              await patchAndLaunchGame({
                gameFolder,
                utmtCliFolder,
                gitFolder,
                savesFolder,
                savesFiles: selectedSaveFilesData.files.map((file) => ({
                  name: file,
                  url: '/saves/' + selectedSaveFilesData.path + '/' + file
                })),
                files
              })
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
      <div className="flex flex-col gap-6">
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
        </div>
        <div className="flex flex-col gap-2">
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
        </div>
        <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
          <label htmlFor="select-saves-folder">Sélectionnez le dossier des sauvegardes de DELTARUNE</label>
          <button
            id="select-saves-folder"
            className="btn btn-soft"
            onClick={async () => {
              const selected = await open({
                multiple: false,
                directory: true,
                title: 'Sélectionnez le dossier des sauvegardes de DELTARUNE'
              })

              if (selected && typeof selected === 'string') {
                await store.set(STORE_KEYS.SAVES_FOLDER_PATH, selected)
                await store.save()
                refetchSavesFolder()
              }
            }}
          >
            {savesFolder ?? 'Sélectionner un dossier'}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="select-save">Sélectionnez la sauvegarde que vous souhaitez utiliser</label>
          <select
            id="select-save"
            className="select w-full"
            onChange={async (e) => {
              await store.set(STORE_KEYS.LAST_SELECTED_SAVE_NAME, e.target.value)
              await store.save()
              refetchSelectedSaveFiles()
            }}
          >
            {deltaruneSavesIndex?.map((save) => (
              <option key={save.name} value={save.name}>
                {save.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}
