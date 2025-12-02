#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Warhammer name data from the provided JSON
const warhammerData = {
  "Hammer_Base_Names": [
    "Warhammer", "Maul", "Mace", "Morningstar", "Flanged Mace", "Great Maul", "Heavy Mace", "Gavel", "Pounder", "Basher",
    "Crusher", "Smasher", "Knocker", "Bludgeon", "Ram", "Head", "Striker", "Mallet", "Anvil", "Impact",
    "Shock", "Stunner", "Thunderhead", "Grave-Striker", "Skull-Cracker", "Bone-Crusher", "Shatter-Maul", "Iron-Fist", "Iron-Jaw", "Forge-Hammer",
    "Earth-Maul", "Star-Smasher", "Doom-Knocker", "Soul-Pounder", "Oath-Maul", "Grave-Pounder", "Foe-Hammer", "Skull-Bludgeon", "Spike", "Flail",
    "Ball", "Weight", "Lump", "Blunt", "Solid", "Chunk", "Core", "Haft", "Grip", "Shaft",
    "Handle", "Crown", "Spine", "Bulwark", "Iron-Ball", "Steel-Core", "Rune-Head", "Aegis-Breaker"
  ],
  "Hammer_Cool_Descriptors": [
    "Divine", "Sacred", "Holy", "Gilded", "Aetherial", "Celestial", "Consecrated", "Blessed", "Crushing", "Shattering",
    "Ironclad", "Stone-Heart", "Obsidian", "Granite", "Marble", "Earthen", "Volcanic", "Deep-Stone", "Mountain-Lord", "Thundering",
    "Storm-Forged", "Lightning", "Sky-Fallen", "Judgement", "Righteous", "Vigilant", "Unwavering", "Truth's", "Law-Giver", "Order's",
    "Iron", "Steel", "Mithril", "Adamantine", "Star-Iron", "Bronze", "Rune-Etched", "Glyphic", "Titan's", "Giant's",
    "Colossal", "Massive", "Gargantuan", "Quiet", "Silent", "Ancient", "Forgotten", "Dread", "Doom", "Wroth",
    "Fell", "Ebon", "Shadow-Forged", "Cinder-Wrought", "Ghostly", "Phantom", "Soul-Bound"
  ],
  "Hammer_Epithets": [
    "Breaker of Chains", "Hammer of the Divine Will", "Fist of the Sky-Father", "Voice of the Mountain", "The Soul's Final Word",
    "Smasher of Idols", "Crusher of False Gods", "Wielder of the Rains", "Echo of the First Blow", "Might of the Titan's Hand",
    "Last Prayer of the Heretic", "Law of the Land", "Judgement of the Forge-God", "Stunner of the Wicked", "Shatterer of the Shield-Wall",
    "The Relentless Heartbeat", "Sorrow of the Fallen Star", "Wrath of the Fire Lord", "Sentinel of the Deep", "Key to the Underworld",
    "Token of the Oath-Keeper", "Burden of the Mountain King", "Chains of the Unholy", "End of the Tyrant", "The True North",
    "Will of the Ancestors", "Defender of the Innocent", "Bane of the Ebon Guard", "Tear of the Archangel", "Curse of the Earthshaker",
    "of Holy Might", "of the Celestial Dome", "of the Stone-Bound", "of the Sky", "of the Judgment Seat",
    "of the Earthquake", "of the Dread King", "of the Banished God", "of Quiet Mercy", "of Eternal Vigil",
    "The Final Verdict", "The Unmoving Truth", "The Great Bludgeon", "The Keeper of Order", "The Unbreakable Vow",
    "The Merciful Blow", "The Deafening Silence", "The Shaking Earth", "The King's Decree", "The Forge's Fury"
  ]
};

// Weapon types from C1 (for Template 3) - these are the specific warhammer/maul/mace types
const weaponTypes = [
  "Warhammer", "Maul", "Mace", "Morningstar", "Flanged Mace", "Great Maul", "Heavy Mace", "Gavel"
];

// Read the objects.json file
const objectsFile = path.join(__dirname, '../data/objects.json');
const objectsData = JSON.parse(fs.readFileSync(objectsFile, 'utf8'));

