# The Naming Library (reference/)

Researched, sourced pages on where names come from and how they're built. One JSON
file per page; the file name is the slug (`reference/<slug>.html`). Built by
`scripts/reference-pages.js`, which also makes `reference/index.html`, the sitemap and
llms.txt entries, and an "Understanding these names" box on every generator the page
lists in `generators`.

```json
{
  "title": "Patronymic Names",
  "term": "Patronymic",
  "definition": "A name formed from the given name of a person's father or a male ancestor.",
  "section": "construction",
  "description": "Meta description and card line, 160 characters or fewer.",
  "seoTitle": "Optional <title>, 60 characters or fewer",
  "published": "2026-11-12",
  "updated": "optional",
  "motif": "quill",
  "atAGlance": "<p>The short answer, 2 to 4 sentences. This is what readers and AI tools quote, so it must be exact.</p>",
  "facts": [{ "label": "Common forms", "value": "-son (English), Mac/Mc (Gaelic), ap/ab (Welsh)" }],
  "examplesHeading": "Patronymics in different languages",
  "examples": [
    { "name": "Johnson", "language": "English", "meaning": "son of John", "status": "attested", "source": "odfn" },
    { "name": "Thorvaldsson", "language": "Old Norse style", "meaning": "built as 'son of Thorvald'", "status": "derived" }
  ],
  "sections": [{ "heading": "How patronymics became surnames", "content": "<p>HTML. Cite with <sup><a href=\"#src-1\">[1]</a></sup>.</p>" }],
  "faqs": [{ "question": "...", "answer": "..." }],
  "related": ["surnames", "matronymic-names"],
  "generators": ["viking", "last_name"],
  "sources": [
    { "id": "odfn", "author": "Hanks, Coates and McClure", "title": "The Oxford Dictionary of Family Names in Britain and Ireland", "publisher": "Oxford University Press", "year": "2016" },
    { "id": "etym", "title": "Online Etymology Dictionary: -son", "url": "https://www.etymonline.com/...", "accessed": "2026-11-12" }
  ]
}
```

## Sections

`etymology`, `construction`, `languages`, `history`, `fantasy`, `modern`.

## Status (shown as a badge on every example)

| status | label | use it when |
|---|---|---|
| `attested` | Recorded | the name is found in historical records; needs a `source` |
| `reconstructed` | Reconstructed | scholars have worked it out but it isn't written down; needs a `source` |
| `derived` | Built from real parts | we made it from genuine word elements |
| `invented` | Invented | an original name, e.g. from one of our generators |
| `uncertain` | Uncertain | the origin or meaning is disputed; needs a `source` |

## Rules

- At least 2 sources per page, and every factual claim must be checkable against them. Prefer scholarly
  dictionaries and books (Oxford Dictionary of Family Names, Oxford Dictionary of First Names, Cleasby–Vigfusson,
  Bosworth–Toller, Key to English Place-Names), then Online Etymology Dictionary and Wiktionary as finders.
- Where scholars disagree, say so and mark the example `uncertain`.
- Never present an invented or "sounds-like" name as historical.
- Paraphrase; never copy source text.
- The validator stops the build if a page lacks a field, a source, or a valid status, or links a generator or page that doesn't exist.
