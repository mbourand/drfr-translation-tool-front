import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../../modules/fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../store/store'
import { TranslationList } from './TranslationList'
import { AddIcon } from '../../components/icons/AddIcon'
import { useMemo, useState } from 'react'
import { CreateTranslationModal } from './CreateTranslationModal'
import { TranslationType } from '../../routes/translation/schemas'
import { TRANSLATION_APP_PAGES } from '../../routes/pages/routes'
import { useNavigate } from 'react-router'

const TRANSLATION_LABEL = 'Traduction'
const WIP_LABEL = 'En cours'
const REVIEW_LABEL = 'Correction'

const mapPRToTranslation = (pr: TranslationType, isYours: boolean) => ({
  id: pr.id,
  title: pr.title,
  author: pr.user.login,
  authorAvatar: pr.user.avatar_url,
  href: isYours
    ? TRANSLATION_APP_PAGES.TRANSLATION.EDIT(pr.head.ref.toString(), pr.title.toString())
    : TRANSLATION_APP_PAGES.TRANSLATION.REVIEW(pr.head.ref.toString(), pr.title.toString())
})

const getTranslations = async () => {
  const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
  if (!userInfos) throw new Error('No token found')

  const data = await fetchData({
    route: TRANSLATION_API_URLS.TRANSLATIONS.LIST,
    headers: { Authorization: `Bearer ${userInfos.accessToken}` }
  })

  const prs = data.filter((pr) => pr.labels.some((label) => label.name === TRANSLATION_LABEL))

  const translationMapper = (pr: TranslationType) => mapPRToTranslation(pr, pr.user.id === userInfos.id)

  return {
    yourTranslations: prs.filter((pr) => pr.user.id === userInfos.id && pr.state === 'open').map(translationMapper),
    wipTranslations: prs
      .filter((pr) => pr.labels.some((label) => label.name === WIP_LABEL && pr.state === 'open'))
      .map(translationMapper),
    reviewTranslations: prs
      .filter((pr) => pr.labels.some((label) => label.name === REVIEW_LABEL) && pr.state === 'open')
      .map(translationMapper),
    doneTranslations: prs.filter((pr) => !!pr.merged_at && pr.state === 'closed').map(translationMapper)
  }
}

export const OverviewView = () => {
  const navigate = useNavigate()
  const [isCreateTranslationModalVisible, setIsCreateTranslationModalVisible] = useState(false)

  const { data, isError } = useQuery({
    queryKey: ['all-translations'],
    queryFn: getTranslations,
    refetchOnMount: 'always'
  })

  if (isError) {
    store.delete(STORE_KEYS.USER_INFOS).then(() => navigate(TRANSLATION_APP_PAGES.HOME))
  }

  const translationLists = useMemo(() => {
    if (!data) return []

    return [
      {
        title: 'Vos traductions',
        translations: data.yourTranslations,
        extraElements: (
          <button className="btn btn-primary btn-lg" onClick={() => setIsCreateTranslationModalVisible(true)}>
            <AddIcon />
            Commencer une traduction
          </button>
        )
      },
      {
        title: 'En cours',
        translations: data.wipTranslations
      },
      {
        title: 'En correction',
        translations: data.reviewTranslations
      },
      {
        title: 'Traductions terminées',
        translations: data.doneTranslations
      }
    ]
  }, [data])

  if (isError) {
    return <main></main>
  }

  return (
    <>
      <main className="h-screen mx-auto max-w-[1700px] w-full flex flex-col gap-8 py-8 px-4">
        <h1 className="text-center text-4xl font-bold">Vue d'ensemble</h1>
        <section className="flex flex-row w-full gap-2 h-full relative">
          {translationLists.map((list) => (
            <TranslationList
              key={list.title}
              className="w-full"
              flexClassName="h-[calc(100svh-200px)]"
              title={list.title}
              translations={list.translations}
              extraElements={list.extraElements}
            />
          ))}
        </section>
      </main>
      <CreateTranslationModal
        isVisible={isCreateTranslationModalVisible}
        onClose={() => setIsCreateTranslationModalVisible(false)}
      />
    </>
  )
}
