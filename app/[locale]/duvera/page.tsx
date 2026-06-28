import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { isValidLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/contracts/types'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

const APP_URL = getSiteUrl()

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) return {}
  const locale = raw as Locale
  const canonical = `${APP_URL}/${locale}/duvera`
  return {
    title: 'Důvěra a bezpečnost',
    description: `Jak služba ${SITE_NAME} funguje, jaké má limity, jak používá AI a jak přistupuje k datům. Pracovní návrhy smluv podle českého práva.`,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/duvera`,
        'x-default': `${APP_URL}/cs/duvera`,
      },
    },
    openGraph: {
      url: canonical,
      title: `Důvěra a bezpečnost — ${SITE_NAME}`,
    },
  }
}

export default async function TrustCenterPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale

  return (
    <main className="legal-page">
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: 'Důvěra a bezpečnost', path: `/${locale}/duvera` },
        ]}
      />
      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>
        <h1>Důvěra a bezpečnost v Právo365</h1>
        <p className="legal-updated">Poslední aktualizace: 31. května 2026</p>

        <p>
          {SITE_NAME} je AI nástroj pro přípravu pracovních návrhů smluv a orientační kontrolu smluv
          podle českého práva. Níže najdete přehled toho, jak nástroj funguje, jaké má limity a jak
          přistupujeme k datům.
        </p>

        <section>
          <h2>1. Co Právo365 umí</h2>
          <ul>
            <li>Připravit strukturovaný pracovní návrh smlouvy podle českého práva.</li>
            <li>Orientačně zkontrolovat vložený smluvní text.</li>
            <li>Upozornit na rizika, chybějící údaje nebo položky k doplnění.</li>
            <li>Exportovat pracovní návrh do DOCX a PDF.</li>
            <li>Pomoci nezačínat od prázdné šablony.</li>
          </ul>
        </section>

        <section>
          <h2>2. Co Právo365 neumí</h2>
          <ul>
            <li>Neposkytuje právní poradenství.</li>
            <li>Nenahrazuje advokáta.</li>
            <li>Negarantuje platnost ani vhodnost dokumentu pro konkrétní situaci.</li>
            <li>Nerozhoduje za uživatele.</li>
            <li>Nemá být jedinou kontrolou před podpisem právně důležitého dokumentu.</li>
          </ul>
        </section>

        <section>
          <h2>3. Jak používáme AI</h2>
          <p>
            AI používáme jako technický nástroj pro vytvoření pracovního návrhu nebo orientační
            kontroly na základě údajů, které uživatel zadá. Výstup může obsahovat nepřesnosti nebo
            chybějící údaje, proto jej označujeme jako pracovní návrh a doporučujeme lidskou kontrolu.
          </p>
          <p>
            Podrobnosti najdete na stránce{' '}
            <Link href={`/${locale}/ai`}>Jak Právo365 používá umělou inteligenci</Link>.
          </p>
        </section>

        <section>
          <h2>4. Jaké bezpečnostní prvky má výstup</h2>
          <ul>
            <li>Upozornění (warning bannery) u rizikových nebo neúplných návrhů.</li>
            <li>Stavy výstupu: kompletní návrh / pracovní návrh / vyžaduje kontrolu.</li>
            <li>Značky <code>[DOPLNIT]</code> na místech, která je potřeba doplnit.</li>
            <li>Upozornění před exportem, pokud návrh obsahuje nevyplněná místa.</li>
            <li>Viditelné označení, že výstup vytvořila AI.</li>
            <li>Označení AI a metadata přímo v DOCX/PDF exportu.</li>
            <li>Disclaimer v exportovaném dokumentu.</li>
          </ul>
        </section>

        <section>
          <h2>5. Jak pracujeme s daty</h2>
          <p>Při provozu služby využíváme tyto technické poskytovatele:</p>
          <ul>
            <li><strong>Google OAuth</strong> &mdash; přihlášení uživatele.</li>
            <li><strong>Supabase</strong> &mdash; databáze a autentizace.</li>
            <li><strong>OpenAI API</strong> &mdash; zpracování vstupů a výstupů pro AI.</li>
            <li><strong>Stripe</strong> &mdash; platby a předplatné.</li>
            <li><strong>Upstash</strong> &mdash; rate limiting.</li>
            <li><strong>Sentry</strong> &mdash; monitoring chyb.</li>
            <li><strong>Resend</strong> &mdash; zpětná vazba v betě.</li>
          </ul>
          <p>
            Exportované soubory se generují na požádání a streamují uživateli. Jako subjekt údajů máte
            práva podle GDPR. Podrobnosti najdete v dokumentech{' '}
            <Link href={`/${locale}/privacy`}>Ochrana osobních údajů</Link> a{' '}
            <Link href={`/${locale}/gdpr`}>GDPR / cookies</Link>.
          </p>
        </section>

        <section>
          <h2>6. Co by měl uživatel před použitím udělat</h2>
          <ul>
            <li>Zkontrolovat všechny údaje v návrhu.</li>
            <li>Doplnit položky označené <code>[DOPLNIT]</code>.</li>
            <li>Nepoužívat výstup bez lidské kontroly u významných právních jednání.</li>
            <li>Anonymizovat údaje třetích osob, pokud je to možné.</li>
            <li>Při nejistotě kontaktovat advokáta.</li>
          </ul>
        </section>

        <section>
          <h2>7. Kam poslat zpětnou vazbu</h2>
          <p>
            {SITE_NAME} je v beta verzi. Pokud narazíte na nejasnost, chybu nebo chybějící funkci,
            pošlete nám zpětnou vazbu přímo přes tlačítko v aplikaci.
          </p>
        </section>
      </div>
    </main>
  )
}
