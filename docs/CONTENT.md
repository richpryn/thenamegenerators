# Content notes

How the generator pages are written, so every page is helpful, specific and right. The three pilots (Skyrim Orc, Elf, Business) are the reference: when in doubt, read one of them.

## What a page is for

Someone arrives wanting a name. A good page:

1. **Gives them names straight away** (the generator, then the example names).
2. **Makes the names better than they'd get elsewhere**: the generator matches how the source actually names things (e.g. Skyrim's gro-/gra-), and the choices are worth having.
3. **Teaches them something they'll use**: how names in this world work, what the parts mean, how to build their own, what to check before using one.

If a paragraph doesn't do 2 or 3, cut it.

## Voice

- Neutral, friendly and knowledgeable: like a well-read friend who games, not a sales page. No "I"; "you" is fine.
- British English (recognise, colour, organisation).
- Plain words, short paragraphs. Lists for anything people will scan.
- Specific beats general: name the character, the book, the king, the stronghold. "Moth gro-Bagol, the smith in Markarth" beats "various Skyrim characters".
- Never: "Our X generator…", "authentic", "perfect for", "immortalized", "evoke", "rich linguistic traditions", "Understanding the etymology… adds depth". Don't open sections by restating the heading.

## Page anatomy

The build writes these, so the article mustn't repeat them:

| Part | Where it comes from |
|---|---|
| Example names (about 24) | Generated from the lists, grouped by choice |
| "How the X works" | The filters and lists: counts, every choice, a sample per format |
| Byline, dates, usage note | Build |
| Related and category links | Build |

The article (in the generator's JSON, under `article`) provides:

- **hero**: `title` (with the icon) and a one-line `tagline` that says what's special about this generator.
- **intro**: 2–4 sentences: what names in this world sound like and what this generator gives you. Plain text; `**bold**` and `<strong>` are fine. Mention the generator by its search phrase once ("this **Skyrim orc name generator**").
- **sections**: usually 3–5, each with a specific heading (a question or a claim, not "The Power of X Names"). Typical shape:
  1. How names work in the source (the rule, with real examples)
  2. Context that changes the name (culture, roles, setting)
  3. What the names sound like (patterns taken from the actual lists)
  4. How to build or choose one (practical steps)
- **faqs**: 3–5 real questions people search for, answered in 1–3 sentences. Answer first, then explain.

Numbers: never type a count. Use `{{names}}`, `{{combinations}}` ("over {{combinations}}") or `{{count:list.path}}`; the build fills them in.

## Briefs by page type

**Games, books and films** (Skyrim, Harry Potter, Hogwarts Legacy, WoW, Warhammer, LOTR, Path of Exile, Game of Thrones, Minecraft)
- Explain the naming rules of that world, with named characters as examples.
- Check every fact: who, where, what the name means. If unsure, leave it out.
- Say which names in the generator come from the source and which are new in its style.
- Make the generator follow the world's rules (formats, prefixes, house or faction choices).

**Fantasy creatures and peoples** (elf, dwarf, orc, dragon, demon, angel, fairy, vampire…)
- Contrast the big traditions (Tolkien, D&D, folklore, other games), with real examples and meanings.
- Give the building blocks (word parts, endings) so readers can make their own.

**Real-world names** (business, brand, company, blog, café)
- Practical: how to turn a word into a name, which themes suit which businesses, what makes a name work.
- Always include how to check a name is free (company register, trade marks, domains) and that it isn't legal advice.

**Objects and places** (swords, axes, wands, shields, poisons, towns, cities, countries)
- Real naming traditions (named swords in myth and history, place-name endings and what they mean).
- How to use the names in a game or story (who named it, what it's known for).

**Music** (dungeon synth)
- Real artists and albums, what the genre's names have in common, and notes from Rich.

## Accuracy rules

- Only state what's known to be true. Meanings of real words and invented-language words must be the actual meanings, not guesses.
- Don't claim the generator's own structure is how the source works (e.g. "WoW orc names are organised by class").
- Name counts only through placeholders.
- No innuendo or adult jokes: plenty of visitors are young.
- When a page draws on real names (Tolkien's elves, historical kings), say so.

## Generator checklist

- Every result reads correctly in a sentence (no "of North", no stray brackets, no typos).
- No filler entries (synonyms of synonyms, notes pasted into lists).
- At least 100 names in total, ideally 30+ for every choice someone can make.
- Formats that match the source (gro-/gra- for Skyrim orcs; full name with epithet for angels).
- An "Any" option when there are many categories.
- A text box when the result attaches to the user's character (epithets).
- `optionLabels` for anything the automatic label gets wrong ("D&D", not "Dnd").

## Category pages

Each category in `content/categories.json` has a `heading` (the H1), `seoTitle`, a short `description` (shown on cards and under the heading), `seoDescription`, an `intro` (HTML, two short paragraphs) and `featured`: the three or four best generators to start with, each with a one-line `note`. Keep category titles different from any generator's title so they don't compete (e.g. "Event Name Ideas…" for the category, "Event Name Generator" for the generator).

## Adding a new generator

1. Rich gives the name and any angle or personal notes.
2. Claude proposes filters, recipe and lists; writes the names and the article to these notes; checks facts.
3. Build, check in the browser, Rich reviews, merge.

## Progress

Done to these notes: Skyrim Orc, Elf, Business, Epithet, Demon Epithet, Hogwarts Legacy Witch, Hogwarts Legacy Wizard, Event (new), Vampire, Path of Exile Witch, Elven Sword. Homepage hero, All Generators and all 10 category intros.

Order for the rest: pages with clicks or impressions first (check Search Console → Performance → Pages), then the pages flagged below.

Search Console, October 2026: Hogwarts Legacy Witch (4 clicks / 239 impressions) and Epithet (3 / 77) are the only generator pages with clicks. The homepage (534 impressions), Places category (229), Events category (156, with no generators in it) and All Generators (133) get most impressions, so the homepage and category pages are next.

Known problems to fix when each page's turn comes:
- **Dungeon Synth**: no real artists named; ideal for notes from Rich.
- **Hammer** (was Warhammer; renamed so the old address can become a Warhammer 40k character page): title, intro and keywords are new, but the sections are still the old style ("Our generator", "perfect for", unchecked video-game examples) and need a full rewrite.
- **Business, Company, Brand**: each now has one job (Business: single words for shops, trades and services; Company: startup-style names; Brand: product names by industry) with its own keywords and a "which should I use?" FAQ. Company and Brand sections still need rewriting to these notes; keep each page to its job.
