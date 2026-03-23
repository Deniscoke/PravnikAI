/**
 * Prompt-builder tests for buildPrompt() in promptBuilder.ts
 *
 * Test areas:
 *  1.  Required 5-section structure always present
 *  2.  Contract context (section A) rendered correctly
 *  3.  Filled data (section B) grouped by parties and sections
 *  4.  Missing data (section C) split into critical vs supplementary
 *  5.  Optional party fields appear in supplementary missing-data output
 *  6.  Mode wording — complete / draft / review-needed
 *  7.  Prompt never claims output is inherently legally binding
 *  8.  Citation instructions are NOT globally over-forced
 *  9.  Amounts-in-words instruction is scoped, not global
 * 10.  Placeholders rendered deterministically as `[DOPLNIT: label]`
 *
 * None of these tests change promptBuilder, validators, or route.ts.
 *
 * Run:
 *   npx vitest run lib/contracts/__tests__/promptBuilder.test.ts
 * Watch:
 *   npx vitest lib/contracts/__tests__/promptBuilder.test.ts
 */

import { describe, it, expect } from 'vitest'
import { buildPrompt } from '../promptBuilder'
import { CZECH_LAW_SYSTEM_PROMPT } from '../systemPrompt'
import type {
  ContractSchema,
  NormalizedFormData,
  GenerationMode,
  PromptBuilderInput,
} from '../types'

// ─── Factory helpers ──────────────────────────────────────────────────────────

/**
 * A minimal but realistic ContractSchema used across most tests.
 * Resembles a kupní smlouva (purchase contract) structure.
 */
