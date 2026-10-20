# Name Generators V2

A name generator website where adding content means editing JSON only. Each generator is one file holding its names **and** the recipe for building them, so adding a generator never means touching code.

## 🏗️ Architecture

```
content/ (JSON you edit)
        ↓
   node scripts/build-pages.js
        ↓
HTML pages (output - never edit directly!)
```

**The golden rule:** Edit JSON → Run the build → Pages update automatically

## 📁 Project Structure

```
project/
├── content/                        # ← everything you edit
│   ├── categories.json             # Categories, in menu order, and which generators each shows
│   └── generators/
│       ├── elf.json                # One file per generator: page text, filters, recipe, names
│       └── ...
├── lib/
│   ├── recipe-engine.js            # Builds names by following a generator's recipe
│   └── page.js                     # Menu + generator widget used by every page
├── scripts/
│   ├── build-pages.js              # Builds all pages from content/
│   ├── validate-data.js            # Checks content/ without building
│   └── content.js                  # Loading + checks shared by both
├── styles/                         # main.css, blog.css
├── index.html                      # Homepage (hand-written; marked sections filled by the build)
├── all-generators.html             # Hand-written; generator list filled by the build
├── about.html                      # Hand-written; menu filled by the build
├── posts/                          # Generator pages        (built)
├── categories/                     # Category pages         (built)
├── data/generators/                # Names for the homepage generator (built)
└── sitemap.xml, sitemap.html       # (built)
```

## 🚀 Workflow

1. **Edit** a file in `content/`
2. **Build**: `node scripts/build-pages.js`
   It checks everything first and stops with a clear message if something is wrong.
3. **Test**: run `python3 -m http.server 8000` and open http://localhost:8000
   (generator pages also work by double-clicking the file)

`node scripts/validate-data.js` runs the same checks without building.

The checks catch: missing fields, duplicate slugs, generators not listed in a category, recipes pointing at lists that don't exist, filter options that never produce names, and stray brackets or "undefined" in output. They warn on empty lists and generators with fewer than 100 names.

## 📝 Adding Content

### Adding names to a generator

Open its file in `content/generators/` and add to the right list:

```json
"data": {
  "male": {
    "tolkien": ["Legolas", "Elrond", "NEW_NAME_HERE"]
  }
}
```

Then run the build.

### Adding a new generator

1. Copy a similar file in `content/generators/` (e.g. `elf.json` → `goblin.json`). The file name is the generator's key.
2. Change the title, slug, icon, description, keywords, article, filters, recipe and names.
3. Set `"category"` to its home category (used for the breadcrumb), and add `"goblin"` to that category's `generators` list in `content/categories.json`. Add it to other categories' lists too if it belongs there.
4. Run the build.

### Adding a new category

Add an entry to `content/categories.json` (name, slug, icon, description, seoDescription, navLabel, generators) and run the build. Menus, the homepage and sitemaps pick it up automatically.

## 🧪 Recipes

A recipe says how to build one name. Lists are referred to by **path**: dots step into `data`, and `{filter}` is replaced by what the visitor chose. So with Gender = Male and Style = Tolkien, `"{gender}.{origin}"` means `data.male.tolkien`.

If a path stops at a group of lists, names come from every list in the group. `"*"` means every list in the generator.

| Recipe | What it does | Example |
|---|---|---|
| `pick` | One name from one list | `"recipe": "pick", "from": "{gender}.{origin}"` |
| `combine` | One item from each list, joined | `"recipe": "combine", "parts": ["{gender}", "surnames"], "join": " "` |
| `template` | Fill a pattern: `[path]` draws from a list, `{filter}` inserts a choice or typed text | `"recipe": "template", "template": "The [baseNames] Shield"` |
| `switch` | Use a different recipe for each option of one filter | see below |

Extras:

- **`"join": "auto"`** (combine): adds a space unless the next part starts lowercase, so Night + shade = *Nightshade* but Agent + Kane = *Agent Kane*.
- **Several templates**: give `"template"` a list and one is picked at random each time, e.g. `["The [single_aliases]", "[single_aliases]"]`.
- **`"slots"`**: fill placeholders inside the names themselves. `"slots": { "Name": "{type}" }` turns a drawn title like `"House of [Name]"` into *House of Wolf*.
- **`"distinct"`**: stop names in one batch from looking alike. Each rule compares the `"first"` word or the `"rest"` of the name; `"length"` compares only the first few letters, and `"alike"` lists starts that count as the same sound. See `funny_wizard.json`.

`switch` example (from `angel.json`):

```json
"recipe": "switch",
"on": "format",
"cases": {
  "first_name":        { "recipe": "pick",     "from": "{gender}" },
  "full_name":         { "recipe": "template", "template": "[{gender}] [surnames]" },
  "full_name_epithet": { "recipe": "template", "template": "[{gender}] [surnames], [epithets]" }
}
```

Add `"default": { ... }` for options not listed in `cases` (see `brand.json`).

## 🎛️ Filters

```json
"filters": {
  "gender": {
    "label": "Gender",
    "options": ["male", "female", "neutral"],
    "optionLabels": { "neutral": "Gender-neutral" }
  },
  "characterName": {
    "type": "text",
    "label": "Character Name",
    "placeholder": "Enter your character's name",
    "default": "Your Character"
  }
}
```

`optionLabels` is optional; without it `non_binary` shows as "Non Binary". Text boxes are used in templates as `{characterName}`.

Dropdowns run top to bottom: options that have no names for the choices above them are hidden. For example, dragon types that only exist for "neutral" don't appear while "male" is selected.

## 🎨 Customization

- **Styling**: `styles/main.css` (global), `styles/blog.css` (article pages)
- **Page templates**: `scripts/build-pages.js`
- **Homepage, All Generators and About**: edit the HTML directly, but leave the `<!-- BUILD:... -->` sections alone, since the build rewrites them

## 📦 Requirements

- Node.js (for the build)
- No other dependencies
