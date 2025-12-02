#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Axe name data from the provided JSON
const axeData = {
  "Axe_Base_Names": [
    "Axe", "Greataxe", "Handaxe", "Battleaxe", "Poleaxe", "Throwing Axe", "Bearded Axe", "Tomahawk", "Hatchet", "Labrys",
    "Waraxe", "Dwarven Axe", "Executioner's Axe", "Hewing Axe", "Chopper", "Cleaver", "Ripper", "Smasher", "Crusher", "Splinter",
    "Hack", "Rend", "Splitter", "Cleft", "Fissure", "Maul", "Breaker", "Hewer", "Wrecker", "Sunderer",
    "Iron-Head", "Steel-Grip", "Haft", "Helve", "Pole", "Edge", "Head", "Beard", "Grind", "Notch",
    "Whet", "Stone", "Timber", "Wood-Breaker", "Skull-Splitter", "Doom-Head", "Grave-Splitter", "Foe-Cleaver", "Oath-Crusher", "Heart-Hew",
    "Bone-Maul", "Iron-Cleaver", "Rune-Chopper", "Blood-Hack", "Skull-Breaker", "Mountain-Splitter", "Chaos-Hewer"
  ],
  "Axe_Cool_Descriptors": [
    "Crushing", "Shattered", "Splintered", "Savage", "Brute", "Heavy", "Massive", "Thundering", "Berserk", "Iron-Heart",
    "Runic", "Oath-Forged", "Granite", "Stone-Faced", "Jarl's", "Thane's", "Mountain-Wrought", "Deep-Stone", "Oath-Bound", "Bloodied",
    "Gored", "Spiked", "Jagged", "Volcanic", "Molten", "Frost-Woven", "Ember", "Shadow", "Obsidian", "Star-Metal",
    "Void-Forged", "Storm-Wrought", "Grim", "Dread", "Fell", "Wroth", "Sunder", "Cleave", "Reckoning", "Vengeful",
    "Unbroken", "Unstoppable", "Grave-bound", "Ancient", "Ironclad", "Bronze-Tipped", "Mithril-Core", "Adamantine-Spine", "Diamond-Edged", "Cold-Iron",
    "Doom", "Ragnarok", "Titan", "Giant's", "Earthen", "Storm-Caller", "Fury's"
  ],
  "Axe_Epithets": [
    "Sunderer of Fortresses", "Foe of the Unseen", "Breaker of Shields", "Cleaver of Helms", "Shatterer of Bone", "Maul of the Earth-Spirit",
    "Hammer of the North", "The Unstoppable Force", "Fury of the Jarl", "Vengeance of the Clan", "Last Stand of the Berserker", "Gift of the Deep King",
    "Weeping of the Stone Giants", "Soul of the Forgotten Mine", "Terror of the Surface", "Truth of the Elder", "Price of Betrayal", "Key to the Mountain",
    "The Final Cleft", "Silence of the Stone", "The Winter's Weight", "Mark of the Oathbreaker", "Skull of the Frost Giant", "Wrath of the Fire Lord",
    "Burden of the Mountain King", "Shame of the Fallen", "Light in the Deep", "Rage of the Mountain", "Echo of the First Battle", "Hymn of the Stone-Hearted",
    "End of the Warlord", "Chains of the Sky", "The Relentless Blow", "Judgement of the Forge", "Might of the Ancestors", "Voice of the Deep",
    "Doom of the Unworthy", "Token of the Traitor", "Curse of the Old Gods", "of Stone", "of the Quarry", "of the Deep",
    "of the Northmen", "of the Mountain", "of the Berserker", "of the Hearth", "of the Wyrm", "of the Cursed Line", "of Ancient Fury"
  ]
};

// Weapon types from C1 (for Template 3) - these are the specific axe types
const weaponTypes = [
  "Greataxe", "Handaxe", "Battleaxe", "Poleaxe", "Throwing Axe", "Bearded Axe", "Tomahawk", "Hatchet", "Labrys",
  "Waraxe", "Dwarven Axe", "Executioner's Axe", "Hewing Axe"
];

// Read the objects.json file
const objectsFile = path.join(__dirname, '../data/objects.json');
const objectsData = JSON.parse(fs.readFileSync(objectsFile, 'utf8'));

