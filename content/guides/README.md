# Naming guides

One JSON file per guide; the file name is the page's slug (`guides/<slug>.html`).

```json
{
  "title": "How to Create Great Character Names",
  "description": "Meta description, 160 characters or fewer.",
  "seoTitle": "Optional <title>, 60 characters or fewer",
  "published": "2026-10-29",
  "updated": "optional, when a guide is revised",
  "motif": "quill",
  "intro": "One or two sentences; **bold** works.",
  "sections": [{ "heading": "Start with the world", "content": "<p>HTML</p>" }],
  "faqs": [{ "question": "...", "answer": "..." }],
  "related": ["npc", "elf"]
}
```

`related` lists generator keys shown as "Try these name generators" cards. The build
makes each page, guides/index.html, sitemap and llms.txt entries, and validates it all.
