#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load parsed data
const companyData = JSON.parse(fs.readFileSync('/tmp/company_parsed.json', 'utf8'));
const cityNames = JSON.parse(fs.readFileSync('/tmp/city_parsed.json', 'utf8'));

// Read full city names file to get all 500
const cityFile = '/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators/Name txt files/fantasy_city_names.txt';
const cityContent = fs.readFileSync(cityFile, 'utf8');
const cityLines = cityContent.split('\n');
const allCityNames = [];
cityLines.forEach(line => {
  line = line.trim();
  if (!line || line.includes('FANTASY CITY NAMES') || line.includes('─')) return;
  const match = line.match(/^\d+\.\s*(.+)$/);
  if (match) {
    allCityNames.push(match[1].trim());
  }
});

// Add company generator to organizations.json
const orgFile = path.join(__dirname, '../data/organizations.json');
const orgData = JSON.parse(fs.readFileSync(orgFile, 'utf8'));

orgData.generators.company = {
  "title": "Company Name Generator",
  "slug": "company-name-generator",
  "description": "Generate modern, brandable company names perfect for startups, businesses, and brands. Choose from single words, portmanteaus, trendy suffixes, invented words, or memorable combinations.",
  "seoKeywords": "company names, company name generator, startup names, brand names, business name generator, brandable names, modern company names",
  "icon": "🏢",
  "isPopular": true,
  "popularRank": 8,
  "filters": {
    "category": {
      "label": "Name Style",
      "options": [
        "single_word",
        "portmanteau",
        "trendy_suffix",
        "invented",
        "combinations"
      ]
    }
  },
  "data": companyData,
  "article": {
    "hero": {
      "title": "🏢 Company Name Generator",
      "tagline": "Generate modern, brandable company names perfect for startups, businesses, and brands. From single words to memorable combinations."
    },
    "intro": "Company names are the foundation of your brand identity. A great company name is short, memorable, easy to spell and pronounce, and works as a .com domain. Our **company name generator** offers 1,500+ brandable names across 5 distinct styles, helping you find the perfect name for your startup, business, or brand.",
    "sections": [
      {
        "heading": "Company Name Styles",
        "content": "<p>Each style offers different advantages for brand naming:</p><ul><li><strong>Single Word Brandable:</strong> Strong, memorable single words perfect for company branding (Apex, Nexus, Phoenix, Atlas). These names are simple, iconic, and work across all industries.</li><li><strong>Portmanteau & Invented:</strong> Clever combinations of words (Amplify, Buildify, Evolva) that create unique, brandable names. Similar to successful brands like Spotify, Instagram, and Pinterest.</li><li><strong>Trendy Suffix Words:</strong> Modern naming with -ify, -ly, -io, -hub, -space, -lab, -tech, -works suffixes. These names feel contemporary and tech-forward.</li><li><strong>Made-Up / Invented Words:</strong> Pronounceable invented words with no specific meaning (Abryx, Corix, Dextra, Helix). These names are unique, brandable, and work globally.</li><li><strong>Short Memorable Combinations:</strong> Punchy 2-word combinations that work as company names (Blue Shift, North Star, True North). These names are descriptive yet flexible.</li></ul>"
      },
      {
        "heading": "What Makes a Great Company Name?",
        "content": "<p>A great company name should be:</p><ul><li><strong>Short & Memorable:</strong> 1-3 syllables ideal for easy recall</li><li><strong>Easy to Spell & Pronounce:</strong> People should be able to say and type it without confusion</li><li><strong>Doesn't Describe the Business:</strong> Allows for pivoting and expansion</li><li><strong>Works as a .com Domain:</strong> Check availability before committing</li><li><strong>Unique and Brandable:</strong> Stands out in the competitive market</li><li><strong>Sounds Professional Yet Modern:</strong> Appeals to your target audience</li></ul><p>Examples of great company names include Apple, Stripe, Notion, Figma, Canva, Slack, and Zoom. These names are simple, memorable, and don't lock the company into one industry.</p>"
      },
      {
        "heading": "How to Use Company Names",
        "content": "<p>Company names work excellently for:</p><ul><li><strong>Startups:</strong> Find a memorable, brandable name that stands out</li><li><strong>Businesses:</strong> Choose a name that reflects your company's values and market position</li><li><strong>Brand Naming:</strong> Select a name that works well for logos, marketing materials, and brand identity</li><li><strong>Creative Projects:</strong> Name businesses in stories, games, or creative writing projects</li></ul><p>Always check trademark availability, domain availability, and business registration availability before using any name for your actual business. These names are provided as inspiration and starting points for your own creative naming process.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the name styles?",
        "answer": "Single Word names are simple and iconic (Apex, Nexus). Portmanteau names combine words creatively (Amplify, Buildify). Trendy Suffix names use modern endings (-ify, -ly, -io). Invented names are made-up but pronounceable (Abryx, Helix). Combinations are 2-word phrases (Blue Shift, North Star)."
      },
      {
        "question": "Can I use these names for my actual business?",
        "answer": "Yes, but always check trademark availability, domain availability (.com), and business registration availability in your jurisdiction before using any name. These names are provided as inspiration."
      },
      {
        "question": "Which style should I choose?",
        "answer": "Choose based on your brand personality: Single Word for simplicity, Portmanteau for creativity, Trendy Suffix for modern tech feel, Invented for uniqueness, or Combinations for descriptive flexibility."
      }
    ]
  },
  "relatedGenerators": [
    "business"
  ]
};

