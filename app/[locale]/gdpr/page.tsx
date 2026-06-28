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
  const canonical = `${APP_URL}/${locale}/gdpr`
  return {
    title: 'GDPR',
    description: `Praktický postup pro uplatnění práv podle GDPR ve službě ${SITE_NAME}: přístup, oprava, výmaz, omezení, přenositelnost a námitka.`,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/gdpr`,
        'x-default': `${APP_URL}/cs/gdpr`,
      },
    },
    openGraph: {
      url: canonical,
      title: `GDPR — ${SITE_NAME}`,
    },
  }
}

export default async function GdprPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale

  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>
        <h1>GDPR &mdash; vaše práva a jak je uplatnit</h1>
        <p className="legal-updated">Poslední aktualizace: 31. května 2026</p>

        <p>
          Tato stránka popisuje praktický postup pro uplatnění vašich práv podle nařízení GDPR
          (EU) 2016/679. Jaké údaje a proč zpracováváme, najdete v dokumentu{' '}
          <Link href={`/${locale}/privacy`}>Ochrana osobních údajů</Link>. Body vyžadující právní
          potvrzení jsou označeny <code>[K DOPLNĚNÍ ADVOKÁTEM: …]</code>.
        </p>

        <section>
          <h2>1. Jak požádat o přístup k údajům (čl. 15)</h2>
          <p>
            Máte právo zjistit, jaké vaše osobní údaje zpracováváme. O přehled požádejte e-mailem na{' '}
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a> z e-mailu spojeného
            s vaším účtem. Část údajů (historii návrhů a kontrol) vidíte přímo ve svém dashboardu.
          </p>
        </section>

        <section>
          <h2>2. Jak požádat o opravu (čl. 16)</h2>
          <p>
            Pokud jsou některé vaše údaje nepřesné, napište nám na{' '}
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a> a uveďte, co má být
            opraveno. Jméno a e-mail přebíráme z vašeho Google účtu.
          </p>
        </section>

        <section>
          <h2>3. Jak požádat o výmaz (čl. 17)</h2>
          <p>
            Účet a související data můžete smazat v nastavení účtu nebo kontaktováním podpory.
            Při smazání účtu zahájíme odstranění:
          </p>
          <ul>
            <li>Uživatelského profilu a preferencí</li>
            <li>Historie generovaných návrhů smluv</li>
            <li>Historie kontrol smluv</li>
            <li>Autentizačních údajů</li>
          </ul>
          <p>
            Část údajů může být ponechána, pokud je jejich další uchování nezbytné pro splnění
            zákonných povinností, účetnictví, bezpečnost služby nebo obranu právních nároků.
            Technické bezpečnostní záznamy mohou zůstat v anonymizované nebo pseudonymizované podobě.
          </p>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: ověřit rozsah a lhůty údajů ponechaných po výmazu z titulu zákonných povinností a obrany právních nároků]</code>
          </p>
        </section>

        <section>
          <h2>4. Jak požádat o omezení zpracování (čl. 18)</h2>
          <p>
            Za podmínek stanovených GDPR můžete požádat o dočasné omezení zpracování svých údajů.
            Žádost zašlete na <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>5. Jak požádat o přenositelnost údajů (čl. 20)</h2>
          <p>
            Máte právo získat údaje, které jste nám poskytli, ve strukturovaném, běžně používaném
            a strojově čitelném formátu. O přenos požádejte e-mailem na{' '}
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>6. Jak vznést námitku (čl. 21)</h2>
          <p>
            Proti zpracování založenému na oprávněném zájmu můžete vznést námitku. Napište nám na{' '}
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a> a uveďte důvody
            vyplývající z vaší konkrétní situace.
          </p>
        </section>

        <section>
          <h2>7. Jak řešíme údaje ve smluvních textech</h2>
          <p>
            Texty smluv, které vložíte do generátoru nebo kontroly, mohou obsahovat osobní údaje
            třetích osob. Uživatel odpovídá za to, že je oprávněn tyto údaje zpracovávat. Pokud to
            není nezbytné, doporučujeme údaje před vložením anonymizovat nebo minimalizovat;
            nevkládejte zvláštní kategorie osobních údajů podle GDPR bez právního titulu.
          </p>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: potvrdit roli správce/zpracovatele u obsahu vložených smluv a navazující povinnosti]</code>
          </p>
        </section>

        <section>
          <h2>8. Kontakt pro GDPR žádosti</h2>
          <p>
            S žádostmi a dotazy ohledně ochrany osobních údajů se obraťte na:
            <br />
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
            <br />
            Tel: <a href="tel:+420728523267">+420 728 523 267</a>
          </p>
        </section>

        <section>
          <h2>9. Dozorový úřad</h2>
          <p>
            V případě pochybností o zpracování osobních údajů máte právo podat stížnost u Úřadu pro
            ochranu osobních údajů (ÚOOÚ):
          </p>
          <p>
            Úřad pro ochranu osobních údajů
            <br />
            Pplk. Sochora 27, 170 00 Praha 7
            <br />
            <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">
              www.uoou.cz
            </a>
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            {SITE_NAME} používá výhradně <strong>nezbytné technické cookies</strong> pro:
          </p>
          <ul>
            <li>Autentizaci a udržení přihlášení (Supabase session cookies)</li>
            <li>Zapamatování jazykové preference nebo přesměrování na českou verzi služby
              (technický cookie <code>pravnikai-locale</code>)</li>
            <li>Zapamatování zvoleného tématu vzhledu (localStorage, ne cookie)</li>
          </ul>
          <p>
            Nepoužíváme analytické, reklamní ani cookies třetích stran pro sledování. Proto
            nevyžadujeme souhlas s cookies dle směrnice ePrivacy &mdash; nezbytné technické cookies
            jsou povoleny bez souhlasu (čl. 5 odst. 3 směrnice 2002/58/ES).
          </p>
        </section>
      </div>
    </main>
  )
}
