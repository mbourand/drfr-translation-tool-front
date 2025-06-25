import { useState } from 'react'
import { AskForChangesModal } from './AskForChangesModal'

type AskForChangesButtonProps = {
  branch: string
}

export const AskForChangesButton = ({ branch }: AskForChangesButtonProps) => {
  const [isAskForChangesModalVisible, setIsAskForChangesModalVisible] = useState(false)

  return (
    <>
      <button className="btn btn-soft btn-primary" onClick={() => setIsAskForChangesModalVisible(true)}>
        Demander des modifications
      </button>
      <AskForChangesModal
        isVisible={isAskForChangesModalVisible}
        onClose={() => setIsAskForChangesModalVisible(false)}
        branch={branch}
      />
    </>
  )
}
