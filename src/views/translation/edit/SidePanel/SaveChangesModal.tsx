import { Modal } from '../../../../components/Modal'
import { useMutation } from '@tanstack/react-query'
import { fetchData } from '../../../../modules/fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../../store/store'
import { useRef } from 'react'
import { FileType } from './SidePanel'

type SaveChangesModalProps = {
  isVisible: boolean
  onClose: () => void
  branch: string
  files: FileType[]
  changes: Map<string, string>
}

const computeFileContentsAfterChanges = (files: FileType[], changes: Map<string, string>) => {
  const newFiles = [...files]
  for (const [key, value] of changes.entries()) {
    const matches = key.match(/(.+):(\d+)/)
    if (!matches) continue
    const path = matches[1]
    const lineNumber = parseInt(matches[2], 10)

    const fileIndex = newFiles.findIndex((file) => file.translatedPath === path)
    if (fileIndex === -1) continue

    newFiles[fileIndex].lines[lineNumber].translated = value
  }

  return newFiles
}

export const SaveChangesModal = ({ onClose, isVisible, branch, files, changes }: SaveChangesModalProps) => {
  const titleRef = useRef<HTMLInputElement>(null)

  const { isPending, mutate } = useMutation({
    mutationKey: ['save-changes'],
    mutationFn: async (message: string) => {
      if (!titleRef.current?.value) throw new Error('No title provided')

      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')

      const filesThatChanged = files.filter((file) =>
        Array.from(changes.entries()).find(([key]) => key.startsWith(file.translatedPath))
      )
      const withAppliedChanges = computeFileContentsAfterChanges(filesThatChanged ?? [], changes)

      await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.SAVE_FILES,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` },
        body: {
          branch,
          message,
          files: withAppliedChanges.map((file) => ({
            path: file.translatedPath,
            content: file.lines.map((line) => line.translated).join('\n')
          }))
        }
      })
    },
    onSuccess: () => onClose()
  })

  return (
    <Modal
      onClose={onClose}
      isVisible={isVisible}
      label="Sauvegarder ces changements"
      actions={
        <>
          <button className="float-right btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            disabled={isPending}
            className="float-right btn btn-primary"
            onClick={() => (titleRef.current?.value ? mutate(titleRef.current.value) : undefined)}
          >
            {isPending && <span className="loading loading-spinner" />}
            Sauvegarder
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="translation_theme" className="block w-fit">
          Qu'avez vous traduit depuis votre dernière sauvegarde ?
        </label>
        <input
          ref={titleRef}
          id="translation_theme"
          type="text"
          placeholder="Ex: Scène de rencontre avec Spamton"
          className="input"
        />
      </div>
    </Modal>
  )
}
