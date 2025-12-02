#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Sword name data from the provided JSON
const swordData = {
  "Sword_Base_Names": [
    "Blade", "Edge", "Steel", "Iron", "Mithril", "Runesteel", "Star-metal", "Adamantine", "Star-iron", "Darksteel",
    "Shadow-forged", "Soul-steel", "Warblade", "Fateblade", "Griefblade", "Dawnbreaker", "Soulcarver", "Bloodletter", "Whisperwind", "Oathkeeper",
    "Doomspike", "Vengeance", "Woe", "Mourning", "Sorrow", "Fury", "Ruin", "Calamity", "Scourge", "Malice",
    "Hunger", "Blight", "Sepulchre", "Stygian", "Dread", "Tempest", "Frostbite", "Cinder", "Ember", "Shadow",
    "Phantom", "Zephyr", "Scythe", "Razor", "Needle", "Thorn", "Claw", "Tooth", "Tusk", "Fang",
    "Longsword", "Greatsword", "Claymore", "Shortsword", "Broadsword", "Katana", "Rapier", "Scimitar", "Sabre", "Falchion",
    "Dirk", "Estoc", "Arming-sword", "Bastard-sword"
  ],
  "Sword_Cool_Descriptors": [
    "Bloodied", "Wither", "Fel", "Grim", "Shadow", "Ebon", "Gloom", "Quiet", "Silent", "Mournful",
    "Black", "Crimson", "Scarlet", "Dread", "Sunken", "Rusted", "Pale", "Ghoul", "Spectre", "Phantom",
    "Wraith", "Vex", "Rune", "Striker", "Valor", "Dawn", "Fire", "Frost", "Gale", "Storm",
    "Iron", "Gold", "Gilded", "Holy", "Sacred", "Star", "Keeper", "Sentinel", "Guardian", "Spirit",
    "Soul", "Life", "Death", "Waking", "Slumber", "Venom", "Whisper", "Amber-Infused", "Emerald", "Sapphire",
    "Ruby", "Obsidian", "Diamond", "Cold-Forged", "Storm-Wrought", "Sky-Metal"
  ],
  "Sword_Epithets": [
    "of Visions", "of Summoning", "of the Serpent King", "of the Sunken God", "of the First Oath", "of the Lich-Lord",
    "of the Dread Plane", "of the Star-Forge", "of the Demon's Eye", "of the Shadow-Fae", "of the Cold Abyss", "of the Waking Dream",
    "of the Silent Sky", "of the Fallen Kingdom", "of the Elder-Blood", "of the Crystal Heart", "of the Forgotten Tower", "of the Bleeding Well",
    "of the Riven Earth", "of the Black Mountain", "Slicer of the Prince", "Wit of the Banished", "Ferocity of the Victor", "Reach of Assassins",
    "Song of Destiny", "Tear of Grief", "Whisper of Treachery", "Folly of the Fool", "Mercy of the Gods", "Truth of the Prophet",
    "Weight of Vows", "Silence of Kings", "Keeper of Secrets", "Brand of the Oathbreaker", "Ruin of Giants", "Vengeance of the Meek",
    "End of All Hope", "Fury of the Storm", "Key to the Deep", "Shadow of the Last Light", "of Woe", "of Anguish",
    "of Iron", "of Might", "of Glory", "of the Grave", "of the Wild", "of the Horde", "of the Knight", "of the Champion"
  ]
};

// Weapon types from C1 (for Template 3)
const weaponTypes = [
  "Longsword", "Greatsword", "Claymore", "Shortsword", "Broadsword", "Katana", "Rapier", "Scimitar", "Sabre", "Falchion",
  "Dirk", "Estoc", "Arming-sword", "Bastard-sword"
];

// Read the objects.json file
const objectsFile = path.join(__dirname, '../data/objects.json');
const objectsData = JSON.parse(fs.readFileSync(objectsFile, 'utf8'));

