# Content plan

What to build next, in what order, and why. It is built from the keyword research list (the "name generator a–z" suggestions) and the site as it stands in October 2026: 52 generators, mostly fantasy, objects, places and pop culture, plus a small business and music corner.

It combines two pieces of work: a keyword-research plan (moats and phases) and the Search Console review and pilot rewrites from the content-notes work (`CONTENT.md`). Read it with `CONTENT.md` (how each page is written) and `SEO.md` (technical checklist).

## What Search Console says (October 2026)

| Page | Clicks | Impressions |
|---|---|---|
| Homepage | 1 | 534 |
| Hogwarts Legacy Witch | 4 | 239 |
| Places category | 1 | 229 |
| Events category (no generators) | 0 | 156 |
| All Generators | 1 | 133 |
| Epithet | 3 | 77 |
| People category | 0 | 10 |
| Objects category | 1 | 9 |
| Brand / Blog | 0 | 6 / 4 |

What this means for the plan:
- **Traffic is tiny, so quality comes first.** Google barely shows most generator pages yet. Making each page the best answer (the `CONTENT.md` rewrites) is worth more right now than adding pages fast.
- **The broad pages get most impressions.** Google sees the site as a hub for "name generators", "place names" and "event names" before any single generator. The homepage and category pages are where the moat structure starts, so they are the first job.
- **Searchers want Events, and the page is empty.** Build an Event Name Generator rather than hiding the page.
- **What does get clicks is specific and well made**: Hogwarts Legacy Witch and Epithet, both rebuilt to `CONTENT.md`. Build out from those two (see Phases 1 and 2).

Check again monthly; reorder the phases when the numbers move.

## The goals this plan serves

1. **Search traffic that fits the site.** The site is ad-funded (Mediavine Grow), so what counts is pageviews and pages per visit from people who will use more than one generator. A D&D player who needs a tiefling name will also need a tavern, a sword and a town; a visitor who wants "fancy text for Free Fire" won't.
2. **Generators people come back to.** Each one should be the best result for its search: names that follow the source's rules, choices worth having, and tools to keep and share the names someone likes.
3. **Authority in a few areas, not thin coverage of everything.** It is better to own *D&D names* (hub, every race, every place and item) than to have one page each on baby names, PUBG names and Pokémon.

The keyword list gives no search volumes. Before each phase, check demand in Search Console (Performance → Queries, for terms the site already shows up for) and in a keyword tool.

---

## Where the site is now

### Strengths to build on
- **Orcs are already a moat**: Orc, Half-Orc, Skyrim, WoW, LOTR and Warhammer orcs, plus Ogryn. Copy this pattern: a general page, then a page for each tradition.
- **Elves**: Elf, High Elf, Wood Elf and Dark Elf (which also targets drow).
- **Weapons and items** (sword, axe, shield, wand, warhammer, poison, plus elven, Japanese, Game of Thrones and Minecraft swords). Rival sites cover these thinly, and they fit tabletop and writing visitors.
- **Places** (town, city, country, fairy town) and **organisations** (clan, guild).
- **Rich's own angle**: a musician who built the site for band, album and project names. Nobody else can say this, and it is the authority behind a music cluster.

### Problems to fix before scaling up
| Problem | Fix |
|---|---|
| **Warhammer Name Generator** is the *weapon*, but people searching "warhammer name generator" want Warhammer 40k and Fantasy character names. | Rename the weapon page to "War Hammer Name Generator" (or "Warhammer Weapon Name…"), keep its URL redirecting, and later build a real Warhammer character hub (see Phase 2). |
| **Overlapping targets**: Business, Company and Brand all target "business name generator", "company names" and "brand names". Fantasy Town targets "fantasy city names". | Give each page one job. **Business** is small and local businesses (shops, trades, services). **Company** is startups, tech and LLCs. **Brand** is invented, brandable words for products. Each page's `seoKeywords` lists only its own terms, and the pages link to each other with one line saying what each is for. Do the same for Town vs City vs Country. |
| **Category pages are thin and empty**, yet they get most impressions (Places 229, Events 156). Events has 0 generators, Folklore has 2 (both fairy), Music has 1. The People category is described as "real-world names from different cultures", but it holds Epithet, Assassin and Vampire. | Give the category template a proper title, an intro and a line on what each of its best generators does, then write 10 short intros (one template change covers all of them). **Build an Event Name Generator** for the Events page (Phase 0). Folklore and Music fill up in Phases 3–4. Rewrite People as **Characters** (or fill it with the historical names in Phase 5). Category `seoDescription`s use banned words ("authentic", "Perfect for…"); rewrite them in the `CONTENT.md` voice. |
| **Thin or broken pages**: Vampire (48-word article, 139 names), LOTR Wizard (155), Half-Orc (160), the Elven Sword translations, Path of Exile Witch (no real characters) and Dungeon Synth (no real artists). | In the `CONTENT.md` progress queue. Do Vampire first, because "vampire name generator" is a big search. |
| **The homepage hero says "Ultimate Name Generator"**, which matches no search and no promise. | Make it say what the site is: e.g. "Name generators for D&D, fantasy worlds, stories and bands". Feature the hubs, not a dropdown of categories. |

