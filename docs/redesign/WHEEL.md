# Spin the Wheel: build spec (Grown Up B)

The working prototype is "Grown Up B · Spin the Wheel": https://claude.ai/artifact/5RvjH5uMBvFYUJni7PTohD. Its source, `grown-up-B-wheel.html` in the design session's scratchpad, is the reference: lift the JS and CSS from it.

Spacing follows Grown Up B with header A ("Roomy"). Use the spacing system in `docs/redesign/SPACING.md` (section C) and the shared `styles/site.css`; they take precedence over the values the prototype used. Nothing is squashed to fit the phone fold.

Rich's answers (21 Oct): with one name, Spin is disabled; duplicates are removed automatically; lists are shared with a short hash link only, with no stored links.

## Page structure

1. Header A, then the breadcrumb "Home / Name tools / Spin the Wheel", then the H1 "Spin the **Wheel**" with the title doodle (a wheel), then the lede (2 lines max).
2. **Tool sheet**: one generator card (`.sheet.hd`).
   - **Phone (<720px):** a single column.
     - The wheel, as wide as the card, up to 400px.
     - The **Spin** button directly under the wheel, so it's always reachable without scrolling past the wheel. No sticky bar is needed.
     - A quick row of buttons: Remove winner and Shuffle.
     - A status line.
     - The list column: the "Names, one per line" textarea with a count chip, the duplicate hint, "Fill from a generator" (a select plus **Add 8**), then Copy share link and Clear list.
   - **720px and up:** two columns. The wheel column is about 1.08fr and the list column 1fr.
3. In-content ad (300×250) **below** the tool. There's never an ad inside the sheet or next to the wheel.
4. How-to article (draft copy), "Is it fair?", Ideas, a second in-content ad, then the FAQ (details).
5. "More name tools": 4 hand-outlined cards (doodle, title, one line and →).
6. Ads: the desktop sticky sidebar is 300×600 from 1024px up; mobile adhesion is 320×50. The body has `padding-bottom: 74px` plus the safe area, so the ad bar never covers content.

## Components and states

