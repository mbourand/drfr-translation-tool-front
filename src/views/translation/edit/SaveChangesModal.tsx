import { useState } from 'react'
import { Modal } from '../../../components/Modal'
import { useMutation } from '@tanstack/react-query'

type SaveChangesModalProps = {
  isVisible: boolean
  onClose: () => void
}

export const SaveChangesModal = ({ onClose, isVisible }: SaveChangesModalProps) => {
  const { isPending, mutate } = useMutation({
    mutationKey: ['save-changes'],
    mutationFn: async () => {},
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
          <button disabled={isPending} className="float-right btn btn-primary" onClick={() => mutate()}>
            {isPending && <span className="loading loading-spinner" />}
            Valider
          </button>
        </>
      }
    >
      <></>
    </Modal>
  )
}