---

## Making the generators better (do this alongside Phase 1)

These changes improve every page at once. They are what makes someone bookmark the site, and they help SEO indirectly: longer visits, more pages per visit, more links from Discord and Reddit.

In order of value for effort, all in `lib/page.js` and the build:

1. **Click a name to copy it**, with a small "Copied" confirmation. This is the most-used action on any name generator.
2. **Shortlist**: a ♥ on each name, and a "Your shortlist" panel that persists in `localStorage` across generators, so a D&D player collects a character, a sword and a hometown in one place. Add copy-all and clear buttons.
3. **How many names**: let visitors choose 8, 16 or 32 instead of the fixed 8.
4. **Shareable settings**: put the filter choices in the URL (`?gender=female&origin=tolkien`), so links in Discord open the same setup. You can then link to these from articles ("try *female, Tolkien*").
5. **Meanings where they are real**: an optional `meanings` map in the JSON, shown as a tooltip or second line. Only add it where the meanings are true: Tolkien's Sindarin and Quenya, real historical names, sword names. It is a big differentiator for searches like "elf names with meanings" and "Japanese names with meanings".
6. **An "Any" option and sensible defaults** on every multi-choice filter (already in the checklist).
7. **Later, a "build a character" page** that strings existing generators together: name, epithet, hometown and weapon. This is a natural link magnet and a strong internal-linking hub.

**On "AI" searches** ("does name generator use AI", "name generator no AI"): the generator itself uses no AI. It draws from hand-checked lists by recipe, in the browser. That is an honest, useful line for the About page and an FAQ. Don't claim that the *lists* were written without AI help unless that's true.

---

## The moats

Each moat is a hub page (a category page, rewritten into a real landing page with an intro, the best generators first and a short guide) plus spoke generators. Every spoke links to its hub and to two or three siblings, and the "Related generators" block should favour the same moat.

Fit: ●●● core, ●● good, ● later or only partly.

| # | Moat (hub) | Fit | Already have | Keyword list demand |
|---|---|---|---|---|
| 1 | **D&D & Fantasy Characters** | ●●● | elf ×4, orc ×2, dwarf, dragon, wizard, demon, angel, fairy, D&D fantasy, epithet | dnd, fantasy, female/male fantasy, every race |
| 2 | **Worldbuilding: Places & Groups** | ●●● | town, city, country, fairy town, clan, guild | town, city, kingdom, village, tavern, world, island, empire, planet |
| 3 | **Weapons & Magic Items** | ●●● | 10 object generators | (not in the list, but proven on the site) |
| 4 | **Fandoms: Fantasy Games, Books & TV** | ●●● | Skyrim, WoW, LOTR, Hogwarts Legacy, Harry Potter, GoT, Warhammer, PoE, Minecraft | Elder Scrolls, WoW, LOTR, HP, GoT, BG3, Elden Ring, Star Wars |
| 5 | **Music & Creators** | ●●● | Dungeon Synth | band, rapper, stage name, song, Wu-Tang, K-pop group, podcast, YouTube |
| 6 | **Monsters & Genres** | ●● | vampire, alien, demon, swamp witch | vampire, zombie, pirate, viking, superhero, villain, sci-fi, cyberpunk, robot, horror |
| 7 | **Historical Character Names** | ●● | none | medieval, Viking/Norse, Old English, Victorian, Roman, Greek, Japanese, Old West |
| 8 | **Business & Brand** | ●● | business, company, brand, blog, café | business (free), company, brand, LLC, shop, podcast, YouTube channel |
| 9 | **Events** | ●● | none (156 impressions already) | party, festival, gig, quiz team, hen do, stag do, team |
| 10 | **Name Tools** | ● | none (needs engine work) | combine/mix two names, ship name, from letters, random picker/wheel |
| 11 | **Gaming Handles** | ● | none | gamertag, Xbox, Discord, username, clan (have) |

