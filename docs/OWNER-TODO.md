# Rich's to-do list

## Overnight summary (20–21 October 2026)

Both Claude sessions worked through `docs/CONTENT-PLAN.md` overnight. The site went from 52 generators to 108, every one of them on `main` and live.

**New generators (Claude session 2):** 55 new pages in 7 new hubs.
- **D&D hub**: Tiefling, Dragonborn, Halfling, Gnome, Half-Elf, Human, Goblin, Kobold, Lizardfolk, Githyanki, Knight, Paladin, Tavern, Fantasy Shop, Baldur's Gate 3.
- **Game hubs**: Elder Scrolls (Nord, Khajiit, Dunmer, Altmer, Argonian), Warcraft (Night Elf, Blood Elf, Troll), Warhammer (a 40k generator at the old Warhammer address).
- **Pop culture**: Hobbit, Game of Thrones, Elden Ring, Star Wars.
- **Music & creators**: Band, Album, Song Title, Rapper, Stage Name, Wu-Tang, DJ, Podcast, YouTube Channel.
- **Characters & folklore**: Pirate, Viking, Superhero, Villain, Werewolf, Zombie, Ghost, Gamertag, plus a Witch hub.
- **Sci-Fi hub**: Cyberpunk, Robot, Spaceship. **Historical hub**: Roman, Ancient Greek, Anglo-Saxon, Medieval, Victorian, Old West.
- **Name Combiner** (ship names), built on a new "blend" feature in the engine.
- **Fixes**: click-to-copy, the ♥ shortlist, 8/16/32 names and shareable links are live on every page. An engine bug that hid options on the Dragon page is fixed.

**Rewrites (Claude session 1):** the homepage and every category page got proper intros, and a new Event Name Generator went live. Track A is finished: every page that still had old boilerplate, about 55 in all, was rewritten and its name data rebuilt. That covers the fantasy races and creatures, the places, all the weapons and items, the wizard and witch pages, Clan, Guild, Alien, Assassin, Blog, Ogryn, Company, Brand and Café. Filler words, famous characters and chain names are gone. Many names are now built from real words with their meanings: Quenya and Sindarin elf family names, Japanese sword names, English place-name endings, heraldry. Fantasy Town and Fantasy Country now also target "village" and "kingdom" searches.

**What needs you, in order:**
1. ~~Google Analytics~~: done. The tag is live and linked to Search Console.
2. Search Console indexing: partly done (the daily limit was reached). Carry on a few a day (see "Now" below).
3. Have a look at the new pages and say what you'd change.
4. ~~Random picker/wheel~~: decided (build it after the redesign).
5. Add your notes to Band and Dungeon Synth when you have time.


Things only Rich can do. The Claude sessions add items here as they come up and tick them off when they see they're done. Newest at the bottom of each section.

## Now

- [x] **Google Analytics (GA4).** Done: tag `G-R34WKHG3SR` is on every page (21 October).
- [x] **GA linked to Search Console.** Done (21 October).
- [x] **Sitemap fixed in Search Console.** `sitemap.xml` submitted in place of `sitemap.html` (21 October).
- [ ] **Request indexing for new and moved pages.** Partly done on 21 October; Search Console only allows about 10 requests a day. Do the hubs first, a few more each day. The sitemap (`sitemap.xml`, submitted under Sitemaps) lets Google find everything else on its own, so the rest is a nudge, not essential. URL Inspection → Request indexing for:
  - **First, while it's still October:** `https://thenamegenerators.com/categories/halloween-names.html` (new Halloween hub)
  - **Then the new Halloween generators:** `/posts/witch-name-generator.html`, `/posts/black-cat-name-generator.html`, `/posts/haunted-house-name-generator.html`
  - **Then the rest of the Halloween set, a few a day:** `/posts/coven-name-generator.html`, `/posts/monster-name-generator.html`, `/posts/skeleton-name-generator.html`, `/posts/spell-name-generator.html`, `/posts/horror-movie-title-generator.html`, `/posts/mummy-name-generator.html`, `/posts/scarecrow-name-generator.html`
  - **Christmas (request in early November, before the searches peak):** `https://thenamegenerators.com/categories/christmas-names.html` first, then `/posts/elf-on-the-shelf-name-generator.html`, `/posts/christmas-elf-name-generator.html` and `/posts/christmas-quiz-team-names.html`; the hub links the reindeer, snowman and pet pages
  - **Mythical creatures (new hub, 26 generators, all year round):** `https://thenamegenerators.com/categories/mythical-names.html`; it links every creature page
  - **Minecraft (new hub, all year round):** `https://thenamegenerators.com/categories/minecraft-names.html` first, then `/posts/minecraft-username-generator.html` and `/posts/minecraft-name-from-your-name.html`; the hub links the other seven
  - `https://thenamegenerators.com/` (new hero)
  - `https://thenamegenerators.com/posts/hammer-name-generator.html` (was Warhammer)
  - `https://thenamegenerators.com/posts/event-name-generator.html`
  - `https://thenamegenerators.com/categories/places-names.html` and `.../events-names.html`
  - New D&D pages as they go live (listed under "Review" below)
  - `https://thenamegenerators.com/name-tools.html`, `/random-name-picker.html`, `/raffle-picker.html`, `/secret-santa-generator.html`, `/team-generator.html`
