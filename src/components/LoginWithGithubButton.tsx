import { GitHubIcon } from './icons/GitHubIcon'

type LoginWithGithubButtonProps = {
  onClick: () => void
}

export const LoginWithGithubButton = ({ onClick }: LoginWithGithubButtonProps) => (
  <button className="btn btn-lg bg-black text-white border-black" onClick={onClick}>
    <GitHubIcon />
    Se connecter avec GitHub
  </button>
)
