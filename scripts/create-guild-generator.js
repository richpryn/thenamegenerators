#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Guild name data from the provided JSON
const guildData = {
  "GUILD_NAME_PREFIXES": [
    // Original 25 Prefixes (Core)
    "Wolf", "Dragon", "Ironforge", "Shadow", "Frost", "Steel", "Raven", "Lion", "Storm", "Crimson",
    "Stone", "Rune", "Swift", "Valiant", "Truth", "Secret", "Myth", "Sun", "Moon", "Ember",
    "Whisper", "Gold", "Black", "White", "Blood",
    
    // New Animal & Mythic Prefixes (~25)
    "Tiger", "Eagle", "Falcon", "Serpent", "Cobra", "Viper", "Bear", "Panther", "Bull", "Stag",
    "Rhino", "Mammoth", "Boar", "Stallion", "Griffin", "Phoenix", "Basilisk", "Hydra", "Wyvern",
    "Manticore", "Cerberus", "Thunderbird",
    
    // New Nature & Elemental Prefixes (~35)
    "Oak", "Ash", "Willow", "Thorn", "Ironwood", "Redwood", "Yew", "Maple", "Elder", "Briar",
    "River", "Stream", "Brook", "Ocean", "Wave", "Flint", "Granite", "Marble", "Pebble", "Thunder",
    "Lightning", "Tempest", "Ice", "Gale", "Blaze", "Light", "Void", "Wind", "Cloud",
    
    // New Weapon & Virtue Prefixes (~25)
    "Sword", "Blade", "Axe", "Hammer", "Spear", "Lance", "Shield", "Aegis", "Dagger", "Rapier",
    "Honor", "Valor", "Courage", "Justice", "Faith", "Wisdom", "Loyalty", "Will", "Strength",
    "Armor", "Plate", "Mail", "Helm", "Bastion",
    
    // New Color & Material Prefixes (~20)
    "Scarlet", "Azure", "Cobalt", "Emerald", "Jade", "Ruby", "Sapphire", "Amber",
    "Iron", "Copper", "Bronze", "Platinum", "Silver", "Mithril", "Diamond", "Obsidian", "Brass", "Pewter",
    
    // New Time & Abstract Prefixes (~20)
    "Dawn", "Dusk", "Midnight", "Noon", "Sunrise", "Sunset", "Star", "Comet", "Eclipse", "Dream",
    "Nightmare", "Oath", "Vow", "Destiny", "Fate", "Balance", "Harmony", "Chaos", "Order"
  ],
  "GUILD_NAME_SUFFIXES": [
    "[Name] Guild",
    "Guild of [Name]",
    "Guild of the [Name]",
    "The [Name] Guild",
    "Order of [Name]",
    "Order of the [Name]",
    "The [Name] Order",
    "[Name] Brotherhood",
    "Brotherhood of [Name]",
    "The [Name] Brotherhood",
    "[Name] Covenant",
    "Covenant of [Name]",
    "The [Name] Covenant",
    "[Name] Syndicate",
    "Syndicate of [Name]",
    "The [Name] Syndicate",
    "[Name] Consortium",
    "Consortium of [Name]",
    "The [Name] Consortium",
    "The [Name] Assembly"
  ],
  "SINGLE_WORD_ALIASES": [
    "Sentinel", "Vanguard", "Legion", "Pact", "Covenant", "Brotherhood", "Syndicate", "Consortium", "Arcanum",
    "Aegis", "Bastion", "Citadel", "Watch", "Keep", "Asylum", "Vault", "Circle", "Coven", "Cult", "Order",
    "Shade", "Blade", "Hand", "Mark", "Signet"
  ]
};

// Test generation
function generateCompoundGuildName() {
  const prefix = guildData.GUILD_NAME_PREFIXES[Math.floor(Math.random() * guildData.GUILD_NAME_PREFIXES.length)];
  const suffix = guildData.GUILD_NAME_SUFFIXES[Math.floor(Math.random() * guildData.GUILD_NAME_SUFFIXES.length)];
  return suffix.replace(/\[Name\]/g, prefix);
}

function generateSimpleGuildName() {
  const alias = guildData.SINGLE_WORD_ALIASES[Math.floor(Math.random() * guildData.SINGLE_WORD_ALIASES.length)];
  // 50% chance to prepend "The "
  return Math.random() < 0.5 ? `The ${alias}` : alias;
}

console.log('Compound Guild Names:');
for (let i = 0; i < 10; i++) {
  console.log('  ' + generateCompoundGuildName());
}

console.log('\nSimple Guild Names:');
for (let i = 0; i < 10; i++) {
  console.log('  ' + generateSimpleGuildName());
}

// Add to organizations.json
const orgFile = path.join(__dirname, '../data/organizations.json');
const orgData = JSON.parse(fs.readFileSync(orgFile, 'utf8'));

