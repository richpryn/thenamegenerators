# Name lists (names/)

Big, browsable lists of real names: "names that mean moon", Welsh baby names, dog
names, fantasy names. One JSON file per page; the file name is the slug
(`names/<slug>.html`). Built by `scripts/list-pages.js`, which also makes
`names/index.html`, sitemap and llms.txt entries, and validates every file.

```json
{
  "title": "Names That Mean Moon",
  "seoTitle": "Names That Mean Moon: 60 Girl and Boy Names | The Name Generators",
  "description": "Meta description and card line, 160 characters or fewer.",
  "section": "meanings",
  "published": "2026-11-13",
  "updated": "optional",
  "motif": "moon",
  "intro": "<p>One or two short paragraphs: what's here and how the list was checked.</p>",
  "groups": [
    {
      "heading": "Girl names that mean moon",
      "gender": "girl",
      "names": [
        { "name": "Selene", "meaning": "moon", "origin": "Greek", "status": "attested", "source": "behind", "note": "the Greek goddess of the moon" },
        { "name": "Luna", "meaning": "moon", "origin": "Latin", "status": "attested", "source": "oxford-first" }
      ]
    }
  ],
  "sections": [{ "heading": "Choosing a moon name", "content": "<p>HTML. Short, practical.</p>" }],
  "faqs": [{ "question": "...", "answer": "..." }],
  "generators": ["fairy", "witch"],
  "reference": ["what-is-onomastics"],
  "lists": ["names-that-mean-star"],
  "sources": [
    { "id": "oxford-first", "author": "Hanks, Hardcastle and Hodges", "title": "A Dictionary of First Names", "publisher": "Oxford University Press", "year": "2006" },
    { "id": "behind", "title": "Behind the Name: Selene", "url": "https://www.behindthename.com/name/selene", "accessed": "2026-11-13" }
  ]
}
```

## Fields

- `section`: `meanings`, `heritage`, `pets` or `fantasy`.
- `gender` on a group: `girl`, `boy`, `any`. Pet lists use `girl`/`boy` too (female/male pets).
- Each name: `name` (required), `meaning`, `origin` (language or culture), `status`, `source`, `note` (one short line), `pronounce` (optional, plain respelling like "SEL-ee-nee").
- `status`, the same labels as the Naming Library:
  - `attested`: the meaning is recorded in a reliable source (needs `source`)
  - `uncertain`: the meaning is disputed, or popular but unproven (needs `source`; say why in `note`)
  - `derived`: a modern name built from real words (e.g. a word name like "Juniper")
  - `invented`: an original name (fantasy lists, generator output)
- Lists of pet names and fantasy names may skip `meaning` and `status`; then add no `sources`.
- Real ranks for England and Wales come automatically from `content/data/ons-names.json` (ONS, 1996–2025), matched on exact spelling and the group's gender. Don't type ranks in.

## Rules

- At least 2 sources on any page that gives meanings. Prefer the Oxford Dictionary of First Names, Behind the Name (which cites its sources), Wiktionary, and the Naming Library's own sources.
- Never invent a meaning. If sources disagree, use `uncertain` and say so. Many "meaning" claims on baby name sites are made up: say so where it matters (that's what makes our lists worth citing).
- Real people's names are fine as names; no "famous bearers" claims unless sourced.
- The validator stops the build on a missing field, an unknown status, a meaning without a source, a duplicate name in a group, or a generator, reference page or list that doesn't exist.