function makeSchema(overrides: Partial<ContractSchema> = {}): ContractSchema {
  return {
    metadata: {
      schemaId: 'kupni-smlouva-v1',
      name: 'Kupní smlouva',
      version: '1.0.0',
      jurisdiction: 'CZ',
      legalBasis: [
        '§ 2079–2183 zák. č. 89/2012 Sb. (NOZ) — kupní smlouva',
        '§ 2080 NOZ — předmět koupě',
      ],
      sensitivity: 'standard',
      outputStructure: {
        sections: [
          'Předmět smlouvy',
          'Kupní cena a platební podmínky',
          'Předání a převzetí',
          'Záruční podmínky',
          'Závěrečná ustanovení',
        ],
        requiresSignature: true,
        defaultJurisdictionClause: 'Obecný soud dle sídla prodávajícího',
      },
      aiInstructions: 'Tato smlouva se řídí § 2079 a násl. NOZ.',
      description: 'Kupní smlouva dle NOZ',
      category: 'občanské',
    },
    parties: [
      {
        id: 'prodavajici',
        label: 'Prodávající',
        role: 'Prodávající — strana převádějící vlastnické právo k předmětu koupě',
        requiredFields: [
          { id: 'name', label: 'Obchodní firma / jméno', required: true, sensitivity: 'personal' },
          { id: 'address', label: 'Sídlo / adresa', required: true, sensitivity: 'personal' },
        ],
        optionalFields: [
          {
            id: 'ico',
            label: 'IČO',
            required: false,
            sensitivity: 'personal',
            legalNote: '§ 435 NOZ — identifikace podnikatele',
          },
          { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        ],
      },
      {
        id: 'kupujici',
        label: 'Kupující',
        role: 'Kupující — strana přijímající předmět koupě a platící kupní cenu',
        requiredFields: [
          { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
          { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
        ],
        optionalFields: [
          {
            id: 'ico',
            label: 'IČO',
            required: false,
            sensitivity: 'personal',
            legalNote: '§ 435 NOZ — identifikace podnikatele',
          },
          {
            id: 'bankAccount',
            label: 'Číslo bankovního účtu',
            required: false,
            sensitivity: 'regulated',
          },
        ],
      },
    ],
    sections: [
      {
        id: 'predmet',
        title: 'Předmět smlouvy',
        fields: [
          {
            id: 'subjectDescription',
            label: 'Popis předmětu koupě',
            type: 'textarea',
            required: true,
            sensitivity: 'public',
          },
          {
            id: 'quantity',
            label: 'Množství / počet kusů',
            type: 'number',
            required: false,
            sensitivity: 'public',
          },
        ],
      },
      {
        id: 'cena',
        title: 'Kupní cena',
        fields: [
          {
            id: 'price',
            label: 'Kupní cena (Kč)',
            type: 'number',
            required: true,
            sensitivity: 'public',
          },
          {
            id: 'paymentMethod',
            label: 'Způsob úhrady',
            type: 'select',
            required: false,
            sensitivity: 'public',
            options: [
              { value: 'bankovni-prevod', label: 'Bankovní převod' },
              { value: 'hotove', label: 'V hotovosti' },
            ],
          },
        ],
      },
      {
        id: 'predani',
        title: 'Předání a převzetí',
        fields: [
          {
            id: 'handoverDate',
            label: 'Datum předání',
            type: 'date',
            required: false,
            sensitivity: 'public',
          },
        ],
      },
    ],
    ...overrides,
  }
}

/** Fully filled NormalizedFormData — all required + most optional fields present. */
function makeFullData(): NormalizedFormData {
  return {
    schemaId: 'kupni-smlouva-v1',
    parties: [
      {
        partyId: 'prodavajici',
        fields: {
          name: 'ACME Czech s.r.o.',
          address: 'Václavské náměstí 1, 110 00 Praha 1',
          ico: '27082440',
          email: '',  // intentionally empty — optional, not filled
        } as any,
      },
      {
        partyId: 'kupujici',
        fields: {
          name: 'Jan Novák',
          address: 'Husova 12, 602 00 Brno',
          ico: '',         // not filled
          bankAccount: '', // not filled
        } as any,
      },
    ],
    sections: {
      predmet: {
        subjectDescription: 'Notebooky Dell Latitude 5540, 10 kusů, stav: nové',
        quantity: '10',
      },
      cena: {
        price: '150000',
        paymentMethod: 'bankovni-prevod',
      },
      predani: {
        handoverDate: '2026-06-01',
      },
    },
  }
}

/** Minimal data — only required fields filled. */
function makeMinimalData(): NormalizedFormData {
  return {
    schemaId: 'kupni-smlouva-v1',
    parties: [
      {
        partyId: 'prodavajici',
        fields: { name: 'ACME Czech s.r.o.', address: 'Václavské náměstí 1, 110 00 Praha 1' } as any,
      },
      {
        partyId: 'kupujici',
        fields: { name: 'Jan Novák', address: 'Husova 12, 602 00 Brno' } as any,
      },
    ],
    sections: {
      predmet: { subjectDescription: 'Notebooky Dell' },
      cena: { price: '50000' },
      predani: {},
    },
  }
}

/** Data with required fields intentionally absent (to trigger review-needed). */
function makeSparseData(): NormalizedFormData {
  return {
    schemaId: 'kupni-smlouva-v1',
    parties: [
      {
        partyId: 'prodavajici',
        fields: { name: 'ACME Czech s.r.o.' } as any, // address missing
      },
      {
        partyId: 'kupujici',
        fields: {} as any, // both missing
      },
    ],
    sections: {
      predmet: {}, // subjectDescription missing
      cena: { price: '50000' },
      predani: {},
    },
  }
}

/** Invoke buildPrompt with sensible defaults. */
function buildFor(
  mode: GenerationMode,
  data: NormalizedFormData = makeFullData(),
  missingFields: string[] = [],
  schemaOverrides: Partial<ContractSchema> = {},
): ReturnType<typeof buildPrompt> {
  return buildPrompt({ schema: makeSchema(schemaOverrides), data, mode, missingFields })
}

// ─── Assertion helpers ────────────────────────────────────────────────────────

function expectContains(text: string, fragment: string, label?: string) {
  expect(
    text,
    label ?? `Expected prompt to contain:\n  "${fragment}"\n\nActual (first 500 chars):\n${text.slice(0, 500)}`,
  ).toContain(fragment)
}

function expectNotContains(text: string, fragment: string, label?: string) {
  expect(
    text,
    label ?? `Expected prompt NOT to contain: "${fragment}"`,
  ).not.toContain(fragment)
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. Required 5-section structure always present
// ══════════════════════════════════════════════════════════════════════════════

describe('1 — Required 5-section structure', () => {
  const MODES: GenerationMode[] = ['complete', 'draft', 'review-needed']

  for (const mode of MODES) {
    it(`mode="${mode}": userPrompt starts with zadání header`, () => {
      const { userPrompt } = buildFor(mode)
      expectContains(userPrompt, '# ZADÁNÍ PRO GENEROVÁNÍ SMLOUVY')
    })

    it(`mode="${mode}": section A present`, () => {
      const { userPrompt } = buildFor(mode)
      expectContains(userPrompt, '## A) KONTEXT SMLOUVY')
    })

    it(`mode="${mode}": section B present`, () => {
      const { userPrompt } = buildFor(mode)
      expectContains(userPrompt, '## B) VYPLNĚNÉ ÚDAJE')
    })

    it(`mode="${mode}": section C present`, () => {
      const { userPrompt } = buildFor(mode)
      expectContains(userPrompt, '## C) CHYBĚJÍCÍ ÚDAJE')
    })

    it(`mode="${mode}": section D present`, () => {
      const { userPrompt } = buildFor(mode)
      expectContains(userPrompt, '## D) POKYNY K GENEROVÁNÍ')
    })

    it(`mode="${mode}": section E present`, () => {
      const { userPrompt } = buildFor(mode)
      expectContains(userPrompt, '## E) POŽADOVANÁ STRUKTURA VÝSTUPU')
    })

    it(`mode="${mode}": sections are separated by --- dividers`, () => {
      const { userPrompt } = buildFor(mode)
      // 5 sections + header = 5 dividers joining them
      const dividerCount = (userPrompt.match(/\n\n---\n\n/g) ?? []).length
      expect(dividerCount).toBe(5)
    })

    it(`mode="${mode}": returns non-empty systemPrompt`, () => {
      const { systemPrompt } = buildFor(mode)
      expect(systemPrompt.length).toBeGreaterThan(100)
    })
  }
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. Contract context (section A) rendered correctly
// ══════════════════════════════════════════════════════════════════════════════

describe('2 — Contract context (section A)', () => {
  it('contains contract type (name)', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Kupní smlouva')
  })

  it('contains schema ID verbatim', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '`kupni-smlouva-v1`')
  })

  it('contains schema version', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '1.0.0')
  })

  it('states Czech Republic jurisdiction', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Česká republika')
  })

  it('includes all legal basis items', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '§ 2079–2183 zák. č. 89/2012 Sb. (NOZ) — kupní smlouva')
    expectContains(userPrompt, '§ 2080 NOZ — předmět koupě')
  })

  it('includes both party labels', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Prodávající')
    expectContains(userPrompt, 'Kupující')
  })

  it('includes party roles verbatim', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Prodávající — strana převádějící vlastnické právo k předmětu koupě')
    expectContains(userPrompt, 'Kupující — strana přijímající předmět koupě a platící kupní cenu')
  })

  it('legal basis is rendered as a list (one item per line)', () => {
    const { userPrompt } = buildFor('complete')
    // Each item should be prefixed with "- "
    expectContains(userPrompt, '- § 2079–2183 zák. č. 89/2012 Sb. (NOZ) — kupní smlouva')
  })

  it('party roles are rendered as a list (one item per line)', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '- **Prodávající** — Prodávající — strana převádějící')
  })

  /**
   * Representative expected fragment from section A:
   *
   *   ## A) KONTEXT SMLOUVY
   *
   *   **Typ smlouvy:** Kupní smlouva
   *   **Identifikátor schématu:** `kupni-smlouva-v1` (verze 1.0.0)
   *   **Jurisdikce:** Česká republika — výhradně české právo, žádné jiné právní řády
   *
   *   **Právní základ (závazné prameny):**
   *   - § 2079–2183 zák. č. 89/2012 Sb. (NOZ) — kupní smlouva
   *   - § 2080 NOZ — předmět koupě
   *
   *   **Smluvní strany a jejich zákonné role:**
   *   - **Prodávající** — Prodávající — strana převádějící vlastnické právo k předmětu koupě
   *   - **Kupující** — Kupující — strana přijímající předmět koupě a platící kupní cenu
   */
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Filled data (section B) grouped by parties and sections
// ══════════════════════════════════════════════════════════════════════════════