### Not worth pursuing (and why)
- **Baby names, and real names by ethnicity** (baby, boy, girl, Indian, Hispanic, African American…): dominated by Nameberry, BabyCenter and Behind the Name. This is a different audience who won't use the rest of the site, and real cultural names need care the site can't give at scale. Historical names *for fiction* (Moat 7) get the useful part of this demand.
- **Fancy fonts and symbols** (PUBG/Free Fire stylish names, cursive, emoji): a different kind of tool, low-value traffic, and visitors who leave once they've copied.
- **Tracing worksheets and printables**: a different product (a PDF maker).
- **Fake identities** (fake name, US fake name): attracts misuse, and it is off-brand.
- **Kids' platforms** (Roblox, Adopt Me, Zepeto) and **anime**: they fit, but they are franchise-by-franchise work for a young audience. Revisit after Moat 4 is done; anime (Naruto, JJK, One Piece, Bleach) is the best of these.
- **Noise in the list**: IUPAC, NASA Landsat, Coke can, QR codes, will makers, "Gen Z" generation questions.

---

## Two tracks, run together

**Track A: make every existing page great.** Work through the `CONTENT.md` progress queue in Search Console order (pages with clicks or impressions first, then the flagged problems). Done so far: Skyrim Orc, Elf, Business, Epithet, Demon Epithet, Hogwarts Legacy Witch and Wizard. Each rewrite also improves the generator itself, not just the article, as with Skyrim's gro-/gra- full names and Epithet's "Any category" option.

**Track B: build the moats** (the phases below). New pages are written to `CONTENT.md` from day one, so they never join the rewrite queue.

While traffic is this low, lean towards Track A: roughly one rewrite for every new generator. Once rewritten pages start getting clicks, shift towards Track B. Each new page follows `CONTENT.md` (≥100 names, 30+ per choice, real-source facts checked, FAQs drawn from the keyword variants).

## Phases

### Phase 0: Foundations (first 2–3 weeks)

**Status (20 Oct 2026):** 1–4 are done: homepage and category intros, the Event Name Generator, the generator upgrades, and the Hammer rename and Business/Company/Brand split. Vampire is next in Track A.

1. **Homepage and the 10 category pages** (most impressions): a real title and intro for each, the best generators first with a line on what each does, and a homepage hero that says what the site is. This is where the moat hubs begin; later phases add new hubs (D&D, Elder Scrolls, Music…) the same way.
2. **Event Name Generator** for the empty Events category (156 impressions). A Type filter with "Any": party, festival, gig, fundraiser, tournament or raid, quiz night, hen/stag do (all in the keyword list). Gigs and festivals get notes from Rich. It can later split into Festival, Party and Hen/Stag Do pages if Search Console shows those queries.
3. Copy-to-clipboard, shortlist, count choice and URL settings (above).
4. Fix the Warhammer intent clash and the Business/Company/Brand overlap.
5. Vampire rewrite (names and article).
6. SEO.md to-dos that affect sharing: share image, GA4.

### Phase 1: Own D&D (weeks 2–8)

**Status:** D&D hub, Tiefling, Tavern, Dragonborn, Halfling, Gnome, Half-Elf, Goblin, Kobold, Lizardfolk, Githyanki, Knight, Paladin and Baldur's Gate 3 are live. Fantasy Shop (magic shops, smiths, apothecaries) is live too. **Village and Kingdom are not separate pages**: Fantasy Town already covers villages and Fantasy Country already targets kingdom names, so new pages would compete with them. Instead, when those two are next rewritten, add "village" and "kingdom" to their titles, keywords and FAQs. Next: Fantasy World, Island, then Human (Forgotten Realms ethnicities), then Phase 4.

Biggest searches, best fit, and most of the engine work is reuse.

