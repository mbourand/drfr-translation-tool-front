import 'react-virtualized/styles.css'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

ModuleRegistry.registerModules([AllCommunityModule])
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
