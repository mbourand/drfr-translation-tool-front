import { useEffect, useState } from 'react'
import { SaveChangesModal } from './SaveChangesModal'
import { FileType } from './SidePanel'

type SaveChangesButtonProps = {
  branch: string
  changes: Map<string, string>
  files: FileType[]
}

export const SaveChangesButton = ({ branch, changes, files }: SaveChangesButtonProps) => {
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false)

  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        setIsSaveModalVisible(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown, { signal })

    return () => abortController.abort()
  })

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
