# Name Generators V2

A scalable name generator website system where adding content = editing JSON only. No code changes ever needed.

## 🏗️ Architecture

```
JSON Files (Content)
        ↓
   Build Scripts (Auto-generate)
        ↓
HTML Pages (Output - Never edit directly!)
```

**The golden rule:** Edit JSON → Run build script → Pages update automatically

## 📁 Project Structure

```
project/
├── index.html                       # Homepage (dynamic)
├── all-generators.html             # All generators list
├── styles/
│   ├── main.css                    # Global styles
│   └── blog.css                    # Article/blog styles
├── data/
│   ├── fantasy.json                # Category data files
│   └── [other categories].json
├── lib/
│   └── generator.js                # Core generator logic
├── scripts/
│   ├── build-pages.js              # Auto-generates all HTML pages
│   ├── update-homepage.js          # Updates category counts on homepage
│   └── validate-data.js            # Validates all JSON files
├── categories/
│   └── [auto-generated]/           # Category landing pages
└── posts/                          # Individual generator pages
    └── [auto-generated]/
```

## 🚀 Getting Started

### 1. Validate Your Data

Before building, validate your JSON files:

```bash
node scripts/validate-data.js
```

This checks for:
- Required fields present
- Minimum 100 names per generator (warning)
- Valid filter structures
- No duplicate slugs
- Related generators exist
- SEO fields not empty

### 2. Build All Pages

Generate all HTML pages from JSON:

```bash
node scripts/build-pages.js
```

This creates:
- Individual generator pages in `/posts/`
- Category landing pages in `/categories/`
- Updates `all-generators.html`

### 3. Update Homepage

Update category counts and popular generators:

```bash
node scripts/update-homepage.js
```

Or the homepage will auto-populate via JavaScript when loaded.

## 📝 Adding Content

### Adding Names to an Existing Generator

1. Edit the JSON file (e.g., `data/fantasy.json`)
2. Add names to the appropriate `data` section:

```json
"data": {
  "male": {
    "tolkien": [
      "Legolas",
      "Elrond",
      "NEW_NAME_1",  // <- Just add here
      "NEW_NAME_2",
      // ... add more
    ]
  }
}
```

3. Run `node scripts/build-pages.js` to regenerate pages

### Adding a New Generator

1. Edit the category JSON file (e.g., `data/fantasy.json`)
2. Add a new generator object to the `generators` section:

```json
"generators": {
  "elf": { ... },
  "goblin": {  // <- New generator
    "title": "Goblin Name Generator",
    "slug": "goblin-name-generator",
    "description": "...",
    "seoKeywords": "...",
    "icon": "👺",
    "isPopular": false,
    "filters": { ... },
    "data": { ... },
    "article": { ... },
    "relatedGenerators": [ ... ]
  }
}
```

3. Run `node scripts/build-pages.js`

### Adding a New Category

1. Create a new JSON file in `/data/` (e.g., `data/music.json`)
2. Follow the structure from `data/fantasy.json`
3. Run `node scripts/build-pages.js`
4. The homepage will automatically include the new category

## 📋 JSON Structure

### Category File Structure

```json
{
  "categoryInfo": {
    "name": "Fantasy",
    "slug": "fantasy",
    "icon": "⚔️",
    "description": "...",
    "seoDescription": "...",
    "navLabel": "Fantasy Names"
  },
  "generators": {
    "generatorKey": {
      "title": "Generator Title",
      "slug": "generator-slug",
      "description": "...",
      "seoKeywords": "...",
      "icon": "🧝",
      "isPopular": true,
      "popularRank": 7,
      "filters": { ... },
      "data": { ... },
      "article": { ... },
      "relatedGenerators": [ ... ]
    }
  }
}
```

### Generator Data Structure

The `data` field can be structured based on your filters:

**Simple (no filters):**
```json
"data": [
  "Name 1",
  "Name 2",
  ...
]
```

**With filters:**
```json
"data": {
  "male": {
    "tolkien": [ ... ],
    "dnd": [ ... ]
  },
  "female": {
    "tolkien": [ ... ],
    "dnd": [ ... ]
  }
}
```

The structure should match your filter options exactly.

## 🎯 Workflow

1. **Edit JSON** → Add/update names in `data/*.json`
2. **Validate** → `node scripts/validate-data.js`
3. **Build** → `node scripts/build-pages.js`
4. **Update Homepage** → `node scripts/update-homepage.js` (optional, auto-updates)
5. **Test** → Open `index.html` in browser

## 🔧 Scripts Reference

### `build-pages.js`
- Reads all JSON files in `/data/`
- Generates individual generator pages
- Generates category landing pages
- Updates `all-generators.html`

### `validate-data.js`
- Validates all JSON files
- Checks required fields
- Warns about low name counts
- Exits with error code if issues found

### `update-homepage.js`
- Updates category counts on homepage
- Updates popular generators section
- Updates category dropdown

## 📦 Requirements

- Node.js (for build scripts)
- Modern web browser (for viewing)
- No external dependencies (vanilla JavaScript)

## 🎨 Customization

### Styling
- Edit `styles/main.css` for global styles
- Edit `styles/blog.css` for article pages

### Generator Logic
- Edit `lib/generator.js` for core generation logic

### Page Templates
- Edit `scripts/build-pages.js` to modify HTML templates

## ✅ Success Criteria

- ✅ Adding 100 names → Edit JSON, run build script
- ✅ Adding new generator → Edit JSON, run build script
- ✅ Adding new category → Create JSON file, run build script
- ✅ No code changes needed for content updates

## 📚 Example: Adding Names to Elf Generator

```json
// data/fantasy.json
"elf": {
  "data": {
    "male": {
      "tolkien": [
        "Legolas",
        "Elrond",
        "NEW_NAME_HERE"  // <- Add here
      ]
    }
  }
}
```

Then run:
```bash
node scripts/build-pages.js
```

The page at `posts/elf-name-generator.html` will automatically update!