fs.writeFileSync(orgFile, JSON.stringify(orgData, null, 2));
console.log('✅ Added company generator to organizations.json');

// Add fantasy city generator to places.json
const placesFile = path.join(__dirname, '../data/places.json');
const placesData = JSON.parse(fs.readFileSync(placesFile, 'utf8'));

placesData.generators.fantasy_city = {
  "title": "Fantasy City Name Generator",
  "slug": "fantasy-city-name-generator",
  "description": "Generate 500 unique fantasy city names perfect for worldbuilding, D&D campaigns, fantasy writing, and map creation. Epic names like Thornhaven, Silvermere, and Dragonkeep.",
  "seoKeywords": "fantasy city names, city name generator, fantasy place names, dnd city names, worldbuilding city names, fantasy location names",
  "icon": "🏰",
  "isPopular": true,
  "popularRank": 6,
  "data": allCityNames,
  "article": {
    "hero": {
      "title": "🏰 Fantasy City Name Generator",
      "tagline": "Generate epic fantasy city names perfect for worldbuilding, D&D campaigns, and fantasy writing. 500 unique names from Thornhaven to Dragonkeep."
    },
    "intro": "Fantasy city names capture the essence of epic locations in fantasy worlds. From the mystical Thornhaven to the majestic Dragonkeep, city names tell stories about their history, culture, and character. Our **fantasy city name generator** offers 500 unique names perfect for worldbuilding, D&D campaigns, fantasy writing, and map creation.",
    "sections": [
      {
        "heading": "The Power of Fantasy City Names",
        "content": "<p>Fantasy city names serve multiple purposes in worldbuilding: they identify locations, communicate character, establish history, and create memorable settings. A well-chosen city name can instantly convey whether a location is mystical (Crystalreach, Moonspire), powerful (Ironforge, Dragonkeep), mysterious (Shadowmarch, Nightvale), or majestic (Silvermere, Goldcrest).</p><p>Our generator includes names that evoke different moods and themes: ancient cities (Stonehearth, Deepstone), magical locations (Starfall, Emberveil), fortified settlements (Stormwatch, Flameguard), and natural settings (Mistwood, Frostholm). Each name is designed to spark imagination and help you build rich, detailed fantasy worlds.</p>"
      },
      {
        "heading": "How to Use Fantasy City Names",
        "content": "<p>Fantasy city names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Populate your fantasy world with memorable cities and locations</li><li><strong>Worldbuilding:</strong> Create detailed maps and settings for your fantasy stories</li><li><strong>Fantasy Writing:</strong> Name cities, capitals, and major locations in your novels and stories</li><li><strong>Game Development:</strong> Generate city names for fantasy video games and interactive fiction</li><li><strong>Map Creation:</strong> Label cities on fantasy maps for tabletop games and worldbuilding projects</li></ul><p>These names work well alongside our <a href=\"/posts/fantasy-town-name-generator.html\">Fantasy Town Name Generator</a> and <a href=\"/posts/fantasy-country-name-generator.html\">Fantasy Country Name Generator</a> to create a complete fantasy geography.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between cities, towns, and countries?",
        "answer": "Cities are large, major settlements (Thornhaven, Silvermere). Towns are smaller settlements (see our Fantasy Town Name Generator). Countries are entire nations (see our Fantasy Country Name Generator). Use cities for capitals and major locations, towns for smaller settlements, and countries for entire regions."
      },
      {
        "question": "Can I combine these with other generators?",
        "answer": "Yes! These city names work perfectly with our Fantasy Town Name Generator and Fantasy Country Name Generator to create a complete fantasy geography. You can also use them with our Fantasy Name Generators for characters."
      },
      {
        "question": "Are these names suitable for any fantasy setting?",
        "answer": "Yes! These names work for medieval fantasy, high fantasy, dark fantasy, and other fantasy genres. They're designed to be versatile and fit various fantasy worlds and settings."
      }
    ]
  },
  "relatedGenerators": [
    "fantasy_town",
    "fantasy_country"
  ]
};

