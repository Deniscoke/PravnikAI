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
  const canonical = `${APP_URL}/${locale}/privacy`
  return {
    title: 'Ochrana osobních údajů',
    description: `Zásady ochrany osobních údajů služby ${SITE_NAME}: zpracování dat, právní základ, práva subjektů údajů a kontakt správce IndiWeb.`,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/privacy`,
        'x-default': `${APP_URL}/cs/privacy`,
      },
    },
    openGraph: {
      url: canonical,
      title: `Ochrana osobních údajů — ${SITE_NAME}`,
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale

  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>
        <h1>Ochrana osobních údajů</h1>
        <p className="legal-updated">Poslední aktualizace: 31. května 2026</p>

        <section>
          <h2>1. Správce osobních údajů</h2>
          <p>Správcem osobních údajů je IndiWeb (dále jen &bdquo;Správce&ldquo;).</p>
          <p>
            Kontaktní e-mail: <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
          </p>
        </section>

        <section>
          <h2>2. Jaké údaje shromažďujeme</h2>
          <ul>
            <li>
              <strong>Identifikační údaje:</strong> jméno, e-mailová adresa (z Google účtu)
            </li>
            <li>
              <strong>Údaje o používání:</strong> historie generovaných a kontrolovaných smluv
            </li>
            <li>
              <strong>Technické údaje:</strong> IP adresa v hashované podobě, technické identifikátory
              požadavků, čas přístupu a informace potřebné pro ochranu služby
            </li>
            <li>
              <strong>Fakturační údaje:</strong> zpracovávány přímo společností Stripe, Inc.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Účel zpracování</h2>
          <ul>
            <li>Poskytování služby {SITE_NAME}</li>
            <li>Správa uživatelského účtu a předplatného</li>
            <li>Zabezpečení proti zneužití (rate limiting)</li>
            <li>Zlepšování kvality služby</li>
          </ul>
        </section>

        <section>
          <h2>4. Právní základ zpracování</h2>
          <p>
            Zpracování osobních údajů probíhá na základě plnění smlouvy (čl. 6 odst. 1 písm. b GDPR)
            a oprávněného zájmu správce na bezpečnosti služby (čl. 6 odst. 1 písm. f GDPR).
          </p>
        </section>

        <section>
          <h2>5. Příjemci údajů</h2>
          <ul>
            <li>
              <strong>Supabase, Inc.</strong> &mdash; autentizace, databáze a bezpečné uložení
              uživatelských dat
            </li>
            <li>
              <strong>OpenAI, L.L.C.</strong> &mdash; zpracování AI požadavků. Texty smluv, údaje
              zadané do formulářů a požadavky uživatele mohou být odesílány prostřednictvím
              OpenAI API za účelem vygenerování návrhu smlouvy nebo orientační kontroly dokumentu.
              Podle aktuálních pravidel OpenAI API nejsou tato data standardně používána k trénování
              modelů, pokud není zapnuto sdílení dat pro zlepšování služeb. Poskytovatel API může
              zpracovávat technické údaje a obsah požadavků pro bezpečnostní a abuse monitoring
              dle svých pravidel.
            </li>
            <li>
              <strong>Stripe, Inc.</strong> &mdash; zpracování plateb
            </li>
            <li>
              <strong>Vercel, Inc.</strong> &mdash; hosting aplikace
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Doba uchování</h2>
          <p>
            Osobní údaje uchováváme po dobu trvání uživatelského účtu. Po smazání účtu odstraníme
            osobní údaje a historii dokumentů, pokud jejich další uchování není nezbytné z právních,
            bezpečnostních, účetních nebo technických důvodů. Některé technické bezpečnostní záznamy
            mohou zůstat uchovány v anonymizované nebo pseudonymizované podobě.
          </p>
        </section>

        <section>
          <h2>7. Vaše práva</h2>
          <p>Máte právo na:</p>
          <ul>
            <li>Přístup ke svým údajům (čl. 15 GDPR)</li>
            <li>Opravu nepřesných údajů (čl. 16 GDPR)</li>
            <li>Výmaz údajů &mdash; &bdquo;právo být zapomenut&ldquo; (čl. 17 GDPR)</li>
            <li>Přenositelnost údajů (čl. 20 GDPR)</li>
            <li>Podání stížnosti u dozorového úřadu (ÚOOÚ)</li>
          </ul>
          <p>
            Pro uplatnění svých práv nás kontaktujte na{' '}
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            Používáme pouze nezbytné technické cookies pro funkci autentizace a udržení přihlášení.
            Nepoužíváme analytické ani reklamní cookies. Více informací naleznete v naší{' '}
            <Link href={`/${locale}/gdpr`}>GDPR dokumentaci</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
