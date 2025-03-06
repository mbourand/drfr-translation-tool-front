import { LoginWithGithubButton } from '../../components/LoginWithGithubButton'
import { GITHUB_URLS } from '../../routes/github/routes'

export const AuthLoginView = () => {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center">
      <div className="card card-side bg-base-100 shadow-sm max-w-[1100px] rounded-lg">
        <img
          className="h-96 aspect-square rounded-l-lg"
          src="https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
          alt="Album"
        />
        <div className="card-body">
          <h2 className="text-3xl font-bold">Lier votre compte GitHub</h2>
          <p className="text-lg">
            Vous devez vous connecter à votre compte github pour pouvoir contribuer à Deltarune FR via ce logiciel.
          </p>
          <p className="text-lg">
            L'application se servira de cette connexion pour effectuer des opérations sur le dépôt GitHub de Deltarune.
            Vos données ne sont stockées que sur votre ordinateur.
          </p>
          <div className="card-actions justify-end">
            <LoginWithGithubButton onClick={() => window.open(GITHUB_URLS.AUTHORIZE_APP, '_self')} />
          </div>
        </div>
      </div>
    </main>
  )
}