// Add the axe generator
objectsData.generators.axe = {
  "title": "Axe Name Generator",
  "slug": "axe-name-generator",
  "description": "Generate legendary axe names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming.",
  "seoKeywords": "axe names, axe name generator, fantasy axe names, legendary axe names, D&D axe names, gaming axe names, greataxe names",
  "icon": "🪓",
  "isPopular": true,
  "popularRank": 4,
  "filters": {
    "template": {
      "label": "Name Template",
      "options": [
        "compound_artifact",
        "named_artifact",
        "complex_weapon"
      ],
      "optionLabels": {
        "compound_artifact": "Compound Artifact (e.g., Runic Cleaver, Frost-Woven Maul)",
        "named_artifact": "Named Artifact (e.g., Berserk, Fury of the Jarl)",
        "complex_weapon": "Complex Weapon (e.g., Frost-Woven Battleaxe, Sunderer of Fortresses)"
      }
    }
  },
  "data": {
    "baseNames": axeData.Axe_Base_Names,
    "descriptors": axeData.Axe_Cool_Descriptors,
    "epithets": axeData.Axe_Epithets,
    "weaponTypes": weaponTypes
  },
  "article": {
    "hero": {
      "title": "🪓 Axe Name Generator",
      "tagline": "Generate legendary axe names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming."
    },
    "intro": "Axe names carry the weight of brute force, dwarven craftsmanship, and Nordic mythology. From the classic 'Runic Cleaver' to the legendary 'Berserk, Fury of the Jarl', axe names tell stories of crushing power, mountain-forged strength, and unbreakable oaths. Our **Axe Name Generator** creates powerful axe names using three distinct templates: Compound Artifacts (Runic Cleaver), Named Artifacts (Berserk, Fury of the Jarl), and Complex Weapons (Frost-Woven Battleaxe, Sunderer of Fortresses), drawing from Nordic mythology, dwarven lore, and fantasy to create names that resonate with raw power and legendary craftsmanship.",
    "sections": [
      {
        "heading": "The Power of Axe Names",
        "content": "<p>Axe names serve multiple purposes in fantasy worlds: they identify legendary weapons, create memorable artifacts, establish a weapon's power level, and add depth to fantasy settings. A well-chosen axe name can instantly convey whether a weapon is dwarven-crafted (Mountain-Wrought Greataxe), Nordic-inspired (Jarl's Battleaxe, Hammer of the North), or legendary (Berserk, Fury of the Jarl).</p><p>Our generator uses three distinct templates to create axe names with different levels of complexity and detail. Each template has its own character: Compound Artifacts are short and punchy, Named Artifacts emphasize the weapon's legendary status, and Complex Weapons provide the most detail about appearance and lore.</p>"
      },
      {
        "heading": "Axe Name Templates",
        "content": "<p>The generator offers three distinct naming templates, each with its own character and feel:</p><ul><li><strong>Compound Artifact (C2 + C1):</strong> This template creates short, punchy names common in high fantasy. Format: [Descriptor] + [Base Name]. Examples: 'Runic Cleaver', 'Frost-Woven Maul', 'Mountain-Wrought Chopper'. This template combines an adjective/title with a base noun or axe type, creating memorable, iconic names that emphasize raw power.</li><li><strong>Named Artifact (C2 + C3):</strong> This template creates legendary, named artifacts where the name stands alone, followed by its defining lore. Format: [Descriptor], [Epithet]. Examples: 'Berserk, Fury of the Jarl', 'Runic, Sunderer of Fortresses', 'Thundering, Hammer of the North'. This template emphasizes the weapon's legendary status and its connection to powerful forces, clans, or events.</li><li><strong>Complex Weapon (C2 + C1 Weapon Type + C3):</strong> This template creates the most detailed and varied names, describing the weapon's appearance/type and its lore. Format: [Descriptor] + [Weapon Type], [Epithet]. Examples: 'Frost-Woven Battleaxe, Sunderer of Fortresses', 'Mountain-Wrought Greataxe, Breaker of Shields', 'Oath-Forged Dwarven Axe, Key to the Mountain'. This template provides maximum detail about the weapon's physical form and legendary status.</li></ul><p>Each template has its own strengths: Compound Artifacts are direct and memorable, Named Artifacts emphasize legendary status, and Complex Weapons provide the most narrative depth.</p>"
      },
      {
        "heading": "Axe Name Components",
        "content": "<p>The generator uses three component lists to create axe names:</p><ul><li><strong>Base Names (C1):</strong> Nouns and axe types like Axe, Greataxe, Battleaxe, Chopper, Cleaver, Maul, Breaker, Hewer. These provide the foundation of the axe's identity, whether it's a specific axe type or a general crushing concept. Many names emphasize the axe's function: 'Skull-Splitter', 'Bone-Maul', 'Mountain-Splitter', 'Grave-Splitter'.</li><li><strong>Cool Descriptors (C2):</strong> Adjectives and titles like Crushing, Runic, Oath-Forged, Mountain-Wrought, Berserk, Thundering, Frost-Woven, Storm-Wrought. These add character, power level, and visual description, often emphasizing dwarven craftsmanship, Nordic themes, or raw power.</li><li><strong>Epithets (C3):</strong> Lore phrases like 'Sunderer of Fortresses', 'Fury of the Jarl', 'Hammer of the North', 'Key to the Mountain', 'Echo of the First Battle'. These add legendary status, history, and narrative depth, often referencing Nordic mythology, dwarven lore, or the axe's connection to mountains, stone, and the earth.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique axe names that work across different fantasy settings and power levels, with a focus on brute force, dwarven craftsmanship, and Nordic mythology.</p>"
      },
      {
        "heading": "How to Use Axe Names",
        "content": "<p>Axe names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Name legendary axes for player characters or important NPCs, especially for dwarven characters or barbarians</li><li><strong>Fantasy Writing:</strong> Create memorable axe names for characters in novels or short stories, particularly in Nordic-inspired or dwarven settings</li><li><strong>Gaming:</strong> Perfect for MMORPGs, video games, or tabletop RPGs where axes are important equipment</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for legendary weapons in your fantasy world, especially for dwarven or Nordic cultures</li><li><strong>Character Development:</strong> Use axe names to reflect a character's personality, background, or alignment—brutal warriors, dwarven craftsmen, or Nordic berserkers</li></ul><p>When choosing axe names, consider the weapon's power level, origin, and the character who wields it. An axe named 'Runic Cleaver' suggests dwarven craftsmanship and magical power, while 'Berserk, Fury of the Jarl' suggests Nordic heritage and legendary status.</p>"
      },
      {
        "heading": "Well-Known Axes in Literature and Media",
        "content": "<p>Axe names have been immortalized through mythology, literature, games, and media. These iconic axes demonstrate the power of well-chosen axe names:</p><ul><li><strong>Various D&D Axes:</strong> Dungeons & Dragons features numerous legendary axes like the Axe of the Dwarvish Lords, Berserker Axe, and Frostbrand (which can be an axe), demonstrating how axe names can reflect their magical properties and legendary status.</li><li><strong>Various Video Game Axes:</strong> Games like World of Warcraft, The Elder Scrolls, and God of War feature iconic axes with memorable names like Gorehowl, Wuuthrad, and the Leviathan Axe, showing how axe names can be both functional and atmospheric, often emphasizing Nordic or dwarven themes.</li><li><strong>Nordic Mythology:</strong> While specific named axes are less common in Norse mythology than swords, axes were important weapons, and many fantasy works draw from Nordic themes to create axe names that reference Jarls, Thanes, berserkers, and the harsh northern lands.</li><li><strong>Dwarven Axes in Fantasy:</strong> Fantasy literature often features dwarven-crafted axes with names that emphasize craftsmanship, mountain-forging, and clan loyalty. Names like 'Mountain-Wrought Greataxe' or 'Oath-Forged Dwarven Axe' capture the essence of dwarven weapon-making.</li><li><strong>Barbarian Axes:</strong> Many fantasy works feature axes wielded by barbarians and berserkers, with names that emphasize raw power, fury, and unrelenting force. Names like 'Berserk, Fury of the Jarl' or 'Thundering Maul' capture the brutal nature of these warriors.</li><li><strong>Various Fantasy Literature Axes:</strong> Fantasy novels feature axes with evocative names that suggest their power, origin, or the forces that created them, from simple names like 'Cleaver' to complex names like 'Frost-Woven Battleaxe, Sunderer of Fortresses'.</li></ul><p>These iconic axes demonstrate the range of axe naming conventions: from simple, powerful names (Gorehowl) to descriptive names that tell stories (Axe of the Dwarvish Lords) to complex names that combine appearance and lore (Frost-Woven Battleaxe, Sunderer of Fortresses). When creating your own axe names, consider what the axe represents, its power level, and how the name reflects its origin and legendary status, especially in relation to dwarven craftsmanship or Nordic mythology.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Axe Names",
        "content": "<p>Understanding the etymology and symbolism behind axe names adds depth to character creation and worldbuilding. Many axe names draw from specific linguistic roots, mythological references, and symbolic meanings:</p><ul><li><strong>Axe Types and Parts:</strong> Base names often reference specific axe types (Greataxe, Battleaxe, Handaxe, Poleaxe) or parts (Haft, Helve, Head, Beard, Edge). These names create authenticity and suggest the weapon's physical form and function.</li><li><strong>Crushing and Breaking Concepts:</strong> Many base names emphasize the axe's function: 'Chopper', 'Cleaver', 'Smasher', 'Crusher', 'Breaker', 'Hewer', 'Wrecker', 'Sunderer', 'Splitter', 'Maul'. These names directly reference the axe's role as a weapon of brute force and destruction.</li><li><strong>Nordic and Dwarven Themes:</strong> Descriptors often reference Nordic and dwarven culture: 'Jarl's', 'Thane's', 'Runic', 'Oath-Forged', 'Mountain-Wrought', 'Deep-Stone', 'Oath-Bound'. These names suggest heritage, craftsmanship, and connection to mountain kingdoms and clan loyalty.</li><li><strong>Material and Craftsmanship:</strong> Descriptors reference materials and forging: 'Granite', 'Stone-Faced', 'Iron-Heart', 'Bronze-Tipped', 'Mithril-Core', 'Adamantine-Spine', 'Diamond-Edged', 'Cold-Iron', 'Star-Metal'. These names suggest the axe's construction and power level.</li><li><strong>Raw Power and Force:</strong> Descriptors emphasize brute strength: 'Crushing', 'Shattered', 'Splintered', 'Savage', 'Brute', 'Heavy', 'Massive', 'Thundering', 'Berserk', 'Unstoppable'. These names suggest overwhelming force and unrelenting power.</li><li><strong>Elemental and Natural Forces:</strong> Descriptors reference natural elements: 'Volcanic', 'Molten', 'Frost-Woven', 'Ember', 'Storm-Wrought', 'Earthen'. These names suggest elemental power and connection to natural forces.</li><li><strong>Mythological References:</strong> Epithets often reference mythology and legend: 'Hammer of the North', 'Gift of the Deep King', 'Weeping of the Stone Giants', 'Curse of the Old Gods', 'Ragnarok'. These names connect axes to ancient legends and powerful forces.</li><li><strong>Combat and Warfare:</strong> Epithets emphasize combat role: 'Sunderer of Fortresses', 'Breaker of Shields', 'Cleaver of Helms', 'Shatterer of Bone', 'The Unstoppable Force'. These names suggest the axe's effectiveness in battle and its legendary deeds.</li><li><strong>Clan and Heritage:</strong> Epithets reference clan and heritage: 'Fury of the Jarl', 'Vengeance of the Clan', 'Might of the Ancestors', 'Voice of the Deep', 'of the Northmen', 'of the Berserker'. These names suggest loyalty, heritage, and connection to a people or culture.</li><li><strong>Mountain and Earth Themes:</strong> Epithets reference mountains and earth: 'Key to the Mountain', 'Rage of the Mountain', 'Burden of the Mountain King', 'of the Quarry', 'of the Deep', 'of Stone'. These names emphasize the axe's connection to dwarven culture and mountain kingdoms.</li></ul><p>When creating axe names, consider what each element means and how it contributes to the axe's identity. A name like 'Runic Cleaver' immediately suggests dwarven craftsmanship and magical power, while 'Frost-Woven Battleaxe, Sunderer of Fortresses' suggests both elemental power (frost) and legendary combat effectiveness (Sunderer of Fortresses). 'Berserk, Fury of the Jarl' combines a powerful name (Berserk) with Nordic heritage (Fury of the Jarl), creating a name that tells a story of power, heritage, and legendary status.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three templates?",
        "answer": "Compound Artifact creates short, punchy names (Runic Cleaver, Frost-Woven Maul). Named Artifact creates legendary names with lore (Berserk, Fury of the Jarl). Complex Weapon creates detailed names with weapon type and lore (Frost-Woven Battleaxe, Sunderer of Fortresses). Each template has its own character and works best for different power levels and narrative styles."
      },
      {
        "question": "Can I use these names for other weapons?",
        "answer": "While designed specifically for axes with themes of brute force and dwarven craftsmanship, some names could work for other heavy weapons like warhammers or maces. However, the names are optimized for axes and their unique characteristics."
      },
      {
        "question": "How many unique axe names does the generator provide?",
        "answer": "The generator provides thousands of unique axe name combinations across all three templates. With 57 base names, 57 descriptors, and 50 epithets, the generator can create over 10,000 unique combinations, ensuring maximum variety for your fantasy world."
      },
      {
        "question": "Can I use these names for player characters' axes?",
        "answer": "Yes! These names are perfect for player characters' axes in D&D, tabletop RPGs, or fantasy writing. The names work well for both starting equipment and legendary artifacts that characters might acquire during their adventures, especially for dwarven characters, barbarians, or Nordic-inspired warriors."
      }
    ]
  },
  "relatedGenerators": [
    "sword",
    "shield",
    "poison"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(objectsFile, JSON.stringify(objectsData, null, 2));

console.log('✅ Successfully created Axe Name Generator!');
console.log(`📊 Base names: ${axeData.Axe_Base_Names.length}`);
console.log(`📊 Descriptors: ${axeData.Axe_Cool_Descriptors.length}`);
console.log(`📊 Epithets: ${axeData.Axe_Epithets.length}`);
console.log(`📊 Weapon types: ${weaponTypes.length}`);
console.log(`✨ Three templates available`);
console.log(`\n📋 Example names:`);
console.log(`   Template 1: Runic Cleaver, Frost-Woven Maul`);
console.log(`   Template 2: Berserk, Fury of the Jarl`);
console.log(`   Template 3: Frost-Woven Battleaxe, Sunderer of Fortresses`);


