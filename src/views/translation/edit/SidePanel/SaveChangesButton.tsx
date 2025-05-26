import { useState } from 'react'
import { SaveChangesModal } from './SaveChangesModal'
import { FileType } from './SidePanel'

type SaveChangesButtonProps = {
  branch: string
  changes: Map<string, string>
  files: FileType[]
}

export const SaveChangesButton = ({ branch, changes, files }: SaveChangesButtonProps) => {
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false)

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsSaveModalVisible(true)}>
        Sauvegarder
      </button>
      <SaveChangesModal
        isVisible={isSaveModalVisible}
        onClose={() => setIsSaveModalVisible(false)}
        branch={branch}
        files={files}
        changes={changes}
      />
    </>
  )
}