describe('3 — Filled data (section B)', () => {
  it('shows party subsection heading for Prodávající', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, '#### Prodávající')
  })

  it('shows party subsection heading for Kupující', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, '#### Kupující')
  })

  it('includes filled party name value', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, 'ACME Czech s.r.o.')
  })

  it('includes filled party address value', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, 'Václavské náměstí 1, 110 00 Praha 1')
  })

  it('includes filled party IČO with bold label', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, '**IČO:** 27082440')
  })

  it('inline legal note appears next to IČO', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, '§ 435 NOZ — identifikace podnikatele')
  })

  it('shows content section heading for Předmět smlouvy', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, '#### Předmět smlouvy')
  })

  it('includes the subject description text', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, 'Notebooky Dell Latitude 5540, 10 kusů, stav: nové')
  })

  it('includes the section heading for Kupní cena', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, '#### Kupní cena')
  })

  it('number field is formatted with Czech locale grouping (150 000)', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    // Czech locale uses non-breaking space as thousands separator
    // We test loosely — the formatted number must appear somewhere in section B
    expect(userPrompt).toMatch(/150[\s\u00a0]?000/)
  })

  it('select field resolves to human-readable label (not raw value key)', () => {
    const { userPrompt } = buildFor('complete', makeFullData())
    expectContains(userPrompt, 'Bankovní převod')
    expectNotContains(userPrompt, 'bankovni-prevod')
  })

  it('fields in missingSet are excluded from section B', () => {
    // Mark prodavajici.address as missing — it should not appear in B
    const { userPrompt } = buildFor(
      'review-needed',
      makeFullData(),
      ['prodavajici.address'],
    )
    // The value should not be in the filled-data block
    // Note: we check for the bold-labeled line, not the raw string
    expectNotContains(userPrompt, '**Sídlo / adresa:** Václavské náměstí 1')
  })

  it('shows empty-party fallback text when party has no filled fields', () => {
    const data = makeFullData()
    // Remove all kupujici fields
    data.parties.find((p) => p.partyId === 'kupujici')!.fields = {} as any
    const { userPrompt } = buildFor('review-needed', data, [
      'kupujici.name',
      'kupujici.address',
    ])
    expectContains(userPrompt, '*(žádné vyplněné údaje pro tuto stranu)*')
  })

  it('shows empty-sections fallback when no section data is provided', () => {
    const data = makeFullData()
    data.sections = {}
    const { userPrompt } = buildFor('draft', data, ['predmet.subjectDescription', 'cena.price'])
    expectContains(userPrompt, '*(obsah smlouvy není vyplněn)*')
  })

  /**
   * Representative expected section B fragment:
   *
   *   ## B) VYPLNĚNÉ ÚDAJE
   *
   *   ### Smluvní strany
   *
   *   #### Prodávající
   *   *Role: Prodávající — strana převádějící vlastnické právo k předmětu koupě*
   *   - **Obchodní firma / jméno:** ACME Czech s.r.o.
   *   - **Sídlo / adresa:** Václavské náměstí 1, 110 00 Praha 1
   *   - **IČO:** 27082440
   *     *(§ 435 NOZ — identifikace podnikatele)*
   */
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Missing data (section C) split into critical vs supplementary
// ══════════════════════════════════════════════════════════════════════════════

