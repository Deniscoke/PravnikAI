import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Obchodní podmínky — PrávníkAI',
  description: 'Obchodní podmínky služby PrávníkAI',
}

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-card">
        <Link href="/" className="legal-back">&larr; Zpět na hlavní stránku</Link>
        <h1>Obchodní podmínky</h1>
        <p className="legal-updated">Poslední aktualizace: 24. března 2026</p>

        <section>
          <h2>1. Úvodní ustanovení</h2>
          <p>
            Tyto obchodní podmínky (dále jen &bdquo;Podmínky&ldquo;) upravují práva a povinnosti
            mezi provozovatelem služby PrávníkAI &mdash; IndiWeb (dále jen &bdquo;Provozovatel&ldquo;)
            a uživatelem služby (dále jen &bdquo;Uživatel&ldquo;).
          </p>
          <p>Kontaktní e-mail: <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a></p>
        </section>

        <section>
          <h2>2. Popis služby</h2>
          <p>
            PrávníkAI je webová aplikace využívající umělou inteligenci pro generování
            a kontrolu právních smluv v rámci české právní praxe. Služba je poskytována
            v režimu SaaS (Software as a Service).
          </p>
          <p>
            <strong>Upozornění:</strong> Služba neposkytuje právní poradenství. Výstupy AI jsou
            informativního charakteru a nenahrazují konzultaci s advokátem.
          </p>
        </section>

        <section>
          <h2>3. Registrace a uživatelský účet</h2>
          <p>
            Pro využívání služby je nutná registrace prostřednictvím Google účtu.
            Uživatel je povinen uvádět pravdivé údaje a chránit přístup ke svému účtu.
          </p>
        </section>

        <section>
          <h2>4. Platební podmínky</h2>
          <p>
            Služba nabízí bezplatný tarif s omezeními a placené tarify (Pro, Team).
            Platby jsou zpracovávány prostřednictvím Stripe. Předplatné se automaticky
            obnovuje, pokud není zrušeno před koncem fakturačního období.
          </p>
        </section>

        <section>
          <h2>5. Omezení odpovědnosti</h2>
          <p>
            Provozovatel nenese odpovědnost za škody vzniklé použitím AI-generovaných
            dokumentů bez odborné právní revize. Uživatel používá výstupy služby
            na vlastní odpovědnost.
          </p>
        </section>

        <section>
          <h2>6. Ukončení služby</h2>
          <p>
            Uživatel může svůj účet kdykoli smazat v nastavení účtu. Smazáním účtu
            dojde k nevratnému odstranění všech osobních údajů v souladu s GDPR.
          </p>
        </section>

        <section>
          <h2>7. Závěrečná ustanovení</h2>
          <p>
            Tyto Podmínky se řídí právním řádem České republiky. Provozovatel si vyhrazuje
            právo Podmínky jednostranně měnit s oznámením uživatelům.
          </p>
        </section>
      </div>
    </main>
  )
}
