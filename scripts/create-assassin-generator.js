#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Assassin name data from the provided JSON
const assassinData = {
  "MODERN_PREFIXES": [
    "Agent", "Cipher", "Rook", "Ash", "Cole", "Blake", "Drake", "Reed", "Jade", "Slate", "Pierce", "Nash", "Jax", "Quinn", "Flynn", "Thorne",
    "Knox", "Zane", "Steele", "Cross", "Wolfe", "Frost", "Hawk", "Colt", "Stone", "Flint", "Duke", "Blaze", "Slade", "Axel", "Sage", "Phoenix",
    "Orion", "Jett", "Dante", "Echo", "Nyx", "Raven", "Silas", "Ghost", "Onyx", "Shadow", "Number Nine", "Subject Twelve",
    "Asset Thirteen", "Operative Seventeen", "Unit Twenty-Three", "Subject Thirty-One", "Cipher Fifty-Five"
  ],
  "MODERN_SUFFIXES": [
    "Blackwell", "Kane", "Mercer", "Reeves", "Shadow", "Winters", "Nightingale", "Phantom", "Venom", "Dagger", "Raven", "Cobalt", "Viper",
    "Sable", "Onyx", "Sterling", "Ember", "Crimson", "Frost", "Hunter", "Bishop", "Reaper", "Blackwood", "Nightfall", "Holloway", "Graves",
    "Price", "Marlowe", "Cross", "Sinclair", "Archer", "Caldwell", "Donovan", "Wolfe", "Callahan", "Shepherd", "Ashford", "Rhodes", "Lockwood",
    "Hartwell", "Ramsey", "Langley", "Hollister", "Thornton", "Whitlock", "Murdoch", "Remington", "Stratford", "Cassidy", "Pembroke",
    "Grimshaw", "Kensington", "Aldridge", "Montrose", "Bloodfang", "Blackfeather", "Greymane", "Webweaver", "Sharpeye", "Silentflight",
    "Cunningtail", "Shadowpaw", "Spottedfang"
  ],
  "FANTASY_DARK_PREFIXES": [
    "Night", "Shadow", "Silent", "Dark", "Void", "Ghost", "Black", "Umbra", "Vesper", "Shade", "Mirth", "Gloom", "Dirk", "Steel", "Iron",
    "Edge", "Blade", "Scarp", "Point", "Gore", "Stylet", "Whisper", "Slink", "Soft", "Cinder", "Echo", "Hush", "Knell", "Reap", "Grim",
    "Doom", "Grave", "Mort", "Soul", "Cairn", "Viper", "Serpent", "Acon", "Venom", "Talon", "Scale", "Hiss", "Glia", "Cloak", "Hood",
    "Crypt", "Seal", "Order", "Creed", "Hidden", "Cove", "Silver", "Gold", "Jet", "Azure", "Glimmer", "Mist", "Zephyr",
    "Veridian", "Ash", "Coal", "Nightshade", "Voidwalker"
  ],
  "FANTASY_DARK_SUFFIXES": [
    "shade", "blade", "fang", "whisper", "walker", "veil", "mere", "fall", "step", "bane", "thorn", "reaper", "mist", "claw", "bringer",
    "shadow", "death", "storm", "raven", "hunter", "dagger", "hawk", "prowler", "ember", "mancer", "cloak", "slayer", "weaver", "mire",
    "ghast", "echo", "mantle", "grave", "hollow", "rift", "spire", "chill", "water", "winter", "moon", "rune", "keep", "march", "song",
    "scar", "tide", "mark", "path", "reach", "cairn", "glen", "rest", "shore", "wood", "shimmer", "lace", "pool", "loch", "dell", "crest",
    "hart", "well", "haven", "moor", "shire", "dust", "gale", "fire", "frost", "flame", "doom", "grim", "scythe", "crypt", "guild", "tox"
  ],
  "ETHNIC_THEMATIC_PREFIXES": [
    "Kael", "Zephyr", "Lysander", "Morrigan", "Theron", "Azrael", "Draven", "Talon", "Rook", "Soren", "Lyra", "Cassian", "Nova", "Dante",
    "Seraph", "Kieran", "Lucian", "Elara", "Damon", "Ivy", "Cade", "Thalia", "Corvus", "Lennox", "Magnus", "Isolde", "Dorian", "Kira",
    "Cassius", "Rune", "Malachi", "Astrid", "Thane", "Liora", "Caspian", "Aldric", "Grim", "Roderick", "Cedric", "Edmund", "Godric",
    "Alaric", "Tristan", "Gareth", "Percival", "Thaddeus", "Benedict", "Reynard", "Osric", "Baldric", "Mortimer", "Ulrich", "Wolfram",
    "Barnabas", "Cornelius", "Ambrose", "Rupert", "Geoffrey", "Desmond", "Crispin", "Siward", "Randolf", "Everard", "Godwin", "Alistair",
    "Aldous", "Wolfric", "Godfrey", "Tancred", "Harding", "Wulfric", "Kenzo", "Akira", "Takeshi", "Hiro", "Ryu", "Kenji", "Masaru",
    "Shinobu", "Haruto", "Raiden", "Yuki", "Kaito", "Isamu", "Ryota", "Hayato", "Daichi", "Satoshi", "Hiroshi", "Makoto", "Toshiro",
    "Kazuki", "Noboru", "Yukio", "Ichiro", "Takeo", "Jiro", "Minoru", "Akio", "Ren", "Sora", "Katsu", "Hideaki", "Osamu", "Shiro",
    "Masato", "Yoshio", "Kiyoshi", "Tadashi", "Naoki", "Brutus", "Cassius", "Marcus", "Julius", "Octavius", "Tiberius", "Nero", "Caligula",
    "Augustus", "Claudius", "Ragnar", "Bjorn", "Leif", "Erik", "Ivar", "Halfdan", "Sigurd", "Rollo", "Harald", "Gunnar", "Ulf", "Thorstein",
    "Pyrus", "Aquila", "Terra", "Zephyrus", "Glacius", "Voltis", "Magma", "Tempest", "Cinder", "Torrent", "Boulder", "Gale", "Icicle",
    "Spark", "Lava", "Tsunami", "Quake", "Cyclone", "Blizzard", "Thunder", "Wolf", "Serpent", "Viper", "Cobra", "Panther", "Tiger"
  ],
  "SINGLE_ALIASES": [
    "Oblivion", "Vengeance", "Retribution", "Malice", "Havoc", "Chaos", "Doom", "Fate", "Ruin", "Dread", "Bane", "Scourge", "Plague",
    "Famine", "War", "Death", "Wrath", "Fury", "Rage", "Spite", "Venom", "Toxin", "Poison", "Curse", "Hex", "Jinx", "Gloom", "Despair",
    "Sorrow", "Anguish", "Torment", "Agony", "Pain", "Suffering", "Misery", "Damnation", "Perdition", "Abyss", "Void", "Null", "Zero",
    "Naught", "Nihil", "Entropy", "Decay", "Rot", "Corruption", "Taint", "Blight", "Phantom", "Specter", "Wraith", "Eclipse", "Raven",
    "Dagger", "Blade", "Ghost", "Smoke", "Ash", "Ember", "Frost", "Ice", "Storm", "Thunder", "Lightning", "Crimson", "Scarlet", "Onyx",
    "Obsidian", "Jade", "Rogue", "Bandit", "Outlaw", "Nomad", "Vagrant", "Exile", "Pariah", "Heretic", "Sable", "Slate", "Flint", "Steel",
    "Iron", "Chrome", "Mercury", "Zinc", "Copper", "Silver", "Platinum", "Ivory", "Pearl", "Coral", "Amber", "Garnet", "Topaz", "Quartz",
    "Opal", "Jasper", "Granite", "Marble", "Basalt", "Diamond", "Sapphire", "Ruby", "Emerald", "Citrine"
  ]
};

