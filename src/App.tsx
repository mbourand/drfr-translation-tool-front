import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router'
import { TRANSLATION_APP_PAGES } from './routes/pages/routes'
import { HomeView } from './views/HomeView'
import { lazy } from 'react'

const AuthLoginView = lazy(() => import('./views/auth/AuthLoginView').then((m) => ({ default: m.AuthLoginView })))
const AuthConfirmView = lazy(() => import('./views/auth/AuthConfirmView').then((m) => ({ default: m.AuthConfirmView })))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={TRANSLATION_APP_PAGES.HOME} element={<HomeView />} />
        <Route path={TRANSLATION_APP_PAGES.AUTH.LOGIN} element={<AuthLoginView />} />
        <Route path={TRANSLATION_APP_PAGES.AUTH.CONFIRM} element={<AuthConfirmView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
