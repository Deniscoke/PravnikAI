import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { isValidLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/contracts/types'

const APP_URL = getSiteUrl()

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) return {}
  const locale = raw as Locale
  const canonical = `${APP_URL}/${locale}/terms`
  return {
    title: 'Obchodní podmínky',
    description: `Obchodní podmínky služby ${SITE_NAME}: podmínky služby pro přípravu návrhů smluv podle českého práva, práva a povinnosti uživatele a provozovatele IndiWeb.`,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/terms`,
        'x-default': `${APP_URL}/cs/terms`,
      },
    },
    openGraph: {
      url: canonical,
      title: `Obchodní podmínky — ${SITE_NAME}`,
    },
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale

  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>
        <h1>Obchodní podmínky</h1>
        <p className="legal-updated">Poslední aktualizace: 31. května 2026</p>

        <section>
          <h2>1. Úvodní ustanovení</h2>
          <p>
            Tyto obchodní podmínky (dále jen &bdquo;Podmínky&ldquo;) upravují práva a povinnosti mezi
            provozovatelem služby {SITE_NAME} &mdash; IndiWeb (dále jen &bdquo;Provozovatel&ldquo;) a
            uživatelem služby (dále jen &bdquo;Uživatel&ldquo;).
          </p>
          <p>
            Kontaktní e-mail: <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
          </p>
        </section>

        <section>
          <h2>2. Popis služby</h2>
          <p>
            {SITE_NAME} je webová aplikace využívající umělou inteligenci pro přípravu návrhů smluv
            a orientační kontrolu textu podle českého práva. Služba je poskytována v režimu
            SaaS (Software as a Service).
          </p>
          <p>
            <strong>Upozornění:</strong> Služba neposkytuje právní poradenství ve smyslu zák.
            č. 85/1996 Sb., o advokacii. Výstupy AI jsou pracovní návrhy informativního charakteru
            a nenahrazují konzultaci s advokátem. Před podpisem doporučujeme nechat dokument
            zkontrolovat advokátem.
          </p>
        </section>

        <section>
          <h2>3. Registrace a uživatelský účet</h2>
          <p>
            Pro využívání služby je nutná registrace prostřednictvím Google účtu. Uživatel je povinen
            uvádět pravdivé údaje a chránit přístup ke svému účtu.
          </p>
        </section>

        <section>
          <h2>4. Platební podmínky</h2>
          <p>
            Služba nabízí bezplatný tarif s omezeními a placené tarify (Pro, Team). Platby jsou
            zpracovávány prostřednictvím Stripe. Předplatné se automaticky obnovuje, pokud není zrušeno
            před koncem fakturačního období.
          </p>
        </section>

        <section>
          <h2>5. Omezení odpovědnosti</h2>
          <p>
            Provozovatel nenese odpovědnost za škody vzniklé použitím AI-generovaných dokumentů bez
            odborné právní revize. Uživatel používá výstupy služby na vlastní odpovědnost.
          </p>
        </section>

        <section>
          <h2>6. Ukončení služby</h2>
          <p>
            Uživatel může svůj účet kdykoli smazat v nastavení účtu nebo kontaktováním podpory.
            Při smazání účtu dojde k odstranění osobních údajů a historie dokumentů, pokud jejich
            další uchování není nezbytné pro splnění zákonných povinností, ochranu právních nároků,
            bezpečnost služby nebo účetnictví. Technické bezpečnostní záznamy mohou být uchovány
            v anonymizované nebo pseudonymizované podobě.
          </p>
        </section>

        <section>
          <h2>7. Závěrečná ustanovení</h2>
          <p>
            Tyto Podmínky se řídí právním řádem České republiky. Provozovatel si vyhrazuje právo
            Podmínky jednostranně měnit s oznámením uživatelům.
          </p>
        </section>
      </div>
    </main>
  )
}
