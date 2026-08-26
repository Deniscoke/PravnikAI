# Právo365 — podklad pro právní revizi

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
| 1 | Zákonné hodnoty | 12 položek | Chyba se propíše do každého dokumentu, který aplikace kdy vytvořila |
| 2 | Tvrzení o neplatnosti | 124 pravidel | Tady říkáme uživateli, že něco je neplatné nebo nevzniklo |
| 3 | Ustanovení označená jako nepoužitelná | 9 typů | Tichá chyba — nesprávná položka nález nezpůsobí, ale POTLAČÍ |
| 4 | Tvrzení o překonaném právu | 11 tvrzení | Tvrdíme, že rozšířený výklad je zastaralý |

Doporučení a zvyklosti sepisování v dokumentu **nejsou**. Mohou být nesprávné,
aniž by tím někdo utrpěl, a nemá smysl na ně platit hodiny.

---

# Část 1 — Zákonné hodnoty

Nejlevnější a nejužitečnější krok. Jedna stránka čísel; každé z nich se dostane
do textu generovaných dokumentů i do kontrol.

| Hodnota | Ustanovení | Účinné od | Ověřeno námi | Poznámka | Souhlasí? |
|---|---|---|---|---|---|
| `MINIMUM_MONTHLY_WAGE_CZK` = **22400** | § 111 zák. č. 262/2006 Sb. (zákoník práce) | 2026-01-01 | 2026-08-21 | Indexovaná hodnota — mění se každý leden. Zaručená mzda může být pro danou skupinu prací vyšší. | ☐ ano ☐ oprava: |
| `MINIMUM_HOURLY_WAGE_CZK` = **134.4** | § 111 zák. č. 262/2006 Sb.; sdělení MPSV č. 356/2025 Sb. | 2026-01-01 | 2026-08-22 | Odvozeno od měsíční minimální mzdy při 40hodinovém týdnu. Mění se každý leden spolu s ní. | ☐ ano ☐ oprava: |
| `PROBATION_MAX_MONTHS` = **4** | § 35 zák. č. 262/2006 Sb. | 2025-06-01 | 2026-08-21 | Nesmí přesáhnout polovinu sjednané doby trvání pracovního poměru. | ☐ ano ☐ oprava: |
| `PROBATION_MAX_MONTHS_MANAGER` = **8** | § 35 zák. č. 262/2006 Sb. | 2025-06-01 | 2026-08-21 | — | ☐ ano ☐ oprava: |
| `FIXED_TERM_MAX_YEARS` = **3** | § 39 odst. 2 zák. č. 262/2006 Sb. | 2012-01-01 | 2026-08-21 | Lze opakovat nejvýše dvakrát. | ☐ ano ☐ oprava: |
| `MIN_VACATION_WEEKS` = **4** | § 213 zák. č. 262/2006 Sb. | 2007-01-01 | 2026-08-21 | — | ☐ ano ☐ oprava: |
| `RENT_DEPOSIT_MAX_MULTIPLE` = **3** | § 2254 odst. 1 zák. č. 89/2012 Sb. | 2017-02-28 | 2026-08-26 | — | ☐ ano ☐ oprava: |
| `CASH_PAYMENT_LIMIT_CZK` = **270000** | zák. č. 254/2004 Sb., o omezení plateb v hotovosti | 2004-07-01 | 2026-08-21 | — | ☐ ano ☐ oprava: |
| `DEFAULT_INTEREST_SPREAD_POINTS` = **8** | § 2 odst. 1 nař. vl. č. 351/2013 Sb. | 2014-01-01 | 2026-08-23 | Sazba = repo sazba ČNB pro první den kalendářního pololetí, v němž došlo k prodlení, + 8 procentních bodů. Repo sazbu je nutné dohledat u ČNB — nikdy ji sem nezmrazuj. | ☐ ano ☐ oprava: |
| `LATE_PAYMENT_MIN_COSTS_CZK` = **1200** | § 3 nař. vl. č. 351/2013 Sb. | 2014-01-01 | 2026-08-23 | Jen u vzájemného závazku podnikatelů, popř. podnikatele a veřejného zadavatele. | ☐ ano ☐ oprava: |
| `ILLEGAL_WORK_FINE_MAX_CZK` = **10000000** | § 140 odst. 4 písm. f) zák. č. 435/2004 Sb. | 2012-01-01 | 2026-08-23 | Vedle pokuty lze uložit zákaz činnosti až na 2 roky a zveřejnění rozhodnutí. | ☐ ano ☐ oprava: |
| `ILLEGAL_WORK_FINE_MIN_CZK` = **50000** | § 140 odst. 4 písm. f) zák. č. 435/2004 Sb. | 2012-01-01 | 2026-08-23 | — | ☐ ano ☐ oprava: |

**Zdroje, ze kterých jsme čerpali:**

- https://mpsv.gov.cz/
- https://mpsv.gov.cz/minimalni-mzda
- zák. č. 120/2025 Sb. (flexinovela)
- https://www.zakonyprolidi.cz/cs/2006-262
- https://www.zakonyprolidi.cz/cs/2016-460 (bod 27)
- https://www.zakonyprolidi.cz/cs/2004-254
- https://www.zakonyprolidi.cz/cs/2013-351
- https://www.zakonyprolidi.cz/cs/2004-435

---

# Část 2 — Tvrzení o neplatnosti

Pravidla, kde aplikace uživateli říká, že ustanovení je **neplatné**, že se
k němu **nepřihlíží**, nebo že smlouva **nevznikla**. To jsou tvrzení, která
mění chování: uživatel kvůli nim smlouvu nepodepíše, nebo naopak podepíše
s klidem.

Pravidla, kde jde jen o riziko nebo doporučení, tu nejsou.

## Pravidla platná pro každou smlouvu

**§ 553 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Ujednání musí být určité a srozumitelné. Neurčité nebo nesrozumitelné ujednání je zdánlivé — právně neexistuje.

Ustanovení: § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 553 a § 435 zák. č. 89/2012 Sb.** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Smluvní strany musí být identifikovány nezaměnitelně: fyzická osoba jménem, datem narození nebo rodným číslem a bydlištěm; právnická osoba názvem, IČO a sídlem; podnikatel navíc IČO.

Ustanovení: § 553 a § 435 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 580 a § 588 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Neplatné je ujednání, které se příčí dobrým mravům, odporuje zákonu nebo zjevně narušuje veřejný pořádek.

Ustanovení: § 580 a § 588 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 1796 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Neplatná je smlouva, při níž někdo zneužije tísně, nezkušenosti, rozumové slabosti nebo lehkomyslnosti druhé strany a nechá si slíbit plnění v hrubém nepoměru.

Ustanovení: § 1796 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2898 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Nelze se předem vzdát práva na náhradu újmy způsobené úmyslně nebo z hrubé nedbalosti, ani újmy na přirozených právech člověka. U slabší strany nelze předem omezit ani vyloučit právo na náhradu jakékoli újmy.

Ustanovení: § 2898 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 1798–1801 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

V adhezní smlouvě (sepsané jednou stranou, druhá měla jen možnost přijmout) je neplatná doložka, kterou lze přečíst jen s obtížemi nebo je pro průměrného člověka nesrozumitelná, i doložka zvláště nevýhodná bez rozumného důvodu.

Ustanovení: § 1798–1801 zák. č. 89/2012 Sb.
Použije se jen když: Smlouva byla sepsána jednou stranou a druhá její obsah nemohla ovlivnit.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 1813 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Ve spotřebitelské smlouvě se nepřihlíží k ujednáním, která zakládají v rozporu s požadavkem přiměřenosti významnou nerovnováhu práv v neprospěch spotřebitele.

Ustanovení: § 1813 zák. č. 89/2012 Sb.
Použije se jen když: Jedna strana je spotřebitel a druhá podnikatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**zák. č. 216/1994 Sb. ve znění zák. č. 258/2016 Sb. (účinnost 1. 12. 2016)** — *NEPLATNÉ USTANOVENÍ*

Ve spotřebitelské smlouvě nelze sjednat rozhodčí doložku. Rozhodce lze ujednat až poté, co spor vznikl.

Ustanovení: zák. č. 216/1994 Sb. ve znění zák. č. 258/2016 Sb. (účinnost 1. 12. 2016)
Použije se jen když: Jedna strana je spotřebitel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________


