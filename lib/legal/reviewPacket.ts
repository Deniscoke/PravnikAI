/**
 * The document we hand a lawyer — built from the code, so it cannot go stale.
 *
 * WHY THIS IS GENERATED
 *
 * The previous review checklist was written by hand and said "pět profilů"
 * while the app had grown to twenty-three. A lawyer reading it would have
 * quoted for a fifth of the work and reviewed a fifth of the claims, and both
 * sides would have believed the thing was checked. A packet assembled from the
 * same objects the product runs on cannot drift from what the product says.
 *
 * WHY IT IS ORDERED THE WAY IT IS
 *
 * A lawyer's time is the scarce resource, so the parts are sequenced by damage
 * if wrong, not by the structure of the code:
 *
 *   1. Statutory values — one page, and an error propagates into every
 *      document the app has ever produced.
 *   2. Claims of invalidity — where we tell a user a clause is void or never
 *      arose. Wrong in one direction it frightens someone off a good contract;
 *      wrong in the other it reassures them about a bad one.
 *   3. Provisions marked inapplicable — the silent failure. A wrong entry does
 *      not produce a visible error; it SUPPRESSES a real finding, so nobody
 *      ever sees what was missed.
 *   4. Claims that some widely repeated rule is superseded.
 *
 * Everything else — recommendations, drafting practice — can be wrong without
 * hurting anyone, and is deliberately left out so it does not consume billed
 * hours.
 */

import { ALL_LEGAL_FACTS } from './czechLegalFacts'
import { STALE_LAW_CLAIMS } from './staleLawGuard'
import { ALL_PROFILES, COMMON_PROFILE, CONSEQUENCE_LABEL } from './knowledge'
import type { ContractLegalProfile, LegalConsequence, LegalRule } from './knowledge/types'

/** Consequences that assert a defect in law rather than a matter of practice. */
const HARD_CONSEQUENCES: ReadonlySet<LegalConsequence> = new Set([
  'nevznikne',
  'neplatnost',
  'neprihlizi-se',
])

/** Works for the common profile too, which has rules but no family or label. */
function hardRules(profile: { rules: ReadonlyArray<LegalRule> }): LegalRule[] {
  return profile.rules.filter((rule) => HARD_CONSEQUENCES.has(rule.consequence))
}

/** Collapses the multi-line source strings into one readable line. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function renderRule(rule: LegalRule): string {
  // Common-profile rules carry no label, and "common-lichva" tells a reviewer
  // nothing. The provision is the identifier they actually think in.
  const name = rule.label ?? rule.law
  const lines = [
    `**${name}** — *${CONSEQUENCE_LABEL[rule.consequence]}*`,
    '',
    oneLine(rule.requirement),
    '',
    `Ustanovení: ${rule.law}`,
  ]
  if (rule.appliesWhen) lines.push(`Použije se jen když: ${oneLine(rule.appliesWhen)}`)
  lines.push('', 'Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________', '')
  return lines.join('\n')
}

function renderProfile(profile: ContractLegalProfile): string {
  const rules = hardRules(profile)
  if (rules.length === 0) return ''

  return [
    `### ${profile.label}`,
    '',
    `Právní základ: ${profile.primaryLaw}`,
    `Naposledy ověřeno námi: ${profile.lastVerified}`,
    '',
    ...rules.map(renderRule),
  ].join('\n')
}

function renderInapplicable(profile: ContractLegalProfile): string {
  const items = profile.inapplicable ?? []
  if (items.length === 0) return ''

  return [
    `### ${profile.label}`,
    '',
    ...items.map(
      (item) =>
        `- **§ ${item.section} zák. č. ${item.law} Sb.** — ${oneLine(item.why)}\n` +
        `  \n  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________\n`,
    ),
  ].join('\n')
}

/** Builds the whole packet as Markdown. */
export function buildLawyerReviewPacket(): string {
  const profilesWithHard = ALL_PROFILES.filter((p) => hardRules(p).length > 0)
  const profilesWithInapplicable = ALL_PROFILES.filter((p) => (p.inapplicable ?? []).length > 0)
  const hardCount =
    hardRules(COMMON_PROFILE).length +
    ALL_PROFILES.reduce((total, p) => total + hardRules(p).length, 0)

  return `# Právo365 — podklad pro právní revizi

> **Interní pracovní dokument. Není určen k publikaci.**
>
> Tento soubor se generuje z kódu aplikace, takže vždy odpovídá tomu, co
> aplikace skutečně tvrdí. Needitujte jej ručně — změny se přepíšou.

## Co od revize potřebujeme

Aplikace připravuje návrhy smluv podle českého práva a kontroluje existující
dokumenty. Neposkytuje právní poradenství a u každého výstupu uvádí, že jde
o pracovní návrh ke kontrole advokátem.

Potřebujeme ověřit **jediné**: že právní tvrzení, která aplikace používá, jsou
správná. Nejde o revizi kódu ani o posouzení konkrétní smlouvy.

**Jak dokument označkovat:** u každé položky je pole *Souhlasí?*. Stačí
zaškrtnout, nebo napsat opravu. Není třeba psát rozbor — postačí správné znění
a ustanovení.

## Jak je dokument seřazený

Podle toho, jak moc škodí chyba, ne podle struktury aplikace. Když dojde čas,
je lepší mít ověřenou část 1 než rozečtenou část 4.

| Část | Co obsahuje | Rozsah | Proč je tam, kde je |
|---|---|---|---|
| 1 | Zákonné hodnoty | ${ALL_LEGAL_FACTS.length} položek | Chyba se propíše do každého dokumentu, který aplikace kdy vytvořila |
| 2 | Tvrzení o neplatnosti | ${hardCount} pravidel | Tady říkáme uživateli, že něco je neplatné nebo nevzniklo |
| 3 | Ustanovení označená jako nepoužitelná | ${profilesWithInapplicable.length} typů | Tichá chyba — nesprávná položka nález nezpůsobí, ale POTLAČÍ |
| 4 | Tvrzení o překonaném právu | ${STALE_LAW_CLAIMS.length} tvrzení | Tvrdíme, že rozšířený výklad je zastaralý |

Doporučení a zvyklosti sepisování v dokumentu **nejsou**. Mohou být nesprávné,
aniž by tím někdo utrpěl, a nemá smysl na ně platit hodiny.

---

# Část 1 — Zákonné hodnoty

Nejlevnější a nejužitečnější krok. Jedna stránka čísel; každé z nich se dostane
do textu generovaných dokumentů i do kontrol.

| Hodnota | Ustanovení | Účinné od | Ověřeno námi | Poznámka | Souhlasí? |
|---|---|---|---|---|---|
${ALL_LEGAL_FACTS.map(
  ({ key, fact }) =>
    `| \`${key}\` = **${fact.value}** | ${fact.law} | ${fact.effectiveFrom} | ${fact.lastVerified} | ${fact.note ? oneLine(fact.note) : '—'} | ☐ ano ☐ oprava: |`,
).join('\n')}

