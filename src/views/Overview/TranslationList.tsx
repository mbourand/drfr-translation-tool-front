import { ReactNode } from 'react'
import { To, useNavigate } from 'react-router'
import { twMerge } from 'tailwind-merge'

type TranslationListProps = {
  title: string
  translations: {
    id: number
    title: string
    author: string
    authorAvatar: string
    href: To
  }[]
  className?: string
  flexClassName?: string
  extraElements?: ReactNode
}

export const TranslationList = ({
  title,
  translations,
  className,
  flexClassName,
  extraElements
}: TranslationListProps) => {
  const navigate = useNavigate()

  return (
    <div className={twMerge('rounded-box shadow-md border border-base-200', className)}>
      <h2 className="p-4 pb-2 text-xl font-semibold tracking-wide">{title}</h2>
      <div className={twMerge('flex flex-col bg-base-100 rounded-box p-2 overflow-auto', flexClassName)}>
        {translations.map((translation) => (
          <button
            key={translation.id}
            className="border border-base-200 rounded-box p-4 group text-left mb-4 cursor-pointer hover:shadow-md"
            onClick={() => navigate(translation.href)}
          >
            <h3 className="text-lg font-semibold group-hover:underline underline-offset-2 mb-4">{translation.title}</h3>
            <div className="flex flex-row justify-end items-center gap-2">
              <p className="opacity-60 w-fit text-sm">par {translation.author}</p>
              <div className="avatar w-8">
                <img className="rounded-full" src={translation.authorAvatar} />
              </div>
            </div>
          </button>
        ))}
        {extraElements}
      </div>
    </div>
  )
}
