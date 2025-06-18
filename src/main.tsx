import 'react-virtualized/styles.css'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log'

function forwardConsole(
  fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
  logger: (message: string) => Promise<void>
) {
  const original = console[fnName]
  console[fnName] = (message) => {
    original(message)
    logger(message)
  }
}

forwardConsole('log', trace)
forwardConsole('debug', debug)
forwardConsole('info', info)
forwardConsole('warn', warn)
forwardConsole('error', error)

console.log('Registering Ag Grid...')

ModuleRegistry.registerModules([AllCommunityModule])
const queryClient = new QueryClient()

console.log('Rendering React App...')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
