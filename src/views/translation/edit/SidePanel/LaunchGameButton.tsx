import { useState } from 'react'
import { LaunchGameModal } from './LaunchGameModal'
import { patchAndLaunchGame } from '../../../../modules/game/launch'

type LaunchGameButtonProps = {
  files: Parameters<typeof patchAndLaunchGame>[3]
}

export const LaunchGameButton = ({ files }: LaunchGameButtonProps) => {
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false)

  return (
    <>
      <button className="btn btn-soft btn-primary" onClick={() => setIsSaveModalVisible(true)}>
        Lancer le jeu
      </button>
      <LaunchGameModal isVisible={isSaveModalVisible} onClose={() => setIsSaveModalVisible(false)} files={files} />
    </>
  )
}
