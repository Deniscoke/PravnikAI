import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR — PrávníkAI',
  description: 'Informace o zpracování osobních údajů dle GDPR',
}

export default function GdprPage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href="/" className="legal-back">&larr; Zpět na hlavní stránku</Link>
        <h1>GDPR &mdash; Zpracování osobních údajů</h1>
        <p className="legal-updated">Poslední aktualizace: 24. března 2026</p>

        <section>
          <h2>Prohlášení o souladu s GDPR</h2>
          <p>
            Služba PrávníkAI provozovaná společností IndiWeb plně respektuje Nařízení
            Evropského parlamentu a Rady (EU) 2016/679 (GDPR). Tato stránka shrnuje,
            jak zajišťujeme ochranu vašich osobních údajů.
          </p>
        </section>

        <section>
          <h2>Zásady zpracování údajů</h2>
          <ul>
            <li><strong>Minimalizace dat:</strong> Shromažďujeme pouze údaje nezbytné pro poskytování služby.</li>
            <li><strong>Účelové omezení:</strong> Údaje používáme výhradně pro účely, ke kterým byly shromážděny.</li>
            <li><strong>Omezení uložení:</strong> Údaje uchováváme pouze po dobu nezbytnou pro účel zpracování.</li>
            <li><strong>Integrita a důvěrnost:</strong> Údaje jsou chráněny technickými a organizačními opatřeními.</li>
          </ul>
        </section>

        <section>
          <h2>Technická opatření</h2>
          <ul>
            <li>Šifrování dat při přenosu (TLS/HTTPS)</li>
            <li>Row Level Security (RLS) v databázi &mdash; uživatelé mají přístup pouze ke svým datům</li>
            <li>Autentizace přes OAuth 2.0 s PKCE flow (žádná hesla nejsou ukládána)</li>
            <li>Oddělení veřejného a servisního přístupu k databázi</li>
            <li>Rate limiting na API endpointech pro ochranu proti zneužití</li>
            <li>Auditní záznamy s anonymizací po smazání účtu</li>
          </ul>
        </section>

        <section>
          <h2>Právo na výmaz (čl. 17 GDPR)</h2>
          <p>
            Máte právo kdykoli požádat o smazání svého účtu a všech souvisejících dat.
            Smazání provedete v nastavení účtu nebo kontaktováním podpory.
          </p>
          <p>Při smazání účtu dojde k odstranění:</p>
          <ul>
            <li>Uživatelského profilu a preferencí</li>
            <li>Historie generovaných smluv</li>
            <li>Historie kontrol smluv</li>
            <li>Autentizačních údajů</li>
          </ul>
          <p>
            Anonymizované auditní záznamy (bez osobních údajů) mohou být uchovány
            pro účely bezpečnosti a souladu se zákonem.
          </p>
        </section>

        <section>
          <h2>Právo na přenositelnost (čl. 20 GDPR)</h2>
          <p>
            Máte právo získat své osobní údaje ve strojově čitelném formátu.
            Kontaktujte nás na <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            PrávníkAI používá výhradně <strong>nezbytné technické cookies</strong> pro:
          </p>
          <ul>
            <li>Autentizaci a udržení přihlášení (Supabase session cookies)</li>
            <li>Zapamatování zvoleného tématu vzhledu (localStorage, ne cookie)</li>
          </ul>
          <p>
            Nepoužíváme analytické, reklamní ani cookies třetích stran pro sledování.
            Proto nevyžadujeme souhlas s cookies dle směrnice ePrivacy &mdash; nezbytné
            technické cookies jsou povoleny bez souhlasu (čl. 5 odst. 3 směrnice 2002/58/ES).
          </p>
        </section>

        <section>
          <h2>Dozorový úřad</h2>
          <p>
            V případě pochybností o zpracování osobních údajů máte právo podat stížnost
            u Úřadu pro ochranu osobních údajů (ÚOOÚ):
          </p>
          <p>
            Úřad pro ochranu osobních údajů<br />
            Pplk. Sochora 27, 170 00 Praha 7<br />
            <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">www.uoou.cz</a>
          </p>
        </section>

        <section>
          <h2>Kontakt</h2>
          <p>
            S dotazy ohledně ochrany osobních údajů se obraťte na:<br />
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a><br />
            Tel: <a href="tel:+420728523267">728 523 267</a>
          </p>
        </section>
      </div>
    </main>
  )
}