## Pravidla podle typu dokumentu

### Kupní smlouva

Právní základ: § 2079–2183 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-21

**předmět koupě** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Předmět koupě musí být určen nezaměnitelně. U nemovitosti údaji z katastru (obec, katastrální území, číslo parcely, číslo jednotky, list vlastnictví); u vozidla VIN, SPZ, značkou, typem a rokem výroby; u ostatních věcí popisem, který je odliší od jiných věcí téhož druhu.

Ustanovení: § 2079 odst. 1 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**kupní cena** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Kupní cena musí být ujednána, nebo musí být ujednán alespoň způsob jejího určení. Uveď měnu a zda jde o cenu včetně DPH.

Ustanovení: § 2079 odst. 1 a § 2080 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 560 a § 561 odst. 2 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Smlouva o převodu nemovitosti vyžaduje písemnou formu a projevy vůle obou stran musí být na téže listině.

Ustanovení: § 560 a § 561 odst. 2 zák. č. 89/2012 Sb.
Použije se jen když: Předmětem koupě je nemovitá věc.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2161–2174b zák. č. 89/2012 Sb., ve znění zák. č. 374/2022 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Prodává-li podnikatel spotřebiteli, může kupující vytknout vadu, která se projeví do dvou let od převzetí. Projeví-li se vada do jednoho roku, má se za to, že věc byla vadná už při převzetí. Reklamaci je nutné vyřídit do 30 dnů. Práva z vadného plnění nelze spotřebiteli zkrátit.

Ustanovení: § 2161–2174b zák. č. 89/2012 Sb., ve znění zák. č. 374/2022 Sb.
Použije se jen když: Prodávající je podnikatel a kupující spotřebitel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Nájemní smlouva (byt)

Právní základ: § 2201–2234 (obecně) a § 2235–2301 (nájem bytu) zák. č. 89/2012 Sb.
Naposledy ověřeno námi: 2026-08-26

**§ 2235 odst. 1 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

K ujednáním, která zkracují práva nájemce podle ustanovení o nájmu bytu, se nepřihlíží. Tato ochrana platí bez ohledu na to, co strany podepsaly.

Ustanovení: § 2235 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2239 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

K ujednání ukládajícímu nájemci povinnost, která je vzhledem k okolnostem zjevně nepřiměřená, se nepřihlíží.

Ustanovení: § 2239 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**jistota (kauce)** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Jistota a právo na zaplacení smluvní pokuty nesmí V SOUHRNU přesáhnout 3násobek měsíčního nájemného. Sjednává-li se obojí, musí se do tohoto stropu vejít dohromady. Při skončení nájmu pronajímatel jistotu vrátí a nájemce má právo na úroky od jejího poskytnutí.

Ustanovení: § 2254 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**označení bytu** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Byt musí být určen nezaměnitelně — adresou, číslem bytu, podlažím, podlahovou plochou a popisem místností. Uveď i příslušenství (sklep, garážové stání) a vybavení.

Ustanovení: § 2235 odst. 1 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výše nájemného** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Nájemné musí být ujednáno pevnou částkou za měsíc. Uveď odděleně nájemné a zálohy na služby — jde o dvě různé platby s odlišným režimem.

Ustanovení: § 2235 odst. 1 a § 2246 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výpovědní podmínky** — *NEPLATNÉ USTANOVENÍ*

Pronajímatel může nájem bytu vypovědět jen z důvodů výslovně uvedených v zákoně, písemně, s uvedením důvodu a s poučením nájemce o právu vznést proti výpovědi námitky a navrhnout přezkoumání soudem. Výpovědní doba je tři měsíce.

Ustanovení: § 2288–2291 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2258 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Nájemce má právo chovat v bytě zvíře, nepůsobí-li chov pronajímateli nebo ostatním obyvatelům domu obtíže nepřiměřené poměrům v domě.

Ustanovení: § 2258 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2272 a § 2274 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Nájemce má právo přijímat v bytě návštěvy a přijmout do domácnosti kohokoli. Pronajímatel může jen požadovat, aby v bytě žil počet osob přiměřený jeho velikosti, a má právo vědět, kdo v bytě bydlí.

Ustanovení: § 2272 a § 2274 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2205 písm. c) a § 2219 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Pronajímatel nesmí do bytu vstupovat bez souhlasu nájemce s výjimkou případů hrozící škody. Nájemce má právo byt užívat nerušeně.

Ustanovení: § 2205 písm. c) a § 2219 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Pracovní smlouva

Právní základ: § 33–73 zák. č. 262/2006 Sb. (zákoník práce)
Naposledy ověřeno námi: 2026-08-21

**§ 4a, § 346b odst. 2 a § 346c zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Odchýlit se od zákoníku práce lze jen ve prospěch zaměstnance. Zaměstnanec se nemůže předem vzdát svých práv a zaměstnavatel na něj nesmí přenášet riziko z výkonu závislé práce.

Ustanovení: § 4a, § 346b odst. 2 a § 346c zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 34 odst. 2 a odst. 5 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Pracovní smlouva vyžaduje písemnou formu. Jedno vyhotovení musí zaměstnavatel vydat zaměstnanci.

Ustanovení: § 34 odst. 2 a odst. 5 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**druh práce** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Druh práce, který má zaměstnanec vykonávat.

Ustanovení: § 34 odst. 1 písm. a) zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**místo výkonu práce** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Místo nebo místa výkonu práce.

Ustanovení: § 34 odst. 1 písm. b) zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**den nástupu do práce** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Den nástupu do práce; tímto dnem pracovní poměr vzniká.

Ustanovení: § 34 odst. 1 písm. c) a § 36 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**mzda nebo plat** — *NEPLATNÉ USTANOVENÍ*

Mzda nesmí být nižší než minimální mzda, která od 2026-01-01 činí 22 400 Kč měsíčně. Pro řadu prací je závazná vyšší zaručená mzda podle skupiny prací.

Ustanovení: § 111 zák. č. 262/2006 Sb. (zákoník práce)

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 35 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Zkušební doba smí činit nejvýše 4 měsíce, u vedoucího zaměstnance 8 měsíců. Nesmí přesáhnout polovinu sjednané doby trvání pracovního poměru. Musí být sjednána písemně nejpozději v den nástupu a nelze ji dodatečně prodlužovat nad zákonné maximum.

Ustanovení: § 35 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výpovědní doba** — *NEPLATNÉ USTANOVENÍ*

Výpovědní doba činí nejméně dva měsíce, u výpovědi z důvodů podle § 52 písm. f) až h) jeden měsíc. Musí být stejná pro obě strany. Od 1. 6. 2025 běží ode dne doručení výpovědi, nikoli od prvního dne následujícího měsíce.

Ustanovení: § 51 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 50 a § 52 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Zaměstnavatel může dát výpověď jen z důvodů taxativně uvedených v § 52. Zaměstnanec může dát výpověď kdykoli i bez uvedení důvodu.

Ustanovení: § 50 a § 52 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 213 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Dovolená činí nejméně 4 týdny za kalendářní rok.

Ustanovení: § 213 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 79, § 93 a § 114 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Stanovená týdenní pracovní doba činí nejvýše 40 hodin. Práce přesčas nesmí v průměru překročit 8 hodin týdně a je-li mzda sjednána včetně přesčasů, jen do rozsahu 150 hodin ročně (u vedoucích 416 hodin).

Ustanovení: § 79, § 93 a § 114 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 310 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Konkurenční doložku lze sjednat nejdéle na jeden rok po skončení zaměstnání a jen za peněžité vyrovnání nejméně ve výši poloviny průměrného měsíčního výdělku za každý měsíc jejího trvání.

Ustanovení: § 310 zák. č. 262/2006 Sb.
Použije se jen když: Smlouva obsahuje zákaz konkurence po skončení pracovního poměru.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Smlouva o dílo

Právní základ: § 2586–2635 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-21

**předmět díla** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Dílo musí být vymezeno určitě — co má být zhotoveno, opraveno, upraveno nebo udržováno, v jakém rozsahu a jaké kvalitě. U stavby odkaž na projektovou dokumentaci nebo specifikaci a učiň ji přílohou smlouvy.