- [x] **Redesign.** Done and live.

## Review when you have a minute

New and rewritten pages. Read them on the live site; reply in any session with changes.

- [ ] Event Name Generator
- [ ] Vampire (rewritten)
- [ ] Category pages and homepage hero
- [ ] Hammer (renamed), and the Business / Company / Brand split
- [ ] **New pages from the overnight run** (request indexing for the hubs first; Google finds the rest through them):
  - **D&D hub** (`categories/dnd-names.html`): Tiefling, Dragonborn, Halfling, Gnome, Half-Elf, Goblin, Kobold, Lizardfolk, Githyanki, Knight, Paladin, Human, Tavern, Fantasy Shop, Baldur's Gate 3
  - **Elder Scrolls hub**: Nord, Khajiit, Dunmer, Altmer, Argonian
  - **Warcraft hub**: Night Elf, Blood Elf, Troll
  - **Warhammer hub**: Warhammer 40k (at the old Warhammer address)
  - **Pop culture**: Hobbit, Game of Thrones, Elden Ring, Star Wars
  - **Music**: Band, Album, Song Title, Rapper, Stage Name, Wu-Tang, DJ, Podcast
  - **Characters and folklore**: Pirate, Viking, Superhero, Villain, Werewolf, Zombie, Ghost
  - **Sci-Fi hub** (`categories/scifi-names.html`): Cyberpunk, Robot, Spaceship (with Alien and Star Wars)
  - **Witch hub** (`categories/witch-names.html`) and **YouTube Channel** (in Blogs & Brands)
  - **Historical hub** (`categories/historical-names.html`): Roman, Ancient Greek, Anglo-Saxon, Medieval, Victorian, Old West
  - **Name Combiner** (`posts/name-combiner.html`): type two names, get ship-name blends. Try it with your own names!
  - **Gamertag Generator** (`posts/gamertag-generator.html`)
  - **Spin the Wheel** (`spin-the-wheel.html`): try it on your phone. Also request indexing for it in Search Console.
  - **Name tools** (`name-tools.html` hub): Random Name Picker, Raffle Picker, Secret Santa Generator, Team Generator. Request indexing for the hub and all four pages.
