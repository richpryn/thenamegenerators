# Grown Up B · Illustration plan

Sample sheet: grown-up-B-illustrations.html (published as "Grown Up B · Illustration library (sample)").
Source of truth for generators: the read-only snapshot of origin/main in scratchpad/main-snapshot (108 generators, 17 categories).

## 1. Summary

- One shared **motif library**, not 108 bespoke drawings. Total: **81 drawings**.
  - 48 are drawn on the sample sheet: every motif needed by the 46 tier-1 generators, plus 7 category-only marks.
  - The 33 tier-2 motifs are now drawn too, plus "lost-map" for the 404 page, so the library has 82 drawings and every generator has its own (phase 5).
  - 4 generators get a lightly bespoke drawing (angel, goblin, hobbit, werewolf). Every other generator reuses a library motif, with at most a small accent variant.
- **17 category marks**: 10 reuse a library motif and 7 are category-only. Each is shown inside a hand-drawn "stamp" ring, so a category never looks like a single generator.
- **Tier 1** = homepage popular plus every category's featured picks: 46 generators, covered by 41 motifs, all drawn.
- To get the library nearer 50, merge more aggressively (one "hat" for top hat, cowboy hat and wizard hat with accent changes; one "mic" for rapper, podcast and stage name). I'd keep them separate: each costs about 15 minutes to draw, and distinct cards scan better on hub pages.

## 2. Where illustrations appear, and at what size

All drawings are authored once on a 48×48 grid and scaled. Nothing is redrawn per size.

| Slot | Size (phone / desktop) | Drawing | Notes |
|---|---|---|---|
| Generator page title, beside the H1 | 56 / 92 px | the generator's motif | aligned to the H1's last line; never pushes the generator down (it sits in the title row) |
| Hub "Where to start" cards | 52 px | generator motif | the one place a drawing is large inside a card |
| Hub full generator list cards | 32–40 px (optional) | generator motif | recommended on desktop; on phones too if the list feels like plain text |
| Homepage popular cards | 40 px | generator motif | |
| Homepage and footer category cards | stamp ring 48 px, motif 34 px | category mark | |
| "Browse other categories" grid (bottom of every page) | stamp ring 40 px | category mark | |
| About page | 92–120 px | quill + pencil, one or two drawings | decorative only |
| "Ran out of names" line ("That's all N names for these choices.") | 32–40 px | the generator's own motif | keeps the line friendly and on-subject |
| Empty shortlist / nothing saved | 32 px | pencil | |
| 404 page | 120 px | map with the route ending in a question mark (new drawing) | one bespoke drawing |
| Example-name boxes | none | – | the hand-drawn box is the decoration; drawings here would crowd the names |
| Ad slots | never | – | no drawing within 16 px of any ad container |

**Social/OG image:** recommended, but generated, not drawn per page.
- Use one 1200×630 template: paper background, the generator title in Schibsted Grotesk, the motif at 240 px and a highlighter swash.
- The build renders it at build time (headless Chromium or resvg-js).
- One template covers all 108 pages, so there's no extra drawing work. Do it in a later phase; it's not needed for launch.

## 3. Category marks (17)

| Category slug | Name | Mark motif | Generators |
|---|---|---|---|
| fantasy | Fantasy | dragon | 37 |
| dnd | D&D | d20 | 43 |
| pop_culture | Pop Culture | clapper | 25 |
| people | Characters | quill | 11 |
| places | Places | map | 6 |
| objects | Objects | sword | 10 |
| music | Music | note | 10 |
| historical | Historical | hourglass | 6 |
| witch | Witches | cauldron | 6 |
| elder_scrolls | Elder Scrolls | mountain | 6 |
| scifi | Sci-Fi | planet | 5 |
| folklore | Folklore | mushroom | 5 |
| organizations | Organisations | banner | 5 |
| warcraft | Warcraft | crossed-axes | 4 |
| warhammer | Warhammer | cog-skull | 3 |
| concepts | Blogs & Brands | lightbulb | 3 |
| events | Events | bunting | 1 |

## 4. Motif library

Status "drawn" means it's on the sample sheet; "drawn (tier 2)" means it was added in phase 5. All drawings live in `lib/illustrations.js`.

