/** Alinhado a `src/app/page.tsx` e listagens públicas filtradas. */
export const PROPERTY_LIST_PAGE_SIZE = 60

export function parseListingPage(
  searchParams: { [key: string]: string | string[] | undefined }
): number {
  const raw = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1
  return Number.isFinite(raw) && raw > 0 ? raw : 1
}
