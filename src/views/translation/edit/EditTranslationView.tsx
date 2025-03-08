import { NavLink, useParams } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../../../routes/pages/routes'

export const EditTranslationView = () => {
  const id = useParams().id

  return (
    <div>
      <h1>Edit Translation {id}</h1>
      <NavLink to={TRANSLATION_APP_PAGES.OVERVIEW}>Retour à l'accueil</NavLink>
    </div>
  )
}