Ustanovení: § 2586 odst. 1 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**cena díla** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Podstatnou náležitostí je úplatnost — nikoli však konkrétní výše ceny. Cenu lze určit pevnou částkou, odkazem na rozpočet, nebo odhadem. Není-li ujednána vůbec, platí cena obvyklá za srovnatelné dílo.

Ustanovení: § 2586 odst. 2 a § 2610 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2615 odst. 2 a § 2161 a násl. zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Je-li objednatel spotřebitel a zhotovitel podnikatel, použijí se přiměřeně ustanovení o právech z vadného plnění při spotřebitelském prodeji a spotřebitelská práva nelze zkrátit.

Ustanovení: § 2615 odst. 2 a § 2161 a násl. zák. č. 89/2012 Sb.
Použije se jen když: Objednatel je spotřebitel a zhotovitel podnikatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Dohoda o mlčenlivosti (NDA)

Právní základ: § 1746 odst. 2 zák. č. 89/2012 Sb. (nepojmenovaná smlouva); § 504 a § 2985 tamtéž
Naposledy ověřeno námi: 2026-08-21

**definice důvěrných informací** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Důvěrné informace musí být vymezeny určitě — druhem, okruhem, nebo způsobem označení při předání. Musí být zjistitelné, co konkrétně mlčenlivosti podléhá.

Ustanovení: § 553 a § 1746 odst. 2 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2898 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Náhradu újmy způsobené úmyslně nebo z hrubé nedbalosti nelze předem vyloučit ani omezit; vůči slabší straně nelze předem omezit náhradu jakékoli újmy.

Ustanovení: § 2898 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 310 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Je-li zavázanou stranou zaměstnanec, nesmí NDA fakticky nahrazovat konkurenční doložku. Omezení výdělečné činnosti po skončení pracovního poměru je platné jen za podmínek § 310 zákoníku práce — nejvýše jeden rok a za peněžité vyrovnání.

Ustanovení: § 310 zák. č. 262/2006 Sb.
Použije se jen když: Zavázanou stranou je zaměstnanec.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Dohoda o provedení práce / o pracovní činnosti

Právní základ: § 74–77 zák. č. 262/2006 Sb. (zákoník práce)
Naposledy ověřeno námi: 2026-08-22

**§ 77 odst. 1 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Dohoda musí být uzavřena písemně. Jedno vyhotovení obdrží zaměstnanec.

Ustanovení: § 77 odst. 1 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**vymezení sjednané práce** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Musí být vymezen sjednaný pracovní úkol nebo druh práce, který má zaměstnanec vykonat.

Ustanovení: § 75 a § 76 odst. 1 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 75 a § 76 odst. 5 zák. č. 262/2006 Sb.** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Musí být uvedena doba, na kterou se dohoda uzavírá, nebo termín splnění pracovního úkolu.

Ustanovení: § 75 a § 76 odst. 5 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**odměna z dohody** — *NEPLATNÉ USTANOVENÍ*

Odměna z dohody nesmí být nižší než minimální mzda přepočtená na hodinu, která od 2026-01-01 činí 134,4 Kč za hodinu. Pro řadu prací je závazná vyšší zaručená mzda.

Ustanovení: § 111 zák. č. 262/2006 Sb.; sdělení MPSV č. 356/2025 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 257 odst. 2 ve spojení s § 4a a § 346b odst. 2 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Odpovědnost zaměstnance za škodu z nedbalosti je omezena čtyřapůlnásobkem jeho průměrného měsíčního výdělku. Tento strop nelze dohodou rozšířit ani nahradit obecnou odpovědností.

Ustanovení: § 257 odst. 2 ve spojení s § 4a a § 346b odst. 2 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 4a a § 346c zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

I u dohody platí, že odchýlit se od zákoníku práce lze jen ve prospěch zaměstnance a že se zaměstnanec nemůže předem vzdát svých práv.

Ustanovení: § 4a a § 346c zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 77 odst. 1 zák. č. 262/2006 Sb.; § 553 zák. č. 89/2012 Sb.** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Identifikuj obě strany: zaměstnavatele názvem, IČO a sídlem; zaměstnance jménem, datem narození a bydlištěm.

Ustanovení: § 77 odst. 1 zák. č. 262/2006 Sb.; § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Smlouva o zápůjčce

Právní základ: § 2390–2394 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-22

**potvrzení o předání** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Zápůjčka vzniká až skutečným přenecháním peněz nebo věci. Samotný podpis smlouvy dluh nezakládá. Ve smlouvě proto výslovně potvrď, že předmět zápůjčky byl předán — nebo popiš, jak a kdy k předání dojde.

Ustanovení: § 2390 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výše zápůjčky** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď výši zápůjčky číselně i slovy a měnu. U nepeněžité zápůjčky popiš věc tak, aby bylo zřejmé, co má být vráceno.

Ustanovení: § 2390 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**závazek vrátit** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Výslovný závazek vydlužitele vrátit věc stejného druhu, u peněz stejnou částku.

Ustanovení: § 2390 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 1796 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Úrok nesmí být v hrubém nepoměru k poskytnutému plnění, zejména zneužil-li zapůjčitel tísně nebo nezkušenosti vydlužitele. Takové ujednání je neplatné.

Ustanovení: § 1796 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Darovací smlouva

Právní základ: § 2055–2078 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-22

**předmět daru** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Dar musí být určen nezaměnitelně. U nemovitosti údaji z katastru (obec, katastrální území, číslo parcely nebo jednotky, list vlastnictví); u vozidla VIN a SPZ; u peněz částka a měna.

Ustanovení: § 2055 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**bezplatnost** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Ve smlouvě musí být zřejmé, že se převádí bezplatně. Je-li sjednáno jakékoli protiplnění, nejde o darování, ale o jiný smluvní typ — nejčastěji o koupi nebo směnu.

Ustanovení: § 2055 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**přijetí daru** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Obdarovaný musí dar přijmout. Darování je dvoustranné právní jednání — jednostranné prohlášení dárce nestačí.

Ustanovení: § 2055 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2057 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Písemná forma je nutná ve dvou případech: darujeme-li věc zapsanou do veřejného seznamu (typicky nemovitost), a nedojde-li k odevzdání věci současně s projevem vůle darovat (slib darování do budoucna). Movitou věc předanou z ruky do ruky lze darovat i ústně.

Ustanovení: § 2057 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2058 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Darovat lze celý současný majetek. Smlouva, kterou někdo daruje svůj budoucí majetek, však platí jen do poloviny takového majetku.

Ustanovení: § 2058 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2063 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Darování závislé na tom, že obdarovaný dárce přežije, se posuzuje jako odkaz a řídí se dědickým právem. Jako běžnou darovací smlouvu je sepsat nelze.

Ustanovení: § 2063 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Výpověď z nájmu bytu

Právní základ: § 2286–2296 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-22

**způsob doručení** — *NEPLATNÉ USTANOVENÍ*

Výpověď vyžaduje písemnou formu a musí dojít druhé straně. Samotné vyhotovení ani odeslání nestačí — rozhodující je dojití.

Ustanovení: § 2286 odst. 1 a § 570 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**označení vypovídaného nájmu** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ nájemní smlouvu, kterou se vypovídá — datum uzavření a byt (adresa, číslo bytu). Bez toho není zřejmé, co se ukončuje.

Ustanovení: § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**poučení o právu vznést námitky** — *NEPLATNÉ USTANOVENÍ*

Vypovídá-li nájem PRONAJÍMATEL, musí nájemce poučit o právu vznést proti výpovědi námitky a navrhnout přezkoumání oprávněnosti výpovědi soudem. Bez tohoto poučení je výpověď neplatná.

Ustanovení: § 2286 odst. 2 zák. č. 89/2012 Sb.
Použije se jen když: Výpověď dává pronajímatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výpovědní důvod** — *NEPLATNÉ USTANOVENÍ*

Pronajímatel musí ve výpovědi uvést důvod, a to důvod, který zákon připouští. Nájem bytu nelze vypovědět „bez udání důvodu".

Ustanovení: § 2288 zák. č. 89/2012 Sb.
Použije se jen když: Výpověď dává pronajímatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výpovědní doba** — *NEPLATNÉ USTANOVENÍ*

Výpovědní doba činí tři měsíce, nejde-li o výpověď bez výpovědní doby podle § 2291.

