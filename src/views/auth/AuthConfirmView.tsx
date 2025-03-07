import { TRANSLATION_APP_PAGES } from '../../routes/pages/routes'
import { useNavigate, useSearchParams } from 'react-router'
import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { TRANSLATION_API_URLS } from '../../routes/translation/routes'
import { fetchData } from '../../fetching/fetcher'
import { login } from '../../auth/login'

export const AuthConfirmView = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasFired = useRef(false)

  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) navigate(TRANSLATION_APP_PAGES.HOME)
  }, [])

  const { isPending, isError, error, mutate } = useMutation({
    mutationKey: ['auth-confirm'],
    mutationFn: async () => {
      if (!code) throw new Error('Invalid code')
      return await fetchData({ route: TRANSLATION_API_URLS.AUTH.CONFIRM, body: { code } })
    },
    onSuccess: async (data) => {
      await login(data.accessToken)
      await navigate(TRANSLATION_APP_PAGES.HOME)
    }
  })

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true
    mutate()
  }, [])

  if (isError) return <main>Une erreur est survenue, veuillez contacter un administrateur : {error.message}</main>
  if (isPending) return <main>Chargement...</main>

  return <main>Vous êtes connecté ! Redirection en cours...</main>
}
