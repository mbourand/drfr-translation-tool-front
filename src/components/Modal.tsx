import { ReactNode, useId } from 'react'
import { twMerge } from 'tailwind-merge'

type ModalProps = {
  label: string
  className?: string
  children: ReactNode
  actions: ReactNode
  isVisible: boolean
  onClose: () => void
}

export const Modal = (props: ModalProps) => {
  const id = useId()

  return (
    <dialog id={id} className={twMerge('modal', props.isVisible && 'modal-open')} open={props.isVisible}>
      <div className={twMerge('modal-box', props.className)}>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={props.onClose}>
            ✕
          </button>
        </form>
        <h3 className="font-bold text-2xl mb-8">{props.label}</h3>
        {props.children}
        <div className="modal-action">{props.actions}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={props.onClose} />
      </form>
    </dialog>
  )
}