**New hub:** *D&D Name Generators* (category `dnd`), listing every race, class and place and linking out to all of them. Reposition `dnd-fantasy-name-generator` as the all-races page that this hub leads with, with a Race filter that draws on the race pages' lists.

**New race generators** (D&D style first; add a Tolkien or folklore option where it really exists):

| Generator | Also targets | Notes |
|---|---|---|
| Tiefling | infernal names, virtue names | Format: infernal name *or* virtue name ("Hope", "Sorrow"), like the PHB |
| Dragonborn | clan names | Personal name + clan name, child names |
| Halfling | hobbit names (link to LOTR) | Family names like "Tealeaf"; Tolkien-style hobbit option |
| Gnome | rock/forest gnome | Nicknames are part of gnome naming in D&D lore; add a nickname format |
| Human (D&D) | D&D human names | The PHB's human ethnicities as a Style filter |
| Goblin | goblin, hobgoblin, bugbear | Funny and fearsome styles |
| Half-Elf | half elf names | Elven, human or mixed formats; reuse the elf lists |
| Drow | drow name generator | Split from Dark Elf if Search Console shows "drow" queries landing there; house names |
| Githyanki | | Harsh sounds; BG3 made this search big |
| Kobold | | Short, draconic; tribe names |
| Lizardfolk | | Names as descriptions (D&D lore) |
| Tabaxi | (not in list; check demand) | Name format is a phrase ("Smoke on the Water"); fits the template recipe |
| Aasimar, Genasi, Firbolg | (check demand) | Only if the data supports them |

**Class and role names** (spoke off Wizard): Knight, Paladin, Warlock, Rogue (fold into Assassin?), Bard (link Music), Cleric, Druid, Jester, Hero, Villain, God. Start with Knight, Paladin and God, which appear in the keyword list.

**Places for D&D** (Moat 2): **Tavern/Inn**, **Kingdom**, **Village**, **Fantasy World**, **Island**, **Empire**, **Fantasy Planet**, **Shop/Magic Shop**. Tavern goes first: it is a huge tabletop search, and the template recipe ("The [adjective] [noun]") is quick to build.

**Build out from Epithet** (one of the two pages with clicks): it already attaches a title to the visitor's own character name. Siblings with the same text-box pattern: **Knight Title**, **Villain Title**, **Nickname** (for D&D characters), **Dragon Epithet**, **Royal/Noble Title**. All of them link back to Epithet and Demon Epithet, and they feed the "build a character" page.

**Baldur's Gate 3 Name Generator**: a fandom page that pulls the D&D race lists through one Race filter, with an article on BG3's origin characters. It is cheap to build because it reuses Phase 1 work.

### Phase 2: Finish the fandom clusters you've started (weeks 6–14)

**Status:** Elder Scrolls cluster done: hub (`categories/elder_scrolls-names.html`), Skyrim Orc, Nord, Khajiit, Dunmer, Altmer, Argonian. Warcraft cluster done: hub (`categories/warcraft-names.html`), WoW Orc, Night Elf, Blood Elf, Troll. Warhammer done: hub (`categories/warhammer-names.html`) and the Warhammer 40k Name Generator at the old `warhammer-name-generator` address (Space Marines by Chapter style, Imperial Guard, Aeldari). Hobbit, Game of Thrones, Elden Ring and Star Wars are live too. Next: Phase 3 (Music & Creators) generators that do not need Rich's notes: Band, Album, Song Title, Rapper, Stage Name, Wu-Tang.

Build out franchises where the site already has a page, so each becomes a small hub. **Start with Harry Potter**: Hogwarts Legacy Witch gets the site's most clicks, and its two pages are already rebuilt.