| Motif id | Name | Shows | Used by | Status |
|---|---|---|---|---|
| leaf | Elven leaf | a single pointed leaf with veins | altmer, elf, half_elf, high_elf, wood_elf | drawn |
| leaf-moon | Leaf and crescent | the elven leaf under a crescent moon | dark_elf, night_elf | drawn |
| leaf-flame | Leaf and flame | the elven leaf with a small flame | blood_elf | drawn |
| war-axe | War axe | a heavy single-bladed axe on a long haft | half_orc, lotr_orc, orc, skyrim_orc, warhammer_orc, wow_orc | drawn |
| axe | Bearded axe | a double-bit axe, Norse style | axe, nord | drawn |
| flame | Flame | a tall flame with a bright core | demon_epithet | drawn |
| d20 | D20 | a twenty-sided die | bg3, dnd_fantasy, dnd_human; category: D&D | drawn |
| horns | Horns and tail | two curving horns over a brow, with a pointed tail | demon, tiefling | drawn |
| pub-sign | Pub sign | a hanging tavern sign with a tankard | tavern | drawn |
| laurel | Laurel | a laurel wreath, open at the top | epithet | drawn |
| wings | Fairy wings | two pairs of rounded wings | fairy | drawn |
| mushroom | Toadstool | a spotted toadstool | fairy_town, gnome; category: Folklore | drawn |
| guitar | Guitar | an electric guitar body and neck | band | drawn |
| candle | Candle and moon | a dripping candle under a crescent moon | dungeon_synth | drawn |
| sword | Sword | a straight longsword, tilted | elven_sword, funny_sword, sword; category: Objects | drawn |
| sword-crown | Sword and crown | the sword with a small crown at the hilt | game_of_thrones_sword | drawn |
| katana | Katana | a curved single-edged blade with a round guard | githyanki, japanese_sword | drawn |
| lightbulb | Lightbulb | an idea bulb | business; category: Blogs & Brands | drawn |
| banner | Banner | a swallowtail banner on a pole | guild; category: Organisations | drawn |
| round-shield | Round shield | a round shield with a boss | anglo_saxon, clan, paladin, shield | drawn |
| hood | Hood | an empty hooded cloak | assassin | drawn |
| house | Village house | a gabled cottage with a chimney | fantasy_town | drawn |
| map | Map | a folded map with a dotted route | fantasy_country; category: Places | drawn |
| castle | Castle | a crenellated keep with a flag | fantasy_city, medieval | drawn |
| paw | Paw print | a cat paw print | khajiit | drawn |
| lizard | Lizard | a lizard seen from above | argonian, kobold, lizardfolk | drawn |
| tusks | Tusks | a pair of upturned tusks | wow_troll | drawn |
| cog-skull | Skull in a cog | a skull inside a gear wheel | warhammer; category: Warhammer | drawn |
| club | Studded club | a big studded club | ogryn | drawn |
| rocket | Rocket | a little rocket with a porthole | spaceship | drawn |
| robot | Robot | a boxy robot head with an antenna | robot | drawn |
| city | Night city | a skyline with a lit street line | cyberpunk | drawn |
| planet | Ringed planet | a planet with a ring and a star | alien, star_wars; category: Sci-Fi | drawn |
| cauldron | Cauldron | a steaming cauldron on legs | swamp_witch; category: Witches | drawn |
| broom | Broomstick | a besom broom, diagonal | harry_potter_witch, hogwarts_legacy_witch | drawn |
| column | Column | a classical column | roman | drawn |
| cowboy-hat | Cowboy hat | a wide-brimmed hat | old_west | drawn |
| wand | Wand | a wand throwing a spark | hogwarts_legacy_wizard, wand | drawn |
| pencil | Pencil | a sharpened pencil | blog | drawn |
| tag | Price tag | a tag on a string | brand | drawn |
| bunting | Bunting | a string of party flags | event; category: Events | drawn |
| dragon | Dragon head | a dragon head in profile, horns swept back | dragon, dragonborn; category: Fantasy | drawn |
| quill | Quill | a feather quill | –; category: Characters | drawn |
| note | Music note | two joined notes | song_title; category: Music | drawn |
| mountain | Mountains | snowy peaks under a sun | –; category: Elder Scrolls | drawn |
| crossed-axes | Crossed axes | two war axes crossed | –; category: Warcraft | drawn |
| hourglass | Hourglass | an hourglass with sand | –; category: Historical | drawn |
| clapper | Clapperboard | a film clapperboard | –; category: Pop Culture | drawn |
| vinyl | Vinyl | a vinyl record | album | drawn (tier 2) |
| amphora | Amphora | a Greek amphora | ancient_greek | drawn (tier 2) |
| feather-wings | Feather wings | feathered wings with a halo | angel | drawn (tier 2) |
| cup | Cup | a coffee cup with steam | cafe | drawn (tier 2) |
| building | Building | an office block | company | drawn (tier 2) |
| headphones | Headphones | headphones | dj | drawn (tier 2) |
| volcano | Volcano | a smoking volcano | dunmer | drawn (tier 2) |
| pickaxe | Pickaxe | a pickaxe | dwarf | drawn (tier 2) |
| ring | Ring | a plain ring with a glint | elden_ring | drawn (tier 2) |
| shopfront | Shopfront | a striped-awning shopfront | fantasy_shop | drawn (tier 2) |
| wizard-hat | Wizard hat | a pointed wizard hat with stars | funny_wizard, lotr_wizard, wizard | drawn (tier 2) |
| crown | Crown | an iron crown | game_of_thrones | drawn (tier 2) |
| gamepad | Gamepad | a game controller | gamertag | drawn (tier 2) |
| ghost | Ghost | a sheet ghost | ghost | drawn (tier 2) |
| goblin-ear | Goblin ear | a pointed goblin ear with an earring | goblin | drawn (tier 2) |
| clover | Clover | a four-leaf clover | halfling | drawn (tier 2) |
| hammer | Hammer | a war hammer | hammer | drawn (tier 2) |
| round-door | Round door | a round door in a hillside | hobbit | drawn (tier 2) |
| helm | Helm | a great helm with a plume | knight | drawn (tier 2) |
| two-circles | Two circles | two overlapping circles | name_combiner | drawn (tier 2) |
| crystal-ball | Crystal ball | a crystal ball on a stand | path_of_exile_witch | drawn (tier 2) |
| skull-bones | Skull bones | a skull and crossbones | pirate | drawn (tier 2) |
| mic | Mic | a microphone | podcast, rapper | drawn (tier 2) |
| bottle | Bottle | a stoppered potion bottle | poison | drawn (tier 2) |
| star | Star | a star with spotlight rays | stage_name | drawn (tier 2) |
| mask | Mask | a domino mask | superhero, villain | drawn (tier 2) |
| bat | Bat | a bat in flight | vampire | drawn (tier 2) |
| top-hat | Top hat | a top hat | victorian | drawn (tier 2) |
| longship | Longship | a longship with a striped sail | viking | drawn (tier 2) |
| wolf-moon | Wolf moon | a wolf head against a full moon | werewolf | drawn (tier 2) |
| bee | Bee | a bee | wu_tang | drawn (tier 2) |
| old-tv | Old tv | an old TV with an antenna | youtube | drawn (tier 2) |
| hand | Hand | a hand rising from the soil | zombie | drawn (tier 2) |
| lost-map | Lost map | a folded map with a dotted path ending in a hand-drawn question-mark squiggle | the 404 page | drawn (tier 2) |

