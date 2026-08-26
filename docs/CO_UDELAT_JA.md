# Co udělat ručně — návod krok za krokem

> Seznam věcí, které se **nedají udělat v kódu**. Řazeno podle poměru dopadu
> k času. Odškrtávejte přímo tady.
>
> Doména: `https://pravo365.cz` · Hosting: Vercel

---

## 1. Google Search Console — 30 minut, největší dopad

Bez tohoto Google web najde taky, ale pomaleji — a hlavně **neuvidíte, na co
rankujete**. To je jediný zdroj pravdy o tom, jestli SEO práce zabírá.

**Dobrá zpráva:** ověřovací token už je v kódu (`app/layout.tsx`, sekce
`verification.google`). Ověření by tedy mělo projít napoprvé.

### Postup

1. Otevřete <https://search.google.com/search-console>
2. Vlevo nahoře **Přidat službu** → zvolte **Předpona adresy URL** (ne doménu)
3. Vložte přesně `https://pravo365.cz` a dejte **Pokračovat**
4. V seznamu metod rozbalte **Značka HTML** — Google ukáže kód
   `<meta name="google-site-verification" content="…">`
5. **Porovnejte hodnotu `content` s tou v kódu.** Musí být stejná.
   - Sedí → klikněte **Ověřit**, hotovo
   - Nesedí → zkopírujte novou hodnotu a pošlete mi ji, přepíšu ji v kódu
     a po nasazení ověření zopakujte

### Odeslání sitemapy

6. V Search Console vlevo → **Sitemapy**
7. Do pole vepište `sitemap.xml` a dejte **Odeslat**
8. Do pár hodin až dnů se objeví stav **Úspěch** a počet nalezených adres —
   **mělo by jich být 40**

### Co sledovat a kdy

| Kdy | Kde | Co čekat |
|---|---|---|
| Za 2–3 dny | Sitemapy | Stav „Úspěch", 40 adres |
| Za 1–2 týdny | Indexování stránek | Stránky se přesouvají do „Indexováno" |
| Za 3–6 týdnů | Výsledky vyhledávání | První zobrazení, zatím bez proklikú |
| Za 2–4 měsíce | Výsledky vyhledávání | První pozice na dlouhé dotazy |

**Nepanikařte, když první měsíc nic není.** U nové domény v právním segmentu
je to normální. Panikařte, když po třech týdnech nebude nic v „Indexováno" —
to už je signál problému a řekněte mi to.

---

## 2. Bing Webmaster Tools — 10 minut

Bing má v Česku menší podíl, ale stojí za deset minut — a napájí i vyhledávání
v ChatGPT a Copilotu, což začíná být znát.

1. <https://www.bing.com/webmasters>
2. Přihlaste se a zvolte **Importovat z Google Search Console** — převezme
   ověření i sitemapu, takže krok 1 dělá práci dvakrát
3. Když import nepůjde: **Přidat web** → `https://pravo365.cz` → ověření
   metodou **XML file** nebo **Meta tag** (token pošlete mně, přidám ho)

---

## 3. Skutečná rychlost webu — 5 minut

V kódu jsme rychlost opravili naslepo, protože měření v sandboxu není
věrohodné. Tohle je první opravdové číslo.

1. Otevřete <https://pagespeed.web.dev>
2. Změřte postupně **tyhle tři adresy** — každá reprezentuje jiný typ stránky:
   - `https://pravo365.cz/cs` (domovská, nejvíc JavaScriptu)
   - `https://pravo365.cz/cs/vzory/reklamace-zbozi` (statická příručka)
   - `https://pravo365.cz/cs/generator` (aplikace s přihlášením)
3. U každé si přepněte na **Mobil** i **Počítač** — Google hodnotí mobil

### Co mi poslat

Screenshot nebo prostě čtyři čísla z každé stránky:

- **LCP** (Largest Contentful Paint) — cíl pod 2,5 s
- **CLS** (Cumulative Layout Shift) — cíl pod 0,1, měli bychom mít **0**
- **INP** (Interaction to Next Paint) — cíl pod 200 ms
- **Performance skóre** — celkové číslo nahoře

Podle nich pak mířím přesně, ne odhadem. **CLS by mělo být 0** — když nebude,
je to regrese a chci o ní vědět hned.

### Volitelně: měření od skutečných návštěvníků

PageSpeed měří laboratorně, jednou. **Vercel Speed Insights** měří reálné
návštěvníky průběžně, což je to, co Google skutečně hodnotí.

- Vercel → projekt → záložka **Speed Insights** → **Enable**
- Vyžaduje malý zásah v kódu (jeden balíček a jedna komponenta) — **řekněte
  mi, jestli to chcete, a doplním to.** Sám jsem to nepřidával, protože to
  znamená novou závislost a to je vaše rozhodnutí.

