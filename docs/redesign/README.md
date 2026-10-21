# Redesign: "Grown Up B"

Approved by Rich on 21 October 2026. This folder is the source of truth for the redesign build.

| File | What it covers |
|---|---|
| `SPACING.md` | The spacing audit of the mockups, the one spacing system (section C) and the bugs to avoid. |
| `ILLUSTRATIONS.md` | The illustration library: 81 motifs, 17 category marks and the drawing assigned to each of the 108 generators. |
| `WHEEL.md` | Build spec for Spin the Wheel and its sibling tools (built after phase 3). |

Design references (private claude.ai pages, shared by Rich on request):
- Reference page and component sheet: https://claude.ai/artifact/Ac43hTdoGqEEYAu6pzHrHn. If a mockup and this disagree, this wins.
- Illustration library sample: https://claude.ai/artifact/9bnoGWBRKkzy9Fo9qmSzjk
- Spin the Wheel prototype: https://claude.ai/artifact/5RvjH5uMBvFYUJni7PTohD
- Build plan: https://claude.ai/artifact/BEQkk3RyqEHVBVaTg7cLJX

Some paths in these docs point at files in the design session's scratchpad. They describe the published reference pages above.

## Decisions

- **Look:** warm paper, black marker outlines that look hand-drawn, a yellow highlighter, blue ballpoint notes and quiet doodles. A black offset shadow means "you can tap this".
- **Fonts:** Schibsted Grotesk for titles, headings, labels and buttons; Newsreader for text; Kalam only for small handwritten notes. All self-hosted in `/fonts` (SIL Open Font License).
- **Header:** A ("Roomy") on every page.
- **Generators are never squashed:**
  - On a phone, the first screen shows the options, the Generate button and the first row or two of names.
  - There's no "how many" control: you get 8 names, then "Show 8 more".
  - When names run out, "That's all N names for these choices" replaces the button.
- **Options:** big buttons for short option lists, a dropdown for long ones. Long names get one column on phones.
- **Emoji:** removed from headings, menus and cards. Drawings replace them, with each category's mark as the fallback.
- **No ad sidebar yet:** Mediavine ads are 6–12 months away. Adding `class="has-sidebar"` to `<body>` switches on the 300px sidebar column when they start.
- **Warhammer drawing:** a plain sword.
- **Wheel:** Spin is disabled with one name, duplicates are removed automatically, and lists are shared with a short hash link only.

## Phases

0. **Groundwork:** fonts, `styles/site.css` and `lib/outline.js`.
1. **Shared shell:** one header and footer for every page, and no emoji.
2. **Generator widget** (`lib/page.js`): option buttons, Show 8 more, the bookmark save, the "That's all" line.
3. **Generator page template:** all 108 pages.
4. **Hub and category pages, Home, About, All Generators, the HTML sitemap and the 404 page.**
5. **Illustrations:** the sprite, plus an `"illustration"` field and validator checks.
6. **Spin the Wheel and the name tools:** built by the content session.
7. **Checks and launch.**

While phases 0–3 are being built, other sessions only edit `content/`, and hold changes to `scripts/build-pages.js`, `lib/`, `styles/`, `index.html`, `about.html` and `all-generators.html`.

## SEO rules (don't break)

- **URLs:** no changes; `posts/` and `categories/` paths and slugs stay.
- **Page structure:** one H1 per page; titles, descriptions and canonical links stay.
- **Structured data:** all of it stays.
- **Links and text:** menus and related links stay as plain HTML links. Example names and FAQ answers stay in the HTML.
- **Build markers:** `<!-- BUILD:… -->` markers in the hand-written pages stay.
