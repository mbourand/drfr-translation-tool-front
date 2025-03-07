import { useQuery } from '@tanstack/react-query'
import { fetchData } from '../../fetching/fetcher'
import { TRANSLATION_API_URLS } from '../../routes/translation/routes'
import { store, STORE_KEYS, StoreUserInfos } from '../../store/store'
import { TranslationList } from './TranslationList'
import { AddIcon } from '../../components/icons/AddIcon'
import { useState } from 'react'
import { CreateTranslationModal } from './CreateTranslationModal'

const TRANSLATION_LABEL = 'Traduction'
const WIP_LABEL = 'En cours'
const REVIEW_LABEL = 'Correction'

export const OverviewView = () => {
  const [isCreateTranslationModalVisible, setIsCreateTranslationModalVisible] = useState(false)

  const { data, isError } = useQuery({
    queryKey: ['all-translations'],
    queryFn: async () => {
      const userInfos = await store.get<StoreUserInfos>(STORE_KEYS.USER_INFOS)
      if (!userInfos) throw new Error('No token found')

      const data = await fetchData({
        route: TRANSLATION_API_URLS.TRANSLATIONS.LIST,
        headers: { Authorization: `Bearer ${userInfos.accessToken}` }
      })
      console.log(data)

      const translations = data.filter((pr) => pr.labels.some((label) => label.name === TRANSLATION_LABEL))

      return {
        yourTranslations: translations.filter((pr) => pr.user.id === userInfos.id),
        wipTranslations: translations.filter((pr) => pr.labels.some((label) => label.name === WIP_LABEL)),
        reviewTranslations: translations.filter((pr) => pr.labels.some((label) => label.name === REVIEW_LABEL)),
        doneTranslations: translations.filter((pr) => !!pr.merged_at)
      }
    },
    retry: 1,
    staleTime: 10000 * 60
  })

  if (isError) {
    return <main></main>
  }

  return (
    <>
      <main className="h-screen mx-auto max-w-[1700px] w-full flex flex-col gap-8 py-8">
        <h1 className="text-center text-4xl font-bold">Vue d'ensemble</h1>
        {data && (
          <section className="flex flex-row w-full gap-2 h-full relative">
            <TranslationList
              className="w-full"
              flexClassName="h-[calc(100svh-200px)]"
              title="Vos traductions"
              translations={data.yourTranslations.map((pr) => ({
                id: pr.id,
                title: pr.title,
                author: pr.user.login,
                authorAvatar: pr.user.avatar_url
              }))}
              extraElements={
                <button className="btn btn-primary btn-lg" onClick={() => setIsCreateTranslationModalVisible(true)}>
                  <AddIcon />
                  Commencer une traduction
                </button>
              }
            />
            <TranslationList
              className="w-full"
              flexClassName="h-[calc(100svh-200px)]"
              title="En cours"
              translations={data.wipTranslations.map((pr) => ({
                id: pr.id,
                title: pr.title,
                author: pr.user.login,
                authorAvatar: pr.user.avatar_url
              }))}
            />
            <TranslationList
              className="w-full"
              flexClassName="h-[calc(100svh-200px)]"
              title="En correction"
              translations={data.reviewTranslations.map((pr) => ({
                id: pr.id,
                title: pr.title,
                author: pr.user.login,
                authorAvatar: pr.user.avatar_url
              }))}
            />
            <TranslationList
              className="w-full"
              flexClassName="h-[calc(100svh-200px)]"
              title="Traductions terminées"
              translations={data.doneTranslations.map((pr) => ({
                id: pr.id,
                title: pr.title,
                author: pr.user.login,
                authorAvatar: pr.user.avatar_url
              }))}
            />
          </section>
        )}
      </main>
      <CreateTranslationModal
        isVisible={isCreateTranslationModalVisible}
        onClose={() => setIsCreateTranslationModalVisible(false)}
        onTitleChange={(title) => console.log(title)}
      />
    </>
  )
}
