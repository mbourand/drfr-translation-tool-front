import { ReactNode } from 'react'
import { To, useNavigate } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { CheckIcon } from '../../components/icons/CheckIcon'
import { CrossIcon } from '../../components/icons/CrossIcon'

type TranslationListProps = {
  title: string
  translations: {
    id: number
    title: string
    approvals: string[]
    requestedChanges: string[]
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
      <div className={twMerge('flex flex-col bg-base-100 rounded-box p-2 overflow-auto gap-4', flexClassName)}>
        {translations.map((translation) => (
          <button
            key={translation.id}
            className="border border-base-200 rounded-box p-4 group text-left cursor-pointer hover:shadow-md"
            onClick={() => navigate(translation.href)}
          >
            <h3 className="text-lg font-semibold group-hover:underline underline-offset-2 mb-4">{translation.title}</h3>
            <div className="flex flex-row justify-end">
              <div className="flex items-center gap-2">
                <p className="opacity-60 w-fit text-sm">par {translation.author}</p>
                <div className="avatar w-8">
                  <img className="rounded-full" src={translation.authorAvatar} />
                </div>
              </div>
            </div>
            {translation.approvals.length + translation.requestedChanges.length > 0 && (
              <div className="flex flex-row mt-2">
                {translation.approvals.length > 0 && (
                  <>
                    <div className="text-success mr-[2px]">
                      <CheckIcon />
                    </div>
                    {translation.approvals.map((user) => (
                      <div className="rounded-full min-w-[calc(24px-12px)] min-h-6 w-[calc(24px-12px)] h-6" key={user}>
                        <div className="tooltip" data-tip={user}>
                          <img
                            className="rounded-full min-w-6 min-h-6 w-6 h-6"
                            src={`https://github.com/${user}.png?size=128`}
                            alt=""
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {translation.requestedChanges.length > 0 && (
                  <div className={twMerge('flex flex-row', translation.approvals.length > 0 ? 'ml-4' : '')}>
                    <div className="text-error mr-[2px]">
                      <CrossIcon />
                    </div>
                    {translation.requestedChanges.map((user) => (
                      <div className="rounded-full min-w-[calc(24px-12px)] min-h-6 w-[calc(24px-12px)] h-6" key={user}>
                        <div className="tooltip" data-tip={user}>
                          <img
                            className="rounded-full min-w-6 min-h-6 w-6 h-6"
                            src={`https://github.com/${user}.png?size=128`}
                            alt=""
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
        {extraElements}
      </div>
    </div>
  )
}
