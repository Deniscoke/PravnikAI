import { getSiteUrl } from '@/lib/seo/site'

export interface BreadcrumbItem {
  name: string
  /** Path relative to the site root, e.g. "/cs/ai" */
  path: string
}

/**
 * Emits BreadcrumbList structured data so search engines can show a breadcrumb
 * trail in results. Rendered as a JSON-LD text child (no raw HTML injection);
 * all names are server-controlled plain text without angle brackets.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const base = getSiteUrl()
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  }
  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(data)}
    </script>
  )
}