// Add the warhammer generator
objectsData.generators.warhammer = {
  "title": "Warhammer Name Generator",
  "slug": "warhammer-name-generator",
  "description": "Generate legendary warhammer names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming.",
  "seoKeywords": "warhammer names, warhammer name generator, fantasy warhammer names, legendary warhammer names, D&D warhammer names, gaming warhammer names, mace names, maul names",
  "icon": "🔨",
  "isPopular": true,
  "popularRank": 5,
  "filters": {
    "template": {
      "label": "Name Template",
      "options": [
        "compound_artifact",
        "named_artifact",
        "complex_weapon"
      ],
      "optionLabels": {
        "compound_artifact": "Compound Artifact (e.g., Sacred Anvil, Thundering Maul)",
        "named_artifact": "Named Artifact (e.g., Righteous, Fist of the Sky-Father)",
        "complex_weapon": "Complex Weapon (e.g., Star-Iron Warhammer, Breaker of Chains)"
      }
    }
  },
  "data": {
    "baseNames": warhammerData.Hammer_Base_Names,
    "descriptors": warhammerData.Hammer_Cool_Descriptors,
    "epithets": warhammerData.Hammer_Epithets,
    "weaponTypes": weaponTypes
  },
  "article": {
    "hero": {
      "title": "🔨 Warhammer Name Generator",
      "tagline": "Generate legendary warhammer names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming."
    },
    "intro": "Warhammer names carry the weight of impact, divinity, justice, and crushing force. From the classic 'Sacred Anvil' to the legendary 'Righteous, Fist of the Sky-Father', warhammer names tell stories of divine power, unstoppable force, and righteous judgment. Our **Warhammer Name Generator** creates powerful warhammer names using three distinct templates: Compound Artifacts (Sacred Anvil), Named Artifacts (Righteous, Fist of the Sky-Father), and Complex Weapons (Star-Iron Warhammer, Breaker of Chains), drawing from divine power, elemental forces, and concepts of justice to create names that resonate with authority and legendary impact.",
    "sections": [
      {
        "heading": "The Power of Warhammer Names",
        "content": "<p>Warhammer names serve multiple purposes in fantasy worlds: they identify legendary weapons, create memorable artifacts, establish a weapon's power level, and add depth to fantasy settings. A well-chosen warhammer name can instantly convey whether a weapon is divine (Sacred Anvil), elemental (Thundering Maul), or legendary (Righteous, Fist of the Sky-Father).</p><p>Our generator uses three distinct templates to create warhammer names with different levels of complexity and detail. Each template has its own character: Compound Artifacts are short and punchy, Named Artifacts emphasize the weapon's legendary status, and Complex Weapons provide the most detail about appearance and lore.</p>"
      },
      {
        "heading": "Warhammer Name Templates",
        "content": "<p>The generator offers three distinct naming templates, each with its own character and feel:</p><ul><li><strong>Compound Artifact (C2 + C1):</strong> This template creates short, punchy names common in high fantasy. Format: [Descriptor] + [Base Name]. Examples: 'Sacred Anvil', 'Thundering Maul', 'Divine Gavel'. This template combines an adjective/title with a base noun or weapon type, creating memorable, iconic names that emphasize divine power or crushing force.</li><li><strong>Named Artifact (C2 + C3):</strong> This template creates legendary, named artifacts where the name stands alone, followed by its defining lore. Format: [Descriptor], [Epithet]. Examples: 'Righteous, Fist of the Sky-Father', 'Divine, Breaker of Chains', 'Judgement, Hammer of the Divine Will'. This template emphasizes the weapon's legendary status and its connection to divine power, justice, or elemental forces.</li><li><strong>Complex Weapon (C2 + C1 Weapon Type + C3):</strong> This template creates the most detailed and varied names, describing the weapon's appearance/type and its lore. Format: [Descriptor] + [Weapon Type], [Epithet]. Examples: 'Star-Iron Warhammer, Breaker of Chains', 'Thundering Great Maul, Voice of the Mountain', 'Sacred Mace, Judgement of the Forge-God'. This template provides maximum detail about the weapon's physical form and legendary status.</li></ul><p>Each template has its own strengths: Compound Artifacts are direct and memorable, Named Artifacts emphasize legendary status, and Complex Weapons provide the most narrative depth.</p>"
      },
      {
        "heading": "Warhammer Name Components",
        "content": "<p>The generator uses three component lists to create warhammer names:</p><ul><li><strong>Base Names (C1):</strong> Nouns and weapon types like Warhammer, Maul, Mace, Morningstar, Gavel, Anvil, Pounder, Basher, Crusher, Smasher. These provide the foundation of the warhammer's identity, whether it's a specific weapon type or a general impact concept. Many names emphasize the warhammer's function: 'Skull-Cracker', 'Bone-Crusher', 'Grave-Striker', 'Shatter-Maul'.</li><li><strong>Cool Descriptors (C2):</strong> Adjectives and titles like Divine, Sacred, Holy, Thundering, Storm-Forged, Judgement, Righteous, Law-Giver, Titan's, Colossal. These add character, power level, and visual description, often emphasizing divine power, elemental forces (especially earth and thunder), or concepts of justice and unstoppable force.</li><li><strong>Epithets (C3):</strong> Lore phrases like 'Breaker of Chains', 'Fist of the Sky-Father', 'Voice of the Mountain', 'Judgement of the Forge-God', 'The Final Verdict', 'The Unmoving Truth'. These add legendary status, history, and narrative depth, often referencing divine power, justice, the earth, or the weapon's connection to gods and elemental forces.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique warhammer names that work across different fantasy settings and power levels, with a focus on impact, divinity, justice, and crushing force.</p>"
      },
      {
        "heading": "How to Use Warhammer Names",
        "content": "<p>Warhammer names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Name legendary warhammers for player characters or important NPCs, especially for paladins, clerics, or characters associated with justice and divine power</li><li><strong>Fantasy Writing:</strong> Create memorable warhammer names for characters in novels or short stories, particularly for divine champions or characters of justice</li><li><strong>Gaming:</strong> Perfect for MMORPGs, video games, or tabletop RPGs where warhammers are important equipment</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for legendary weapons in your fantasy world, especially for divine or justice-themed weapons</li><li><strong>Character Development:</strong> Use warhammer names to reflect a character's personality, background, or alignment—divine champions, judges, or characters of unstoppable force</li></ul><p>When choosing warhammer names, consider the weapon's power level, origin, and the character who wields it. A warhammer named 'Sacred Anvil' suggests divine power and justice, while 'Righteous, Fist of the Sky-Father' suggests legendary status and connection to divine authority.</p>"
      },
      {
        "heading": "Well-Known Warhammers in Literature and Media",
        "content": "<p>Warhammer names have been immortalized through mythology, literature, games, and media. These iconic warhammers demonstrate the power of well-chosen warhammer names:</p><ul><li><strong>Mjolnir (Norse Mythology):</strong> The legendary hammer of Thor, Mjolnir is one of the most famous warhammers in mythology. Its name means 'crusher' or 'grinder', perfectly capturing its role as a weapon of divine power and unstoppable force. Mjolnir represents the connection between warhammers and divine authority.</li><li><strong>Various D&D Warhammers:</strong> Dungeons & Dragons features numerous legendary warhammers like the Hammer of Thunderbolts, Dwarven Thrower, and Mace of Disruption, demonstrating how warhammer names can reflect their magical properties and legendary status, often emphasizing divine power or elemental force.</li><li><strong>Various Video Game Warhammers:</strong> Games like World of Warcraft, The Elder Scrolls, and various fantasy RPGs feature iconic warhammers with memorable names like The Unstoppable Force, The Immovable Object, and various divine or justice-themed hammers, showing how warhammer names can be both functional and atmospheric.</li><li><strong>Divine Warhammers in Fantasy:</strong> Fantasy literature often features warhammers wielded by paladins, clerics, or divine champions, with names that emphasize justice, divine power, and righteous judgment. Names like 'Sacred Anvil' or 'Righteous, Fist of the Sky-Father' capture the essence of divine authority.</li><li><strong>Justice and Order Themes:</strong> Many fantasy works feature warhammers associated with law, order, and justice, with names that emphasize these concepts. Names like 'Law-Giver', 'Judgement', or 'The Final Verdict' reflect the warhammer's role as a weapon of authority and justice.</li><li><strong>Elemental Warhammers:</strong> Fantasy works often feature warhammers with elemental powers, particularly earth and thunder, with names that emphasize these connections. Names like 'Thundering Maul' or 'Storm-Forged Warhammer' capture the elemental nature of these weapons.</li></ul><p>These iconic warhammers demonstrate the range of warhammer naming conventions: from mythological references (Mjolnir) to descriptive names that tell stories (Hammer of Thunderbolts) to complex names that combine appearance and lore (Star-Iron Warhammer, Breaker of Chains). When creating your own warhammer names, consider what the warhammer represents, its power level, and how the name reflects its origin and legendary status, especially in relation to divine power, justice, or elemental forces.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Warhammer Names",
        "content": "<p>Understanding the etymology and symbolism behind warhammer names adds depth to character creation and worldbuilding. Many warhammer names draw from specific linguistic roots, mythological references, and symbolic meanings:</p><ul><li><strong>Weapon Types and Parts:</strong> Base names often reference specific weapon types (Warhammer, Maul, Mace, Morningstar, Gavel) or parts (Head, Haft, Grip, Shaft, Handle, Crown, Spine). These names create authenticity and suggest the weapon's physical form and function.</li><li><strong>Impact and Crushing Concepts:</strong> Many base names emphasize the warhammer's function: 'Pounder', 'Basher', 'Crusher', 'Smasher', 'Knocker', 'Bludgeon', 'Impact', 'Shock', 'Stunner'. These names directly reference the warhammer's role as a weapon of blunt force and stunning impact.</li><li><strong>Divine and Sacred Themes:</strong> Descriptors often reference divine power: 'Divine', 'Sacred', 'Holy', 'Gilded', 'Aetherial', 'Celestial', 'Consecrated', 'Blessed'. These names suggest connection to gods, divine authority, and holy power.</li><li><strong>Justice and Order Themes:</strong> Descriptors reference justice and law: 'Judgement', 'Righteous', 'Vigilant', 'Unwavering', 'Truth's', 'Law-Giver', 'Order's'. These names suggest the warhammer's role as a weapon of justice, authority, and divine law.</li><li><strong>Elemental and Natural Forces:</strong> Descriptors reference elemental power: 'Thundering', 'Storm-Forged', 'Lightning', 'Sky-Fallen', 'Volcanic', 'Earthen', 'Deep-Stone', 'Mountain-Lord'. These names suggest elemental power and connection to natural forces, particularly earth and thunder.</li><li><strong>Material and Craftsmanship:</strong> Descriptors reference materials: 'Iron', 'Steel', 'Mithril', 'Adamantine', 'Star-Iron', 'Bronze', 'Obsidian', 'Granite', 'Marble'. These names suggest the warhammer's construction and power level.</li><li><strong>Size and Force:</strong> Descriptors emphasize size and power: 'Colossal', 'Massive', 'Gargantuan', 'Titan's', 'Giant's', 'Crushing', 'Shattering'. These names suggest overwhelming force and unstoppable power.</li><li><strong>Mythological References:</strong> Epithets often reference mythology and legend: 'Fist of the Sky-Father', 'Hammer of the Divine Will', 'Judgement of the Forge-God', 'Tear of the Archangel', 'Curse of the Earthshaker'. These names connect warhammers to ancient legends and divine forces.</li><li><strong>Justice and Divine Purpose:</strong> Epithets emphasize justice and divine purpose: 'Breaker of Chains', 'Smasher of Idols', 'Crusher of False Gods', 'Stunner of the Wicked', 'Defender of the Innocent', 'The Final Verdict', 'The Unmoving Truth'. These names suggest the warhammer's role as a weapon of justice and divine judgment.</li><li><strong>Earth and Mountain Themes:</strong> Epithets reference earth and mountains: 'Voice of the Mountain', 'Burden of the Mountain King', 'of the Stone-Bound', 'The Shaking Earth'. These names emphasize the warhammer's connection to earth, stone, and elemental power.</li></ul><p>When creating warhammer names, consider what each element means and how it contributes to the warhammer's identity. A name like 'Sacred Anvil' immediately suggests divine power and justice, while 'Thundering Great Maul, Voice of the Mountain' suggests both elemental power (thunder) and connection to the earth (Voice of the Mountain). 'Righteous, Fist of the Sky-Father' combines a powerful name (Righteous) with divine authority (Fist of the Sky-Father), creating a name that tells a story of justice, power, and legendary status.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three templates?",
        "answer": "Compound Artifact creates short, punchy names (Sacred Anvil, Thundering Maul). Named Artifact creates legendary names with lore (Righteous, Fist of the Sky-Father). Complex Weapon creates detailed names with weapon type and lore (Star-Iron Warhammer, Breaker of Chains). Each template has its own character and works best for different power levels and narrative styles."
      },
      {
        "question": "Can I use these names for other blunt weapons?",
        "answer": "Absolutely! While designed specifically for warhammers, these names work excellently for other blunt weapons like maces, mauls, morningstars, and even clubs. The themes of impact, divinity, and justice apply well to all blunt force weapons."
      },
      {
        "question": "How many unique warhammer names does the generator provide?",
        "answer": "The generator provides thousands of unique warhammer name combinations across all three templates. With 58 base names, 57 descriptors, and 50 epithets, the generator can create over 10,000 unique combinations, ensuring maximum variety for your fantasy world."
      },
      {
        "question": "Can I use these names for player characters' warhammers?",
        "answer": "Yes! These names are perfect for player characters' warhammers in D&D, tabletop RPGs, or fantasy writing. The names work well for both starting equipment and legendary artifacts that characters might acquire during their adventures, especially for paladins, clerics, or characters associated with justice and divine power."
      }
    ]
  },
  "relatedGenerators": [
    "sword",
    "axe",
    "shield"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(objectsFile, JSON.stringify(objectsData, null, 2));

console.log('✅ Successfully created Warhammer Name Generator!');
console.log(`📊 Base names: ${warhammerData.Hammer_Base_Names.length}`);
console.log(`📊 Descriptors: ${warhammerData.Hammer_Cool_Descriptors.length}`);
console.log(`📊 Epithets: ${warhammerData.Hammer_Epithets.length}`);
console.log(`📊 Weapon types: ${weaponTypes.length}`);
console.log(`✨ Three templates available`);
console.log(`\n📋 Example names:`);
console.log(`   Template 1: Sacred Anvil, Thundering Maul`);
console.log(`   Template 2: Righteous, Fist of the Sky-Father`);
console.log(`   Template 3: Star-Iron Warhammer, Breaker of Chains`);