// Add the sword generator
objectsData.generators.sword = {
  "title": "Sword Name Generator",
  "slug": "sword-name-generator",
  "description": "Generate legendary sword names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming.",
  "seoKeywords": "sword names, sword name generator, fantasy sword names, legendary sword names, D&D sword names, gaming sword names",
  "icon": "⚔️",
  "isPopular": true,
  "popularRank": 3,
  "filters": {
    "template": {
      "label": "Name Template",
      "options": [
        "compound_artifact",
        "named_artifact",
        "complex_weapon"
      ],
      "optionLabels": {
        "compound_artifact": "Compound Artifact (e.g., Shadow Edge, Diamond Rapier)",
        "named_artifact": "Named Artifact (e.g., Striker, of Visions)",
        "complex_weapon": "Complex Weapon (e.g., Emerald Shortsword, Weight of Vows)"
      }
    }
  },
  "data": {
    "baseNames": swordData.Sword_Base_Names,
    "descriptors": swordData.Sword_Cool_Descriptors,
    "epithets": swordData.Sword_Epithets,
    "weaponTypes": weaponTypes
  },
  "article": {
    "hero": {
      "title": "⚔️ Sword Name Generator",
      "tagline": "Generate legendary sword names using three distinct templates. Create compound artifacts, named artifacts, or complex named weapons perfect for fantasy writing, D&D, and gaming."
    },
    "intro": "Sword names carry the weight of legend, power, and destiny. From the classic 'Shadowmourne' to the legendary 'Excalibur, Keeper of Secrets', sword names tell stories of heroes, villains, and the weapons that shaped history. Our **Sword Name Generator** creates powerful sword names using three distinct templates: Compound Artifacts (Shadow Edge), Named Artifacts (Striker, of Visions), and Complex Weapons (Emerald Shortsword, Weight of Vows), drawing from fantasy, mythology, and gaming to create names that resonate with power and legend.",
    "sections": [
      {
        "heading": "The Power of Sword Names",
        "content": "<p>Sword names serve multiple purposes in fantasy worlds: they identify legendary weapons, create memorable artifacts, establish a weapon's power level, and add depth to fantasy settings. A well-chosen sword name can instantly convey whether a weapon is dark (Shadow Edge), holy (Sacred Longsword, of the First Oath), or legendary (Striker, Ruin of Giants).</p><p>Our generator uses three distinct templates to create sword names with different levels of complexity and detail. Each template has its own character: Compound Artifacts are short and punchy, Named Artifacts emphasize the weapon's legendary status, and Complex Weapons provide the most detail about appearance and lore.</p>"
      },
      {
        "heading": "Sword Name Templates",
        "content": "<p>The generator offers three distinct naming templates, each with its own character and feel:</p><ul><li><strong>Compound Artifact (C2 + C1):</strong> This template creates short, punchy names common in high fantasy. Format: [Descriptor] + [Base Name]. Examples: 'Shadow Edge', 'Diamond Rapier', 'Cold-Forged Claymore'. This template combines an adjective/title with a base noun or blade type, creating memorable, iconic names.</li><li><strong>Named Artifact (C2 + C3):</strong> This template creates legendary, named artifacts where the name stands alone, followed by its defining lore. Format: [Descriptor], [Epithet]. Examples: 'Striker, of Visions', 'Wraith, Ruin of Giants', 'Dawn, Keeper of Secrets'. This template emphasizes the weapon's legendary status and its connection to powerful forces or events.</li><li><strong>Complex Weapon (C2 + C1 Weapon Type + C3):</strong> This template creates the most detailed and varied names, describing the weapon's appearance/type and its lore. Format: [Descriptor] + [Weapon Type], [Epithet]. Examples: 'Emerald Shortsword, Weight of Vows', 'Rusted Sabre, Vengeance of the Meek', 'Cold-Forged Longsword, of the Demon's Eye'. This template provides maximum detail about the weapon's physical form and legendary status.</li></ul><p>Each template has its own strengths: Compound Artifacts are direct and memorable, Named Artifacts emphasize legendary status, and Complex Weapons provide the most narrative depth.</p>"
      },
      {
        "heading": "Sword Name Components",
        "content": "<p>The generator uses three component lists to create sword names:</p><ul><li><strong>Base Names (C1):</strong> Nouns and weapon types like Blade, Edge, Longsword, Claymore, Katana, Rapier. These provide the foundation of the sword's identity, whether it's a specific weapon type or a general blade concept.</li><li><strong>Cool Descriptors (C2):</strong> Adjectives and titles like Shadow, Cold-Forged, Striker, Diamond, Bloodied, Wither. These add character, power level, and visual description to the sword's name.</li><li><strong>Epithets (C3):</strong> Lore phrases like 'of Visions', 'Slicer of the Prince', 'Ruin of Giants', 'Keeper of Secrets'. These add legendary status, history, and narrative depth to the sword's name.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique sword names that work across different fantasy settings and power levels.</p>"
      },
      {
        "heading": "How to Use Sword Names",
        "content": "<p>Sword names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Name legendary swords for player characters or important NPCs</li><li><strong>Fantasy Writing:</strong> Create memorable sword names for characters in novels or short stories</li><li><strong>Gaming:</strong> Perfect for MMORPGs, video games, or tabletop RPGs where swords are important equipment</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for legendary weapons in your fantasy world</li><li><strong>Character Development:</strong> Use sword names to reflect a character's personality, background, or alignment</li></ul><p>When choosing sword names, consider the weapon's power level, origin, and the character who wields it. A sword named 'Shadow Edge' suggests a dark, stealthy weapon, while 'Sacred Longsword, of the First Oath' suggests a holy, legendary artifact.</p>"
      },
      {
        "heading": "Well-Known Swords in Literature and Media",
        "content": "<p>Sword names have been immortalized through mythology, literature, games, and media. These iconic swords demonstrate the power of well-chosen sword names:</p><ul><li><strong>Excalibur (Arthurian Legend):</strong> The legendary sword of King Arthur, Excalibur's name has become synonymous with legendary weapons. Its name suggests both power and destiny, fitting for a sword that chose its wielder.</li><li><strong>Andúril (The Lord of the Rings):</strong> The Flame of the West, Andúril was forged from the shards of Narsil. Its name means 'Flame of the West' in Quenya, demonstrating how sword names can incorporate linguistic depth and cultural meaning.</li><li><strong>Glamdring (The Lord of the Rings):</strong> Gandalf's sword, Glamdring means 'Foe-hammer' in Sindarin. Its name reflects its purpose and power, showing how sword names can tell stories of their deeds.</li><li><strong>Various D&D Swords:</strong> Dungeons & Dragons features numerous legendary swords like the Sword of Kas, Vorpal Sword, and Holy Avenger, demonstrating how sword names can reflect their magical properties and legendary status.</li><li><strong>Various Video Game Swords:</strong> Games like The Elder Scrolls, World of Warcraft, and Final Fantasy feature iconic swords with memorable names like Dawnbreaker, Frostmourne, and Masamune, showing how sword names can be both functional and atmospheric.</li><li><strong>Various Fantasy Literature Swords:</strong> Fantasy novels feature swords with evocative names that suggest their power, origin, or the forces that created them, from simple names like 'Needle' to complex names like 'Oathkeeper, of the First Oath'.</li></ul><p>These iconic swords demonstrate the range of sword naming conventions: from simple, memorable names (Excalibur) to linguistically complex names (Andúril, Glamdring) to descriptive names that tell stories (Frostmourne, Dawnbreaker). When creating your own sword names, consider what the sword represents, its power level, and how the name reflects its origin and legendary status.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Sword Names",
        "content": "<p>Understanding the etymology and symbolism behind sword names adds depth to character creation and worldbuilding. Many sword names draw from specific linguistic roots, mythological references, and symbolic meanings:</p><ul><li><strong>Weapon Types and Materials:</strong> Base names often reference weapon types (Longsword, Claymore, Katana, Rapier) or materials (Mithril, Adamantine, Star-metal, Darksteel). These names create authenticity and suggest the weapon's physical form and power level.</li><li><strong>Descriptive Adjectives:</strong> Descriptors add character and visual description: 'Shadow' (darkness, stealth), 'Cold-Forged' (ice, winter), 'Bloodied' (battle, violence), 'Diamond' (purity, value), 'Rusted' (age, decay). These names suggest the sword's appearance, nature, and history.</li><li><strong>Mythological and Legendary References:</strong> Epithets often reference mythology and legend: 'of the Serpent King', 'of the Lich-Lord', 'of the Star-Forge', 'of the Demon's Eye'. These names connect swords to powerful forces and legendary events.</li><li><strong>Abstract and Conceptual Terms:</strong> Names use abstract concepts: 'Vengeance', 'Woe', 'Mourning', 'Sorrow', 'Fury', 'Ruin', 'Calamity'. These names suggest the sword's emotional impact and the stories it tells.</li><li><strong>Natural and Elemental References:</strong> Names reference natural forces: 'Tempest', 'Frostbite', 'Cinder', 'Ember', 'Zephyr', 'Storm'. These names suggest elemental power and connection to nature.</li><li><strong>Lore and Narrative Phrases:</strong> Epithets tell stories: 'Slicer of the Prince', 'Ruin of Giants', 'Vengeance of the Meek', 'Keeper of Secrets', 'Weight of Vows'. These names create narrative depth and suggest the sword's legendary deeds and history.</li><li><strong>Color and Visual Elements:</strong> Descriptors reference colors and visual elements: 'Crimson', 'Scarlet', 'Ebon', 'Black', 'Gold', 'Gilded', 'Emerald', 'Sapphire', 'Ruby', 'Obsidian'. These names create visual identity and suggest the sword's appearance.</li><li><strong>Spiritual and Mystical Terms:</strong> Names reference spiritual concepts: 'Soul', 'Spirit', 'Holy', 'Sacred', 'Phantom', 'Wraith', 'Spectre'. These names suggest otherworldly power and mystical origins.</li></ul><p>When creating sword names, consider what each element means and how it contributes to the sword's identity. A name like 'Shadow Edge' immediately suggests darkness and stealth, while 'Emerald Shortsword, Weight of Vows' suggests both visual appearance (emerald) and legendary significance (weight of vows). 'Striker, Ruin of Giants' combines a powerful name (Striker) with legendary deeds (Ruin of Giants), creating a name that tells a story of power and achievement.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three templates?",
        "answer": "Compound Artifact creates short, punchy names (Shadow Edge, Diamond Rapier). Named Artifact creates legendary names with lore (Striker, of Visions). Complex Weapon creates detailed names with weapon type and lore (Emerald Shortsword, Weight of Vows). Each template has its own character and works best for different power levels and narrative styles."
      },
      {
        "question": "Can I use these names for other weapons?",
        "answer": "Absolutely! While designed for swords, these names can work for other weapons like axes, maces, or even magical staves. The naming templates are flexible and can be adapted to different weapon types in your fantasy world."
      },
      {
        "question": "How many unique sword names does the generator provide?",
        "answer": "The generator provides thousands of unique sword name combinations across all three templates. With 64 base names, 56 descriptors, and 50 epithets, the generator can create over 10,000 unique combinations, ensuring maximum variety for your fantasy world."
      },
      {
        "question": "Can I use these names for player characters' swords?",
        "answer": "Yes! These names are perfect for player characters' swords in D&D, tabletop RPGs, or fantasy writing. The names work well for both starting equipment and legendary artifacts that characters might acquire during their adventures."
      }
    ]
  },
  "relatedGenerators": [
    "shield",
    "poison",
    "assassin"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(objectsFile, JSON.stringify(objectsData, null, 2));

console.log('✅ Successfully created Sword Name Generator!');
console.log(`📊 Base names: ${swordData.Sword_Base_Names.length}`);
console.log(`📊 Descriptors: ${swordData.Sword_Cool_Descriptors.length}`);
console.log(`📊 Epithets: ${swordData.Sword_Epithets.length}`);
console.log(`📊 Weapon types: ${weaponTypes.length}`);
console.log(`✨ Three templates available`);
console.log(`\n📋 Example names:`);
console.log(`   Template 1: Shadow Edge, Diamond Rapier`);
console.log(`   Template 2: Striker, of Visions`);
console.log(`   Template 3: Emerald Shortsword, Weight of Vows`);


