import { Modal } from '../../../components/Modal'
import { useSaveChanges } from '../../../hooks/useSaveChanges'
import { FileType } from '../edit/SidePanel/SidePanel'
import { useEffect, useState } from 'react'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { useNavigate } from 'react-router'

type UnsavedChangesModalProps = {
  changes: Map<string, string>
  files: FileType[]
  branch: string
  hasUnsavedChanges: boolean
  onSaveSuccess?: () => void
  onCloseRequested?: () => void
}

type Actions =
  | {
      type: 'navigate'
      to: string
    }
  | {
      type: 'close'
    }

export const UnsavedChangesModal = ({
  hasUnsavedChanges,
  changes,
  onSaveSuccess,
  files,
  branch
}: UnsavedChangesModalProps) => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [triedAction, setTriedAction] = useState<Actions>()

  const quitFn = () => {
    console.log('quitFn called')
    switch (triedAction?.type) {
      case 'navigate':
        navigate(triedAction.to)
        break
      case 'close':
        console.log('Closing window')
        getCurrentWebviewWindow().destroy()
        break
    }
  }

  const { isPending, mutate } = useSaveChanges({
    changes,
    files,
    branch,
    onSaveSuccess: () => {
      onSaveSuccess?.()
      quitFn()
    }
  })

  useEffect(() => {
    if (!hasUnsavedChanges) return

    const abortController = new AbortController()
    const signal = abortController.signal

    window.addEventListener(
      'click',
      (e) => {
        if (!(e.target instanceof Element)) return

        const anchor = e.target.closest('a')
        if (!anchor?.href) return

        e.preventDefault()
        setIsVisible(true)
        setTriedAction({ type: 'navigate', to: new URL(anchor.href).pathname })
      },
      { signal, capture: true }
    )

    const unlistenPromise = getCurrentWebviewWindow().onCloseRequested((e) => {
      e.preventDefault()
      setIsVisible(true)
      setTriedAction({ type: 'close' })
    })

    return () => {
      unlistenPromise.then((unlisten) => {
        console.log('unlisten')
        unlisten()
      })
      abortController.abort()
    }
  }, [hasUnsavedChanges])

  return (
    <Modal
      isVisible={isVisible}
      label="Modifications non sauvegardées"
      onClose={() => setIsVisible(false)}
      actions={
        <>
          <button className="btn btn-neutral" onClick={quitFn}>
            Quitter sans sauvegarder
          </button>
          <button disabled={isPending} className="btn btn-primary" onClick={() => mutate()}>
            {isPending && <span className="loading loading-spinner" />}
            Sauvegarder et quitter
          </button>
        </>
      }
    >
      <p>
        Vous avez des modifications non sauvegardées. Si vous ne sauvegardez pas, ces dernières seront perdues à jamais.
        <br />
        Voulez-vous vraiment quitter ?
      </p>
    </Modal>
  )
}
