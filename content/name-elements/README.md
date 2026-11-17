# Name Element Finder (content/name-elements/)

The data behind `reference/name-elements.html`: the word parts real names are built from,
each with a meaning and at least one source. One JSON file per language group
(`old-english.json`, `old-norse.json`, `celtic.json`, `classical-germanic.json`), each shaped
`{ "sources": [...], "elements": [...] }`. Built by `scripts/elements-page.js`; filters in
`lib/elements.js`. `meta.json` holds `published` and `updated` dates (bump `updated` when you edit).

```json
{
  "id": "oe-wulf",
  "element": "wulf",
  "forms": ["-wulf", "-ulf", "Wulf-"],
  "language": "Old English",
  "use": ["given"],
  "meaning": "wolf",
  "tags": ["wolf"],
  "note": "Optional, one sentence.",
  "status": "attested",
  "sources": ["bt-wulf"],
  "examples": [{ "name": "Æthelwulf", "parts": "æþel + wulf", "gloss": "noble wolf", "source": "pase" }],
  "page": "old-english-names",
  "generators": ["anglo_saxon"]
}
```

## Rules
- `language`, `use` (given / place / surname) and `tags` come from fixed lists in
  `scripts/elements-page.js`; the validator rejects anything else.
- `status`: `attested` (word and meaning documented) or `uncertain` (disputed; needs a `note` saying so).
- Every element cites a specific dictionary or scholarly page that was opened and checked
  (Bosworth-Toller, Cleasby–Vigfusson, GPC, Ainmean-Àite na h-Alba, logainm.ie, KEPN, Logeion, Wiktionary).
- Examples are real recorded names only, never fictional canon or living famous people. Up to 3.
- Source ids must be unique across all files (same id = same source).
- Meanings in British English, lower case, shown in single quotes on the page.
