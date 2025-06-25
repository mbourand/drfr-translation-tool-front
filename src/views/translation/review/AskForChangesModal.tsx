import { useMutation } from '@tanstack/react-query'
import { store, STORE_KEYS, StoreUserInfos } from '../../../store/store'
import { fetchData } from '../../../modules/fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../../routes/translation/routes'
import { Modal } from '../../../components/Modal'
import { useNavigate } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'

type AskForChangesModalProps = {
  isVisible: boolean
  onClose: () => void
  branch: string
}

export const AskForChangesModal = ({ onClose, isVisible, branch }: AskForChangesModalProps) => {
  const navigate = useNavigate()

  const { isPending, mutate } = useMutation({
    mutationKey: ['ask-for-changes', branch],
    mutationFn: async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')

      await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.MARK_AS_REVIEWED,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` },
        body: {
          branch
        }
      })
    },
    onSuccess: () => {
      onClose()
      navigate(TRANSLATION_APP_PAGES.OVERVIEW)
    }
  })

  return (
    <Modal
      onClose={onClose}
      isVisible={isVisible}
      label="Demander des modifications"
      actions={
        <>
          <button className="float-right btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button disabled={isPending} className="float-right btn btn-primary" onClick={() => mutate()}>
            {isPending && <span className="loading loading-spinner" />}
            Confirmer
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <p>Vous êtes sur le point de demander au traducteur de relire les commentaires que vous avez laissés.</p>
      </div>
    </Modal>
  )
}
