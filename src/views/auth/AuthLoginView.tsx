import { LoginWithGithubButton } from '../../components/LoginWithGithubButton'
import { GITHUB_URLS } from '../../urls'
import { open } from '@tauri-apps/plugin-shell'

export const AuthLoginView = () => {
  return (
    <main>
      <LoginWithGithubButton onClick={() => open(GITHUB_URLS.AUTHORIZE_APP)} />
    </main>
  )
}
