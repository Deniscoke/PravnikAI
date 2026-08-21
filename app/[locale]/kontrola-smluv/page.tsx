import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { isValidLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/contracts/types'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BetaSignupForm } from '@/components/beta/BetaSignupForm'

const APP_URL = getSiteUrl()

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) return {}
  const canonical = `${APP_URL}/${raw}/kontrola-smluv`

  return {
    title: 'Kontrola smlouvy online — rychlé posouzení textu podle českého práva',
    description:
      'Vložte text smlouvy a během chvíle dostanete přehled rizik, chybějících ustanovení a míst k doplnění podle českého práva. Orientační kontrola, nenahrazuje advokáta.',
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/kontrola-smluv`,
        'x-default': `${APP_URL}/cs/kontrola-smluv`,
      },
    },
    openGraph: {
      url: canonical,
      title: `Kontrola smlouvy online — ${SITE_NAME}`,
      description:
        'Přehled rizik a chybějících ustanovení ve vaší smlouvě během chvíle. Orientační kontrola podle českého práva.',
    },
  }
}

const FAQ = [
  {
    question: 'Nahrazuje kontrola v Právo365 posouzení advokátem?',
    answer:
      'Ne. Jde o orientační kontrolu textu — upozorní na rizikové formulace, chybějící ustanovení a nejasnosti. Neposuzuje vaši konkrétní situaci a neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii. U smluv s vysokou hodnotou nebo ve sporu vždy oslovte advokáta.',
  },
  {
    question: 'Jaké smlouvy mohu nechat zkontrolovat?',
    answer:
      'Jakýkoli smluvní text v češtině — kupní, nájemní, pracovní, smlouvu o dílo, NDA i smlouvy, které vám někdo předložil k podpisu. Stačí text vložit do pole a spustit kontrolu.',
  },
  {
    question: 'Co se s mojí smlouvou stane?',
    answer:
      'Text se odešle poskytovateli AI služby, který připraví orientační rozbor. Nepoužíváme ho k trénování veřejných modelů. Podrobnosti o zpracování najdete v zásadách ochrany osobních údajů; citlivé údaje třetích osob doporučujeme před vložením anonymizovat.',
  },
  {
    question: 'Na co si mám dát pozor u smlouvy, kterou mi někdo předložil?',
    answer:
      'Nejčastěji na jednostranné sankce, nejasné vymezení předmětu a ceny, chybějící úpravu odstoupení a na ujednání, která zkracují vaše zákonná práva. Právě tyto oblasti kontrola prochází jako první.',
  },
]

export default async function KontrolaSmluvPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'cs-CZ',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="legal-page">
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: 'Kontrola smlouvy', path: `/${locale}/kontrola-smluv` },
        ]}
      />
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(faqJsonLd)}
      </script>

      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>

        <h1>Kontrola smlouvy online</h1>
        <p>
          Dostali jste smlouvu k podpisu a nevíte, co v ní hledat? Vložte text a {SITE_NAME} projde
          rizikové formulace, chybějící ustanovení a místa, která je potřeba doplnit — podle českého práva.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', margin: 'var(--space-lg) 0' }}>
          <Link href={`/${locale}/review`} className="glass-btn glass-btn--primary" style={{ textDecoration: 'none' }}>
            Zkontrolovat smlouvu
          </Link>
          <Link href={`/${locale}/generator`} className="glass-btn" style={{ textDecoration: 'none' }}>
            Vytvořit návrh smlouvy
          </Link>
        </div>

        <section>
          <h2>Kdy se orientační kontrola vyplatí</h2>
          <ul>
            <li>Protistrana vám poslala smlouvu a chcete vědět, na co se zeptat.</li>
            <li>Máte vlastní návrh a chcete zjistit, co v něm chybí, než ho odešlete.</li>
            <li>Potřebujete si udělat obrázek dřív, než se rozhodnete platit za právní posouzení.</li>
            <li>Používáte starší vzor a nevíte, jestli odpovídá dnešní úpravě.</li>
          </ul>
        </section>

        <section>
          <h2>Co kontrola projde</h2>
          <ul>
            <li>Rizikové a jednostranné formulace</li>
            <li>Chybějící podstatná ustanovení pro daný typ smlouvy</li>
            <li>Nejasné vymezení předmětu, ceny a termínů</li>
            <li>Místa, která je nutné doplnit před podpisem</li>
            <li>Odkazy na relevantní ustanovení českých předpisů</li>
          </ul>
        </section>

        <section>
          <h2>Kde je hranice</h2>
          <p>
            Orientační kontrola vám dá <strong>přehled a otázky</strong>, ne právní závěr. Nezná
            pozadí vašeho obchodu, vyjednávací pozici ani to, co jste si domluvili ústně. Neposuzuje
            konkrétní případ a <strong>nenahrazuje advokáta</strong> — u sporů, vysokých částek a
            regulovaných oblastí je konzultace na místě.
          </p>
          <p>
            Berte ji jako první síto: projde text rychle, upozorní na to, co stojí za pozornost, a vy
            se pak rozhodnete, jestli je potřeba odborné posouzení.
          </p>
        </section>

        <section>
          <h2>Časté otázky</h2>
          {FAQ.map((item) => (
            <div key={item.question} style={{ marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{item.question}</h3>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Chystáme ostrý provoz</h2>
          <p>
            {SITE_NAME} je zatím v beta verzi. Nechte nám e-mail a dáme vám vědět, jakmile spustíme
            plný provoz — jednou zprávou, bez spamu.
          </p>
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <BetaSignupForm source="kontrola-smluv" />
          </div>
        </section>

        <section>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
            Tato stránka má informativní charakter. {SITE_NAME} neposkytuje právní poradenství ve
            smyslu zák. č. 85/1996 Sb., o advokacii, a nenahrazuje posouzení konkrétního případu
            advokátem.
          </p>
        </section>
      </div>
    </main>
  )
}
