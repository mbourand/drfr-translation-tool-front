import { fetchData } from '../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../routes/translation/routes'
import { store, STORE_KEYS } from '../store/store'

export const login = async (accessToken: string) => {
  const userInfos = await fetchData({
    route: TRANSLATION_API_URLS.AUTH.USER,
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const userInfosWithToken = { ...userInfos, accessToken }

  await store.set(STORE_KEYS.USER_INFOS, userInfosWithToken)
  await store.save()
}

export const logout = async () => {
  await store.delete(STORE_KEYS.USER_INFOS)
  await store.save()
}
