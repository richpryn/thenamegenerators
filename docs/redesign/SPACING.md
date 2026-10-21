# Grown Up B: spacing and bug audit

Covers the 14 mockups: home, about, three hubs (fantasy, historical, music), eight generator pages (band, hl-witch, tavern, roman, spaceship, combiner, elf, epithet) and header-options.
- **Viewports checked:** 390, 768 and 1280 wide.
- **How:** measured with Playwright (audit/metrics.json, plus screenshots in audit/).
- **Owner's new rule:** the generator gets comfortable spacing again. On a phone, the first screen only needs to show the controls, the Generate button and the first row or two of results.

## A. Bugs

| # | Page(s) | Viewport | What's wrong | Fix |
|---|---|---|---|---|
| A1 | elf, epithet | all | Still on the old cramped header: the bar is 46–47px tall and the breadcrumb sits 4px under it. Header A was never applied. | Rebuild both on the shared stylesheet (section C). |
| A2 | every `.hd` element | all | The hand-drawn outline SVG sits inside a 1.5px transparent border, so it is drawn 2–3px smaller than the element. It is also stretched by `preserveAspectRatio=none`, and doesn't line up with the black tap shadow. Every example box measured 173×156 against an outline of 171×154. | Give `.hd` `border:0` and draw the SVG at `inset:0` on the border box, sized from `getBoundingClientRect`. Redraw on ResizeObserver, `document.fonts.ready` and `load`. Done in the reference page. |
| A3 | band, tavern | 1280 | The H1 stays at 34px on desktop; other pages use 56px. | One H1 rule per breakpoint (section C). |
| A4 | hl-witch | 390 / 1280 | The H1 is set to 30px and 52px, a one-off override to squeeze the title. | Use the shared scale and let long titles wrap to 3 lines. |
| A5 | band (and other highlighter titles) | 1280 | The yellow highlighter shape sits left of the highlighted word: the padding plus negative margin is off when the word starts the line. | Use the highlight as a background on an inline span with `box-decoration-break:clone` and equal padding on both sides, and no negative margins. |
| A6 | spaceship, combiner | 390 | Chip rows run off the card edge with no cue ("Sentence" and "Sam + Alex" are cut off). Only Home has a "swipe" hint. | Wrap chips onto 2 lines when there are 6 or fewer. When a row has to scroll, add a fade edge plus the "swipe for more →" note. |
| A7 | all desktop pages | 1280 | The sidebar ad starts 28px lower than `main`, so it lines up with neither the breadcrumb nor the H1. | Start the aside at the top of the content row (`align-self:start`, `margin-top:0`). |
| A8 | all | 768 | Tablet gets the phone layout stretched to 768. Results are 2 columns with wide empty gaps, the H1 and lede are phone-sized, the 320×50 phone ad bar shows, and Home moves its intro below the generator even here. | Add a real tablet breakpoint (640–1023): wider gutters, 3-column results for short names, a 44px H1, and the intro back in place. Use a 728×90 or the phone sticky ad per the Mediavine settings. |
| A9 | home | all | 16 `!important` declarations. A late "Roomy header" block and a phone "squash" block override earlier rules, with duplicate selectors (`header .wrap, header .wrap`). Hubs and generators carry similar layered blocks. | Replace with one stylesheet (`gb.css`) and one component spec; no `!important` except the `prefers-reduced-motion` reset. |
| A10 | about, hubs | 1280 | The header is 82–96px tall on hubs and About but 62–66px on generator pages; Home is 144px on desktop. | One header: 72px tall on desktop and 72px on phone (14px padding + 44px button). |
| A11 | combiner, home | 390 | `Show 2 more` shows on the Combiner when only 2 are left, but the live site now gives the reason in a "That's all N names for these choices." line. Style that line once and use it everywhere. | Add the `.done-note` component (section C). |
| A12 | all generator pages | all | The shortlist is display-only: you can't copy it or clear it. Saved state survives "Show more" but not Generate (correct), and the bookmark buttons toggle correctly. | Add Copy and Clear text buttons to the shortlist line (44px targets). |
| A13 | build note | all | Component rules like `.go svg` or `.menu svg` also match the outline SVGs inside those elements. The mockups only escape this because `.hd > svg.o` wins on specificity. | Set the outline SVG's width and height inline from JS, as the reference page does, so icon rules can never shrink it. |

## B. Spacing drift between pages (measured)

| Item | Values found | Pages |
|---|---|---|
| Header height, phone | 47 · 80 · 82 · 92 · 108 | elf/epithet · band/witch/tavern · about/fantasy/roman/spaceship/combiner · historical/music · home |
| Header height, desktop | 46 · 62 · 66 · 82 · 96 · 144 | elf · band/witch/tavern · roman/spaceship/combiner · about/fantasy · historical/music · home |
| Gap from header to breadcrumb | 4 · 18 · 26 | elf/epithet · most · about/fantasy/roman desktop |
| H1 margin-top | 0 · 2 · 10 · 12 | band/witch/tavern · elf · most · historical/music |
| Lede font / bottom margin, desktop | 16/12 · 16/18 · 18/24 · 18/26 · 19/26 | roman · band · music · about · home |
| Generator card padding, phone | 10/11 · 10/12/12 · 13/12/12 | band/witch/tavern · roman/spaceship/combiner · elf/epithet/home |
| Option button height, phone | 30–35 | all (below the 44px touch target) |
| Generate button height | 37 · 43 · 45 · 47 · 51 | roman · spaceship/combiner · band/witch/tavern · elf/home · desktop |
| Result row height, phone | 26 · 32 · 34 · 39 · 42 | roman/spaceship · band/witch · elf/combiner · tavern · home |
| H2 size, desktop | 26 · 30 | generators (some) · combiner/hubs |
| Gap above section H2 | 0 · 34 | it depends on which wrapper adds the margin |
| Small touch targets per page | 1 (hubs) to 50 (home chips) | |