Ustanovení: § 2288 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2291 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Výpověď bez výpovědní doby je možná jen při zvlášť závažném porušení povinností nájemce. Pronajímatel jej musí předtím vyzvat, aby v přiměřené době závadné chování odstranil.

Ustanovení: § 2291 zák. č. 89/2012 Sb.
Použije se jen když: Výpověď je dána bez výpovědní doby.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2287 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Nájem na dobu určitou může nájemce vypovědět, změní-li se okolnosti, z nichž strany při uzavření smlouvy zjevně vycházely, do té míry, že po nájemci nelze rozumně požadovat, aby v nájmu pokračoval. Změnu je třeba ve výpovědi uvést.

Ustanovení: § 2287 zák. č. 89/2012 Sb.
Použije se jen když: Výpověď dává nájemce a nájem je na dobu určitou.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Plná moc

Právní základ: § 441–449 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-22

**označení zmocnitele a zmocněnce** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Zmocnitel i zmocněnec musí být označeni nezaměnitelně — jménem, datem narození nebo IČO a adresou. Třetí osoba musí být schopna ověřit, kdo koho zmocnil.

Ustanovení: § 441 odst. 1 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**rozsah zmocnění** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Rozsah zástupčího oprávnění musí být vymezen určitě. Vyjmenuj konkrétní úkony, ne jen zamýšlený výsledek — oprávnění „podepsat kupní smlouvu" nezahrnuje podání návrhu na vklad ani jednání s katastrálním úřadem.

Ustanovení: § 441 odst. 1 a § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**forma odpovídající zastupovanému jednání** — *NEPLATNÉ USTANOVENÍ*

Vyžaduje-li zastupované právní jednání zvláštní formu, musí být v téže formě udělena i plná moc. Vyžaduje-li tedy jednání písemnou formu s úředně ověřeným podpisem, musí ji mít i plná moc.

Ustanovení: § 441 odst. 2 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Zpracovatelská smlouva (GDPR)

Právní základ: čl. 28 nařízení (EU) 2016/679 (GDPR); zák. č. 110/2019 Sb.
Naposledy ověřeno námi: 2026-08-22

**určení role stran** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Smlouva musí jasně určit, kdo je správce a kdo zpracovatel. Zpracovatelská smlouva se uzavírá jen tam, kde jedna strana zpracovává osobní údaje PRO druhou. Zpracovávají-li obě strany pro vlastní účely, jde o samostatné správce a čl. 28 se nepoužije.

Ustanovení: čl. 4 bod 7 a 8, čl. 28 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**předmět a doba zpracování** — *NEPLATNÉ USTANOVENÍ*

Uveď předmět zpracování a dobu, po kterou bude probíhat — konkrétním datem, dobou trvání hlavní smlouvy nebo jinou určitelnou skutečností.

Ustanovení: čl. 28 odst. 3 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**povaha a účel zpracování** — *NEPLATNÉ USTANOVENÍ*

Popiš povahu zpracování (jaké operace se s údaji provádějí — ukládání, zpřístupňování, mazání) a účel, ke kterému správce údaje zpracovává.

Ustanovení: čl. 28 odst. 3 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**typ osobních údajů** — *NEPLATNÉ USTANOVENÍ*

Vyjmenuj typy zpracovávaných údajů. Zahrnuje-li zpracování zvláštní kategorie podle čl. 9 (zdraví, biometrie, členství v odborech), uveď to výslovně — pojí se s nimi přísnější požadavky.

Ustanovení: čl. 28 odst. 3 a čl. 9 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**kategorie subjektů údajů** — *NEPLATNÉ USTANOVENÍ*

Uveď, čí údaje se zpracovávají — zaměstnanci, zákazníci, uchazeči, návštěvníci webu. Kategorie subjektů určuje rozsah rizika.

Ustanovení: čl. 28 odst. 3 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**zpracování jen na doložené pokyny** — *NEPLATNÉ USTANOVENÍ*

Zpracovatel zpracovává údaje pouze na doložené pokyny správce, včetně předání do třetí země — ledaže mu to ukládá právo EU nebo členského státu. V takovém případě správce informuje předem, nezakazuje-li to zákon.

Ustanovení: čl. 28 odst. 3 písm. a) GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**mlčenlivost oprávněných osob** — *NEPLATNÉ USTANOVENÍ*

Zpracovatel zajistí, že osoby oprávněné zpracovávat údaje se zavázaly k mlčenlivosti nebo je vážou zákonné povinnosti mlčenlivosti.

Ustanovení: čl. 28 odst. 3 písm. b) GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**technická a organizační opatření** — *NEPLATNÉ USTANOVENÍ*

Zpracovatel přijme opatření podle čl. 32. NEOPISUJ jen text nařízení — uveď konkrétně, co je zavedeno: šifrování, pseudonymizace, řízení přístupu, zálohování, obnovitelnost, testování. Obecná věta o „vhodných opatřeních" správci neříká nic.

Ustanovení: čl. 28 odst. 3 písm. c) a čl. 32 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**podmínky zapojení dalšího zpracovatele** — *NEPLATNÉ USTANOVENÍ*

Uprav zapojení dalších zpracovatelů: buď konkrétní písemné povolení pro každého, nebo obecné povolení s povinností informovat správce o změnách a s právem správce vznést námitky. Na dalšího zpracovatele musí být přeneseny tytéž povinnosti.

Ustanovení: čl. 28 odst. 2 a odst. 3 písm. d) GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**součinnost při právech subjektů** — *NEPLATNÉ USTANOVENÍ*

Zpracovatel je správci nápomocen při plnění povinnosti reagovat na žádosti subjektů údajů. Uveď lhůtu, ve které zpracovatel odpoví — správce má na vyřízení jeden měsíc, takže musí mít podklady dřív.

Ustanovení: čl. 28 odst. 3 písm. e) a čl. 12 odst. 3 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**ohlašování incidentů a součinnost dle čl. 32–36** — *NEPLATNÉ USTANOVENÍ*

Zpracovatel je nápomocen při zabezpečení, ohlašování porušení a posouzení vlivu. Uveď KONKRÉTNÍ lhůtu pro ohlášení incidentu správci — správce musí stihnout ohlásit dozorovému úřadu do 72 hodin, takže „bez zbytečného odkladu" je pro něj nepoužitelné.

Ustanovení: čl. 28 odst. 3 písm. f) a čl. 33 odst. 2 GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výmaz nebo vrácení údajů po skončení** — *NEPLATNÉ USTANOVENÍ*

Po skončení poskytování služeb zpracovatel podle volby SPRÁVCE všechny údaje vymaže nebo vrátí a smaže existující kopie — ledaže právo EU nebo členského státu ukládá jejich uložení. Volba patří správci, ne zpracovateli.

Ustanovení: čl. 28 odst. 3 písm. g) GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**doložení souladu a audity** — *NEPLATNÉ USTANOVENÍ*

Zpracovatel poskytne správci všechny informace potřebné k doložení splnění povinností a umožní audity nebo inspekce prováděné správcem či pověřeným auditorem. Uprav praktické podmínky — oznámení předem, četnost, náklady.

Ustanovení: čl. 28 odst. 3 písm. h) GDPR

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Výpověď z pracovního poměru

Právní základ: § 50–54 a § 67 zák. č. 262/2006 Sb. (zákoník práce)
Naposledy ověřeno námi: 2026-08-22

**písemná forma a doručení** — *NEPLATNÉ USTANOVENÍ*

Výpověď musí být písemná a doručena druhé straně. Nedoručená výpověď nemá žádné účinky, i kdyby byla sepsána bezvadně.

Ustanovení: § 50 odst. 1 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**délka výpovědní doby** — *NEPLATNÉ USTANOVENÍ*

Výpovědní doba činí nejméně dva měsíce. U výpovědi z důvodů podle § 52 písm. f) až h) činí nejméně jeden měsíc. Musí být stejná pro obě strany.

Ustanovení: § 51 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výpovědní důvod** — *NEPLATNÉ USTANOVENÍ*

Zaměstnavatel může dát výpověď pouze z důvodů taxativně uvedených v § 52. Důvod musí být ve výpovědi skutkově vymezen tak, aby jej nebylo možné zaměnit s jiným — nestačí odkaz na písmeno zákona.

