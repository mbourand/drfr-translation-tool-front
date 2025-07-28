import { Modal } from '../../../../components/Modal'
import { FileType } from './SidePanel'
import { useSaveChanges } from '../../../../hooks/useSaveChanges'
import { useEffect } from 'react'

type SaveChangesModalProps = {
  isVisible: boolean
  onClose: () => void
  branch: string
  files: FileType[]
  changes: Map<string, string>
  onSaveSuccess?: () => void
}

export const SaveChangesModal = ({
  onClose,
  isVisible,
  branch,
  files,
  changes,
  onSaveSuccess
}: SaveChangesModalProps) => {
  const { isPending, mutate } = useSaveChanges({
    changes,
    files,
    branch,
    onSaveSuccess: () => {
      onClose()
      onSaveSuccess?.()
    }
  })

  useEffect(() => {
    if (isVisible && !isPending) {
      mutate()
    }
  }, [isVisible])

  return (
    <Modal isVisible={isVisible} label="Sauvegarde">
      Sauvegarde en cours, veuillez patienter...
    </Modal>
  )
}
