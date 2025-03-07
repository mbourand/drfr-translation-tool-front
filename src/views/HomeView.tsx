import { useNavigate } from 'react-router'
import { TRANSLATION_APP_PAGES } from '../routes/pages/routes'
import { useEffect } from 'react'
import { store, STORE_KEYS, StoreUserInfos } from '../store/store'

export const HomeView = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const handleNavigation = async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)

      if (userInfos?.id) await navigate(TRANSLATION_APP_PAGES.OVERVIEW)
      else await navigate(TRANSLATION_APP_PAGES.AUTH.LOGIN)
    }

    handleNavigation()
  }, [])
  return <main>Home</main>
}