Ustanovení: § 50 odst. 2 a 4 a § 52 zák. č. 262/2006 Sb.
Použije se jen když: Výpověď dává zaměstnavatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 50 odst. 4 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Uvedený výpovědní důvod nelze dodatečně měnit. Ukáže-li se jako neobstojný, nelze jej v řízení nahradit jiným.

Ustanovení: § 50 odst. 4 zák. č. 262/2006 Sb.
Použije se jen když: Výpověď dává zaměstnavatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 53 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

V ochranné době — zejména v době dočasné pracovní neschopnosti, těhotenství, mateřské a rodičovské dovolené — nesmí zaměstnavatel dát výpověď, s výjimkami stanovenými zákonem.

Ustanovení: § 53 zák. č. 262/2006 Sb.
Použije se jen když: Výpověď dává zaměstnavatel.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Zrušení dohody o provedení práce / o pracovní činnosti

Právní základ: § 77 odst. 4 zák. č. 262/2006 Sb. (zákoník práce)
Naposledy ověřeno námi: 2026-08-22

**ověření režimu sjednaného v dohodě** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Zákonná úprava se použije jen tehdy, nesjednaly-li si strany způsob zrušení v samotné dohodě. Ověř nejprve, co dohoda říká — může stanovit jiné důvody i jinou délku výpovědní doby.

Ustanovení: § 77 odst. 4 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**písemná forma a doručení** — *NEPLATNÉ USTANOVENÍ*

Výpověď dohody i okamžité zrušení musí být písemné a doručené druhé straně. Ústní zrušení nemá účinky.

Ustanovení: § 77 odst. 4 a odst. 6 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Odstoupení od smlouvy

Právní základ: § 2001–2005 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-22

**důvod odstoupení** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Odstoupit lze jen tehdy, ujednaly-li si to strany, nebo stanoví-li tak zákon. Ve zprávě musí být uvedeno, o který důvod jde — odkaz na ujednání ve smlouvě nebo na zákonné ustanovení, a skutečnosti, které jej naplňují.

Ustanovení: § 2001 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**označení smlouvy** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ smlouvu, od které se odstupuje — typ, datum uzavření, smluvní strany a předmět. Bez toho není zřejmé, co se ruší.

Ustanovení: § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**předchozí výzva s dodatečnou lhůtou** — *NEPLATNÉ USTANOVENÍ*

Při nepodstatném porušení lze odstoupit až poté, co druhá strana nesplní ani v dodatečné přiměřené lhůtě, kterou jí strana výslovně poskytla. Bez předchozí výzvy s lhůtou odstoupení neobstojí.

Ustanovení: § 1978 a § 2003 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2004 a § 1998 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Nezaměňuj odstoupení a výpověď. U trvajících závazků, kde plnění nelze vrátit, bývá namístě výpověď; odstoupení míří na zrušení od počátku.

Ustanovení: § 2004 a § 1998 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Reklamace (uplatnění práv z vadného plnění)

Právní základ: § 2161–2174 zák. č. 89/2012 Sb. a § 19 zák. č. 634/1992 Sb.
Naposledy ověřeno námi: 2026-08-23

**identifikace koupě** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ zboží a doklad o koupi — co bylo koupeno, kdy a za kolik, číslo objednávky nebo účtenky. Bez toho nelze reklamaci přiřadit.

Ustanovení: § 2172 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**popis vady** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Popiš vadu skutkově — v čem se projevuje, kdy se poprvé projevila a za jakých okolností. Obecné „nefunguje to" prodávajícímu umožní reklamaci odmítnout pro neurčitost.

Ustanovení: § 2161 a § 2165 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**zvolený způsob vyřízení** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď, co požaduješ — odstranění vady opravou, nebo dodání nové věci. Volba je na kupujícím. Prodávající musí podle § 19 odst. 2 zákona o ochraně spotřebitele požadovaný způsob vyřízení uvést v potvrzení, takže jej ve zprávě uveď výslovně.

Ustanovení: § 2169 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2174 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Ujednají-li strany ještě předtím, než kupující vytkl vadu, že se jeho práva omezí nebo zanikají, nepřihlíží se k tomu.

Ustanovení: § 2174 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Předžalobní výzva k plnění

Právní základ: § 142a zák. č. 99/1963 Sb. (občanský soudní řád)
Naposledy ověřeno námi: 2026-08-23

**vymezení pohledávky** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď, z čeho dluh vznikl — smlouva nebo faktura, datum, předmět plnění, a jistina v Kč. Bez určitého vymezení není zřejmé, k čemu se výzva vztahuje a soud ji k § 142a nemusí vztáhnout.

Ustanovení: § 142a odst. 1 zák. č. 99/1963 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**datum splatnosti** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď den, kdy se dluh stal splatným. Od něj se odvíjí prodlení i běh úroku z prodlení.

Ustanovení: § 1968 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výzva k plnění** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Text musí obsahovat jednoznačnou výzvu, aby dlužník dluh zaplatil, a údaje pro platbu — číslo účtu a variabilní symbol. Pouhé sdělení, že dluh existuje, výzvou k plnění není.

Ustanovení: § 142a odst. 1 zák. č. 99/1963 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Smlouva o poskytování služeb

Právní základ: § 1746 odst. 2 a § 2430 a násl. zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-23

**vymezení služby** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Vymez, JAKÁ ČINNOST se poskytuje, v jakém rozsahu a jak často. Slibuje-li poskytovatel konkrétní VÝSLEDEK, který se předává a přebírá, jde ve skutečnosti o dílo podle § 2586 a řídí se jiným režimem — včetně předání, převzetí a odpovědnosti za vady.

Ustanovení: § 1746 odst. 2 a § 2586 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2 a § 3 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Smlouva nesmí popisovat závislou práci. Závislá práce je práce ve vztahu nadřízenosti a podřízenosti, jménem zaměstnavatele, podle jeho pokynů a vykonávaná osobně, za odměnu, na náklady a odpovědnost zaměstnavatele, v pracovní době na jeho pracovišti. Takovou práci lze konat výlučně v pracovněprávním vztahu. NEPIŠ proto do smlouvy pracovní dobu, dovolenou, nadřízeného, docházku ani povinnost osobního výkonu bez možnosti zastoupení.

Ustanovení: § 2 a § 3 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**odměna a splatnost** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď výši odměny nebo způsob jejího určení, splatnost a to, zda je uvedena včetně DPH. U opakované služby uveď fakturační období.

Ustanovení: § 1746 odst. 2 a § 2438 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**doba trvání** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď, zda se smlouva uzavírá na dobu určitou, nebo neurčitou. Na tom závisí, jak ji lze ukončit.

Ustanovení: § 1998 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Uznání dluhu

Právní základ: § 2053 a § 2054 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-23

**písemná forma** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uznání dluhu vyžaduje PÍSEMNOU FORMU. Ústní uznání domněnku podle § 2053 nezaloží a desetiletá lhůta z něj neběží.

Ustanovení: § 2053 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**důvod dluhu** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď DŮVOD dluhu — z čeho vznikl: smlouva, faktura, datum, předmět plnění. Uznání „co do důvodu i výše" znamená obojí; samotné „uznávám, že dlužím" domněnku nezaloží.

Ustanovení: § 2053 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**výše dluhu** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď VÝŠI dluhu v korunách, a to jistinu odděleně od příslušenství. Domněnka působí jen v rozsahu, v jakém byl dluh uznán.

Ustanovení: § 2053 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**prohlášení o uznání** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Text musí obsahovat výslovné prohlášení dlužníka, že dluh uznává. Popis dluhu bez tohoto prohlášení uznáním není.

Ustanovení: § 2053 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Dohoda o rozvázání pracovního poměru

Právní základ: § 49 zák. č. 262/2006 Sb. (zákoník práce)
Naposledy ověřeno námi: 2026-08-23

**den skončení pracovního poměru** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď konkrétní DEN, ke kterému pracovní poměr končí. Dohodou končí pracovní poměr sjednaným dnem — bez určení dne dohoda svůj účel nesplní.

Ustanovení: § 49 odst. 1 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**označení pracovního poměru** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ pracovní smlouvu, která se ukončuje — datum uzavření a sjednaný druh práce.

Ustanovení: § 553 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**písemná forma** — *NEPLATNÉ USTANOVENÍ*