---

## 4. Právník — co poslat a co si vyžádat

### Co poslat

Jediný soubor: **`docs/PRAVNI_REVIZE_PODKLAD.md`**

Generuje se z kódu, takže vždy odpovídá tomu, co aplikace skutečně tvrdí.
Když ho otevřete v Wordu nebo si ho vytisknete, dá se do něj psát rovnou.

### Co napsat do e-mailu

> Dobrý den,
>
> provozuji nástroj, který připravuje návrhy smluv podle českého práva
> a orientačně kontroluje existující dokumenty. Nejde o právní poradenství
> a u každého výstupu to výslovně uvádíme.
>
> Potřebuji ověřit jedinou věc: **zda jsou právní tvrzení, která nástroj
> používá, správná.** Není to revize kódu ani posouzení konkrétní smlouvy.
>
> Přikládám podklad. Je seřazený podle toho, jak moc škodí případná chyba,
> takže má smysl i tehdy, když projdete jen jeho část. U každé položky je
> pole „Souhlasí?" — stačí zaškrtnout nebo napsat opravu, rozbor nepotřebuji.
>
> Zajímalo by mě:
> 1. cena za **část 1** samotnou (12 zákonných hodnot, jedna strana),
> 2. cena za **části 1–3** dohromady,
> 3. odhad času.
>
> Děkuji

### Proč zrovna takhle

- **Část 1 zvlášť** je záměr. Je to jedna strana čísel a chyba v ní se
  propíše do každého dokumentu, který nástroj kdy vytvořil. Když bude cena
  za celek moc vysoká, tohle je nejlevnější krok, který má smysl sám o sobě.
- **Nechceme rozbor.** Právníci píší rozbory, protože se tak účtuje —
  ale nám stačí „ano" nebo „správně je X podle § Y". Řekněte to rovnou,
  ušetří to obě strany.
- **Nedávejte mu kód.** Podklad je celý obsah; kód by jen prodražil hodiny.

### Kde právníka hledat

- Advokát se zaměřením na **smluvní právo a IT** — ne generalista
- Česká advokátní komora má vyhledávač: <https://vyhledavac.cak.cz>
- Reálný odhad: **5 000–15 000 Kč** za části 1–3. Když někdo řekne 50 000,
  nabízí rozbor, ne to, o co žádáme.

### Až přijde odpověď

Pošlete mi ji. Opravy zapíšu do profilů, podklad se pregeneruje sám
a testy chytí, kdyby se něco rozešlo.

---

## 5. Zpětné odkazy — jediná část, kterou technika nenahradí

Tohle je dlouhodobé a nedá se to obejít. Co v českém právním segmentu
skutečně funguje:

1. **Firemní zápisy** — Google Business Profile, Firmy.cz, Živéfirmy.
   Zabere hodinu, jednorázově.
2. **Odborné weby a fóra** — odpovídat na dotazy tam, kde se ptají
   (podnikatelské skupiny, fóra pro OSVČ), a odkázat na konkrétní příručku,
   která na otázku odpovídá. **Ne spam** — odkaz musí být užitečný sám o sobě.
   Na to máme 24 příruček a 5 porovnání.
3. **Spolupráce s účetními a HR** — mají klienty se stejnými otázkami
   a odkaz od nich váží víc než deset katalogových.

**Co nedělat:** nakoupené odkazy, výměnné sítě, katalogy s tisícem odkazů.
Google to pozná a v regulovaném segmentu (peníze, právo, zdraví) je na to
citlivější než kdekoli jinde.

---

## 6. Ještě to hlavní — otestujte kontrolu na skutečné smlouvě

Nejde o SEO, ale je to nejcennější zpětná vazba, kterou můžete dát.

Vezměte **skutečnou smlouvu, kterou nevygeneroval tenhle nástroj** — nájemní
smlouvu, kterou jste podepsal, fakturu s obchodními podmínkami, cokoli —
a proženěte ji kontrolou. Ideálně i vyfoťte papír a nahrajte fotku.

Pak mi pošlete **text i výstup kontroly**. Přesně takhle se našly ty
nejzávažnější chyby: OCR, které si vymýšlelo klauzule, i kontrola, která
u DPP citovala paragrafy platné jen pro pracovní poměr. Vygenerované smlouvy
tohle neodhalí — ty jsou příliš čisté.

---

## Pořadí, kdybyste měl jen jedno odpoledne

1. Search Console + sitemapa (30 min) — bez toho neuvidíte nic
2. PageSpeed na třech adresách (5 min) — a pošlete čísla
3. Test kontroly na skutečné smlouvě (15 min) — nejcennější zpětná vazba
4. E-mail právníkovi (10 min) — běží pak bez vás

Bing a zpětné odkazy počkají.
