#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Wand name data from the provided JSON
const wandData = {
  "Wand_Base_Names": [
    "Wand", "Staff", "Rod", "Scepter", "Focus", "Spire", "Baton", "Core", "Channel", "Conduit",
    "Arcanum", "Coil", "Spine", "Shaft", "Root", "Branch", "Pylon", "Pillar", "Glyph", "Rune",
    "Cipher", "Prism", "Lens", "Eye", "Orb", "Head", "Apex", "Tip", "Shard", "Point",
    "Tine", "Taper", "Nexus", "Anchor", "Vertex", "Zenith", "Nadir", "Portal", "Gate", "Vessel",
    "Caster", "Dirigent", "Diviner", "Scryer", "Weaver", "Binder", "Sentinel", "Keeper", "Oracle", "Relic",
    "Talisman", "Totem", "Charm", "Fetish", "Effigy", "Scroll", "Quill", "Rood", "Rift", "Beacon"
  ],
  "Wand_Cool_Descriptors": [
    "Arcane", "Primal", "Celestial", "Cosmic", "Star-Drift", "Void-Bound", "Shadow", "Ebon", "Ivory", "Jet",
    "Crystal", "Quartz", "Diamond", "Emerald", "Sapphire", "Ruby", "Obsidian", "Sunstone", "Moonstone", "Glacial",
    "Blazing", "Storm-Wrought", "Tempest", "Whispering", "Silent", "Dreaming", "Master's", "Seer's", "Sage's", "Oracle's",
    "Keeper's", "Law's", "Will", "Mind", "Fate", "Destiny", "Truth", "Phantom", "Wraith", "Spirit",
    "Soul-Woven", "Blood-Stained", "Cursed", "Blessed", "Divine", "Holy", "Forbidden", "Ancient", "Elder", "Twisted",
    "Thorned", "Spiked", "Serpent", "Phoenix", "Dragon-Bone", "Ironwood", "Elderwood", "Yew", "Woven", "Luminous",
    "Chronos", "Veridian"
  ],
  "Wand_Epithets": [
    "of Eternal Winter", "Wielder of Flames", "Whisper of the Cosmos", "Key to the Planes", "Eye of the Storm",
    "Master of the Nexus", "Channel of the Void", "Finger of Fate", "Root of the World", "Spire of the Zenith",
    "Anchor of Time", "Voice of the Silent Gods", "Law of the Unseen", "Mind of the Archmage", "Staff of Dominion",
    "Keeper of the Hidden Lore", "Conduit of Pure Mana", "Rod of the Arch-Lich", "Seer of the Final Age", "Weaver of Destiny",
    "Binder of the Unseen", "The Unending Chord", "The Last Echo", "The First Word", "Terror of the Unholy",
    "Judge of the Elementals", "Scourge of the False Prophet", "of Sorrows", "of Anguish", "of Control",
    "of the Wild", "of the Horde", "of the Champion", "of the Burning Heavens", "The Cosmic Shard",
    "The Oracle's Touch", "The Unbroken Spell", "The Grand Design", "The Dreamer's Focus", "The Mages' Last Hope",
    "The Silent Command", "The True Form", "The End of Magic", "The Starting Point", "The Unwritten Rule"
  ]
};

// Weapon types from C1 (for Template 3) - these are the specific wand/staff/rod types
const weaponTypes = [
  "Wand", "Staff", "Rod", "Scepter"
];

// Read the objects.json file
const objectsFile = path.join(__dirname, '../data/objects.json');
const objectsData = JSON.parse(fs.readFileSync(objectsFile, 'utf8'));