Dohoda o rozvázání pracovního poměru MUSÍ být písemná.

Ustanovení: § 49 odst. 2 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 49 odst. 1 zák. č. 262/2006 Sb.** — *NEPLATNÉ USTANOVENÍ*

Dohodu podepisují OBĚ strany. Na rozdíl od výpovědi jde o dvoustranné právní jednání — jednostranným podpisem nevzniká.

Ustanovení: § 49 odst. 1 zák. č. 262/2006 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Nájem prostoru sloužícího podnikání

Právní základ: § 2302–2315 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-24

**vymezení prostoru** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ prostor jednoznačně — adresa, číslo jednotky nebo místnosti, podlaží, výměra v m² a nemovitost, v níž se nachází.

Ustanovení: § 2302 a § 2201 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**účel nájmu** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď, k jaké podnikatelské činnosti prostor slouží. Zvláštní úprava se sice použije i bez toho, ale účel vymezuje, co smí nájemce v prostoru dělat, a od něj se odvíjí i výpovědní důvod podle § 2308 písm. a).

Ustanovení: § 2302 odst. 1 a § 2304 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**nájemné a splatnost** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď výši nájemného, splatnost a to, zda je uvedeno včetně DPH. U pronájmu podnikateli bývá nájemné zdanitelným plněním — režim DPH proto ujednej výslovně.

Ustanovení: § 2302 a § 2201 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**doba nájmu** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď, zda se nájem sjednává na dobu určitou, nebo neurčitou. Na tom závisí, jak jej lze ukončit — § 2308 a § 2309 u doby určité, § 2312 u doby neurčité.

Ustanovení: § 2308, § 2309 a § 2312 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2310 odst. 1 zák. č. 89/2012 Sb.** — *NEPLATNÉ USTANOVENÍ*

Ve výpovědi MUSÍ být uveden důvod. Výpověď, v níž důvod uveden není, je NEPLATNÁ. Platí to pro výpověď z nájmu na dobu určitou podle § 2308 i § 2309.

Ustanovení: § 2310 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Smlouva o smlouvě budoucí

Právní základ: § 1785–1788 zák. č. 89/2012 Sb. (občanský zákoník)
Naposledy ověřeno námi: 2026-08-24

**obsah budoucí smlouvy** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Vymez obsah budoucí smlouvy alespoň OBECNÝM ZPŮSOBEM — kdo, co, za kolik a za jakých podstatných podmínek. Není to formalita: podle § 1787 může obsah budoucí smlouvy určit soud, ale jen z toho, co strany ujednaly. Čím vágnější vymezení, tím prázdnější je celý dokument.

Ustanovení: § 1785 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**předmět budoucí smlouvy** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ předmět jednoznačně. U nemovitosti uveď údaje z katastru — číslo jednotky nebo parcely, katastrální území a list vlastnictví.

Ustanovení: § 1785 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**cena nebo způsob jejího určení** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď kupní cenu, nájemné nebo alespoň způsob jejího určení. Bez ceny ani mechanismu jejího výpočtu nelze obsah budoucí smlouvy určit.

Ustanovení: § 1785 a § 1787 odst. 2 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

### Licenční smlouva

Právní základ: § 2358–2383 zák. č. 89/2012 Sb. a zák. č. 121/2000 Sb. (autorský zákon)
Naposledy ověřeno námi: 2026-08-24

**§ 26 odst. 1 a § 11 odst. 4 zák. č. 121/2000 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

NIKDY nepiš, že autor „převádí autorská práva", „postupuje veškerá práva" nebo se jich „vzdává". Majetkových práv se autor nemůže vzdát a jsou NEPŘEVODITELNÁ; totéž platí o osobnostních právech. Poskytuje se výhradně LICENCE, tedy oprávnění k výkonu práva dílo užít.

Ustanovení: § 26 odst. 1 a § 11 odst. 4 zák. č. 121/2000 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**vymezení díla** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Označ dílo jednoznačně — název, druh, forma, rozsah, případně příloha se specifikací. U softwaru uveď verzi a to, zda licence zahrnuje zdrojový kód.

Ustanovení: § 2358 a § 2371 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**způsoby užití díla** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Vyjmenuj ZPŮSOBY UŽITÍ — rozmnožování, rozšiřování, sdělování veřejnosti, úprava, zpracování, zařazení do jiného díla. Neujedná-li se nic, má se za to, že licence pokrývá jen to, co je nutné k dosažení účelu smlouvy.

Ustanovení: § 2371 a § 2376 odst. 2 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2372 odst. 1 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Autor může poskytnout oprávnění jen ke způsobům užití ZNÁMÝM v době uzavření smlouvy. K ujednání, které zahrnuje i způsoby dosud neznámé, se NEPŘIHLÍŽÍ — nepiš tedy „všemi způsoby, včetně dosud neznámých".

Ustanovení: § 2372 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**odměna nebo bezúplatnost** — *BEZ TOHOTO SMLOUVA NEVZNIKNE (podstatná náležitost)*

Uveď odměnu, způsob jejího určení, NEBO výslovně to, že se licence poskytuje bezúplatně. Není-li ani jedno a z jednání stran plyne vůle uzavřít smlouvu úplatnou, platí odměna obvyklá — což je otevřený spor.

Ustanovení: § 2366 odst. 1 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**§ 2374 odst. 2 zák. č. 89/2012 Sb.** — *ZÁKON K TOMU NEPŘIHLÍŽÍ (i když si to strany ujednaly)*

Je-li ujednaná odměna tak nízká, že je ve zřejmém nepoměru k výnosům z využití licence, může autor požadovat přiměřenou DODATEČNOU ODMĚNU. K ujednáním, která toto právo vylučují nebo omezují, se NEPŘIHLÍŽÍ — a to i tehdy, vzdá-li se autor tohoto práva výslovně.

Ustanovení: § 2374 odst. 2 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**písemná forma u výhradní licence** — *NEPLATNÉ USTANOVENÍ*

Písemnou formu vyžaduje smlouva jen tehdy, poskytuje-li se licence VÝHRADNÍ, nebo má-li být zapsána do veřejného seznamu. Nevýhradní licenci lze poskytnout i jinak — u nevýhradní tedy nehlas absenci písemné formy jako vadu.

Ustanovení: § 2358 odst. 2 zák. č. 89/2012 Sb.

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________


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

### Dohoda o provedení práce / o pracovní činnosti

- **§ 213 zák. č. 262/2006 Sb.** — Dovolená u dohody se řídí § 77 odst. 8, nikoli § 213 — nárok vzniká až při trvání alespoň 28 dní a 80 odpracovaných hodinách.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 51 zák. č. 262/2006 Sb.** — Výpovědní doba podle § 51 platí pro pracovní poměr. Dohoda se ruší podle § 77 odst. 4 s patnáctidenní lhůtou.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 50 zák. č. 262/2006 Sb.** — Úprava výpovědi z pracovního poměru se na dohodu nevztahuje.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 34 zák. č. 262/2006 Sb.** — Podstatné náležitosti pracovní smlouvy podle § 34 se na dohodu nevztahují.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 52 zák. č. 262/2006 Sb.** — Výpovědní důvody zaměstnavatele se na dohodu nevztahují — lze ji zrušit i bez důvodu.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 67 zák. č. 262/2006 Sb.** — Odstupné se u dohody neposkytuje.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Reklamace (uplatnění práv z vadného plnění)

- **§ 2113 zák. č. 89/2012 Sb.** — Záruka za jakost vzniká jen prohlášením prodávajícího nebo ujednáním (§ 2113 a § 2174a). Není to zákonná dvouletá záruka a u běžné reklamace se jí nedovolávej, není-li v podkladech záruční list.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 1829 zák. č. 89/2012 Sb.** — Čtrnáctidenní odstoupení spotřebitele je jiný institut než reklamace. Nevyžaduje vadu a s právy z vadného plnění nesouvisí.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Předžalobní výzva k plnění

- **§ 2002 zák. č. 89/2012 Sb.** — Předžalobní výzva není odstoupení od smlouvy ani jeho podmínka. Nedovolávej se podstatného porušení, nejde-li o dodatečnou lhůtu podle § 1978 uvedenou v podkladech.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Smlouva o poskytování služeb

