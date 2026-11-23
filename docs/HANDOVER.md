# Handover

Each session keeps its own section. Read the whole file at the start of a session.

## Generator Builder (data, engine and build; 16 Nov 2026)

### Where things stand
- About 410 generators, 33 hubs, 16 Naming Library pages (`/reference/`), 20 name lists (`/names/`), 10 guides, the Business Name Checker, Spin the Wheel and the name tools. All live and validating.
- **Business:** 96 trade generators in six hubs (biz_food, biz_beauty, biz_trades, biz_shops, biz_services, biz_care) plus business, company, brand and cafe, all with a Check button. The checker is at `business-name-checker.html`:
  - **live in the browser:** RDAP domain checks, and US state open-data lookups for CO/NY/OR/CT/TX
  - **links:** the UK Companies House name check, trade mark searches and social handles
  - **affiliate buttons:** set in `content/affiliates.json`, placeholders until Rich has tracking links
  - **Companies House proxy:** a Cloudflare Worker in `workers/companies-house/`, waiting for Rich's API key; set `companiesHouseApi` in affiliates.json once deployed.
- **Name lists:** ranks come from `content/data/ons-names.json`, built from the ONS 1996–2025 workbook by `scripts/data/ons-names.py`. Builder `scripts/list-pages.js`, filters `lib/lists.js`. Compact table design from 14 Nov; keep the `.nl-body` wrapper and the `.nl-item` class.
- **Naming Library:** builder `scripts/reference-pages.js`. Every example has a status (attested / reconstructed / derived / invented / uncertain), and the validator requires sources.
- **Name Element Finder** (17 Nov): `reference/name-elements.html`, 292 sourced word parts (Old English, Old Norse, Welsh, Scottish Gaelic, Irish, Latin, Greek, Old High German, Frankish). Data in `content/name-elements/` (README there), builder `scripts/elements-page.js`, filters `lib/elements.js`. Generator pages whose keys appear in the data link to it from "Understanding these names". `?q=wolf` pre-fills the search.
- **Provenance labels** (17 Nov): generators with `"provenance": { "lists": { "<data path>": "recorded" | "derived" | "canon" | "invented" } }` show a badge on every name (Real name, Real parts, From Tolkien, Invented) plus a key under the results; a name joined from several lists becomes Real parts. Optional `canon`, `canonWork`, `labels`, `hyphenated`. Logic in `lib/recipe-engine.js` (`provenanceOf`, `provenanceLabel`). On so far: viking, roman, ancient_greek, medieval, victorian, elf, epithet, last_name. Not yet: anglo_saxon and the Hogwarts pages (a list mixes real and new names; split the list first), character_name.
- **Homepage** has an "Every name has a story" Library band (17 Nov), built by `libraryHomeHtml()` in build-pages.js.
- **Generator pages** show "How it works" with nameSource, an "Understanding these names" box from the library, a Naming guide box and a Name lists box, plus 8 hub links (no longer the whole hub).

### Shipped 23 Nov
The ten ideas approved on 9 and 16 Nov are live: book_club, running_club, gingerbread_house, quiz_team, gritter, snow_removal_business, horse, ice_mage, hamster and guinea_pig. Weekly names went to nail_salon, dog_grooming and orc. Articles and drawings were requested from the content and design sessions. No new-idea research this week (none pending approval).

### Backlog (approved by Rich; build one a week)
- **Franchise and character pages:** WoW Dwarf, WoW Tauren, funny WoW names by class, FF14 Viera, Transformers-style, funny Marvel Rivals, Sims names. Write these "in the style of", with original names only.
- **Titles:** knight title, villain title, nickname, dragon epithet, royal title, jester, hero, black metal band.
- **Game extras:** Minecraft (skin, boss, build, potion, YouTube channel, modpack, map) and Elden Ring weapon and boss names.
- **Possible trade pages:** junk removal, dog training, fence company.
- **Naming Library phase 4:** business, brand and stage names.

### Scheduled task
"TNG weekly generator and refresh" (trig_01KF7NvrpuE69hqvVxvEBo5z) runs Mondays at 07:56 London time. It fires into the long Generator Builder chat (session_013n1Brs6jN7WNjnPp4aVHzc). Each run:
- builds one backlog generator
- adds 50+ names to 3 pages, at least 2 of them business pages, oldest "updated" first
- researches 3–5 ideas into a `tng-ideas-<date>` Site Jobs entry
- ships and notifies the content and design sessions

To stop it re-reading this long chat, Rich could switch it to start a fresh session each time (update_trigger, create_new_session_on_fire). It's self-contained enough.

### Decisions
- Fan pages use original names only, and say they're fan-made and unofficial. Canon ban lists are built from the wikis.
- Business names follow the rules in CLAUDE.md "Start here".
- Name lists: ONS ranks are for England and Wales only. No typed ranks. Disputed meanings are kept and labelled.
- Rich's style: meanings in straight single quotes in list copy.
- Outreach tracker (18 Nov): https://claude.ai/artifact/1s6kFY2S4J6j5EsHXsZrUe (a Sheet, 47 checked prospects with pitch and destination). Drafts go in Gmail for Rich to send once the email service is chosen.
- **Name Builder** (18 Nov): `reference/name-builder.html` joins two sourced elements into Old English, Old Norse, Germanic or Greek people's names, and Old English or Norse place names. Joining forms in `content/name-builder.json` (by element id, with m/f on second parts); builder `scripts/builder-page.js`, page script `lib/builder.js`. Names matching an example in the elements or Library data show as Recorded.
- **Worldbuilder's Naming Toolkit** (18 Nov): `worldbuilders-naming-toolkit.html`, built by `scripts/toolkit-page.js`; the outreach flagship. Linked from the homepage Library band, the Library index and the 22 generators it lists.
- Speed (Lighthouse, 18 Nov): performance 91–99, SEO 100, accessibility 96–100; best practices 79 only because Grow by Mediavine sets third-party cookies (see the consent decision on Site Jobs).
- Outreach (backlinks) is agreed in principle. It waits on Rich choosing an email service (Google Workspace or Zoho) and moving mail off Bluehost. Plan: a 30-site target list in a separate Outreach page, drafts in Gmail for Rich to send, and a "fastest-rising names" ONS data story for the press.
- Monthly email signup: agreed in principle, waiting on the email service choice.
- My World (saved name projects): decided 17 Nov to wait for analytics; when built, "My Worlds", on the save button and homepage only. Revisit in February (Site Jobs).

### Waiting on Rich (see Site Jobs)
Companies House API key and Worker; affiliate sign-ups; Cloudflare Web Analytics; email service and moving mail off Bluehost; the Search Console check of the name lists in late December.
