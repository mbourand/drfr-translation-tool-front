import { start, cancel } from '@fabianlars/tauri-plugin-oauth'
import { TRANSLATION_APP_PAGES } from '../routes/pages/routes'
import { platform } from '@tauri-apps/plugin-os'
import { invoke } from '@tauri-apps/api/core'
import { RUST_COMMANDS } from '../modules/commands/commands'

let port: number | undefined = undefined

const getAppBaseUrl = async () => {
  const isDev = await invoke<boolean>(RUST_COMMANDS.IS_DEV)

  if (isDev) {
    return 'http://localhost:1420'
  }

  const os = platform()

  if (os === 'windows') {
    return 'http://tauri.localhost'
  }

  return 'tauri://localhost'
}

export async function startOAuthFlow() {
  if (port !== undefined) {
    console.warn('OAuth server is already running, stopping it before starting a new one.')
    await stopOAuthServer()
  }

  try {
    port = await start({
      response: `
      <head>
        <script>
          const code = new URLSearchParams(window.location.search).get('code');
          const url = '${(await getAppBaseUrl()) + TRANSLATION_APP_PAGES.AUTH.CONFIRM}' + '?code=' + code;
          console.log('Redirecting to', url);
          window.open(url, '_self');
        </script>
      </head>
      <body>
        Redirection en cours...
      </body>`,
      ports: [1440]
    })

    console.log(`OAuth server started on port ${port}`)
  } catch (error) {
    console.error('Error starting OAuth server:', error)
  }
}

export async function stopOAuthServer() {
  if (port === undefined) {
    console.warn('OAuth server is not running, nothing to stop.')
    return
  }

  try {
    await cancel(port)
    port = undefined
    console.log('OAuth server stopped')
  } catch (error) {
    console.error('Error stopping OAuth server:', error)
  }
}
