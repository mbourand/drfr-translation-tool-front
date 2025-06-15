import { useState } from 'react'
import { ApproveModal } from './ApproveModal'

type ApproveButtonButtonProps = {
  branch: string
}

export const ApproveButtonButton = ({ branch }: ApproveButtonButtonProps) => {
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false)

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsSaveModalVisible(true)}>
        Approuver les changements
      </button>
      <ApproveModal isVisible={isSaveModalVisible} onClose={() => setIsSaveModalVisible(false)} branch={branch} />
    </>
  )
}
