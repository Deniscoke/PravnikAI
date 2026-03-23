/**
 * Review Prompt Builder — PrávníkAI
 * Jurisdiction: Czech Republic (CZ) only
 *
 * Builds { systemPrompt, userPrompt } for AI-assisted contract review.
 * The LLM receives pasted contract text and returns structured risk analysis
 * as JSON matching ReviewContractResponse.
 *
 * Provider-agnostic — no LLM SDK coupling. Only lib/llm/openaiClient.ts
 * knows which provider is used.
 */

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ReviewPromptInput {
  contractText: string
  contractTypeHint?: string
}

export interface BuiltReviewPrompt {
  systemPrompt: string
  userPrompt: string
}

// ─── System prompt ────────────────────────────────────────────────────────────

const REVIEW_SYSTEM_PROMPT = `Jsi právní analytik specializovaný výhradně na české právo. Provádíš AI-asistovanou kontrolu smluvních dokumentů.

## Právní základ — závazné pořadí pramenů

1. Primárně vycházej z:
   - zákona č. 89/2012 Sb., občanský zákoník (NOZ)
   - zákona č. 262/2006 Sb., zákoník práce (ZP)
   - zákona č. 90/2012 Sb., o obchodních korporacích (ZOK)
   - zákona č. 634/1992 Sb., o ochraně spotřebitele
   - zákona č. 235/2004 Sb., o dani z přidané hodnoty

2. Při výkladu sporných ustanovení vycházej z judikatury:
   - Nejvyššího soudu ČR (NS ČR)
   - Ústavního soudu ČR (ÚS ČR)

3. Nezohledňuj slovenské právo, slovenské zákony, ani slovenské smluvní vzory.

## Tvoje role

Analyzuješ existující smluvní text a identifikuješ:
- Rizikové klauzule (nevyvážené, právně problematické, neobvyklé)
- Chybějící důležité klauzule (dle typu smlouvy a českého práva)
- Vyjednávací body (kde má strana prostor pro lepší podmínky)
- Celkovou úroveň rizika

## Pravidla analýzy

1. NIKDY neprezentuj právní jistotu tam, kde existuje nejistota.
2. Pokud je klauzule nejednoznačná, řekni to explicitně.
3. U každého rizika uveď, proč je problematické z pohledu českého práva.
4. Doporuč revizi klauzule, pokud je to možné — navrhni konkrétní alternativní znění.
5. Pokud smlouva vyžaduje kontrolu advokátem, jasně to uveď.
6. Nepoužívej obecné rady — buď konkrétní k danému textu.

## Formát výstupu

Vrať VÝHRADNĚ validní JSON objekt (bez markdown, bez komentářů) s touto strukturou:

{
  "overallRisk": "low" | "medium" | "high",
  "summary": "2-4 věty shrnující hlavní zjištění",
  "riskyClauses": [
    {
      "title": "Krátký název rizika",
      "severity": "low" | "medium" | "high",
      "explanation": "Vysvětlení proč je klauzule riziková dle českého práva",
      "suggestedRevision": "Navrhované alternativní znění (volitelné)"
    }
  ],
  "missingClauses": [
    {
      "title": "Co chybí",
      "reason": "Proč by to mělo být zahrnuto dle českého práva",
      "suggestedClause": "Navrhovaný text klauzule (volitelný)"
    }
  ],
  "negotiationFlags": ["Bod 1 pro vyjednávání", "Bod 2..."],
  "lawyerReviewRequired": true/false,
  "disclaimer": "Tato analýza je AI-asistovaná a neslouží jako právní poradenství...",
  "detectedContractType": "Typ smlouvy rozpoznaný z textu",
  "assumptions": ["Předpoklad 1", "Předpoklad 2"],
  "legalBasis": ["§ xxx zák. č. yy/yyyy Sb.", "..."],
  "reviewMode": "ai-assisted-review"
}`

// ─── User prompt builder ──────────────────────────────────────────────────────

export function buildReviewPrompt(input: ReviewPromptInput): BuiltReviewPrompt {
  const sections: string[] = []

  // Section A — Contract type context
  if (input.contractTypeHint) {
    sections.push(
      `## Typ smlouvy (uživatelem zadaný)\n\n` +
      `Uživatel označil tento dokument jako: **${input.contractTypeHint}**.\n` +
      `Ověř, zda text odpovídá tomuto typu. Pokud ne, uveď to v assumptions.`
    )
  } else {
    sections.push(
      `## Typ smlouvy\n\n` +
      `Uživatel neuvedl typ smlouvy. Urči typ z textu a uveď v poli "detectedContractType".`
    )
  }

  // Section B — Contract text
  sections.push(
    `## Text smlouvy k analýze\n\n` +
    `Analyzuj následující smluvní text výhradně z pohledu českého práva:\n\n` +
    `---\n${input.contractText}\n---`
  )

  // Section C — Analysis instructions
  sections.push(
    `## Instrukce pro analýzu\n\n` +
    `1. Identifikuj všechny rizikové klauzule — nevyvážené podmínky, neobvyklá ustanovení, ` +
    `chybějící ochranné mechanismy, potenciálně neplatná ustanovení dle NOZ.\n` +
    `2. Identifikuj chybějící klauzule, které by měly být v tomto typu smlouvy přítomny ` +
    `dle české smluvní praxe a zákonných požadavků.\n` +
    `3. Uveď konkrétní body, kde má slabší strana prostor pro vyjednávání lepších podmínek.\n` +
    `4. Urči celkovou úroveň rizika:\n` +
    `   - "low": Standardní smlouva, žádné výrazné problémy\n` +
    `   - "medium": Některé klauzule vyžadují pozornost nebo úpravu\n` +
    `   - "high": Závažné problémy — nedoporučuji podepsat bez právní kontroly\n` +
    `5. Vždy nastav "lawyerReviewRequired" na true, pokud overallRisk je "medium" nebo "high".\n` +
    `6. Do "disclaimer" vždy uveď: "Tato analýza byla provedena umělou inteligencí a neslouží ` +
    `jako právní poradenství ve smyslu zák. č. 85/1996 Sb., o advokacii. ` +
    `Před právním jednáním na základě této analýzy konzultujte advokáta."\n` +
    `7. Do "legalBasis" uveď všechna zákonná ustanovení, na která odkazuješ.\n` +
    `8. Do "reviewMode" vždy uveď "ai-assisted-review".`
  )

  // Section D — Safety constraints (last for recency weight)
  sections.push(
    `## Bezpečnostní pravidla (NEPORUŠITELNÁ)\n\n` +
    `1. Neupravuj, nepřepisuj ani negeneruj text smlouvy. Pouze analyzuj.\n` +
    `2. Nikdy neprezentuj domněnky jako fakta.\n` +
    `3. Pokud si nejsi jistý, uveď to v "assumptions".\n` +
    `4. Výhradně české právo — žádné slovenské, rakouské ani obecné EU právo.\n` +
    `5. Odpověz VÝHRADNĚ validním JSON objektem — žádný markdown, žádné komentáře.\n` +
    `6. Pokud text není smluvní dokument, vrať overallRisk "high" se summary vysvětlujícím problém.`
  )

  return {
    systemPrompt: REVIEW_SYSTEM_PROMPT,
    userPrompt: sections.join('\n\n'),
  }
}
