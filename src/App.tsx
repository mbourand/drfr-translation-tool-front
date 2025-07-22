import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router'
import { TRANSLATION_APP_PAGES } from './routes/pages/routes'
import { HomeView } from './views/HomeView'
import { lazy, useEffect } from 'react'
import { OverviewView } from './views/Overview/OverviewView'
import { EditTranslationView } from './views/translation/edit/EditTranslationView'
import { ReviewTranslationView } from './views/translation/review/ReviewTranslationView'
import { stopOAuthServer } from './lib/oauth'
import { store, STORE_KEYS } from './store/store'

const AuthLoginView = lazy(() => import('./views/auth/AuthLoginView').then((m) => ({ default: m.AuthLoginView })))
const AuthConfirmView = lazy(() => import('./views/auth/AuthConfirmView').then((m) => ({ default: m.AuthConfirmView })))

stopOAuthServer()

function App() {
  useEffect(() => {
    store.get<string>(STORE_KEYS.THEME).then((theme) => {
      if (theme) {
        document.querySelector('html')?.setAttribute('data-theme', theme)
      }
    })
  }, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={TRANSLATION_APP_PAGES.HOME} element={<HomeView />} />
          <Route path={TRANSLATION_APP_PAGES.AUTH.LOGIN} element={<AuthLoginView />} />
          <Route path={TRANSLATION_APP_PAGES.AUTH.CONFIRM} element={<AuthConfirmView />} />
          <Route path={TRANSLATION_APP_PAGES.OVERVIEW} element={<OverviewView />} />
          <Route path={TRANSLATION_APP_PAGES.TRANSLATION.EDIT(':branch')} element={<EditTranslationView />}></Route>
          <Route path={TRANSLATION_APP_PAGES.TRANSLATION.REVIEW(':branch')} element={<ReviewTranslationView />}></Route>
        </Routes>
      </BrowserRouter>
      <div id="modal"></div>
    </>
  )
}

export default App