## 5. Generator inventory (108 generators)

Tier 1 = homepage popular + category featured. "Bespoke" = needs its own drawing rather than a library motif.

| Key | Title | Category | Motif | Variant tweak | Bespoke | Tier |
|---|---|---|---|---|---|---|
| blog | Blog Name Generator | Blogs & Brands | pencil | – | no | 1 |
| tiefling | Tiefling Name Generator | D&D | horns | – | no | 1 |
| event | Event Name Generator | Events | bunting | – | no | 1 |
| alien | Alien Name Generator | Fantasy | planet | small saucer instead of star | no | 1 |
| demon_epithet | Demon Epithet Generator | Fantasy | flame | – | no | 1 |
| dnd_fantasy | D&D Fantasy Name Generator | Fantasy | d20 | – | no | 1 |
| elf | Elf Name Generator | Fantasy | leaf | – | no | 1 |
| swamp_witch | Swamp Witch Name Generator | Fantasy | cauldron | reed stalks | no | 1 |
| fairy | Fairy Name Generator | Folklore | wings | – | no | 1 |
| fairy_town | Fairy Town Name Generator | Folklore | mushroom | tiny door in the stalk | no | 1 |
| anglo_saxon | Anglo-Saxon Name Generator | Historical | round-shield | – | no | 1 |
| medieval | Medieval Name Generator | Historical | castle | – | no | 1 |
| old_west | Old West Name Generator | Historical | cowboy-hat | – | no | 1 |
| roman | Roman Name Generator | Historical | column | – | no | 1 |
| band | Band Name Generator | Music | guitar | – | no | 1 |
| dungeon_synth | Dungeon Synth Name Generator | Music | candle | – | no | 1 |
| japanese_sword | Japanese Sword Name Generator | Objects | katana | – | no | 1 |
| sword | Sword Name Generator | Objects | sword | – | no | 1 |
| brand | Brand Name Generator | Organisations | tag | – | no | 1 |
| business | Business Name Generator | Organisations | lightbulb | – | no | 1 |
| clan | Clan Name Generator | Organisations | round-shield | tartan stripe accent | no | 1 |
| guild | Guild Name Generator | Organisations | banner | – | no | 1 |
| assassin | Assassin Name Generator | Characters | hood | – | no | 1 |
| epithet | Epithet Generator | Characters | laurel | – | no | 1 |
| fantasy_city | Fantasy City Name Generator | Places | castle | – | no | 1 |
| fantasy_country | Fantasy Country Name Generator | Places | map | – | no | 1 |
| fantasy_town | Fantasy Town Name Generator | Places | house | – | no | 1 |
| tavern | Tavern Name Generator | Places | pub-sign | – | no | 1 |
| argonian | Argonian Name Generator | Pop Culture | lizard | – | no | 1 |
| game_of_thrones_sword | Game of Thrones Sword Name Generator | Pop Culture | sword-crown | – | no | 1 |
| harry_potter_witch | Harry Potter Witch Name Generator | Pop Culture | broom | star accent instead of yellow bristles | no | 1 |
| hogwarts_legacy_witch | Hogwarts Legacy Witch Name Generator | Pop Culture | broom | – | no | 1 |
| hogwarts_legacy_wizard | Hogwarts Legacy Wizard Name Generator | Pop Culture | wand | – | no | 1 |
| khajiit | Khajiit Name Generator | Pop Culture | paw | – | no | 1 |
| nord | Nord Name Generator | Pop Culture | axe | – | no | 1 |
| ogryn | Ogryn Name Generator | Pop Culture | club | – | no | 1 |
| skyrim_orc | Skyrim Orc Name Generator | Pop Culture | war-axe | snow dots accent | no | 1 |
| warhammer_orc | Warhammer Orc Name Generator | Pop Culture | war-axe | cleaver blade | no | 1 |
| wow_orc | World of Warcraft Orc Name Generator | Pop Culture | war-axe | – | no | 1 |
| cyberpunk | Cyberpunk Name Generator | Sci-Fi | city | – | no | 1 |
| robot | Robot Name Generator | Sci-Fi | robot | – | no | 1 |
| spaceship | Spaceship Name Generator | Sci-Fi | rocket | – | no | 1 |
| blood_elf | Blood Elf Name Generator | Warcraft | leaf-flame | – | no | 1 |
| night_elf | Night Elf Name Generator | Warcraft | leaf-moon | – | no | 1 |
| wow_troll | World of Warcraft Troll Name Generator | Warcraft | tusks | – | no | 1 |
| warhammer | Warhammer 40k Name Generator | Warhammer | cog-skull | – | no | 1 |
| youtube | YouTube Channel Name Generator | Blogs & Brands | old-tv (new) | TV with antenna, no play-button logo | no | 2 |
| bg3 | Baldur's Gate 3 Name Generator | D&D | d20 | tadpole squiggle accent | no | 2 |
| dnd_human | D&D Human Name Generator | D&D | d20 | quill accent | no | 2 |
| dragonborn | Dragonborn Name Generator | D&D | dragon | scale pattern on neck | no | 2 |
| githyanki | Githyanki Name Generator | D&D | katana | zigzag guard | no | 2 |
| gnome | Gnome Name Generator | D&D | mushroom | pointed cap on top | no | 2 |
| goblin | Goblin Name Generator | D&D | goblin-ear (new) | big pointed ear with an earring | yes | 2 |
| half_elf | Half-Elf Name Generator | D&D | leaf | half the leaf in yellow | no | 2 |
| halfling | Halfling Name Generator | D&D | clover (new) | – | no | 2 |
| knight | Knight Name Generator | D&D | helm (new) | great helm with plume | no | 2 |
| kobold | Kobold Name Generator | D&D | lizard | smaller, with a candle stub | no | 2 |
| lizardfolk | Lizardfolk Name Generator | D&D | lizard | spear across | no | 2 |
| paladin | Paladin Name Generator | D&D | round-shield | sun rays on the boss | no | 2 |
| angel | Angel Name Generator | Fantasy | feather-wings (new) | with halo | yes | 2 |
| dark_elf | Dark Elf Name Generator | Fantasy | leaf-moon | ink-filled leaf, no yellow on leaf | no | 2 |
| demon | Demon Name Generator | Fantasy | horns | no tail; flame accent | no | 2 |
| dragon | Dragon Name Generator | Fantasy | dragon | – | no | 2 |
| dwarf | Dwarf Name Generator | Fantasy | pickaxe (new) | – | no | 2 |
| funny_wizard | Funny Wizard Name Generator | Fantasy | wizard-hat (new) | bent tip, wonky star | no | 2 |
| half_orc | Half-Orc Name Generator | Fantasy | war-axe | smaller axe, one tusk accent | no | 2 |
| high_elf | High Elf Name Generator | Fantasy | leaf | small circlet above | no | 2 |
| orc | Orc Name Generator | Fantasy | war-axe | – | no | 2 |
| path_of_exile_witch | Path of Exile Witch Name Generator | Fantasy | crystal-ball (new) | – | no | 2 |
| wizard | Wizard Name Generator | Fantasy | wizard-hat (new) | – | no | 2 |
| wood_elf | Wood Elf Name Generator | Fantasy | leaf | acorn accent | no | 2 |
| ghost | Ghost Name Generator | Folklore | ghost (new) | – | no | 2 |
| werewolf | Werewolf Name Generator | Folklore | wolf-moon (new) | wolf head against full moon | yes | 2 |
| zombie | Zombie Name Generator | Folklore | hand (new) | hand rising from soil | no | 2 |
| ancient_greek | Ancient Greek Name Generator | Historical | amphora (new) | – | no | 2 |
| victorian | Victorian Name Generator | Historical | top-hat (new) | – | no | 2 |
| album | Album Name Generator | Music | vinyl (new) | – | no | 2 |
| dj | DJ Name Generator | Music | headphones (new) | – | no | 2 |
| podcast | Podcast Name Generator | Music | mic (new) | studio mic on a stand | no | 2 |
| rapper | Rapper Name Generator | Music | mic (new) | hand mic | no | 2 |
| song_title | Song Title Generator | Music | note | – | no | 2 |
| stage_name | Stage Name Generator | Music | star (new) | star with spotlight rays | no | 2 |
| wu_tang | Wu-Tang Name Generator | Music | bee (new) | plain bee, no logo | no | 2 |
| axe | Axe Name Generator | Objects | axe | – | no | 2 |
| elven_sword | Elven Sword Name Generator | Objects | sword | leaf on the crossguard | no | 2 |
| hammer | Hammer Name Generator | Objects | hammer (new) | – | no | 2 |
| poison | Poison Name Generator | Objects | bottle (new) | drip label, no skull on bottle | no | 2 |
| shield | Shield Name Generator | Objects | round-shield | heater-shield outline instead of round | no | 2 |
| wand | Wand Name Generator | Objects | wand | – | no | 2 |
| company | Company Name Generator | Organisations | building (new) | – | no | 2 |
| gamertag | Gamertag Generator | Characters | gamepad (new) | – | no | 2 |
| name_combiner | Name Combiner | Characters | two-circles (new) | overlap in yellow | no | 2 |
| pirate | Pirate Name Generator | Characters | skull-bones (new) | generic skull and crossbones | no | 2 |
| superhero | Superhero Name Generator | Characters | mask (new) | domino mask | no | 2 |
| vampire | Vampire Name Generator | Characters | bat (new) | – | no | 2 |
| viking | Viking Name Generator | Characters | longship (new) | longship with a striped sail | no | 2 |
| villain | Villain Name Generator | Characters | mask (new) | monocle and moustache variant | no | 2 |
| cafe | Cafe Name Generator | Places | cup (new) | – | no | 2 |
| fantasy_shop | Fantasy Shop Name Generator | Places | shopfront (new) | – | no | 2 |
| altmer | Altmer Name Generator | Pop Culture | leaf | sun disc as accent | no | 2 |
| dunmer | Dunmer Name Generator | Pop Culture | volcano (new) | – | no | 2 |
| elden_ring | Elden Ring Name Generator | Pop Culture | ring (new) | plain ring with a glint, no logo | no | 2 |
| funny_sword | Funny Minecraft Sword Name Generator | Pop Culture | sword | blocky pixel blade (generic, no game assets) | no | 2 |
| game_of_thrones | Game of Thrones Name Generator | Pop Culture | crown (new) | generic iron crown | no | 2 |
| hobbit | Hobbit Name Generator | Pop Culture | round-door (new) | round door in a hill | yes | 2 |
| lotr_orc | LOTR Orc Name Generator | Pop Culture | war-axe | jagged blade | no | 2 |
| lotr_wizard | LOTR Wizard Name Generator | Pop Culture | wizard-hat (new) | with a staff | no | 2 |
| star_wars | Star Wars Name Generator | Pop Culture | planet | twin suns, no lightsaber or logos | no | 2 |