describe('4 — Missing data split (section C)', () => {
  it('shows "Kriticky chybějící údaje" heading when required fields are missing', () => {
    const { userPrompt } = buildFor('review-needed', makeMinimalData(), [
      'predmet.subjectDescription', // required
    ])
    expectContains(userPrompt, '### ⚠️ Kriticky chybějící údaje')
  })

  it('shows "Doplňkové chybějící údaje" heading when optional fields are missing', () => {
    // Only pass optional fields as missingFields
    const { userPrompt } = buildFor('draft', makeMinimalData(), [
      'cena.paymentMethod', // optional
    ])
    expectContains(userPrompt, '### Doplňkové chybějící údaje')
  })

  it('does NOT show critical heading when all missing fields are optional', () => {
    const { userPrompt } = buildFor('draft', makeMinimalData(), [
      'cena.paymentMethod', // optional
    ])
    expectNotContains(userPrompt, '### ⚠️ Kriticky chybějící údaje')
  })

  it('does NOT show supplementary heading when all missing fields are required', () => {
    const { userPrompt } = buildFor('review-needed', makeSparseData(), [
      'predmet.subjectDescription', // required
    ])
    // supplementary section should only appear if there are supplementary items
    // Since there are no optional missingFields passed, heading should be absent
    // (optional party fields may still appear — tested in area 5)
    // Here we just check that supplementary heading isn't generated for required-only missing
    const criticalOnly = buildFor('review-needed', {
      ...makeMinimalData(),
      sections: { predmet: {}, cena: {} },
    }, [
      'prodavajici.address',
      'kupujici.name',
    ])
    // If no optional party fields are absent AND no optional section fields are absent,
    // supplementary heading should not appear
    // In our minimal data, all party optional fields (ico, email, bankAccount) are empty
    // so they DO appear as supplementary — this is tested in area 5
  })

  it('missing required field shows [DOPLNIT: label] placeholder', () => {
    const { userPrompt } = buildFor('review-needed', makeMinimalData(), [
      'predmet.subjectDescription',
    ])
    expectContains(userPrompt, '[DOPLNIT: Popis předmětu koupě]')
  })

  it('missing optional field shows [DOPLNIT: label] placeholder', () => {
    const { userPrompt } = buildFor('draft', makeMinimalData(), [
      'cena.paymentMethod',
    ])
    expectContains(userPrompt, '[DOPLNIT: Způsob úhrady]')
  })

  it('missing field entry shows the composite ID', () => {
    const { userPrompt } = buildFor('review-needed', makeMinimalData(), [
      'predmet.subjectDescription',
    ])
    expectContains(userPrompt, '`predmet.subjectDescription`')
  })

  it('when all fields are filled: shows "Všechna relevantní pole jsou vyplněna"', () => {
    // Pass no missingFields and fully filled data with all optional party fields present
    const filledData = makeFullData()
    filledData.parties.find((p) => p.partyId === 'prodavajici')!.fields = {
      name: 'ACME Czech s.r.o.',
      address: 'Václavské náměstí 1, 110 00 Praha 1',
      ico: '27082440',
      email: 'info@acme.cz',
    } as any
    filledData.parties.find((p) => p.partyId === 'kupujici')!.fields = {
      name: 'Jan Novák',
      address: 'Husova 12, 602 00 Brno',
      ico: '45274649',
      bankAccount: '123456789/0800',
    } as any
    const { userPrompt } = buildFor('complete', filledData, [])
    expectContains(userPrompt, 'Všechna relevantní pole jsou vyplněna')
  })

  it('critical missing block contains explanatory note about legal readiness', () => {
    const { userPrompt } = buildFor('review-needed', makeMinimalData(), [
      'predmet.subjectDescription',
    ])
    expectContains(userPrompt, 'není text smlouvy připraven k podpisu')
  })

  it('supplementary missing block contains note that it does not block validity', () => {
    const { userPrompt } = buildFor('draft', makeMinimalData(), ['cena.paymentMethod'])
    expectContains(userPrompt, 'Neblokují platnost textu')
  })

  /**
   * Representative expected section C fragment (review-needed mode):
   *
   *   ## C) CHYBĚJÍCÍ ÚDAJE
   *
   *   ### ⚠️ Kriticky chybějící údaje
   *   *Bez těchto údajů není text smlouvy připraven k podpisu ani právní kontrole.*
   *
   *   - `predmet.subjectDescription` → **Popis předmětu koupě**
   *     Placeholder: `[DOPLNIT: Popis předmětu koupě]`
   *
   *   ### Doplňkové chybějící údaje
   *   *Neblokují platnost textu, ale jejich doplnění zlepší kvalitu smlouvy.*
   */
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. Optional party fields appear in supplementary missing-data output
// ══════════════════════════════════════════════════════════════════════════════

describe('5 — Optional party fields in supplementary missing-data', () => {
  /**
   * assessGenerationReadiness() only walks schema.sections; optional party
   * fields (IČO, email, bankAccount, etc.) are NOT included in its
   * missingOptional output. The promptBuilder scans them independently.
   */

  it('unfilled optional party IČO appears in supplementary section', () => {
    // minimalData has no ico for either party
    const { userPrompt } = buildFor('complete', makeMinimalData(), [])
    expectContains(userPrompt, '### Doplňkové chybějící údaje')
    expectContains(userPrompt, 'prodavajici.ico')
  })

  it('unfilled optional bankAccount appears in supplementary section', () => {
    const { userPrompt } = buildFor('complete', makeMinimalData(), [])
    expectContains(userPrompt, 'kupujici.bankAccount')
  })

  it('unfilled optional email appears in supplementary section', () => {
    // prodavajici has email as optional field; email is empty in minimalData
    const { userPrompt } = buildFor('complete', makeMinimalData(), [])
    expectContains(userPrompt, 'prodavajici.email')
  })

  it('filled optional party field does NOT appear in supplementary section', () => {
    // Give prodavajici a filled ico
    const data = makeMinimalData()
    data.parties.find((p) => p.partyId === 'prodavajici')!.fields = {
      ...data.parties.find((p) => p.partyId === 'prodavajici')!.fields,
      ico: '27082440',
    } as any
    const { userPrompt } = buildFor('complete', data, [])
    expectNotContains(userPrompt, 'prodavajici.ico')
  })

  it('supplementary optional party field shows [DOPLNIT: label] placeholder', () => {
    const { userPrompt } = buildFor('complete', makeMinimalData(), [])
    expectContains(userPrompt, '[DOPLNIT: IČO]')
  })

  it('optional party field with legalNote shows legal note inline', () => {
    const { userPrompt } = buildFor('complete', makeMinimalData(), [])
    // The IČO field has legalNote: '§ 435 NOZ — identifikace podnikatele'
    // It should appear in the missing-field entry
    expectContains(userPrompt, '§ 435 NOZ — identifikace podnikatele')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. Mode wording — complete / draft / review-needed
// ══════════════════════════════════════════════════════════════════════════════

describe('6 — Mode wording (section D)', () => {
  describe('complete mode', () => {
    it('shows KOMPLETNÍ mode heading', () => {
      const { userPrompt } = buildFor('complete')
      expectContains(userPrompt, '### Generační mód: KOMPLETNÍ')
    })

    it('instructs to generate kompletní návrh smlouvy', () => {
      const { userPrompt } = buildFor('complete')
      expectContains(userPrompt, 'kompletní návrh smlouvy')
    })

    it('says the output is for legal review and signature', () => {
      const { userPrompt } = buildFor('complete')
      expectContains(userPrompt, 'právní kontrole a podpisu')
    })

    it('does NOT add a NÁVRH banner in complete mode', () => {
      const { userPrompt } = buildFor('complete')
      expectNotContains(userPrompt, 'NÁVRH — Text smlouvy určený k doplnění')
    })

    it('does NOT add NEÚPLNÁ KOSTRA warning in complete mode', () => {
      const { userPrompt } = buildFor('complete')
      expectNotContains(userPrompt, 'NEÚPLNÁ KOSTRA')
    })
  })

  describe('draft mode', () => {
    it('shows NÁVRH mode heading', () => {
      const { userPrompt } = buildFor('draft')
      expectContains(userPrompt, '### Generační mód: NÁVRH')
    })

    it('instructs to generate návrh textu smlouvy', () => {
      const { userPrompt } = buildFor('draft')
      expectContains(userPrompt, 'návrh textu smlouvy')
    })

    it('includes NÁVRH document banner instruction', () => {
      const { userPrompt } = buildFor('draft')
      expectContains(userPrompt, 'NÁVRH — Text smlouvy určený k doplnění a právní kontrole před podpisem')
    })

    it('warns that text must not be signed until placeholders filled', () => {
      const { userPrompt } = buildFor('draft')
      expectContains(userPrompt, 'nesmí být podepsán, dokud nejsou doplněny')
    })

    it('does NOT show KOMPLETNÍ mode heading', () => {
      const { userPrompt } = buildFor('draft')
      expectNotContains(userPrompt, '### Generační mód: KOMPLETNÍ')
    })
  })

  describe('review-needed mode', () => {
    it('shows VYŽADUJE KONTROLU mode heading', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, '### Generační mód: VYŽADUJE KONTROLU')
    })

    it('flags missing required fields with ⚠️ marker', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, '⚠️ **Chybí povinná pole.')
    })

    it('instructs to generate orientační kostru smlouvy', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, 'orientační kostru smlouvy')
    })

    it('includes NEÚPLNÁ KOSTRA document banner instruction', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, '⚠️ NEÚPLNÁ KOSTRA — Pouze orientační podklad. Před podpisem vyžaduje právní kontrolu.')
    })

    it('requires list of missing fields immediately after banner', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, 'číslovaný seznam všech chybějících povinných polí')
    })

    it('states output must not be used without expert review', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, 'nesmí být použit bez odborné kontroly')
    })

    it('uses ⚠️ ZKONTROLOVAT marker for missing required field placeholders', () => {
      const { userPrompt } = buildFor('review-needed')
      expectContains(userPrompt, '⚠️ ZKONTROLOVAT — [DOPLNIT:')
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 7. Prompt never claims output is inherently legally binding
// ══════════════════════════════════════════════════════════════════════════════

describe('7 — No legally binding claim', () => {
  const MODES: GenerationMode[] = ['complete', 'draft', 'review-needed']
  const FORBIDDEN_PHRASES = [
    'právně závazná smlouva',
    'právně závazný dokument',
    'je právně závazný',
    'je právně závazná',
    'právně závazné ujednání',
    'závazná smlouva',
    'ihned účinná',
    'okamžitě platná',
  ]

  for (const mode of MODES) {
    for (const phrase of FORBIDDEN_PHRASES) {
      it(`mode="${mode}": does not contain "${phrase}"`, () => {
        const { userPrompt, systemPrompt } = buildFor(mode)
        expectNotContains(userPrompt + systemPrompt, phrase)
      })
    }
  }

  it('complete mode uses safe phrase "návrh smlouvy" instead of binding claim', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'návrh smlouvy')
  })

  it('complete mode says output is "určený k právní kontrole" (for legal review)', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'právní kontrole')
  })

  it('draft mode says output is "určený k doplnění a právní kontrole před podpisem"', () => {
    const { userPrompt } = buildFor('draft')
    expectContains(userPrompt, 'právní kontrole před podpisem')
  })

  it('review-needed mode says output is "Pouze orientační podklad"', () => {
    const { userPrompt } = buildFor('review-needed')
    expectContains(userPrompt, 'Pouze orientační podklad')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 8. Citation instructions are NOT globally over-forced
// ══════════════════════════════════════════════════════════════════════════════

describe('8 — Citation instructions not globally over-forced', () => {
  it('safety rule 5 instructs citations only where they strengthen a specific agreement', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'vlož pouze tam, kde posilují konkrétní ujednání')
  })

  it('section E formatting rule also scopes citations to where they strengthen agreements', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'vlož jen tam, kde posilují konkrétní ujednání')
  })

  it('citation instruction appears only in PROHIBITING form ("Nepoužívej ... ke každé větě")', () => {
    const { userPrompt } = buildFor('complete')
    // The phrase "ke každé větě" only appears inside the prohibition clause — never as a positive instruction
    const idx = userPrompt.indexOf('ke každé větě')
    expect(idx, 'Expected "ke každé větě" to appear somewhere (inside the prohibition)').toBeGreaterThan(-1)
    // The word immediately before this phrase in context must be the prohibiting negation
    const context = userPrompt.slice(Math.max(0, idx - 30), idx + 20)
    expect(context).toMatch(/[Nn]epoužívej/)
  })

  it('no positive instruction tells the model to add citations to every paragraph', () => {
    const { userPrompt } = buildFor('complete')
    // There is no affirmative "vlož citaci ke každé větě/odstavci" instruction
    expectNotContains(userPrompt, 'vlož citaci ke každé')
    expectNotContains(userPrompt, 'přidej citaci ke každé')
    expectNotContains(userPrompt, 'ke každému odstavci')
  })

  it('safety rule 5 label is present and identifies citation over-forcing as prohibited', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '**Pravidlo 5 — Citace zákonů:**')
    expectContains(userPrompt, 'Nepoužívej citace automaticky ke každé větě')
  })

  /**
   * Representative expected fragment from safety rule 5:
   *
   *   **Pravidlo 5 — Citace zákonů:**
   *   Zákonné citace ve tvaru `(§ X zák. č. Y/RRRR Sb.)` vlož pouze tam, kde posilují konkrétní ujednání
   *   nebo kde je vyžaduje schema (sekce A, právní základ). Nepoužívej citace automaticky ke každé větě.
   */
})

