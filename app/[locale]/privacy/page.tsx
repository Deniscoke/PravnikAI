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
          na jakém právním základě, jak dlouho je uchovává a komu je předává. Body, které vyžadují
          právní potvrzení, jsou označeny <code>[K DOPLNĚNÍ ADVOKÁTEM: …]</code>.
        </p>

        <section>
          <h2>1. Správce osobních údajů</h2>
          <p>Správcem osobních údajů je IndiWeb (dále jen &bdquo;Správce&ldquo;).</p>
          <p>
            Kontaktní e-mail: <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
          </p>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: potvrdit roli správce/zpracovatele u obsahu vložených smluv a doplnit identifikační údaje provozovatele (IČO, sídlo)]</code>
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
                  <th>Právní základ</th>
                  <th>Doba uchování</th>
                  <th>Poskytovatelé</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Provoz účtu a autentizace</td>
                  <td>Údaje účtu</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní základ]</code></td>
                  <td>Po dobu trvání účtu</td>
                  <td>Supabase, Google OAuth, Vercel</td>
                </tr>
                <tr>
                  <td>Vytvoření návrhu smlouvy</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní základ]</code></td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit přesnou retenční dobu]</code></td>
                  <td>OpenAI API, Supabase, Vercel</td>
                </tr>
                <tr>
                  <td>Orientační kontrola smlouvy</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní základ]</code></td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit přesnou retenční dobu]</code></td>
                  <td>OpenAI API, Vercel</td>
                </tr>
                <tr>
                  <td>Uložení historie v dashboardu</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní základ]</code></td>
                  <td>Po dobu trvání účtu (do smazání)</td>
                  <td>Supabase</td>
                </tr>
                <tr>
                  <td>Export DOCX/PDF</td>
                  <td>Obsah vložený uživatelem, AI výstupy</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní základ]</code></td>
                  <td>Soubory se generují na požádání a neukládají se na serveru</td>
                  <td>Vercel</td>
                </tr>
                <tr>
                  <td>Platby a fakturace</td>
                  <td>Fakturační a platební údaje</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní základ — plnění smlouvy / právní povinnost]</code></td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit dle účetních předpisů]</code></td>
                  <td>Stripe</td>
                </tr>
                <tr>
                  <td>Ochrana proti zneužití a rate limiting</td>
                  <td>Technické údaje</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: oprávněný zájem]</code></td>
                  <td>Krátkodobě, dle nastavení rate limitu</td>
                  <td>Upstash, Vercel</td>
                </tr>
                <tr>
                  <td>Technická diagnostika a bezpečnost</td>
                  <td>Diagnostická data, technické údaje</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: oprávněný zájem]</code></td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit přesnou retenční dobu]</code></td>
                  <td>Sentry, Vercel</td>
                </tr>
                <tr>
                  <td>Zpětná vazba v betě</td>
                  <td>Zpětná vazba</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: oprávněný zájem / souhlas]</code></td>
                  <td>Zpětná vazba se zasílá e-mailem provozovateli</td>
                  <td>Resend</td>
                </tr>
                <tr>
                  <td>Právní povinnosti a účetnictví</td>
                  <td>Fakturační údaje</td>
                  <td><code>[K DOPLNĚNÍ ADVOKÁTEM: právní povinnost]</code></td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit dle zákonných lhůt]</code></td>
                  <td>Stripe</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>4. Příjemci a zpracovatelé</h2>
          <p>
            Při provozu služby využíváme následující poskytovatele. Přesný právní režim (zpracovatelská
            smlouva / DPA) a jeho evidenci u jednotlivých poskytovatelů ověřuje provozovatel, případně
            advokát.
          </p>
          <ul>
            <li><strong>Supabase</strong> &mdash; databáze, autentizace a ukládání uživatelských dat.</li>
            <li><strong>OpenAI API</strong> &mdash; zpracování vstupů a výstupů pro AI generování a orientační kontrolu.</li>
            <li><strong>Stripe</strong> &mdash; platby a správa předplatného.</li>
            <li><strong>Vercel</strong> &mdash; hosting a serverless provoz aplikace.</li>
            <li><strong>Upstash</strong> &mdash; rate limiting (ochrana proti zneužití).</li>
            <li><strong>Sentry</strong> &mdash; monitoring chyb a provozní diagnostika.</li>
            <li><strong>Resend</strong> &mdash; e-mailová komunikace / zpětná vazba v betě.</li>
            <li><strong>Google OAuth</strong> &mdash; přihlášení uživatele.</li>
          </ul>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: ověřit u každého poskytovatele uzavření zpracovatelské smlouvy (DPA) a její evidenci]</code>
          </p>
        </section>

        <section>
          <h2>5. OpenAI API a zpracování umělou inteligencí</h2>
          <p>
            Texty, které vložíte do generátoru nebo kontroly smluv, mohou být odeslány poskytovateli
            AI služby za účelem vytvoření návrhu nebo orientační kontroly. {SITE_NAME} používá AI pouze
            jako technický nástroj pro zpracování zadaného požadavku. Výstup může obsahovat nepřesnosti
            a nenahrazuje právní posouzení advokátem.
          </p>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: ověřit finální formulaci k OpenAI API, retenci, DPA a případným přenosům mimo EHP podle aktuální smluvní dokumentace poskytovatele]</code>
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
          <div style={{ overflowX: 'auto' }}>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Typ dat</th>
                  <th>Předpokládaná doba uchování</th>
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
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: dle účetních a daňových předpisů]</code></td>
                  <td>Část drží Stripe</td>
                </tr>
                <tr>
                  <td>Audit / rate-limit logy</td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit přesnou retenční dobu]</code></td>
                  <td>IP pouze v hashované podobě</td>
                </tr>
                <tr>
                  <td>Zpětná vazba</td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit přesnou retenční dobu]</code></td>
                  <td>Zasílá se e-mailem provozovateli</td>
                </tr>
                <tr>
                  <td>Sentry logy</td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: dle nastavení Sentry]</code></td>
                  <td>Provozní a chybová diagnostika</td>
                </tr>
                <tr>
                  <td>Soft-deleted data</td>
                  <td><code>[K DOPLNĚNÍ PROVOZOVATELEM/ADVOKÁTEM: doplnit lhůtu do trvalého výmazu]</code></td>
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
          <h2>8. Přenosy mimo EHP</h2>
          <p>
            Někteří poskytovatelé technické infrastruktury mohou zpracovávat údaje mimo Evropský
            hospodářský prostor. V takovém případě má být předávání založeno na odpovídajících zárukách
            podle GDPR, například standardních smluvních doložkách nebo jiném platném mechanismu.
          </p>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: ověřit konkrétní předávací mechanismy pro OpenAI, Stripe, Vercel, Supabase, Sentry, Resend, Upstash]</code>
          </p>
        </section>

        <section>
          <h2>9. Právní základ zpracování</h2>
          <p>
            Zpracování probíhá zejména na základě plnění smlouvy, oprávněného zájmu Správce na
            bezpečnosti a provozu služby, právních povinností a případně souhlasu. Přiřazení právního
            základu k jednotlivým účelům je uvedeno v tabulce v sekci 3.
          </p>
          <p>
            <code>[K DOPLNĚNÍ ADVOKÁTEM: potvrdit právní základ zpracování pro jednotlivé účely]</code>
          </p>
        </section>

        <section>
          <h2>10. Vaše práva</h2>
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
          <h2>11. Cookies</h2>
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
