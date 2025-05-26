import { twMerge } from 'tailwind-merge'

type PageSelectorProps = {
  entryCount: number
  pageSize: number
  currentPage: number
  onPageSelected: (page: number) => void
}

export const PageSelector = ({ entryCount, pageSize, onPageSelected, currentPage }: PageSelectorProps) => {
  return (
    <div className="join float-right">
      {Array.from({ length: Math.ceil(entryCount / pageSize) }).map((_, i) => (
        <button
          key={i}
          className={twMerge('join-item btn', i === currentPage && 'btn-active')}
          onClick={() => {
            if (i === currentPage) return
            onPageSelected(i)
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}