- [ ] **Warhammer 40k** (rebuilt: every faction, from Space Marines to Tyranids, each with its Chapters, Legions, regiments, orders, clans or septs, and new copy for all of them)
- [ ] Path of Exile Witch (rewritten: epithets by Ascendancy)
- [ ] Elven Sword (rebuilt: every name now has a real Sindarin or Quenya meaning)
- [ ] Dungeon Synth (rewritten without your notes; your notes would make it better)
- [ ] Company and Brand (rewritten; Brand's word lists rebuilt by hand, with a "with a product word" option)
- [ ] Assassin, Blog, D&D Fantasy and Ogryn (rebuilt; D&D Fantasy now gives names for every common race, or a random party, using the race generators' data)
- [ ] Alien and Swamp Witch (rebuilt: four alien kinds each with its own sound; swamp witches and hags from folklore, the Voodoo style removed)
- [ ] Clan and Guild (rebuilt: Highland-style clans with mottos and war cries, tribes, gaming clans with tags; five kinds of guild)
- [ ] LOTR Wizard (rebuilt: colours and Elvish names from real Sindarin, with meanings) and Funny Wizard (rewritten, rude names removed)
- [ ] Game of Thrones Sword (rebuilt: new names by house style; canon swords removed)
- [ ] Japanese Sword (rebuilt: names from real Japanese words with meanings, in three traditional patterns)
- [ ] Shield, Wand and Poison (rebuilt: shields with real heraldry; wands with wood, core, length and flexibility; poisons with form and effect)
- [ ] Axe (rebuilt: Norse, dwarven, brutal and homely names, with epithets or descriptions)
- [ ] Sword (rebuilt: heroic, dark and Old English names with epithets or descriptions; famous fantasy swords removed)
- [ ] Fairy and Fairy Town (rebuilt from folklore: flower fairies, Seelie and Unseelie courts, household sprites; homes under the hill, in the wood, fairy rings and courts)
- [ ] Angel and Demon (rebuilt: traditional angels with Hebrew meanings and new -el names; the 72 Goetia demons with ranks, and new demons with rank and domain)
- [ ] High Elf, Wood Elf and Dark Elf (rebuilt: high and wood elf family names from real Quenya and Sindarin words with meanings; drow with houses and titles)
- [ ] Half-Orc (rebuilt: names by upbringing, among humans, among orcs or between, with surname or deed-name)
- [ ] Warhammer Orc (rebuilt: 40K Orks or fantasy Orcs, with titles, real 40K clans and Ork-speak nicknames)
- [ ] WoW Orc (rebuilt: names that fit the game's rules, with earned surnames or real clans)
- [ ] LOTR Orc (rebuilt: Black Speech-style names by kind, with rank or place)
- [ ] Orc (rebuilt: harsh names with a deed-name, nickname or clan; famous orcs removed)
- [ ] Wizard (rebuilt: four name formats, epithets by D&D school of magic, male and female)
- [ ] Dwarf (rebuilt: Norse-style names, mountain or hill clan, or "son of"; Tolkien and D&D names removed)
- [ ] Dragon (rebuilt: seven kinds, harsh or sleek, optional epithets; famous dragons removed)
- [ ] Harry Potter Witch (rebuilt: everyday or pure-blood first names, house surnames, no canon names)
- [ ] Fantasy Town, Country, City and Cafe (all rebuilt: towns from real English place-name endings, countries in six language styles with optional titles, cities by kind with optional epithets, cafés in eight styles with the chain names taken out). Town and Country now also target "village" and "kingdom"

## Notes from Rich wanted

Pages that get better with your own experience. A few lines each, in any session.

- [ ] **Dungeon Synth**: artists and albums you rate, and what makes a project name work.
- [ ] **Event Name Generator, gigs and festivals**: what makes a good gig or festival name.
- [ ] **Band Name Generator** (now live): your band-naming lessons and any story about naming your own projects. A short section from you would make it the best band-name page out there.

## Decisions for you

- [x] **Cookie banner:** Rich: yes. Google Analytics now only loads after a visitor clicks Accept, and `privacy.html` explains what the site stores. Grow by Mediavine still loads on every page, and the privacy page mentions it.

- [x] **Swamp Witch:** the old "Voodoo" style was removed, because it treated a real religion as a costume. Rich: leave it out.
- [x] **D&D Fantasy** is now "any race or a random party", built from the race generators' lists. Rich: happy with it.

- [x] **Random name picker / wheel**: Rich: yes, build a spin-the-wheel tool once the redesign is settled, so it's built in the new design.

## Later

- [x] **Share images:** done. Every page has its own, drawn by `scripts/share-images.js` from its title and illustration; Rich checked them in a share preview (21 October).
- [ ] **Backlinks**: post the generators in D&D, worldbuilding and writing communities once the D&D cluster is up.

## Done

- [x] Split the work: content session does rewrites, intros and Events; this session does generator upgrades and new generators.
