import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  totalPages: number
  totalItems: number
  /** Se definido, usado em vez de `/?page=` (ex.: `/imoveis` com filtros na query). */
  buildPageHref?: (page: number) => string
}

/**
 * Paginação discreta ao final do conteúdo (links server-side, barra de rolagem da página inalterada).
 */
export default function HomePagination({ page, totalPages, totalItems, buildPageHref }: Props) {
  if (totalPages <= 1 || totalItems === 0) {
    return null
  }

  const href = (p: number) => (buildPageHref ? buildPageHref(p) : `/?page=${p}`)

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <nav
      className="mt-14 pt-10 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-3 sm:gap-5"
      aria-label="Paginação de imóveis"
    >
      <Link
        href={hasPrev ? href(page - 1) : '#'}
        scroll
        className={
          hasPrev
            ? 'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[#CBA153]/40 text-[#CBA153]/90 hover:bg-[#CBA153]/10 hover:border-[#CBA153] transition-colors'
            : 'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/5 text-gray-600 pointer-events-none'
        }
        aria-disabled={!hasPrev}
        tabIndex={hasPrev ? 0 : -1}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </Link>

      <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 tabular-nums px-2">
        {page} / {totalPages}
      </span>

      <Link
        href={hasNext ? href(page + 1) : '#'}
        scroll
        className={
          hasNext
            ? 'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[#CBA153]/40 text-[#CBA153]/90 hover:bg-[#CBA153]/10 hover:border-[#CBA153] transition-colors'
            : 'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/5 text-gray-600 pointer-events-none'
        }
        aria-disabled={!hasNext}
        tabIndex={hasNext ? 0 : -1}
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </Link>
    </nav>
  )
}
