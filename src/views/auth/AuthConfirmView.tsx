import { TRANSLATION_API_URLS, TRANSLATION_APP_PAGES } from '../../urls'
import { useNavigate, useSearchParams } from 'react-router'
import { useEffect, useState } from 'react'

export const AuthConfirmView = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!searchParams.get('code')) navigate(TRANSLATION_APP_PAGES.HOME)
  }, [])

  useEffect(() => {
    fetch(TRANSLATION_API_URLS.AUTH.CONFIRM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: searchParams.get('code') })
    })
      .then((res) => res.json())
      .catch((err) => {
        if (err instanceof Error) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage(err)
        }
      })
  }, [])

  if (errorMessage) return <main>Une erreur est survenue, veuillez contacter les administrateurs : {errorMessage}</main>

  return <main>Vous êtes connecté ! Redirection en cours...</main>
}