- **§ 2605 zák. č. 89/2012 Sb.** — Předání a převzetí díla se na službu nevztahuje, není-li sjednán hmotný výstup. U činnosti se nepřebírá dílo, nýbrž se vykazuje poskytnutá služba.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 2615 zák. č. 89/2012 Sb.** — Režim vad díla platí pro dílo. U služby se odpovídá za to, že činnost byla provedena s odbornou péčí, nikoli za dosažení výsledku.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Uznání dluhu

- **§ 1931 zák. č. 89/2012 Sb.** — Ztráta výhody splátek vyžaduje ujednání obou stran. V jednostranném uznání dluhu ji nelze platně založit — patří do dohody o splátkách.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Dohoda o rozvázání pracovního poměru

- **§ 53 zák. č. 262/2006 Sb.** — Ochranná doba chrání zaměstnance před VÝPOVĚDÍ, nikoli před dohodou. Nehlas jako vadu, že dohoda byla uzavřena v době pracovní neschopnosti nebo těhotenství — dohodu lze uzavřít i tehdy.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 51 zák. č. 262/2006 Sb.** — Výpovědní doba se u dohody neuplatní. Pracovní poměr končí sjednaným dnem, i kdyby to byl den uzavření dohody.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Nájem prostoru sloužícího podnikání

- **§ 2254 zák. č. 89/2012 Sb.** — Strop jistoty ve výši trojnásobku měsíčního nájemného platí pro nájem BYTU. U prostoru sloužícího podnikání zákon výši jistoty neomezuje — nehlas vyšší jistotu jako porušení zákona.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 2288 zák. č. 89/2012 Sb.** — Výpovědní důvody a tříměsíční výpovědní doba podle § 2288 jsou úpravou nájmu bytu. Zde platí § 2308, § 2309 a § 2312.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 2286 zák. č. 89/2012 Sb.** — Poučení o právu vznést námitky podle § 2286 odst. 2 je náležitostí výpovědi z nájmu bytu. Zde se uplatní vlastní režim námitek podle § 2314.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

- **§ 2239 zák. č. 89/2012 Sb.** — Zákaz ujednání ukládajících nájemci zjevně nepřiměřené povinnosti se vztahuje na nájem bytu. Mezi podnikateli platí smluvní volnost šíře.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Smlouva o smlouvě budoucí

- **§ 560 zák. č. 89/2012 Sb.** — Písemnou formu vyžaduje jednání, kterým se věcné právo k nemovité věci zřizuje, převádí, mění nebo ruší. Smlouva o smlouvě budoucí žádné věcné právo nepřevádí — nehlas absenci písemné formy jako důvod neplatnosti. Písemná forma je zde ale nezbytná prakticky.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________

### Licenční smlouva

- **§ 2359 zák. č. 89/2012 Sb.** — Obecné pravidlo, že nabyvatel není povinen licenci využít, se u díla chráněného autorským zákonem NEUPLATNÍ. § 2372 odst. 2 je opačné: nabyvatel je povinen licenci využít, není-li ujednáno jinak.
  
  Souhlasí? ☐ ano ☐ OPRAVIT: ____________________________________


---

# Část 4 — Tvrzení o překonaném právu

Aplikace čte vygenerovaný text zpět a upozorňuje, obsahuje-li tvrzení, které
bylo správné dřív. U každého potřebujeme vědět, zda korekce sedí.

**Zkušební doba nejvýše 3 měsíce (6 u vedoucích).**

Naše korekce: Od 1. 6. 2025 činí maximum 4 měsíce, u vedoucího zaměstnance 8 měsíců (§ 35 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.).

Účinnost změny: 2025-06-01

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Výpovědní doba začíná prvním dnem následujícího kalendářního měsíce.**

Naše korekce: Od 1. 6. 2025 běží výpovědní doba ode dne doručení výpovědi (§ 51 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.). Pravidlo o počítání času podle § 333 ZP se nepoužije.

Účinnost změny: 2025-06-01

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Dvanáctinásobné odstupné při pracovním úrazu nebo nemoci z povolání.**

Naše korekce: Od 1. 6. 2025 náleží dvanáctinásobek průměrného výdělku pouze při skončení poměru z důvodu dosažení nejvyšší přípustné expozice na pracovišti (§ 67 odst. 3 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.). U pracovního úrazu a nemoci z povolání je nahradila jednorázová náhrada.

Účinnost změny: 2025-06-01

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Zastaralá výše minimální mzdy.**

Naše korekce: Od 2026-01-01 činí minimální mzda 22 400 Kč měsíčně (§ 111 zák. č. 262/2006 Sb. (zákoník práce)). Hodnota se indexuje a mění každý leden.

Účinnost změny: 2026-01-01

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Jistota až šestinásobek měsíčního nájemného.**

Naše korekce: Od 28. 2. 2017 činí maximum 3násobek měsíčního nájemného (§ 2254 odst. 1 zák. č. 89/2012 Sb., ve znění zák. č. 460/2016 Sb.). Od 1. 7. 2020 je navíc tento strop SPOLEČNÝ pro jistotu a smluvní pokutu.

Účinnost změny: 2017-02-28

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**U nájmu bytu se ke smluvní pokutě nepřihlíží.**

Naše korekce: Zákaz smluvní pokuty byl z § 2239 zák. č. 89/2012 Sb. VYPUŠTĚN zákonem č. 163/2020 Sb. s účinností od 1. 7. 2020. Smluvní pokutu lze sjednat; jistota a právo na její zaplacení však nesmí v souhrnu přesáhnout 3násobek měsíčního nájemného (§ 2254 odst. 1 zák. č. 89/2012 Sb.).

Účinnost změny: 2020-07-01

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Limit plateb v hotovosti 350 000 Kč.**

Naše korekce: Limit činí 270 000 Kč za jeden den (zák. č. 254/2004 Sb., o omezení plateb v hotovosti).

Účinnost změny: 2019-01-01

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Zákonná „záruka 24 měsíců".**

Naše korekce: Od 6. 1. 2023 zákon nezná zákonnou záruku, ale práva z vadného plnění: spotřebitel může vytknout vadu, která se projeví do dvou let od převzetí (§ 2165 zák. č. 89/2012 Sb., ve znění zák. č. 374/2022 Sb.). Záruka za jakost je dobrovolný závazek navíc.

Účinnost změny: 2023-01-06

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Prodávající musí o reklamaci rozhodnout do tří pracovních dnů.**

Naše korekce: Tuto povinnost § 19 zák. č. 634/1992 Sb. neobsahuje. Platí, že reklamace musí být vyřízena a spotřebitel o tom informován do 30 dnů ode dne uplatnění (§ 19 odst. 3 téhož zákona).

Účinnost změny: 2023-01-06

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Marné uplynutí třicetidenní lhůty je podstatným porušením smlouvy.**

Naše korekce: Po marném uplynutí lhůty může spotřebitel od smlouvy odstoupit nebo požadovat přiměřenou slevu přímo podle § 19 odst. 4 zák. č. 634/1992 Sb. Konstrukce přes podstatné porušení smlouvy je překonaná.

Účinnost změny: 2023-01-06

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________

**Domněnka, že věc byla vadná už při převzetí, trvá šest měsíců.**

Naše korekce: Od 6. 1. 2023 činí tato doba jeden rok — projeví-li se vada do jednoho roku od převzetí, má se za to, že věc byla vadná už při převzetí (§ 2161 odst. 5 zák. č. 89/2012 Sb.).

Účinnost změny: 2023-01-06

Souhlasí? ☐ ano ☐ OPRAVIT: ______________________________________


---

# Příloha — přehled typů dokumentů

Úplný seznam toho, co aplikace umí, s právním základem a datem, kdy jsme obsah
naposledy ověřovali proti znění zákona.

