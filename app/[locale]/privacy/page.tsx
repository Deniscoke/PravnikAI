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
    description: `Zásady ochrany osobních údajů služby ${SITE_NAME}: zpracování dat, právní základ, příjemci, doba uchování a práva subjektů údajů.`,
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

        <p>
          Tento dokument popisuje, jaké osobní údaje služba {SITE_NAME} zpracovává, k jakým účelům,
          komu je předává a jak dlouho je uchovává.
        </p>

        <section>
          <h2>1. Správce osobních údajů</h2>
          <p>Správcem osobních údajů je IndiWeb (dále jen &bdquo;Správce&ldquo;).</p>
          <p>
            Kontaktní e-mail: <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
          </p>
        </section>

        <section>
          <h2>2. Jaké údaje zpracováváme</h2>
          <ul>
            <li>
              <strong>Údaje účtu:</strong> e-mail a jméno z Google účtu, identifikátor účtu.
            </li>
            <li>
              <strong>Fakturační a platební údaje:</strong> metadata zákazníka, předplatného a plateb
              ze služby Stripe. Údaje platební karty zpracovává přímo Stripe; {SITE_NAME} je neukládá.
            </li>
            <li>
              <strong>Obsah vložený uživatelem:</strong> data zadaná do formulářů generátoru, texty
              smluv vložené ke kontrole, požadavky uživatele.
            </li>
            <li>
              <strong>AI výstupy:</strong> vygenerované návrhy smluv, výsledky orientační kontroly
              a související upozornění (warnings).
            </li>
            <li>
              <strong>Technické údaje:</strong> IP adresa (používá se pro rate limiting; v auditních
              záznamech se uchovává pouze její hash, SHA-256), user-agent prohlížeče, čas požadavku,
              záznamy o rate limitu.
            </li>
            <li>
              <strong>Zpětná vazba:</strong> text zpětné vazby, případně e-mail uživatele a metadata
              stránky (URL, user-agent, čas), pokud nám zpětnou vazbu zašlete.
            </li>
            <li>
              <strong>Diagnostická data:</strong> chybové a provozní záznamy v nástroji Sentry.
            </li>
            <li>
              <strong>Anonymní statistika návštěvnosti:</strong> agregované údaje o zobrazených
              stránkách a výkonu webu. Měření probíhá bez cookies a bez profilování jednotlivců.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. K jakým účelům údaje používáme</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Účel</th>
                  <th>Kategorie údajů</th>
                  <th>Poskytovatelé</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Provoz účtu a autentizace</td>
                  <td>Údaje účtu</td>
                  <td>Supabase, Google OAuth, Vercel</td>
                </tr>
                <tr>
                  <td>Vytvoření návrhu smlouvy</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td>OpenAI API, Supabase, Vercel</td>
                </tr>
                <tr>
                  <td>Orientační kontrola smlouvy</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td>OpenAI API, Vercel</td>
                </tr>
                <tr>
                  <td>Uložení historie v dashboardu</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td>Supabase</td>
                </tr>
                <tr>
                  <td>Export DOCX/PDF</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td>Vercel</td>
                </tr>
                <tr>
                  <td>Platby a fakturace</td>
                  <td>Fakturační a platební údaje</td>
                  <td>Stripe</td>
                </tr>
                <tr>
                  <td>Ochrana proti zneužití a rate limiting</td>
                  <td>Technické údaje</td>
                  <td>Upstash, Vercel</td>
                </tr>
                <tr>
                  <td>Technická diagnostika a bezpečnost</td>
                  <td>Diagnostická data, technické údaje</td>
                  <td>Sentry, Vercel</td>
                </tr>
                <tr>
                  <td>Zpětná vazba v betě</td>
                  <td>Zpětná vazba</td>
                  <td>Resend</td>
                </tr>
                <tr>
                  <td>Právní povinnosti a účetnictví</td>
                  <td>Fakturační údaje</td>
                  <td>Stripe</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Právní základ pro jednotlivé účely je popsán v sekci 8, doba uchování v sekci 6.</p>
        </section>

        <section>
          <h2>4. Příjemci a zpracovatelé</h2>
          <p>
            Při provozu služby využíváme následující poskytovatele. Přesný právní režim
            (zpracovatelská smlouva / DPA) a jeho evidenci u jednotlivých poskytovatelů zajišťuje
            Správce.
          </p>
          <ul>
            <li><strong>Supabase</strong> &mdash; databáze, autentizace a ukládání uživatelských dat.</li>
            <li><strong>OpenAI API</strong> &mdash; zpracování vstupů a výstupů pro AI generování a orientační kontrolu.</li>
            <li><strong>Stripe</strong> &mdash; platby a správa předplatného.</li>
            <li><strong>Vercel</strong> &mdash; hosting, serverless provoz aplikace a anonymní statistika návštěvnosti (bez cookies).</li>
            <li><strong>Upstash</strong> &mdash; rate limiting (ochrana proti zneužití).</li>
            <li><strong>Sentry</strong> &mdash; monitoring chyb a provozní diagnostika.</li>
            <li><strong>Resend</strong> &mdash; e-mailová komunikace / zpětná vazba v betě.</li>
            <li><strong>Google OAuth</strong> &mdash; přihlášení uživatele.</li>
          </ul>
        </section>

        <section>
          <h2>5. OpenAI API a zpracování umělou inteligencí</h2>
          <p>
            Texty vložené do generátoru nebo kontroly smluv mohou být odeslány poskytovateli AI služby
            za účelem vytvoření návrhu nebo orientační kontroly. {SITE_NAME} používá AI jako technický
            nástroj pro zpracování zadaného požadavku. Výstup může obsahovat nepřesnosti a vyžaduje
            lidskou kontrolu.
          </p>
        </section>

        <section>
          <h2>6. Údaje třetích osob ve smluvních textech</h2>
          <p>
            Uživatel odpovídá za to, že do služby vkládá pouze údaje, které je oprávněn zpracovávat.
            Pokud smlouva obsahuje osobní údaje třetích osob, zvláštní kategorie osobních údajů podle
            GDPR nebo obchodní tajemství, doporučujeme je před vložením anonymizovat nebo minimalizovat.
          </p>
        </section>

        <section>
          <h2>7. Doba uchování</h2>
          <p>
            Údaje uchováváme pouze po dobu nezbytnou pro daný účel, provoz služby, splnění právních
            povinností, ochranu služby a řešení případných nároků.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Typ dat</th>
                  <th>Doba uchování</th>
                  <th>Poznámka</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Účet uživatele</td>
                  <td>Po dobu trvání účtu</td>
                  <td>Smazáním účtu se zahájí výmaz</td>
                </tr>
                <tr>
                  <td>Historie návrhů a kontrol</td>
                  <td>Po dobu trvání účtu</td>
                  <td>Lze smazat jednotlivě nebo se účtem</td>
                </tr>
                <tr>
                  <td>Billing metadata</td>
                  <td>Po dobu nezbytnou pro účetní a daňové účely</td>
                  <td>Část drží Stripe</td>
                </tr>
                <tr>
                  <td>Audit / rate-limit logy</td>
                  <td>Po dobu nezbytnou pro ochranu služby</td>
                  <td>IP pouze v hashované podobě</td>
                </tr>
                <tr>
                  <td>Zpětná vazba</td>
                  <td>Po dobu nezbytnou pro vyhodnocení</td>
                  <td>Zasílá se e-mailem provozovateli</td>
                </tr>
                <tr>
                  <td>Sentry logy</td>
                  <td>Po dobu nezbytnou pro diagnostiku</td>
                  <td>Provozní a chybová diagnostika</td>
                </tr>
                <tr>
                  <td>Soft-deleted data</td>
                  <td>Po dobu nezbytnou do trvalého výmazu</td>
                  <td>Dočasně označená ke smazání</td>
                </tr>
                <tr>
                  <td>Exportované soubory (DOCX/PDF)</td>
                  <td>Neukládají se</td>
                  <td>Generují se na požádání a streamují uživateli</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>8. Právní základ a přenosy mimo EHP</h2>
          <p>
            Právní základ zpracování se liší podle konkrétního účelu, zejména podle toho, zda jde
            o poskytování služby, splnění právní povinnosti, ochranu služby před zneužitím nebo
            oprávněný zájem na bezpečném provozu.
          </p>
          <p>
            Někteří techničtí poskytovatelé mohou zpracovávat údaje mimo Evropský hospodářský prostor.
            V takovém případě má být předávání založeno na odpovídajících zárukách podle GDPR, například
            standardních smluvních doložkách nebo jiném platném mechanismu.
          </p>
        </section>

        <section>
          <h2>9. Vaše práva</h2>
          <p>Máte právo na:</p>
          <ul>
            <li>Přístup ke svým údajům (čl. 15 GDPR)</li>
            <li>Opravu nepřesných údajů (čl. 16 GDPR)</li>
            <li>Výmaz údajů &mdash; &bdquo;právo být zapomenut&ldquo; (čl. 17 GDPR)</li>
            <li>Omezení zpracování (čl. 18 GDPR)</li>
            <li>Přenositelnost údajů (čl. 20 GDPR)</li>
            <li>Vznést námitku proti zpracování (čl. 21 GDPR)</li>
            <li>Podání stížnosti u dozorového úřadu (ÚOOÚ)</li>
          </ul>
          <p>
            Praktický postup pro uplatnění těchto práv najdete na stránce{' '}
            <Link href={`/${locale}/gdpr`}>GDPR / cookies</Link>. Pro uplatnění práv nás kontaktujte na{' '}
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>10. Cookies</h2>
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
