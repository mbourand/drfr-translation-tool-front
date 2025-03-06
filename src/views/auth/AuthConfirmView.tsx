import { TRANSLATION_APP_PAGES } from '../../routes/pages/routes'
import { useNavigate, useSearchParams } from 'react-router'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TRANSLATION_API_URLS } from '../../routes/translation/routes'
import { store } from '../../store/store'

const fetchAuthConfirm = async (code: string | null) => {
  if (!code) throw new Error('Invalid code')

  const route = TRANSLATION_API_URLS.AUTH.CONFIRM

  const response = await fetch(route.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })

  if (!response.ok) throw new Error('Une erreur est survenue')

  const unsafeData = await response.json()
  const data = route.responseSchema.parse(unsafeData)
  return data
}

export const AuthConfirmView = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) navigate(TRANSLATION_APP_PAGES.HOME)
  }, [])

  const { isPending, isError, error, isSuccess, data } = useQuery({
    queryKey: ['auth-confirm'],
    queryFn: () => fetchAuthConfirm(code)
  })

  useEffect(() => {
    if (!isSuccess) return
    store.set('access-token', data.accessToken)
    store.set('refresh-token', data.refreshToken)
    navigate(TRANSLATION_APP_PAGES.HOME)
  }, [isSuccess])

  if (isError) return <main>Une erreur est survenue, veuillez contacter les administrateurs : {error.message}</main>
  if (isPending) return <main>Chargement...</main>

  return <main>Vous êtes connecté ! Redirection en cours...</main>
}