| Typ dokumentu | Právní základ | Ověřeno námi | Pravidel celkem | Z toho o neplatnosti |
|---|---|---|---|---|
| Kupní smlouva | § 2079–2183 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-21 | 14 | 4 |
| Nájemní smlouva (byt) | § 2201–2234 (obecně) a § 2235–2301 (nájem bytu) zák. č. 89/2012 Sb. | 2026-08-26 | 15 | 9 |
| Pracovní smlouva | § 33–73 zák. č. 262/2006 Sb. (zákoník práce) | 2026-08-21 | 16 | 12 |
| Smlouva o dílo | § 2586–2635 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-21 | 15 | 3 |
| Dohoda o mlčenlivosti (NDA) | § 1746 odst. 2 zák. č. 89/2012 Sb. (nepojmenovaná smlouva); § 504 a § 2985 tamtéž | 2026-08-21 | 12 | 3 |
| Dohoda o provedení práce / o pracovní činnosti | § 74–77 zák. č. 262/2006 Sb. (zákoník práce) | 2026-08-22 | 15 | 7 |
| Smlouva o zápůjčce | § 2390–2394 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-22 | 12 | 4 |
| Darovací smlouva | § 2055–2078 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-22 | 12 | 6 |
| Výpověď z nájmu bytu | § 2286–2296 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-22 | 11 | 7 |
| Plná moc | § 441–449 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-22 | 11 | 3 |
| Zpracovatelská smlouva (GDPR) | čl. 28 nařízení (EU) 2016/679 (GDPR); zák. č. 110/2019 Sb. | 2026-08-22 | 18 | 13 |
| Výpověď z pracovního poměru | § 50–54 a § 67 zák. č. 262/2006 Sb. (zákoník práce) | 2026-08-22 | 13 | 5 |
| Zrušení dohody o provedení práce / o pracovní činnosti | § 77 odst. 4 zák. č. 262/2006 Sb. (zákoník práce) | 2026-08-22 | 8 | 2 |
| Odstoupení od smlouvy | § 2001–2005 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-22 | 10 | 4 |
| Reklamace (uplatnění práv z vadného plnění) | § 2161–2174 zák. č. 89/2012 Sb. a § 19 zák. č. 634/1992 Sb. | 2026-08-23 | 17 | 4 |
| Předžalobní výzva k plnění | § 142a zák. č. 99/1963 Sb. (občanský soudní řád) | 2026-08-23 | 14 | 3 |
| Smlouva o poskytování služeb | § 1746 odst. 2 a § 2430 a násl. zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-23 | 12 | 4 |
| Uznání dluhu | § 2053 a § 2054 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-23 | 12 | 4 |
| Dohoda o rozvázání pracovního poměru | § 49 zák. č. 262/2006 Sb. (zákoník práce) | 2026-08-23 | 13 | 4 |
| Nájem prostoru sloužícího podnikání | § 2302–2315 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-24 | 18 | 5 |
| Smlouva o smlouvě budoucí | § 1785–1788 zák. č. 89/2012 Sb. (občanský zákoník) | 2026-08-24 | 14 | 3 |
| Licenční smlouva | § 2358–2383 zák. č. 89/2012 Sb. a zák. č. 121/2000 Sb. (autorský zákon) | 2026-08-24 | 22 | 7 |

## Zdroje podle typu

**Kupní smlouva**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2079 a násl.)
- https://www.zakonyprolidi.cz/cs/2013-256 (katastrální zákon)
- zák. č. 374/2022 Sb. — spotřebitelská novela, účinnost 6. 1. 2023

**Nájemní smlouva (byt)**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2235 a násl.)
- zák. č. 460/2016 Sb. (od 28. 2. 2017) — jistota snížena ze šestinásobku na trojnásobek
- zák. č. 163/2020 Sb. (od 1. 7. 2020) — ZRUŠEN zákaz smluvní pokuty v § 2239; § 2254 nově stanoví SPOLEČNÝ strop pro jistotu a smluvní pokutu
- https://www.zakonyprolidi.cz/cs/2015-308 (nař. vlády o vymezení běžné údržby)

**Pracovní smlouva**
- https://www.zakonyprolidi.cz/cs/2006-262 (zákoník práce)
- zák. č. 120/2025 Sb. — flexinovela, účinnost 1. 6. 2025
- https://mpsv.gov.cz/ — minimální a zaručená mzda

**Smlouva o dílo**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2586 a násl.)
- https://obcanskyzakonik.justice.cz/index.php/smluvni-pravo/konkretni-zmeny-ve-zvlastni-casti/smlouva-o-dilo

**Dohoda o mlčenlivosti (NDA)**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 504, § 1730, § 1746, § 2985)
- https://www.zakonyprolidi.cz/cs/2006-262 (§ 310 — hranice vůči konkurenční doložce)

**Dohoda o provedení práce / o pracovní činnosti**
- https://www.zakonyprolidi.cz/cs/2006-262 (§ 74–77)
- https://mpsv.gov.cz/ — rozvrhování pracovní doby u dohod, minimální mzda
- zák. č. 281/2023 Sb. — transpoziční novela (dovolená a rozvrh u dohod od 1. 1. 2024)

**Smlouva o zápůjčce**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2390–2394)
- https://obcanskyzakonik.justice.cz/ — výklad k zápůjčce a úvěru
- zák. č. 257/2016 Sb., o spotřebitelském úvěru

**Darovací smlouva**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2055–2078)
- https://obcanskyzakonik.justice.cz/ — výklad k darovací smlouvě
- https://www.zakonyprolidi.cz/cs/2013-256 (katastrální zákon)
- zák. č. 586/1992 Sb., o daních z příjmů — § 10 odst. 3 (osvobození)

**Výpověď z nájmu bytu**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2286–2296)
- http://www.bulletin-advokacie.cz/ — náležitosti výpovědi z nájmu bytu

**Plná moc**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 441–449)
- https://cuzk.gov.cz/Katastr-nemovitosti/Zapisy-do-KN/ — požadavky na plnou moc

**Zpracovatelská smlouva (GDPR)**
- https://gdpr-info.eu/art-28-gdpr/ (čl. 28 GDPR)
- https://www.edpb.europa.eu/ — Guidelines 07/2020 ke správci a zpracovateli
- https://www.edpb.europa.eu/system/files/2024-10/edpb_opinion_202422_relianceonprocessors-sub-processors_en.pdf
- https://uoou.gov.cz/poradna/poradna-gdpr/zpracovatel (ÚOOÚ)

**Výpověď z pracovního poměru**
- https://www.zakonyprolidi.cz/cs/2006-262 (§ 50–54, § 67)
- zák. č. 120/2025 Sb. — flexinovela, účinnost 1. 6. 2025
- https://mpsv.gov.cz/ — přehled změn flexinovely

**Zrušení dohody o provedení práce / o pracovní činnosti**
- https://www.zakonyprolidi.cz/cs/2006-262 (§ 77)
- https://www.pravniprostor.cz/ — skončení dohody o provedení práce

**Odstoupení od smlouvy**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2001–2005, § 1829)
- https://www.asociace-sos.cz/ — podstatné porušení a právo odstoupit

**Reklamace (uplatnění práv z vadného plnění)**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2161, § 2165–2174, § 1924)
- https://www.zakonyprolidi.cz/cs/1992-634 (§ 19)
- zák. č. 374/2022 Sb. — spotřebitelská novela, účinná 6. 1. 2023

**Předžalobní výzva k plnění**
- https://www.zakonyprolidi.cz/cs/1963-99 (§ 142a, § 143)
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 629, § 639, § 648, § 1968–1971)
- https://www.zakonyprolidi.cz/cs/2013-351 (§ 2 a § 3)

**Smlouva o poskytování služeb**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 1746, § 1999, § 2430–2444, § 2586)
- https://www.zakonyprolidi.cz/cs/2006-262 (§ 2 a § 3)
- https://www.zakonyprolidi.cz/cs/2004-435 (§ 5 písm. e, § 140)

**Uznání dluhu**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 639, § 653, § 1931, § 1952, § 2053–2054)

**Dohoda o rozvázání pracovního poměru**
- https://www.zakonyprolidi.cz/cs/2006-262 (§ 49, § 52, § 53, § 67, § 313)
- https://www.zakonyprolidi.cz/cs/2004-435 (§ 25 odst. 8, § 50)

**Nájem prostoru sloužícího podnikání**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2302–2315, § 2201 a násl.)

**Smlouva o smlouvě budoucí**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 560, § 1785–1788, § 2128)
- https://www.zakonyprolidi.cz/cs/2013-256 (§ 7)

**Licenční smlouva**
- https://www.zakonyprolidi.cz/cs/2012-89 (§ 2358–2383)
- https://www.zakonyprolidi.cz/cs/2000-121 (§ 11, § 26, § 58, § 61)
