# Hub page copy (mockup 2)

Every field below is optional. A hub shows each part only when its category in
`content/categories.json` has it, so hubs without the new copy look as before.

```json
{
  "eyebrow": "World building elements",
  "art": "images/brand/hub-places",
  "artSize": [1686, 809],
  "approach": {
    "heading": "How to approach place names",
    "text": "<p>Think about the type of place, its geography…</p>"
  },
  "tips": {
    "heading": "Quick tips",
    "items": ["Use recurring linguistic patterns", "Draw inspiration from real-world places"]
  },
  "examples": {
    "heading": "Examples",
    "intro": "Here are some example place names, along with a breakdown of what makes them work.",
    "items": [
      {
        "name": "Eldermere",
        "type": "Kingdom",
        "verdict": "A grand, timeless name that suggests an ancient realm with deep history.",
        "breakdown": "Combines “Elder” (age, wisdom) with “mere” (lake), hinting at a realm built around a great lake.",
        "motif": "crown"
      }
    ]
  },
  "startHeading": "Try these name generators",
  "startIntro": "Use these tools to generate names for different types of places in your world."
}
```

- **eyebrow:** a short line in small capitals above the H1. The H1 itself doesn't change.
- **art:** header art beside the title on desktop and under it on phones. Give the path without the ending; the page loads `<art>-800.webp` and `<art>-1600.webp`. Without art, the hub keeps its drawing beside the H1.
- **approach.text:** HTML is allowed, so use `<p>` for paragraphs. Keep it to 60–120 words.
- **tips.items:** 3 to 6 lines of up to about 45 characters each. They're shown with mustard ticks in the Quick tips box.
- **examples.items:** up to 4. Keep `verdict` to one sentence and `breakdown` to one or two. `motif` is any drawing in `lib/illustrations.js`; without it, the card uses the hub's own drawing.
- **startHeading / startIntro:** these rename the "Where to start" section, which still lists `featured`. The mockup's "Try these name generators" is this section.
