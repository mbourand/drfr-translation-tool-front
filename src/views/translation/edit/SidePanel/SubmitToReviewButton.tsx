import { useState } from 'react'
import { Modal } from '../../../../components/Modal'
import { TRANSLATION_API_URLS } from '../../../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../../../store/store'
import { useMutation } from '@tanstack/react-query'
import { fetchData } from '../../../../fetching/fetcher'
import { useNavigate } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../../routes/pages/routes'

type SubmitToReviewButtonProps = {
  branch: string
}

export const SubmitToReviewButton = ({ branch }: SubmitToReviewButtonProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const navigate = useNavigate()

  const { isPending, mutate } = useMutation({
    mutationKey: ['submit-to-review', branch],
    mutationFn: async (branch: string) => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')

      return await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.SUBMIT_TO_REVIEW,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` },
        body: { branch }
      })
    },
    onSuccess: async () => {
      setIsModalVisible(false)
      await navigate(TRANSLATION_APP_PAGES.OVERVIEW)
    }
  })

  return (
    <>
      <button className="btn btn-soft btn-primary" onClick={() => setIsModalVisible(true)}>
        Soumettre à la correction
      </button>
      <Modal
        isVisible={isModalVisible}
        label="Soumettre à la correction"
        onClose={() => setIsModalVisible(false)}
        actions={
          <>
            <button className="float-right btn btn-ghost" onClick={() => setIsModalVisible(false)}>
              Annuler
            </button>
            <button disabled={isPending} className="float-right btn btn-primary" onClick={() => mutate(branch)}>
              {isPending && <span className="loading loading-spinner" />}
              Soumettre
            </button>
          </>
        }
      >
        <p>
          Soumettre à la correction permettra aux autres traducteurs de relire vos changements. Ne soumettez qu'une fois
          que vous avez terminé votre traduction
          <br />
          <br />
          Êtes-vous sûr de vouloir soumettre cette traduction à la correction ?
        </p>
      </Modal>
    </>
  )
}
