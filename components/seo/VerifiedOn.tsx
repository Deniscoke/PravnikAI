/**
 * States, in the reader's own view, when the law behind a page was last checked.
 *
 * The Article schema already carries this date for crawlers. That is not the
 * same thing as saying it: on a page about money or law, the date is one of the
 * few claims a reader can weigh without trusting us first, and hiding it in a
 * script tag helps only the machine.
 *
 * The date comes from the legal profile's own `lastVerified` and moves only
 * when somebody rechecks the statute. Rendering "dnes" would be the easy
 * version and would be a lie.
 */

const MONTHS_CS = [
  'ledna',
  'února',
  'března',
  'dubna',
  'května',
  'června',
  'července',
  'srpna',
  'září',
  'října',
  'listopadu',
  'prosince',
]

/**
 * Formats a date the Czech way, without Intl.
 *
 * `toLocaleDateString` depends on the ICU data present in whichever runtime
 * renders the page, and the server and the browser need not agree. On a
 * prerendered page a mismatch surfaces as a hydration error over a date — a
 * silly reason to break a page, and one that only shows up in production.
 */
export function formatCzechDate(date: Date): string {
  return `${date.getUTCDate()}. ${MONTHS_CS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export function VerifiedOn({ date }: { date: Date | undefined }) {
  if (!date) return null

  return (
    <p
      className="legal-verified"
      style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}
    >
      <time dateTime={date.toISOString().slice(0, 10)}>
        Právní stav ověřen k {formatCzechDate(date)}
      </time>
    </p>
  )
}