## 6. Pop-culture and trademark rules

The rule: show what the generator is about, in generic terms. Never show a logo, sigil, crest, character likeness, game UI or signature prop.

| Generators | Avoid | Use |
|---|---|---|
| Hogwarts Legacy witch and wizard, Harry Potter witch | house crests, the scar, the Hogwarts castle silhouette, the specific wand designs | a besom broom, a plain wand with a spark |
| World of Warcraft (orc, troll, night elf, blood elf) | Horde/Alliance symbols, faction colours used as branding | a generic war axe, tusks, the elf leaf with a moon or flame |
| Warhammer 40k, Warhammer orc, Ogryn | the Aquila, Imperium and Mechanicus icons as drawn in the games | a generic skull in a gear (common heraldry), a cleaver axe, a studded club |
| Elder Scrolls (Skyrim orc, Nord, Khajiit, Argonian, Altmer, Dunmer) | the Imperial dragon emblem, the horned helmet from the box art | a war axe, a bearded axe, a paw print, a lizard, the elf leaf with a sun, a volcano |
| Star Wars | lightsabers (too close to the brand), the logo, helmets | a ringed planet with twin suns |
| Game of Thrones, GoT swords | house sigils, the Iron Throne | a plain iron crown, the sword with a crown |
| Elden Ring | the Elden Ring sigil | a plain ring with a glint |
| Baldur's Gate 3 | the logo, the mind-flayer tadpole as drawn in-game | a D20 with a squiggle accent |
| LOTR orc and wizard, Hobbit | the One Ring script, character likenesses (Gandalf's hat as drawn in the films) | a jagged war axe, a generic wizard hat with a staff, a round door in a hill |
| Wu-Tang | the W logo | a plain bee |
| YouTube | the play-button logo | an old TV with an antenna |
| Minecraft swords | game textures and the diamond-sword sprite | a generic blocky sword, drawn in our line style |

## 7. Technical spec

**Files**
- `illustrations/motifs/<id>.svg`: one file per motif, kebab-case ids matching the library table (`war-axe.svg`, `leaf-moon.svg`).
- Variants are separate small files: `<id>--<variant>.svg`, e.g. `leaf--sun.svg`.
- Category marks reuse motif files. The ring is CSS, not part of the drawing.

**Drawing rules**
- `viewBox="0 0 48 48"`, with a 2-unit safe margin.
- Main stroke 1.8, details 1.2–1.4. `stroke-linecap/linejoin="round"`.
- Colours only `#1e1c18` (ink), `#fffcf4` (paper) and `#efc84a` (accent), written as `currentColor`/CSS variables in the build output so a future theme can recolour.
- No `<text>`, no raster images, no filters inside the files.

**Delivery**
- The build inlines one `<svg><defs>` sprite per page containing only the symbols that page uses: usually 1–20, about 0.5–1.2 KB each, so 2–15 KB per page uncompressed. Then `<svg><use href="#m-war-axe"/></svg>` wherever a drawing appears.
- Inline beats an external sprite file here: no extra request, no CORS or `<use>` cross-file quirks, and it works on the `file://` double-click preview the README promises.
- Expect the whole library to be under 70 KB on disk.

**Wobble**
- One shared `<filter id="wob">` (feTurbulence baseFrequency .035, displacement scale 1.6) per page, in the same sprite.
- Apply it with `filter:url(#wob)` on the `<svg>` element.
- The filter is static, so it's safe with reduced-motion settings. Never animate the turbulence.

**Accessibility**
- Every drawing is decorative: `aria-hidden="true"` and `focusable="false"`. The adjacent heading or card text names the thing.
- If a drawing ever stands alone as a link (it shouldn't), it needs an `aria-label` on the link, not alt text on the SVG.

**Choosing the drawing in the build**
- New optional field in each generator JSON: `"illustration": "war-axe"` or `"illustration": "leaf--moon"`.
- Fallback order: `illustration` → the category's mark → `quill`.
- Categories get `"mark": "dragon"` in `content/categories.json`.
- The existing `"icon"` emoji field stays for now (it's used in titles and llms.txt). Drop it from page markup once the drawings ship, so no emoji appear next to the drawings.
- Add to `scripts/content.js` checks:
  1. `illustration` and `mark` must name an existing file in `illustrations/motifs/`;
  2. warn when a tier-1 generator falls back to its category mark;
  3. warn when a motif file exceeds 2 KB or uses a colour outside the three tokens;
  4. fail on `<text>` or `<image>` inside a motif file.

**Adding a new one**
1. Pick a library motif first; ask "could a variant accent do it?"
2. Only if not: draw on the 48 grid with the rules above, save as `illustrations/motifs/<id>.svg`, and add a row to the library table.
3. Set `"illustration"` in the generator JSON and run the build. The validator catches typos.

## 8. Effort estimate

| Tier | What | Count | Estimate |
|---|---|---|---|
| 1 | Normalise the 48 drawings on the sample sheet into motif files, plus the 3 variants shown | 48 | 0.5 day (they exist; this is cleanup and export) |
| 1 | Wire the sprite, the JSON fields and the validator | – | 0.5 day |
| 2 | Draw the remaining library motifs | 33 | ~1.5 days (about 15 minutes each, plus review) |
| 2 | Lightly bespoke drawings (angel, goblin, hobbit, werewolf) + 404 map | 5 | 0.5 day |
| 2 | Accent variants called out in the inventory | ~30 | 0.5 day (a few minutes each) |
| Later | OG image template | 1 | 0.5 day |

Order: tier 1 ships with the redesign's first phase (popular and featured pages always have a real drawing). Tier 2 can follow; until then, those generators show their category mark, which the fallback handles automatically.

## 9. Trickiest five

1. **Star Wars**: the obvious motif (a lightsaber) is effectively the brand. Use a ringed planet with twin suns: recognisably "space opera", owned by nobody.
2. **Warhammer 40k**: the skull-and-cog is close to Mechanicus iconography. Keep it as plain heraldry (round gear, simple skull, no wings, no half-cog), and review before launch; the fallback is a plain power-sword.
3. **Hogwarts Legacy and Harry Potter** (the top popular pages): the crests and castle are off-limits. The besom broom and a plain wand carry "witch and wizard" without the brand; house identity stays in the text and buttons, never the drawing.
4. **Generic concept pages** (Business, Company, Brand, Blog, YouTube, Podcast): these risk clip-art. Draw them like a writer's margin: a lightbulb, a pencil, a tag, an old TV. Keep the same weight as the fantasy set so they don't look like stock icons.
5. **The many elves and orcs** (8 elf pages, 8 orc pages): one leaf and one war axe for all would make the hubs look repetitive. Use accent variants (moon, flame, sun, acorn, crown; snow dots, jagged or cleaver blades) so neighbouring cards differ while staying one family.
