import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů — PrávníkAI',
  description: 'Zásady ochrany osobních údajů služby PrávníkAI',
}

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href="/" className="legal-back">&larr; Zpět na hlavní stránku</Link>
        <h1>Ochrana osobních údajů</h1>
        <p className="legal-updated">Poslední aktualizace: 24. března 2026</p>

        <section>
          <h2>1. Správce osobních údajů</h2>
          <p>
            Správcem osobních údajů je IndiWeb (dále jen &bdquo;Správce&ldquo;).
          </p>
          <p>Kontaktní e-mail: <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a></p>
        </section>

        <section>
          <h2>2. Jaké údaje shromažďujeme</h2>
          <ul>
            <li><strong>Identifikační údaje:</strong> jméno, e-mailová adresa (z Google účtu)</li>
            <li><strong>Údaje o používání:</strong> historie generovaných a kontrolovaných smluv</li>
            <li><strong>Technické údaje:</strong> IP adresa, typ prohlížeče (pro bezpečnost a rate limiting)</li>
            <li><strong>Fakturační údaje:</strong> zpracovávány přímo společností Stripe, Inc.</li>
          </ul>
        </section>

        <section>
          <h2>3. Účel zpracování</h2>
          <ul>
            <li>Poskytování služby PrávníkAI</li>
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
            <li><strong>Supabase, Inc.</strong> &mdash; autentizace a databáze (EU servery)</li>
            <li><strong>OpenAI, Inc.</strong> &mdash; zpracování AI požadavků</li>
            <li><strong>Stripe, Inc.</strong> &mdash; zpracování plateb</li>
            <li><strong>Vercel, Inc.</strong> &mdash; hosting aplikace</li>
          </ul>
        </section>

        <section>
          <h2>6. Doba uchování</h2>
          <p>
            Osobní údaje uchováváme po dobu trvání uživatelského účtu. Po smazání účtu
            jsou všechny osobní údaje nevratně odstraněny. Anonymizované auditní záznamy
            mohou být uchovány po dobu vyžadovanou zákonem.
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
            Používáme pouze nezbytné technické cookies pro funkci autentizace
            a udržení přihlášení. Nepoužíváme analytické ani reklamní cookies.
            Více informací naleznete v naší <Link href="/gdpr">GDPR dokumentaci</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