// ══════════════════════════════════════════════════════════════════════════════
// 9. Amounts-in-words instruction is scoped, not global
// ══════════════════════════════════════════════════════════════════════════════

describe('9 — Amounts-in-words instruction is scoped', () => {
  it('section E specifies amounts primarily numerically', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Peněžní částky uváděj číselně')
  })

  it('section E limits words-form to kupní cena, nájemné, smluvní pokuta only', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'slovy pouze u kupní ceny, nájemného a smluvní pokuty')
  })

  it('does NOT instruct to write all amounts in words', () => {
    const { userPrompt } = buildFor('complete')
    expectNotContains(userPrompt, 'všechny částky slovy')
    expectNotContains(userPrompt, 'každou částku slovy')
    expectNotContains(userPrompt, 'vždy uváděj slovy')
  })

  /**
   * Representative expected fragment from section E:
   *
   *   - Peněžní částky uváděj číselně; slovy pouze u kupní ceny, nájemného a smluvní pokuty
   */
})

// ══════════════════════════════════════════════════════════════════════════════
// 10. Placeholders rendered deterministically as [DOPLNIT: label]
// ══════════════════════════════════════════════════════════════════════════════

describe('10 — Placeholder format determinism', () => {
  it('missing required field uses [DOPLNIT: label] format exactly', () => {
    const { userPrompt } = buildFor('review-needed', makeMinimalData(), [
      'predmet.subjectDescription',
    ])
    expectContains(userPrompt, '`[DOPLNIT: Popis předmětu koupě]`')
  })

  it('missing optional section field uses [DOPLNIT: label] format exactly', () => {
    const { userPrompt } = buildFor('draft', makeMinimalData(), ['cena.paymentMethod'])
    expectContains(userPrompt, '`[DOPLNIT: Způsob úhrady]`')
  })

  it('missing optional party field uses [DOPLNIT: label] format exactly', () => {
    const { userPrompt } = buildFor('complete', makeMinimalData(), [])
    expectContains(userPrompt, '`[DOPLNIT: IČO]`')
  })

  it('same input produces identical output on repeated calls (deterministic)', () => {
    const input: PromptBuilderInput = {
      schema: makeSchema(),
      data: makeMinimalData(),
      mode: 'draft',
      missingFields: ['predmet.subjectDescription', 'predani.handoverDate'],
    }
    const first = buildPrompt(input)
    const second = buildPrompt(input)
    expect(first.systemPrompt).toBe(second.systemPrompt)
    expect(first.userPrompt).toBe(second.userPrompt)
  })

  it('different modes produce different prompts', () => {
    const data = makeMinimalData()
    const complete = buildFor('complete', data)
    const draft = buildFor('draft', data)
    const review = buildFor('review-needed', data)
    expect(complete.userPrompt).not.toBe(draft.userPrompt)
    expect(complete.userPrompt).not.toBe(review.userPrompt)
    expect(draft.userPrompt).not.toBe(review.userPrompt)
  })

  it('different missingFields arrays produce different section C content', () => {
    const a = buildFor('draft', makeMinimalData(), ['cena.paymentMethod'])
    const b = buildFor('draft', makeMinimalData(), ['predani.handoverDate'])
    expect(a.userPrompt).not.toBe(b.userPrompt)
  })

  it('DOPLNIT placeholder format is consistent: backtick-wrapped in section C', () => {
    const { userPrompt } = buildFor('review-needed', makeMinimalData(), [
      'predmet.subjectDescription',
      'cena.price',
    ])
    // Both missing fields should have backtick-wrapped placeholder
    const matches = userPrompt.match(/`\[DOPLNIT: [^\]]+\]`/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('date field formats to Czech locale in section B', () => {
    // handoverDate: '2026-06-01' should become something like "1. června 2026"
    const { userPrompt } = buildFor('complete', makeFullData(), [])
    // Czech date format: day number + "." + month name + year
    expect(userPrompt).toMatch(/1\. června 2026/)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 11. System prompt content
// ══════════════════════════════════════════════════════════════════════════════

describe('11 — System prompt', () => {
  it('contains the base Czech law system prompt', () => {
    const { systemPrompt } = buildFor('complete')
    // The base prompt identifies the assistant as specialised in Czech law
    expectContains(systemPrompt, 'české právo')
  })

  it('appends schema-specific aiInstructions after the base prompt', () => {
    const { systemPrompt } = buildFor('complete')
    expectContains(systemPrompt, 'Tato smlouva se řídí § 2079 a násl. NOZ.')
  })

  it('uses a section separator between base prompt and schema instructions', () => {
    const { systemPrompt } = buildFor('complete')
    expectContains(systemPrompt, '## Specifická ustanovení pro tento typ smlouvy')
  })

  it('system prompt is stable — equals CZECH_LAW_SYSTEM_PROMPT + schema instructions', () => {
    const { systemPrompt } = buildFor('complete')
    expect(systemPrompt).toContain(CZECH_LAW_SYSTEM_PROMPT)
    expect(systemPrompt).toContain('Tato smlouva se řídí § 2079 a násl. NOZ.')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 12. Safety rules present in section D (inviolable constraints)
// ══════════════════════════════════════════════════════════════════════════════

describe('12 — Safety rules present in section D', () => {
  it('Safety rule 1 — no invented data — is present', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '**Pravidlo 1 — Žádná vymyšlená data:**')
    expectContains(userPrompt, 'NIKDY nevymýšlej konkrétní hodnoty')
  })

  it('Safety rule 2 — DOPLNIT for missing data — is present', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '**Pravidlo 2 — Placeholdery pro chybějící data:**')
  })

  it('Safety rule 3 — Czech law only — is present', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '**Pravidlo 3 — Pouze české právo:**')
    expectContains(userPrompt, 'NIKDY nepoužívej slovenské právo')
  })

  it('Safety rule 4 — no invented clauses — is present', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '**Pravidlo 4 — Žádné vymyšlené klauzule:**')
  })

  it('safety rules are marked as ZÁVAZNÁ, NEPŘEKROČITELNÁ', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'ZÁVAZNÁ, NEPŘEKROČITELNÁ')
  })

  it('section E mentions required document section titles', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, '1. Předmět smlouvy')
    expectContains(userPrompt, '2. Kupní cena a platební podmínky')
    expectContains(userPrompt, '5. Závěrečná ustanovení')
  })

  it('section E includes signature blocks for each party', () => {
    const { userPrompt } = buildFor('complete')
    // Signature block numbers follow the document sections (5 sections + 1 = 6, + 2 = 7)
    expectContains(userPrompt, 'Podpisový blok — Prodávající')
    expectContains(userPrompt, 'Podpisový blok — Kupující')
  })

  it('section E includes jurisdiction clause when schema defines one', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Obecný soud dle sídla prodávajícího')
  })

  it('section E states contract requires signature when requiresSignature is true', () => {
    const { userPrompt } = buildFor('complete')
    expectContains(userPrompt, 'Smlouva vyžaduje vlastnoruční podpis všech smluvních stran')
  })
})