| Component | States and behaviour |
|---|---|
| Wheel (`canvas` inside `.spinner`, role=button, tabindex=0) | **Idle.** **Spinning:** the canvas rotates; the `.spinner` wrapper does not rotate and has `overflow:hidden`, which prevents sideways scroll from a rotated square. **Empty:** fewer than 2 names shows the "Add at least two names to spin" note, and Spin is disabled. Click or tap the wheel to spin. |
| Pointer (SVG, top centre, highlighter fill) | Ticks −14° for 70ms each time a divider passes, when n ≤ 60. It's decorative (aria-hidden). |
| Spin button | Enabled when n ≥ 2. While spinning it is disabled and reads "Spinning…". |
| Winner card (overlay, centred at 60% of the wheel's height so the winning slice under the pointer stays visible) | Shows the name in Schibsted 800 at clamp(26px, 8vw, 38px), with a highlighter swash behind it and overflow-wrap:anywhere. Buttons: **Remove & spin again** (dark, primary) and **Spin again**; × closes and keeps the name. Focus moves to the primary button. |
| Confetti | 34 marker-stroke bits over 1.4s, in ink, yellow, pen blue and terracotta. Skipped under reduced motion. |
| Name textarea | Updates the wheel live, debounced 120ms. Lines are trimmed and blanks ignored, with a cap of 500. Saved on each change. |
| Count chip | "No names yet", "1 name" or "8 names". |
| Hint line (priority order) | 1. More than 500 lines: "Only the first 500 names go on the wheel." 2. Duplicates are removed automatically (case-insensitive, keeps the first), with a short note: "Removed N duplicates." 3. More than 120 names: a note that the wheel shows colours only. 4. Exactly 1 name: "Add at least one more name to spin." |
| Remove winner | Removes the winning line (that exact occurrence, not every copy). Disabled until there's a winner, and reset when the list is edited. |
| Shuffle | Fisher–Yates using `crypto.getRandomValues`. |
| Fill from a generator | A select of generators plus **Add 8**. Adds 8 names not already on the list. In production, call the recipe engine for the chosen generator with its default filters rather than embedding samples. |
| Clear list | An in-page confirm ("Clear all 8 names?", then **Yes, clear** / **Keep them**). Don't use `confirm()`. Focus goes to "Keep them". |
| Copy share link | Shows a read-only field with the link and copies it. If the clipboard is refused, it selects the field and says "Press Ctrl+C or ⌘C". |

## Wheel drawing

- **Slices:** equal angles, starting at −90° (the pointer). Slice i spans `[-π/2 + i·step, -π/2 + (i+1)·step]`.
- **Dividers:** quadratic curves from the hub to the rim, with ±1.2px seeded jitter so the wobble doesn't shimmer while typing. Line width is 1.4px up to 24 names, 1px up to 60, and 0.7px above that.
- **Rim:** a marker ring (2.6px) plus a lighter sketch ring (0.9px at 40% opacity), both with seeded jitter. The hub is a paper disc with an ink dot.
- **Labels:** radial, right-aligned 14px inside the rim, from 0.2r outwards. Truncate by grapheme (`Intl.Segmenter`) with "…".
  - Font size is `clamp(8, min(arc·0.58, r·0.11), 19)`, where `arc = step · r · 0.82`.
  - Weight is 700, or 600 above 30 names.
  - Labels are drawn up to **120 names**. Above that the wheel shows colours only and the winner appears in the card.
  - Tested at 2, 8, 30 and 100 names: 8 names gives 19px labels and 30 gives about 14px. At 100 they're 8px: readable on a phone, but busy.
- **Retina:** the canvas uses a device-pixel ratio capped at 2, and redraws on resize (ResizeObserver) and on `document.fonts.ready`.

## Palette (light; the site has no dark mode today)

Labels are always ink `#1e1c18`. Slice colours cycle in this order; if the last slice would match the first, it uses `--seg-pen` instead.

| Token | Hex | Contrast with ink labels |
|---|---|---|
| `--seg-paper` | #fffcf4 | 16.6 : 1 |
| `--seg-hi` | #efc84a | 10.6 : 1 |
| `--seg-pen` | #cddcec | 12.2 : 1 |
| `--seg-sage` | #d5e3c6 | 12.7 : 1 |
| `--seg-peach` | #f3d2c1 | 12.0 : 1 |

Every pair passes WCAG AA and AAA for small text.

**Dark mode** (for later; `styles/main.css` has no `prefers-color-scheme` or `data-theme` today). Labels would be `#f6f1e3`:

| Token | Hex | Contrast |
|---|---|---|
| `--seg-paper` | #2b2822 | 13.0 : 1 |
| `--seg-hi` | #5a4a17 | 7.7 : 1 |
| `--seg-pen` | #24384f | 10.6 : 1 |
| `--seg-sage` | #2f3d27 | 10.2 : 1 |
| `--seg-peach` | #4d3027 | 10.5 : 1 |

The ink rim and dividers become `#f6f1e3` at 85% opacity.

## Spin maths and easing

- **The winner is chosen first:** `crypto.getRandomValues` picks an index mod n.
- **Landing point:** a random offset of ±0.35 of a slice, so the wheel doesn't always stop dead centre.
  - `target = -(win + .5 + off) · step`
  - `delta = ((target − rotation mod 2π) mod 2π + 2π) mod 2π`
  - `end = rotation + (5 or 6)·2π + delta`
- **Duration:** 5200ms. **Easing:** `easeOutQuart`, `t => 1 - (1 - t)^4`, driven by requestAnimationFrame. The canvas gets `transform: rotate(rad)`.
- **Check:** after the spin, `underPointer(rotation)` must equal the winner. The prototype verifies this in its tests.
- **Reduced motion:** the wheel jumps straight to its end angle, the card appears with no animation, and there's no confetti or pointer tick.

## Storage and share link

- **localStorage:** key `tng-wheel`, value `{ "v": 1, "names": "<raw textarea text>" }`. Every read and write is wrapped in try/catch, and the page falls back to the default list.
- **Share link:** `https://thenamegenerators.com/spin-the-wheel.html#names=Ada~Ben~Chloe`.
  - Each name is `encodeURIComponent`, with `~` itself encoded as `%7E`, and names are joined with `~`.
  - It's a hash, so names never reach the server or its logs.
  - On load, if `#names=` is present, it replaces the list and the stored copy is not touched until the visitor edits.
  - If the link is over 2,000 characters, the page says the list is too long and suggests copying the names instead.
- **Sibling tools:** they use the same format with their own page (e.g. `team-generator.html#names=…&teams=3`).

## Accessibility

- **Keyboard:** the Spin button works natively; the wheel is role=button with tabindex=0, and Space or Enter spins it. Tab order: wheel, Spin, quick actions, textarea, fill, share, clear.
- **Screen reader:** the wheel's description is "Wheel with N names. Press Space or Enter to spin." A polite live region announces "Spinning…", then "The wheel picked Grace.", plus results of actions ("Grace removed. 7 left.", "List shuffled.", "Added 8 elf names.", "List cleared.").
- **Focus:** dashed pen-blue focus rings everywhere. Focus moves to "Remove & spin again" when a winner appears and back to Spin when the card closes.
- **Touch targets:** at least 44px; the Spin button is 54px.

## Edge cases

- **0 names:** the wheel shows a blank paper disc and the hint, and Spin and wheel-tap are disabled.
- **1 name:** a full disc, Spin disabled, and the hint "Add at least one more name to spin." (Rich's decision.)
- **Duplicates:** removed automatically when the list changes, keeping the first copy (case-insensitive). The note says how many were removed. (Rich's decision.)
- **Very long names:** truncated with … on the wheel, shown in full in the winner card (it wraps), and kept in full in the list.
- **Emoji:** drawn with the system font fallback; truncation is grapheme-safe, so an emoji is never split.
- **500+ lines:** only the first 500 are used and a hint says so. Above 120 names the wheel shows no labels. Performance: one redraw per change (debounced) and no redraw during the spin, because the canvas just rotates.
- **Mid-spin:** editing the list, Shuffle or Clear mid-spin is allowed but doesn't change the result in progress. The build should disable list edits while spinning, or apply them after the spin.

## Sibling tools on the same engine

All of them share the list box, Fill from a generator, saving and the share link. Only the output changes.

- **Random Name Picker:** a face-down deck; Draw flips the top card; the same winner card.
- **Raffle / Pick a Winner:** numbered tickets (No. 001…). A "Winners" count (1–10) draws in order: 1st, 2nd, 3rd.
- **Secret Santa:** a derangement (nobody draws themselves), shown as giver → receiver gift tags, revealed one at a time.
- **Team Generator:** a number of teams, or people per team. Shuffle, then deal round-robin so team sizes differ by at most 1. Each team sits in a hand-drawn box.