fs.writeFileSync(placesFile, JSON.stringify(placesData, null, 2));
console.log('✅ Added fantasy city generator to places.json');

// Add fantasy city generator to fantasy.json
const fantasyFile = path.join(__dirname, '../data/fantasy.json');
const fantasyData = JSON.parse(fs.readFileSync(fantasyFile, 'utf8'));

fantasyData.generators.fantasy_city = {
  "title": "Fantasy City Name Generator",
  "slug": "fantasy-city-name-generator",
  "description": "Generate 500 unique fantasy city names perfect for worldbuilding, D&D campaigns, fantasy writing, and map creation. Epic names like Thornhaven, Silvermere, and Dragonkeep.",
  "seoKeywords": "fantasy city names, city name generator, fantasy place names, dnd city names, worldbuilding city names, fantasy location names",
  "icon": "🏰",
  "isPopular": true,
  "popularRank": 6,
  "data": allCityNames,
  "article": {
    "hero": {
      "title": "🏰 Fantasy City Name Generator",
      "tagline": "Generate epic fantasy city names perfect for worldbuilding, D&D campaigns, and fantasy writing. 500 unique names from Thornhaven to Dragonkeep."
    },
    "intro": "Fantasy city names capture the essence of epic locations in fantasy worlds. From the mystical Thornhaven to the majestic Dragonkeep, city names tell stories about their history, culture, and character. Our **fantasy city name generator** offers 500 unique names perfect for worldbuilding, D&D campaigns, fantasy writing, and map creation.",
    "sections": [
      {
        "heading": "The Power of Fantasy City Names",
        "content": "<p>Fantasy city names serve multiple purposes in worldbuilding: they identify locations, communicate character, establish history, and create memorable settings. A well-chosen city name can instantly convey whether a location is mystical (Crystalreach, Moonspire), powerful (Ironforge, Dragonkeep), mysterious (Shadowmarch, Nightvale), or majestic (Silvermere, Goldcrest).</p><p>Our generator includes names that evoke different moods and themes: ancient cities (Stonehearth, Deepstone), magical locations (Starfall, Emberveil), fortified settlements (Stormwatch, Flameguard), and natural settings (Mistwood, Frostholm). Each name is designed to spark imagination and help you build rich, detailed fantasy worlds.</p>"
      },
      {
        "heading": "How to Use Fantasy City Names",
        "content": "<p>Fantasy city names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Populate your fantasy world with memorable cities and locations</li><li><strong>Worldbuilding:</strong> Create detailed maps and settings for your fantasy stories</li><li><strong>Fantasy Writing:</strong> Name cities, capitals, and major locations in your novels and stories</li><li><strong>Game Development:</strong> Generate city names for fantasy video games and interactive fiction</li><li><strong>Map Creation:</strong> Label cities on fantasy maps for tabletop games and worldbuilding projects</li></ul><p>These names work well alongside our <a href=\"/posts/fantasy-town-name-generator.html\">Fantasy Town Name Generator</a> and <a href=\"/posts/fantasy-country-name-generator.html\">Fantasy Country Name Generator</a> to create a complete fantasy geography.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between cities, towns, and countries?",
        "answer": "Cities are large, major settlements (Thornhaven, Silvermere). Towns are smaller settlements (see our Fantasy Town Name Generator). Countries are entire nations (see our Fantasy Country Name Generator). Use cities for capitals and major locations, towns for smaller settlements, and countries for entire regions."
      },
      {
        "question": "Can I combine these with other generators?",
        "answer": "Yes! These city names work perfectly with our Fantasy Town Name Generator and Fantasy Country Name Generator to create a complete fantasy geography. You can also use them with our Fantasy Name Generators for characters."
      },
      {
        "question": "Are these names suitable for any fantasy setting?",
        "answer": "Yes! These names work for medieval fantasy, high fantasy, dark fantasy, and other fantasy genres. They're designed to be versatile and fit various fantasy worlds and settings."
      }
    ]
  },
  "relatedGenerators": [
    "fantasy_town",
    "fantasy_country"
  ]
};

fs.writeFileSync(fantasyFile, JSON.stringify(fantasyData, null, 2));
console.log('✅ Added fantasy city generator to fantasy.json');

console.log('\n✨ All generators added successfully!');
console.log('   - Company Name Generator added to organizations.json');
console.log('   - Fantasy City Name Generator added to places.json');
console.log('   - Fantasy City Name Generator added to fantasy.json');


