import { Modal } from '../../components/Modal'

type CreateTranslationModalProps = {
  isVisible: boolean
  onTitleChange: (title: string) => void
  onClose: () => void
}

export const CreateTranslationModal = ({ isVisible, onClose, onTitleChange }: CreateTranslationModalProps) => (
  <Modal
    label="Commencer une nouvelle traduction"
    isVisible={isVisible}
    onClose={onClose}
    className="min-w-[550px]"
    actions={
      <>
        <button className="float-right btn btn-ghost" onClick={onClose}>
          Annuler
        </button>
        <button className="float-right btn btn-primary" onClick={onClose}>
          Valider
        </button>
      </>
    }
  >
    <div className="flex flex-col gap-2">
      <label htmlFor="translation_theme" className="block w-fit">
        Quel sera le thème de cette traduction ?
      </label>
      <input
        id="translation_theme"
        type="text"
        placeholder="Ex: Boutique de Spamton"
        className="input"
        onChange={(e) => onTitleChange(e.target.value)}
      />
    </div>
  </Modal>
)