// Add the wand generator
objectsData.generators.wand = {
  "title": "Wand Name Generator",
  "slug": "wand-name-generator",
  "description": "Generate legendary wand names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming.",
  "seoKeywords": "wand names, wand name generator, fantasy wand names, legendary wand names, D&D wand names, gaming wand names, staff names, scepter names, rod names",
  "icon": "🪄",
  "isPopular": true,
  "popularRank": 6,
  "filters": {
    "template": {
      "label": "Name Template",
      "options": [
        "compound_artifact",
        "named_artifact",
        "complex_weapon"
      ],
      "optionLabels": {
        "compound_artifact": "Compound Artifact (e.g., Glacial Spire, Arcane Focus)",
        "named_artifact": "Named Artifact (e.g., Arcanum, Finger of Fate)",
        "complex_weapon": "Complex Weapon (e.g., Elderwood Staff, Voice of the Silent Gods)"
      }
    }
  },
  "data": {
    "baseNames": wandData.Wand_Base_Names,
    "descriptors": wandData.Wand_Cool_Descriptors,
    "epithets": wandData.Wand_Epithets,
    "weaponTypes": weaponTypes
  },
  "article": {
    "hero": {
      "title": "🪄 Wand Name Generator",
      "tagline": "Generate legendary wand names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming."
    },
    "intro": "Wand names carry the weight of arcane energy, intellect, celestial bodies, and control. From the classic 'Glacial Spire' to the legendary 'Arcanum, Finger of Fate', wand names tell stories of focused magical power, ancient knowledge, and cosmic forces. Our **Wand Name Generator** creates powerful wand names using three distinct templates: Compound Artifacts (Glacial Spire), Named Artifacts (Arcanum, Finger of Fate), and Complex Weapons (Elderwood Staff, Voice of the Silent Gods), drawing from arcane energy, celestial bodies, and intellectual power to create names that resonate with magical authority and legendary focus.",
    "sections": [
      {
        "heading": "The Power of Wand Names",
        "content": "<p>Wand names serve multiple purposes in fantasy worlds: they identify legendary magical implements, create memorable artifacts, establish a weapon's power level, and add depth to fantasy settings. A well-chosen wand name can instantly convey whether a weapon is arcane (Glacial Spire), celestial (Star-Drift Focus), or legendary (Arcanum, Finger of Fate).</p><p>Our generator uses three distinct templates to create wand names with different levels of complexity and detail. Each template has its own character: Compound Artifacts are short and punchy, Named Artifacts emphasize the weapon's legendary status, and Complex Weapons provide the most detail about appearance and lore.</p>"
      },
      {
        "heading": "Wand Name Templates",
        "content": "<p>The generator offers three distinct naming templates, each with its own character and feel:</p><ul><li><strong>Compound Artifact (C2 + C1):</strong> This template creates short, punchy names common in high fantasy. Format: [Descriptor] + [Base Name]. Examples: 'Glacial Spire', 'Arcane Focus', 'Celestial Staff'. This template combines an adjective/title with a base noun or implement type, creating memorable, iconic names that emphasize arcane power or focused energy.</li><li><strong>Named Artifact (C2 + C3):</strong> This template creates legendary, named artifacts where the name stands alone, followed by its defining lore. Format: [Descriptor], [Epithet]. Examples: 'Arcanum, Finger of Fate', 'Celestial, Whisper of the Cosmos', 'Arcane, Key to the Planes'. This template emphasizes the weapon's legendary status and its connection to arcane power, cosmic forces, or intellectual mastery.</li><li><strong>Complex Weapon (C2 + C1 Weapon Type + C3):</strong> This template creates the most detailed and varied names, describing the weapon's appearance/type and its lore. Format: [Descriptor] + [Weapon Type], [Epithet]. Examples: 'Elderwood Staff, Voice of the Silent Gods', 'Crystal Wand, Eye of the Storm', 'Arcane Scepter, Master of the Nexus'. This template provides maximum detail about the weapon's physical form and legendary status.</li></ul><p>Each template has its own strengths: Compound Artifacts are direct and memorable, Named Artifacts emphasize legendary status, and Complex Weapons provide the most narrative depth.</p>"
      },
      {
        "heading": "Wand Name Components",
        "content": "<p>The generator uses three component lists to create wand names:</p><ul><li><strong>Base Names (C1):</strong> Nouns and implement types like Wand, Staff, Rod, Scepter, Focus, Spire, Core, Channel, Conduit, Arcanum. These provide the foundation of the wand's identity, whether it's a specific implement type or a general magical concept. Many names emphasize the wand's function: 'Channel', 'Conduit', 'Focus', 'Nexus', 'Anchor', 'Portal', 'Gate'.</li><li><strong>Cool Descriptors (C2):</strong> Adjectives and titles like Arcane, Primal, Celestial, Cosmic, Star-Drift, Void-Bound, Glacial, Blazing, Storm-Wrought, Whispering. These add character, power level, and visual description, often emphasizing arcane energy, celestial bodies, elemental forces, or intellectual properties.</li><li><strong>Epithets (C3):</strong> Lore phrases like 'of Eternal Winter', 'Whisper of the Cosmos', 'Key to the Planes', 'Eye of the Storm', 'Finger of Fate', 'Voice of the Silent Gods', 'The Unending Chord'. These add legendary status, history, and narrative depth, often referencing arcane power, cosmic forces, intellectual mastery, or the wand's connection to planes and celestial bodies.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique wand names that work across different fantasy settings and power levels, with a focus on arcane energy, intellect, celestial bodies, and control.</p>"
      },
      {
        "heading": "How to Use Wand Names",
        "content": "<p>Wand names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Name legendary wands for player characters or important NPCs, especially for wizards, sorcerers, or characters associated with arcane power</li><li><strong>Fantasy Writing:</strong> Create memorable wand names for characters in novels or short stories, particularly for mages, wizards, or magical practitioners</li><li><strong>Gaming:</strong> Perfect for MMORPGs, video games, or tabletop RPGs where wands are important equipment</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for legendary magical implements in your fantasy world</li><li><strong>Character Development:</strong> Use wand names to reflect a character's personality, background, or alignment—arcane scholars, celestial mages, or characters of focused magical power</li></ul><p>When choosing wand names, consider the weapon's power level, origin, and the character who wields it. A wand named 'Glacial Spire' suggests elemental ice power, while 'Arcanum, Finger of Fate' suggests legendary status and connection to cosmic forces.</p>"
      },
      {
        "heading": "Well-Known Wands in Literature and Media",
        "content": "<p>Wand names have been immortalized through mythology, literature, games, and media. These iconic wands demonstrate the power of well-chosen wand names:</p><ul><li><strong>Various D&D Wands:</strong> Dungeons & Dragons features numerous legendary wands like the Wand of Orcus, Wand of Wonder, Wand of Magic Missiles, and Staff of Power, demonstrating how wand names can reflect their magical properties and legendary status, often emphasizing arcane power or specific spell effects.</li><li><strong>Various Video Game Wands:</strong> Games like World of Warcraft, The Elder Scrolls, and various fantasy RPGs feature iconic wands and staves with memorable names like Atiesh (Greatstaff of the Guardian), Staff of the Archmage, and various elemental or arcane-themed wands, showing how wand names can be both functional and atmospheric.</li><li><strong>Wands in Harry Potter:</strong> The Harry Potter series features wands with names that reflect their core materials and owners, demonstrating how wand names can be personal and meaningful. While individual wands aren't always named, the concept of wandlore shows the importance of wands in magical settings.</li><li><strong>Staffs in Fantasy Literature:</strong> Fantasy literature often features staffs wielded by powerful wizards, with names that emphasize arcane power, ancient knowledge, or cosmic forces. Names like 'Staff of Power' or 'Arcane Focus' capture the essence of magical authority.</li><li><strong>Celestial and Cosmic Themes:</strong> Many fantasy works feature wands with celestial or cosmic powers, with names that emphasize these connections. Names like 'Star-Drift Focus' or 'Whisper of the Cosmos' reflect the wand's connection to celestial bodies and cosmic forces.</li><li><strong>Elemental Wands:</strong> Fantasy works often feature wands with elemental powers, with names that emphasize these connections. Names like 'Glacial Spire' or 'Blazing Rod' capture the elemental nature of these magical implements.</li></ul><p>These iconic wands demonstrate the range of wand naming conventions: from descriptive names that tell stories (Wand of Orcus) to complex names that combine appearance and lore (Elderwood Staff, Voice of the Silent Gods) to names that emphasize arcane power (Arcane Focus, Master of the Nexus). When creating your own wand names, consider what the wand represents, its power level, and how the name reflects its origin and legendary status, especially in relation to arcane energy, celestial bodies, or intellectual mastery.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Wand Names",
        "content": "<p>Understanding the etymology and symbolism behind wand names adds depth to character creation and worldbuilding. Many wand names draw from specific linguistic roots, mythological references, and symbolic meanings:</p><ul><li><strong>Implement Types and Parts:</strong> Base names often reference specific implement types (Wand, Staff, Rod, Scepter) or parts (Core, Shaft, Head, Apex, Tip, Point). These names create authenticity and suggest the weapon's physical form and function.</li><li><strong>Channeling and Focus Concepts:</strong> Many base names emphasize the wand's function: 'Focus', 'Channel', 'Conduit', 'Nexus', 'Anchor', 'Portal', 'Gate', 'Vessel'. These names directly reference the wand's role as a magical implement that channels and focuses arcane energy.</li><li><strong>Arcane and Intellectual Themes:</strong> Descriptors often reference arcane power and intellect: 'Arcane', 'Primal', 'Master's', 'Seer's', 'Sage's', 'Oracle's', 'Mind', 'Will', 'Truth'. These names suggest connection to magical knowledge, intellectual mastery, and arcane understanding.</li><li><strong>Celestial and Cosmic Themes:</strong> Descriptors reference celestial bodies and cosmic forces: 'Celestial', 'Cosmic', 'Star-Drift', 'Void-Bound', 'Sunstone', 'Moonstone'. These names suggest connection to stars, planets, and cosmic forces beyond the material plane.</li><li><strong>Elemental and Natural Forces:</strong> Descriptors reference elemental power: 'Glacial', 'Blazing', 'Storm-Wrought', 'Tempest', 'Veridian'. These names suggest elemental power and connection to natural forces.</li><li><strong>Material and Craftsmanship:</strong> Descriptors reference materials: 'Crystal', 'Quartz', 'Diamond', 'Emerald', 'Sapphire', 'Ruby', 'Obsidian', 'Ironwood', 'Elderwood', 'Yew', 'Dragon-Bone'. These names suggest the wand's construction and power level.</li><li><strong>Spiritual and Mystical Terms:</strong> Descriptors reference spiritual concepts: 'Phantom', 'Wraith', 'Spirit', 'Soul-Woven', 'Blessed', 'Divine', 'Holy', 'Cursed'. These names suggest otherworldly power and mystical origins.</li><li><strong>Mythological References:</strong> Epithets often reference mythology and legend: 'Finger of Fate', 'Voice of the Silent Gods', 'Root of the World', 'Anchor of Time', 'Key to the Planes'. These names connect wands to ancient legends and cosmic forces.</li><li><strong>Arcane and Intellectual Purpose:</strong> Epithets emphasize arcane purpose: 'Master of the Nexus', 'Channel of the Void', 'Mind of the Archmage', 'Keeper of the Hidden Lore', 'Conduit of Pure Mana'. These names suggest the wand's role as a tool of arcane mastery and intellectual power.</li><li><strong>Cosmic and Planar Themes:</strong> Epithets reference cosmic and planar connections: 'Whisper of the Cosmos', 'Key to the Planes', 'Spire of the Zenith', 'The Cosmic Shard', 'The Grand Design'. These names emphasize the wand's connection to planes, celestial bodies, and cosmic forces.</li></ul><p>When creating wand names, consider what each element means and how it contributes to the wand's identity. A name like 'Glacial Spire' immediately suggests elemental ice power and focused energy, while 'Elderwood Staff, Voice of the Silent Gods' suggests both material (elderwood) and legendary connection (Voice of the Silent Gods). 'Arcanum, Finger of Fate' combines a powerful name (Arcanum) with cosmic significance (Finger of Fate), creating a name that tells a story of arcane power, cosmic forces, and legendary status.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three templates?",
        "answer": "Compound Artifact creates short, punchy names (Glacial Spire, Arcane Focus). Named Artifact creates legendary names with lore (Arcanum, Finger of Fate). Complex Weapon creates detailed names with implement type and lore (Elderwood Staff, Voice of the Silent Gods). Each template has its own character and works best for different power levels and narrative styles."
      },
      {
        "question": "Can I use these names for other magical implements?",
        "answer": "Absolutely! While designed specifically for wands, these names work excellently for other magical implements like staves, rods, scepters, orbs, and even magical foci. The themes of arcane energy, intellect, and celestial bodies apply well to all magical channeling implements."
      },
      {
        "question": "How many unique wand names does the generator provide?",
        "answer": "The generator provides thousands of unique wand name combinations across all three templates. With 60 base names, 62 descriptors, and 47 epithets, the generator can create over 10,000 unique combinations, ensuring maximum variety for your fantasy world."
      },
      {
        "question": "Can I use these names for player characters' wands?",
        "answer": "Yes! These names are perfect for player characters' wands in D&D, tabletop RPGs, or fantasy writing. The names work well for both starting equipment and legendary artifacts that characters might acquire during their adventures, especially for wizards, sorcerers, or characters associated with arcane power."
      }
    ]
  },
  "relatedGenerators": [
    "sword",
    "axe",
    "warhammer"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(objectsFile, JSON.stringify(objectsData, null, 2));

console.log('✅ Successfully created Wand Name Generator!');
console.log(`📊 Base names: ${wandData.Wand_Base_Names.length}`);
console.log(`📊 Descriptors: ${wandData.Wand_Cool_Descriptors.length}`);
console.log(`📊 Epithets: ${wandData.Wand_Epithets.length}`);
console.log(`📊 Weapon types: ${weaponTypes.length}`);
console.log(`✨ Three templates available`);
console.log(`\n📋 Example names:`);
console.log(`   Template 1: Glacial Spire, Arcane Focus`);
console.log(`   Template 2: Arcanum, Finger of Fate`);
console.log(`   Template 3: Elderwood Staff, Voice of the Silent Gods`);