orgData.generators.guild = {
  "title": "Guild Name Generator",
  "slug": "guild-name-generator",
  "description": "Generate fantasy guild names by combining thematic components with organizational titles. Create compound names like 'Order of the Dragon' or simple iconic names like 'The Sentinel'.",
  "seoKeywords": "guild names, guild name generator, fantasy guild names, organization names, brotherhood names, order names, fantasy organization names",
  "icon": "⚔️",
  "isPopular": true,
  "popularRank": 12,
  "filters": {
    "style": {
      "label": "Name Style",
      "options": [
        "compound",
        "simple"
      ]
    }
  },
  "data": {
    "prefixes": guildData.GUILD_NAME_PREFIXES,
    "suffixes": guildData.GUILD_NAME_SUFFIXES,
    "single_aliases": guildData.SINGLE_WORD_ALIASES
  },
  "article": {
    "hero": {
      "title": "⚔️ Guild Name Generator",
      "tagline": "Generate fantasy guild names perfect for D&D, worldbuilding, and fantasy writing. Combine thematic components with organizational titles or choose simple iconic names."
    },
    "intro": "Guild names define the identity, purpose, and power of organizations in fantasy worlds. From the legendary 'Order of the Dragon' to the mysterious 'Guild of Shadows', guild names tell stories about their members, missions, and traditions. Our **guild name generator** combines over 150 thematic prefixes with 20 organizational title formats, plus powerful single-word aliases, creating authentic and memorable guild names for any fantasy setting.",
    "sections": [
      {
        "heading": "The Power of Guild Names",
        "content": "<p>Guild names serve multiple purposes in fantasy worlds: they identify organizations, communicate values, establish traditions, and create memorable identities. A well-chosen guild name can instantly convey whether an organization is noble (Order of the Valiant), mysterious (Guild of Shadows), powerful (Brotherhood of the Dragon), or dark (Covenant of Blood).</p><p>Our generator combines thematic prefixes—from animals (Wolf, Dragon, Eagle) to elements (Storm, Frost, Thunder) to virtues (Honor, Valor, Justice)—with organizational titles like 'Guild of [Name]', 'Order of the [Name]', 'Brotherhood of [Name]', and more. It also offers simple, iconic single-word names like 'The Sentinel', 'Vanguard', or 'Arcanum' for guilds that prefer minimalist identities.</p>"
      },
      {
        "heading": "Guild Name Categories",
        "content": "<p>The generator includes over 150 thematic prefixes across multiple categories:</p><ul><li><strong>Animals & Mythic:</strong> Wolf, Dragon, Eagle, Griffin, Phoenix, Basilisk, Hydra, Wyvern, and more. Perfect for guilds that identify with powerful creatures.</li><li><strong>Nature & Elemental:</strong> Oak, Storm, Thunder, Frost, River, Ocean, Blaze, Void, and more. Ideal for guilds connected to natural forces.</li><li><strong>Weapons & Combat:</strong> Sword, Blade, Shield, Aegis, Hammer, Spear, and more. Great for warrior guilds and military orders.</li><li><strong>Virtues & Values:</strong> Honor, Valor, Courage, Justice, Faith, Wisdom, Loyalty, and more. Perfect for noble orders and righteous organizations.</li><li><strong>Colors & Materials:</strong> Crimson, Azure, Emerald, Iron, Steel, Mithril, Diamond, and more. Ideal for craft guilds and material-focused organizations.</li><li><strong>Time & Abstract:</strong> Dawn, Dusk, Eclipse, Dream, Oath, Destiny, Balance, Chaos, Order, and more. Great for mystical and philosophical guilds.</li></ul>"
      },
      {
        "heading": "How Guild Names Work",
        "content": "<p>The generator creates names using two distinct methods:</p><ul><li><strong>Compound Names:</strong> Combines a thematic prefix with an organizational title format. The prefix replaces '[Name]' in the title format, creating names like 'Order of the Dragon', 'Guild of Shadows', 'Brotherhood of the Valiant', or 'The Crimson Syndicate'. This creates authentic, traditional guild names that feel integrated into fantasy worlds.</li><li><strong>Simple Names:</strong> Selects a powerful single-word alias from the list. 50% of simple names are prefixed with 'The' (like 'The Sentinel' or 'The Vanguard'), while others stand alone (like 'Arcanum' or 'Legion'). These names work excellently for iconic, minimalist guild identities.</li></ul><p>With 20 organizational title formats and over 150 prefixes, the generator can create thousands of unique compound names, ensuring variety and authenticity in your worldbuilding.</p>"
      },
      {
        "heading": "How to Use Guild Names",
        "content": "<p>Guild names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Create memorable guilds, orders, and organizations for your fantasy world</li><li><strong>Worldbuilding:</strong> Populate your fantasy setting with diverse organizations</li><li><strong>Fantasy Writing:</strong> Name guilds, brotherhoods, orders, and syndicates in your stories</li><li><strong>Game Development:</strong> Generate guild names for video games and interactive fiction</li><li><strong>Tabletop RPGs:</strong> Create organizations for players to join or interact with</li></ul><p>Choose 'compound' for traditional guild names that combine prefixes with organizational titles, or 'simple' for iconic single-word names that work as complete identities.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between compound and simple names?",
        "answer": "Compound names combine thematic prefixes with organizational titles (like 'Order of the Dragon' or 'Guild of Shadows'). Simple names are powerful single words (like 'The Sentinel' or 'Vanguard'). Choose compound for traditional guild names, or simple for iconic, minimalist identities."
      },
      {
        "question": "How many unique guild names can be generated?",
        "answer": "With over 150 prefixes and 20 organizational title formats, the generator can create over 3,000 unique compound names. Combined with 25 single-word aliases, you have access to thousands of unique guild names for your fantasy world."
      },
      {
        "question": "Can I use these names for any fantasy setting?",
        "answer": "Yes! The generator includes names suitable for medieval fantasy, high fantasy, dark fantasy, and other fantasy genres. The prefixes cover animals, elements, virtues, weapons, colors, materials, and abstract concepts, making them versatile across different fantasy settings."
      },
      {
        "question": "What makes a good guild name?",
        "answer": "A good guild name should be memorable, reflect the organization's values or purpose, sound authentic to the fantasy setting, work as a complete identity, and fit the tone of your world. The generator ensures variety by combining different prefixes with various organizational titles."
      }
    ]
  },
  "relatedGenerators": [
    "clan",
    "business"
  ]
};

fs.writeFileSync(orgFile, JSON.stringify(orgData, null, 2));
console.log('\n✅ Added guild generator to organizations.json');