**Zdroje, ze kterých jsme čerpali:**

${[...new Set(ALL_LEGAL_FACTS.map(({ fact }) => fact.source))].map((s) => `- ${s}`).join('\n')}

---

# Část 2 — Tvrzení o neplatnosti

Pravidla, kde aplikace uživateli říká, že ustanovení je **neplatné**, že se
k němu **nepřihlíží**, nebo že smlouva **nevznikla**. To jsou tvrzení, která
mění chování: uživatel kvůli nim smlouvu nepodepíše, nebo naopak podepíše
s klidem.

Pravidla, kde jde jen o riziko nebo doporučení, tu nejsou.

## Pravidla platná pro každou smlouvu

${hardRules(COMMON_PROFILE).map(renderRule).join('\n') || '_Žádná._'}

## Pravidla podle typu dokumentu

${profilesWithHard.map(renderProfile).join('\n')}

---

# Část 3 — Ustanovení označená jako nepoužitelná

Tohle je nejzrádnější část dokumentu a stojí za pozornost i tehdy, když na
zbytek nezbude čas.

U každého typu vedeme seznam ustanovení, která se na něj **nevztahují**.
Kontrola díky tomu nehlásí porušení paragrafů, které na daný dokument
nedopadají — dřív se stávalo, že u dohody o provedení práce vytkla porušení
§ 213 a § 51 zákoníku práce, tedy ustanovení správně citovaných a zcela
nepoužitelných.

Chyba v tomto seznamu se ale **neprojeví jako chybová hláška**. Projeví se tím,
že skutečnou vadu nikdo neuvidí.

${profilesWithInapplicable.map(renderInapplicable).join('\n')}

---

# Část 4 — Tvrzení o překonaném právu

Aplikace čte vygenerovaný text zpět a upozorňuje, obsahuje-li tvrzení, které
bylo správné dřív. U každého potřebujeme vědět, zda korekce sedí.

${STALE_LAW_CLAIMS.map(
  (claim) =>
    `**${claim.claim}**\n\n` +
    `Naše korekce: ${oneLine(claim.correction)}\n\n` +
    `Účinnost změny: ${claim.changedOn}\n\n` +
    `Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________\n`,
).join('\n')}

---

# Příloha — přehled typů dokumentů

Úplný seznam toho, co aplikace umí, s právním základem a datem, kdy jsme obsah
naposledy ověřovali proti znění zákona.

| Typ dokumentu | Právní základ | Ověřeno námi | Pravidel celkem | Z toho o neplatnosti |
|---|---|---|---|---|
${ALL_PROFILES.map(
  (p) =>
    `| ${p.label} | ${p.primaryLaw} | ${p.lastVerified} | ${p.rules.length} | ${hardRules(p).length} |`,
).join('\n')}

## Zdroje podle typu

${ALL_PROFILES.map((p) => `**${p.label}**\n${p.sources.map((s) => `- ${s}`).join('\n')}`).join('\n\n')}
`
}
