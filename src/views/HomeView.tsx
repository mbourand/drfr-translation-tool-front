import { useNavigate } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../routes/pages/routes'
import { useEffect } from 'react'

export const HomeView = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(TRANSLATION_APP_PAGES.AUTH.LOGIN)
  }, [])
  return <main>Home</main>
}
