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
  const canonical = `${APP_URL}/${locale}/ai`
  return {
    title: 'Jak Právo365 používá umělou inteligenci',
    description: `Jak služba ${SITE_NAME} používá umělou inteligenci k přípravě pracovních návrhů smluv a orientační kontrole textu podle českého práva.`,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/ai`,
        'x-default': `${APP_URL}/cs/ai`,
      },
    },
    openGraph: {
      url: canonical,
      title: `Jak Právo365 používá umělou inteligenci — ${SITE_NAME}`,
    },
  }
}

export default async function AiNoticePage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale

  return (
    <main className="legal-page">
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: 'Jak používáme AI', path: `/${locale}/ai` },
        ]}
      />
      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>
        <h1>Jak Právo365 používá umělou inteligenci</h1>
        <p className="legal-updated">Poslední aktualizace: 31. května 2026</p>

        <section>
          <p>
            {SITE_NAME} používá umělou inteligenci k přípravě pracovních návrhů smluv a k orientační
            kontrole smluvních textů podle českého práva. Výstupy mohou obsahovat nepřesnosti nebo
            chybějící údaje a nenahrazují právní poradenství advokáta.
          </p>
        </section>

        <section>
          <h2>1. Co Právo365 dělá</h2>
          <ul>
            <li>Připravuje strukturovaný <strong>pracovní návrh</strong> smlouvy podle zadaných údajů.</li>
            <li>Provádí <strong>orientační kontrolu</strong> vloženého smluvního textu — upozorní na možná rizika, mezery a témata k dojednání.</li>
            <li>Odkazuje na relevantní české právní předpisy podle typu smlouvy.</li>
            <li>Umožňuje export do DOCX a PDF s disclaimerem.</li>
          </ul>
        </section>

        <section>
          <h2>2. Co Právo365 nedělá</h2>
          <ul>
            <li>Neposkytuje individuální právní poradenství ve smyslu zák. č. 85/1996 Sb., o advokacii.</li>
            <li>Nenahrazuje advokáta ani posouzení vašeho konkrétního případu.</li>
            <li>Nezaručuje úplnost, správnost ani použitelnost výstupu bez lidské kontroly.</li>
            <li>Nevytváří finální smluvní dokument bez nutnosti lidské revize.</li>
          </ul>
        </section>

        <section>
          <h2>3. Jak vzniká návrh smlouvy</h2>
          <p>
            Vyplníte formulář s údaji stran a podmínkami. Umělá inteligence z těchto údajů sestaví
            strukturovaný návrh a projde jej vnitřní kontrolou kvality. Pokud některé údaje chybí,
            výstup je označí (například <code>[DOPLNIT]</code>) a stav návrhu se odpovídajícím způsobem
            upraví. Výsledkem je <strong>pracovní verze</strong>, kterou je třeba před použitím
            zkontrolovat.
          </p>
        </section>

        <section>
          <h2>4. Jak funguje orientační kontrola smluv</h2>
          <p>
            Vložíte text existující smlouvy. Umělá inteligence jej projde z pohledu českého práva a
            vrátí orientační přehled — možná rizika, chybějící ustanovení a body k vyjednávání. Jde
            o <strong>orientační kontrolu</strong>, ne o závazný právní posudek. Výsledek doporučujeme
            ověřit s advokátem.
          </p>
        </section>

        <section>
          <h2>5. Jak pracujeme s daty</h2>
          <p>
            Zpracování probíhá na serveru. Text smluv a zadané údaje mohou být odeslány prostřednictvím
            OpenAI API za účelem vygenerování návrhu nebo orientační kontroly. Podle aktuálních pravidel
            OpenAI API nejsou tato data standardně používána k trénování modelů. Podrobnosti najdete
            v <Link href={`/${locale}/privacy`}>Zásadách ochrany osobních údajů</Link> a na
            stránce <Link href={`/${locale}/gdpr`}>GDPR / cookies</Link>.
          </p>
          <p>
            Před vložením textu zvažte, zda smlouva neobsahuje osobní údaje třetích osob, citlivé údaje
            nebo obchodní tajemství; pokud je to možné, údaje anonymizujte.
          </p>
        </section>

        <section>
          <h2>6. Proč doporučujeme kontrolu advokátem</h2>
          <p>
            Umělá inteligence pomáhá <strong>nezačínat od prázdné šablony</strong>. Finální právní
            posouzení a rozhodnutí ale zůstává vždy na uživateli a případně jeho advokátovi. U složitých
            transakcí, vysokých částek, spotřebitelských nebo pracovněprávních situací doporučujeme
            nechat dokument před podpisem zkontrolovat advokátem.
          </p>
        </section>
      </div>
    </main>
  )
}