| Franchise hub | Have | Add |
|---|---|---|
| **Elder Scrolls** | Skyrim Orc | Khajiit (real naming rules: Ri'/Ja'/Do' prefixes), Nord, Dunmer, Altmer, Argonian; hub "Skyrim/Elder Scrolls Name Generator" |
| **Warcraft** | WoW Orc | Night Elf, Blood Elf, Troll (Zandalari), Undead, Dwarf; hub "WoW Name Generator" |
| **Tolkien** | LOTR Orc, LOTR Wizard, Elf (Tolkien option) | Hobbit, Elvish/Sindarin (with real meanings), Dwarvish, Rohirrim, Gondor; hub "LOTR Name Generator" |
| **Harry Potter** | Hogwarts Legacy Witch/Wizard (rebuilt), HP Witch, Wand | Rewrite HP Witch to match the Hogwarts Legacy pages; then HP Wizard, Pure-blood family, House-elf; hub "Harry Potter Name Generator" linking all of them |
| **Game of Thrones** | GoT Sword | GoT character names (house names, bastard surnames by region: Snow, Rivers, Sand…), Valyrian; hub |
| **Warhammer** | Warhammer Orc, Ogryn | Space Marine, Chaos, Imperial Guard, Eldar/Aeldari; then the "Warhammer name generator" hub (see Phase 0) |
| **Elden Ring** (new) | | Tarnished/character, weapon and boss names; strong in the keyword list |
| **Star Wars** (new, later) | | Jedi, Sith, Mandalorian, Twi'lek/Zabrak |

Every fact in these pages needs checking against the source (see the accuracy rules in `CONTENT.md`).

### Phase 3: Music & Creators, Rich's moat (weeks 10–18)

**Status:** Band (by genre), Album, Song Title, Rapper, Stage Name and Wu-Tang are live in the Music category. DJ and Podcast are live too. Still to come: Rich's own notes on the Band page (see OWNER-TODO) and YouTube Channel. Metal is a genre option on Band rather than its own page, to avoid two pages competing.

This is where the site has expertise nobody else can copy. Each page gets notes from Rich (what makes a name work live, on streaming and in a search, and checking for existing bands on Bandcamp, Spotify and Discogs).

- **Band Name Generator** (hub) with a Genre filter: metal, punk, indie, folk, electronic, post-rock, black metal.
- **Album Name**, **Song Title**, **Stage Name / Artist Name**, **Rapper Name**, **DJ Name**, **Metal Band**, **Black Metal** (sibling to Dungeon Synth), **Podcast Name**.
- **Wu-Tang Name Generator**: a well-known novelty search (adjective + title) that people share.
- Optional: K-pop group, drag name. Only with real knowledge of the scene.
- Move Dungeon Synth into this hub (and do its `CONTENT.md` rewrite with real artists and Rich's notes), and move Podcast, YouTube Channel and Blog here as "Creator names".
- Link the gig and festival options of the Event Name Generator from here.

### Phase 4: Monsters & Genres (weeks 14–22)

**Status:** Pirate, Viking, Superhero and Villain (Characters) and Werewolf and Zombie (Folklore) are live. Cyberpunk, Robot and Spaceship (new Sci-Fi hub), Ghost, a Witch hub and YouTube Channel are live too. Phase 4 done.

A broad audience (writers, gamers, horror fans) that still links back to fantasy.

Zombie, Werewolf, Pirate (and pirate ship), Viking (crosses into Moat 7), Superhero, Villain, Cyberpunk, Robot/Android, Sci-fi character, Spaceship, Horror character, Witch hub (linking Swamp Witch, HP Witch and PoE Witch), Ghost.

### Phase 5: Historical Character Names (weeks 18–26)

**Status:** Done as a new Historical hub: Roman, Ancient Greek, Anglo-Saxon, Medieval, Victorian and Old West, each with real period names and (where certain) meanings. Viking is in Characters. Japanese historical names are left out for now: they need more care with kanji meanings than a quick page allows.

This fills the People category with what its description promises, framed for writers and GMs: real names from the period, with meanings and sources.

Medieval English, Viking/Norse (with patronymics: -son/-dóttir), Old English/Anglo-Saxon, Victorian, Roman (praenomen–nomen–cognomen), Ancient Greek, Japanese (historical, with kanji meanings), Old West. Each page says where its names come from.

### Phase 6: Name tools (when the engine supports it)

**Status:** The Name Combiner (`name-combiner.html`) is live, using a new `blend` recipe in the engine (documented in the README). It targets name combiner, ship name, couple name and "mix two names" searches. The Gamertag Generator (with an optional word of your own, and each platform's name rules) is live too. **Spin the Wheel is live** (`spin-the-wheel.html`, built to `docs/redesign/WHEEL.md`: `lib/wheel.js`, a template in `build-pages.js`, styles in `site.css`). It's linked from every page's footer, both sitemaps and `llms.txt`. Still to build on the same engine: Random Name Picker, Raffle / Pick a Winner, Secret Santa and Team Generator. Plan: a wheel page where visitors paste or type names (one per line), spin with a proper easing animation, see the winner, and optionally remove the winner for the next spin. Lists are kept in the browser, and each spin's list can be shared as a link. It also gets a "fill from a generator" button (e.g. 8 elf names) that ties the wheel back to the rest of the site. Pages: Spin the Wheel (hub), Random Name Picker, Raffle / Pick a Winner, Secret Santa (draws pairs), and Team Generator (splits names into teams), all on one engine.

High demand, but each needs a new recipe type and competes with established tools. Build one, measure it, then decide.

1. **Name Combiner / Ship Name Generator**: two text boxes, blended by syllables (also targets "couple name", "mix two names", "combine names"). New `blend` recipe.
2. **Gamertag / Username Generator**: an optional text box ("include my name"), style filters (cool, funny, fantasy, short/4-letter for Xbox), with Discord, Xbox and Instagram as options instead of separate pages.
3. **Random Name Picker / Wheel**: a utility for classrooms and raffles. Only if the site wants that audience; it is a different visitor.

---

## How each new page is chosen and judged

Before building, ask:
- **Does it fit a moat?** If not, skip it, or wait until there are three pages to make a moat.
- **Can it be the best result?** Real rules from the source, choices that matter, enough names for every choice. If the source has no naming rules, say what makes the names feel right instead.
- **Does it link both ways?** It goes in a hub and has at least three natural sibling links.

After launch (check monthly in Search Console):
- Impressions and clicks per **moat** as well as per page. Moats are what Google rewards.
- Pages with impressions but low CTR: rewrite the title and description to the exact query (e.g. add "with meanings" or "D&D 5e").
- Queries landing on the wrong page: a sign that a new spoke is needed (as with "drow" on Dark Elf).
- Once GA4 is in: pages per visit and shortlist use. If the shortlist is used, build the character builder.

## Keyword list → page map (quick reference)

| Keyword(s) from the list | Page |
|---|---|
| fantasy, female/male fantasy, a name generator fantasy | D&D Fantasy (rename the hub "Fantasy Name Generator"?) |
| dnd, dnd 5e, for dnd, dnd character, rpg, oc, character | D&D hub + D&D Fantasy |
| elf, elven, elvish, wood elf, night elf, drow, half elf | Elf family (+ Night Elf in Warcraft, Half-Elf, Drow) |
| orc, ork, half orc | Orc family (have) |
| dwarf, dragon, wizard, demon | Have; improve |
| tiefling, dragonborn, halfling, hobbit, gnome, goblin, githyanki, kobold, lizardfolk, yuan-ti, human dnd | Phase 1 |
| knight, paladin, god, jester, hero, villain, warrior | Phase 1 classes / Phase 4 |
| town, city, village, kingdom, empire, world, island, planet, tavern, country | Moat 2 (have town, city, country) |
| skyrim, elder scrolls, eso, khajiit, nord | Elder Scrolls hub |
| wow, zandalari troll, night elf | Warcraft hub |
| lotr, lord of the rings, quenya, hobbit | Tolkien hub |
| harry potter, hogwarts, hogwarts legacy | HP hub (have three) |
| game of thrones, valyrian | GoT hub |
| bg3, elden ring | Phase 1 / Phase 2 |
| band, rapper, rap, stage name, song, wu tang, podcast, youtube channel | Music & Creators |
| vampire, zombie, pirate, viking, superhero, villain, sci fi, cyberpunk, robot, horror, alien | Monsters & Genres |
| medieval, norse, old english, victorian, roman, greek, japanese, old west | Historical Names |
| business, company, brand, llc, logo, website, domain | Business moat (have three; separate their jobs) |
| stag do, hen do, quiz team, party, festival, events | Event Name Generator (Phase 0) |
| combine/mix two names, ship, couple, from letters, using two names | Name Combiner (Phase 6) |
| gamertag, xbox, discord, username, instagram | Gamertag/Username (Phase 6) |
| wheel, spinner, picker, raffle, pick a winner, secret santa | Random Picker (Phase 6, optional) |
| ai, no ai, does it use ai, best name generator | About page + one FAQ per hub |