// Combine prefixes and suffixes as per the logic
const combinedPrefixPool = [
  ...assassinData.MODERN_PREFIXES,
  ...assassinData.FANTASY_DARK_PREFIXES,
  ...assassinData.ETHNIC_THEMATIC_PREFIXES
];

const combinedSuffixPool = [
  ...assassinData.MODERN_SUFFIXES,
  ...assassinData.FANTASY_DARK_SUFFIXES
];

// Helper function to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate compound name logic
function generateCompoundName() {
  const prefix = combinedPrefixPool[Math.floor(Math.random() * combinedPrefixPool.length)];
  const suffix = combinedSuffixPool[Math.floor(Math.random() * combinedSuffixPool.length)];
  
  // Check if prefix is a single word (like 'Knox') and suffix is a surname (like 'Grimshaw')
  const prefixIsSingleWord = !prefix.includes(' ') && prefix.length < 15;
  const suffixIsSurname = suffix.charAt(0) === suffix.charAt(0).toUpperCase() && suffix.length > 4;
  
  // Check if suffix starts with lowercase (like 'shade' from FANTASY_DARK_SUFFIXES)
  const suffixStartsLowercase = suffix.charAt(0) === suffix.charAt(0).toLowerCase();
  
  if (prefixIsSingleWord && suffixIsSurname && !suffixStartsLowercase) {
    // Insert space: "Knox Grimshaw"
    return `${prefix} ${suffix}`;
  } else if (suffixStartsLowercase) {
    // Concatenate without space, capitalize suffix: "Nightshade"
    return prefix + capitalize(suffix);
  } else {
    // Concatenate without space: "Shadowblade"
    return prefix + suffix;
  }
}

