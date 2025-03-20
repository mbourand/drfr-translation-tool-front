import { Modal } from '../../../components/Modal'
import { useMutation } from '@tanstack/react-query'
import { fetchData } from '../../../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { useRef } from 'react'

type SaveChangesModalProps = {
  isVisible: boolean
  onClose: () => void
  branch: string
  newFilesAfterChange: () => { path: string; content: string }[]
}

export const SaveChangesModal = ({ onClose, isVisible, branch, newFilesAfterChange }: SaveChangesModalProps) => {
  const titleRef = useRef<HTMLInputElement>(null)

  const { isPending, mutate } = useMutation({
    mutationKey: ['save-changes'],
    mutationFn: async (message: string) => {
      if (!titleRef.current?.value) throw new Error('No title provided')

      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')

      await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.SAVE_FILES,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` },
        body: {
          branch,
          message,
          files: newFilesAfterChange()
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