## C. One spacing system (use this for the build)

**Space scale (px), 4-based:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 as `--s1` to `--s8`. Never use values off the scale.

**Breakpoints**
- Phone: under 640. Tablet: 640–1023. Desktop: 1024 and up.
- Container max width: 1120.
- Side gutter: 16 / 24 / 32, always `max(gutter, env(safe-area-inset-*))`.
- Desktop: a content column plus a 300px sidebar, with a 48px gap.

**Type scale**

| Role | Phone | Tablet | Desktop | Face |
|---|---|---|---|---|
| H1 | 34/1.06 | 44/1.04 | 56/1.02 | Schibsted Grotesk 800, −0.025em |
| H2 | 26/1.15 | 28/1.15 | 30/1.12 | Schibsted 800, −0.02em |
| Label (caps) | 13/1.2, +0.06em | same | same | Schibsted 700 |
| Body | 18/1.62 | 18/1.62 | 18/1.65 | Newsreader 400 |
| Lede | 17/1.45 italic | 18 | 19 | Newsreader italic |
| Result name | 17/1.3 | 17 | 17 | Newsreader 500 |
| Small / meta | 15/1.4 | 15 | 15 | Newsreader |
| Ballpoint note | 17/1.2 | 17 | 18 | Kalam 400 |

**Header A ("Roomy")**
- **Bar:** padding 14px top and bottom, giving a 72px bar because the Menu button is 44px. On desktop the bar has a 72px min-height and shows the nav links.
- **Logo:** a 26px mark with an 8px gap to the 19px wordmark (desktop: 30px mark, 21px wordmark).
- **Rule:** a hand-drawn rule 10px tall, directly under the bar.
- **Spacing below:** 16px to the breadcrumb (13px text), 8px to the H1, 8px to the lede, 24px to the generator card. Desktop: 24px to the breadcrumb, 32px from the lede to the card.

**Generator card (un-squashed)**
- **Padding:** 20 on phone (16 under 360px), 24 on tablet, 28 on desktop.
- **Inside the card:** groups stack 20px apart, with 8px from a label to its control.
- **Option buttons:** at least 44px tall, 8px apart, wrapping onto 2 rows. Scrolling rows only when there are more than 6 options, with a fade edge and the swipe note.
- **Select and text input:** 48px tall.
- **Generate:** 52px tall, full width on phone and tablet, 20px below the controls.
- **Results:** 20px below Generate, with rows at least 48px tall (8px top and bottom padding) and a 1px rule between them.
  - Columns: 2 for short names on phone, 1 for long-name generators (Roman, Spaceship, Tavern, Band and similar); 3 short or 2 long on tablet; 4 short or 2 long on desktop.
- **Save button:** 40×40 drawn, with a 44×44 hit area via padding.
- **Show 8 more:** 44px tall, 16px below the results.
- **"That's all N names for these choices." line:** sits in the same slot as Show more: Kalam 17px in ballpoint blue with a small hand-drawn tick, and it replaces the button.
- **Tip and shortlist line:** 12px below, 15px muted text, with Copy and Clear links.

**Fold rule (new):** on a 390×700 phone, the first screen shows the controls, Generate and at least the first row of results. Nothing is compressed to fit more.

**Sections**
- **Between major sections:** 48px on phone, 64px on desktop.
- **Headings and text:** an H2 sits 12px above its content, paragraphs are 16px apart, and lists are 8px apart.
- **Example-name boxes:** 16px padding; grids have 16px gaps on phone and 20px on desktop; boxes tilt at most ±0.4°, and the heading sits inside the box over a dashed rule with 8px below it.
- **Hub generator card and category card:** 16px padding, a 44px minimum height, "→" on the right, and the black offset shadow (3px). Featured cards get 20px padding with a 52px doodle.
- **FAQ:** rows are 12px top and bottom, with a 28px toggle.

**Ads**
- **Caption:** "Advertisement", 8px above each slot.
- **Spacing around a slot:** 32px above and below on phone, 48px on desktop.
- **Phone sticky bar:** 50 + 12 + safe-area. Body padding-bottom is the bar height plus 16, so the footer never hides under it.
- **No art:** nothing within 16px of any slot.

**Outlines**
- **Drawing:** one shared script draws on the element's border box, with a 3px shadow offset on `.tap` elements.
- **Redraws:** on resize, `fonts.ready` and `load`.
- **Wobble:** jitter scales with height, from 0.8 to 1.6px.

## D. Reference page

https://claude.ai/artifact/Ac43hTdoGqEEYAu6pzHrHn: the Elf page on this system, plus an annotated component sheet. Measured on a 390-wide phone: Generate ends at 565px, the first result row at 638px, rows are 53px tall, and nothing is under 40px tall outside the sheet. The outline matches its element on every `.hd`, with no horizontal overflow at 390, 768 or 1280. The desktop sidebar is top-aligned with the breadcrumb.