// Generate alias name
function generateAliasName() {
  return assassinData.SINGLE_ALIASES[Math.floor(Math.random() * assassinData.SINGLE_ALIASES.length)];
}

// Test the functions
console.log('Compound Names:');
for (let i = 0; i < 10; i++) {
  console.log('  ' + generateCompoundName());
}

console.log('\nAlias Names:');
for (let i = 0; i < 10; i++) {
  console.log('  ' + generateAliasName());
}

// Now add to people.json
const peopleFile = path.join(__dirname, '../data/people.json');
const peopleData = JSON.parse(fs.readFileSync(peopleFile, 'utf8'));

// Structure the data for the generator
peopleData.generators.assassin = {
  "title": "Assassin Name Generator",
  "slug": "assassin-name-generator",
  "description": "Generate deadly assassin names by combining modern, fantasy dark, and ethnic thematic components. Create compound names or powerful single-word aliases perfect for assassins, rogues, and shadow operatives.",
  "seoKeywords": "assassin names, assassin name generator, rogue names, shadow names, killer names, hitman names, operative names, dark fantasy names",
  "icon": "🗡️",
  "isPopular": true,
  "popularRank": 11,
  "filters": {
    "style": {
      "label": "Name Style",
      "options": [
        "compound",
        "alias"
      ]
    }
  },
  "data": {
    "modern_prefixes": assassinData.MODERN_PREFIXES,
    "modern_suffixes": assassinData.MODERN_SUFFIXES,
    "fantasy_dark_prefixes": assassinData.FANTASY_DARK_PREFIXES,
    "fantasy_dark_suffixes": assassinData.FANTASY_DARK_SUFFIXES,
    "ethnic_thematic_prefixes": assassinData.ETHNIC_THEMATIC_PREFIXES,
    "single_aliases": assassinData.SINGLE_ALIASES,
    "combined_prefixes": combinedPrefixPool,
    "combined_suffixes": combinedSuffixPool
  },
  "article": {
    "hero": {
      "title": "🗡️ Assassin Name Generator",
      "tagline": "Generate deadly assassin names perfect for rogues, shadow operatives, and dark fantasy characters. Combine modern, fantasy, and ethnic components or choose powerful single-word aliases."
    },
    "intro": "Assassin names capture the essence of shadow, death, and precision. From modern operatives like 'Agent Shadow' to fantasy dark assassins like 'Nightshade' or ethnic thematic names like 'Kael Blackwood', assassin names tell stories of stealth, skill, and deadly purpose. Our **assassin name generator** combines components from six distinct categories to create unique compound names or powerful single-word aliases perfect for assassins, rogues, and shadow operatives.",
    "sections": [
      {
        "heading": "The Power of Assassin Names",
        "content": "<p>Assassin names serve multiple purposes in storytelling and gaming: they identify shadow operatives, communicate deadly skills, establish dark backgrounds, and create memorable identities. A well-chosen assassin name can instantly convey whether a character is a modern operative (Agent Shadow, Cipher Kane), a fantasy dark assassin (Nightshade, Voidwalker), or an ethnic thematic character (Kael Blackwood, Morrigan Dagger).</p><p>Our generator combines prefixes and suffixes from three main categories: <strong>Modern</strong> (Agent, Cipher, Shadow, Kane, Mercer), <strong>Fantasy Dark</strong> (Night, Void, Ghost, shade, blade, fang), and <strong>Ethnic Thematic</strong> (Kael, Morrigan, Theron, Azrael). It also offers powerful <strong>Single Aliases</strong> (Oblivion, Vengeance, Phantom, Eclipse) for characters who operate under a single, memorable moniker.</p>"
      },
      {
        "heading": "Assassin Name Categories",
        "content": "<p>Each category offers distinct naming opportunities:</p><ul><li><strong>Modern Prefixes:</strong> Names like Agent, Cipher, Rook, Ash, Cole, Blake suggest contemporary operatives and modern assassins. Perfect for spy thrillers, cyberpunk settings, and modern fantasy.</li><li><strong>Modern Suffixes:</strong> Surnames like Blackwell, Kane, Mercer, Reeves, Shadow, Winters add professional, mysterious, or dark tones to modern names.</li><li><strong>Fantasy Dark Prefixes:</strong> Names like Night, Shadow, Silent, Dark, Void, Ghost evoke mystical darkness and shadow magic. Ideal for dark fantasy and gothic settings.</li><li><strong>Fantasy Dark Suffixes:</strong> Lowercase suffixes like shade, blade, fang, whisper, walker combine with prefixes to create single-word names (Nightshade, Shadowblade).</li><li><strong>Ethnic Thematic Prefixes:</strong> Names from various cultures including Greek (Lysander, Theron), Japanese (Kenzo, Akira, Takeshi), Norse (Ragnar, Bjorn), and Latin (Brutus, Cassius) add cultural depth and thematic variety.</li><li><strong>Single Aliases:</strong> Powerful standalone names like Oblivion, Vengeance, Phantom, Eclipse work as complete identities without needing combination.</li></ul>"
      },
      {
        "heading": "How Assassin Names Work",
        "content": "<p>The generator creates names using intelligent combination logic:</p><ul><li><strong>Compound Names:</strong> Combines prefixes and suffixes. If the prefix is a single word (like 'Knox') and the suffix is a surname (like 'Grimshaw'), it inserts a space: 'Knox Grimshaw'. If the suffix starts with lowercase (like 'shade'), it concatenates and capitalizes: 'Nightshade'. Otherwise, it creates single-word combinations: 'Shadowblade'.</li><li><strong>Alias Names:</strong> Selects a powerful single-word alias from the SINGLE_ALIASES list, perfect for assassins who operate under one memorable name.</li></ul><p>This creates authentic, memorable names that feel integrated into your world, whether you're writing modern thrillers, dark fantasy, or creating characters for tabletop RPGs.</p>"
      },
      {
        "heading": "How to Use Assassin Names",
        "content": "<p>Assassin names work excellently for:</p><ul><li><strong>Tabletop RPGs:</strong> Create memorable assassin characters for D&D, Pathfinder, or other games</li><li><strong>Creative Writing:</strong> Name assassins, rogues, and shadow operatives in your stories</li><li><strong>Game Development:</strong> Generate assassin names for video games and interactive fiction</li><li><strong>Worldbuilding:</strong> Populate your world with shadow organizations and deadly operatives</li></ul><p>Choose 'compound' for full names that combine prefixes and suffixes, or 'alias' for powerful single-word names that work as complete identities.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between compound and alias names?",
        "answer": "Compound names combine prefixes and suffixes to create full names (like 'Agent Shadow' or 'Nightshade'). Alias names are powerful single words that work as complete identities (like 'Oblivion' or 'Phantom'). Choose compound for full names, or alias for memorable monikers."
      },
      {
        "question": "How does the name combination logic work?",
        "answer": "The generator intelligently combines prefixes and suffixes: if the prefix is a single word and the suffix is a capitalized surname, it adds a space ('Knox Grimshaw'). If the suffix starts with lowercase, it concatenates and capitalizes ('Nightshade'). Otherwise, it creates single-word combinations ('Shadowblade')."
      },
      {
        "question": "Can I use these names for any setting?",
        "answer": "Yes! The generator includes modern names for contemporary settings, fantasy dark names for gothic and dark fantasy, and ethnic thematic names from various cultures. This versatility makes it suitable for spy thrillers, cyberpunk, dark fantasy, medieval fantasy, and more."
      },
      {
        "question": "What makes a good assassin name?",
        "answer": "A good assassin name should be memorable, evoke shadow and danger, sound professional or mysterious, work as a complete identity, and fit the tone of your setting. The generator ensures variety by combining different categories and preventing repetition."
      }
    ]
  },
  "relatedGenerators": [
    "epithet"
  ]
};

fs.writeFileSync(peopleFile, JSON.stringify(peopleData, null, 2));
console.log('\n✅ Added assassin generator to people.json');

