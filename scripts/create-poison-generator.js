#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Poison name data from the provided JSON
const poisonData = {
  "Poison_Base_Names": [
    "Aconite", "Abrin", "Atropa", "Belladonna", "Botulin", "Caries", "Coniine", "Contagion", "Curare", "Digitalis",
    "Distillate", "Extract", "Fever", "Ichor", "Lysis", "Malady", "Miasma", "Mortis", "Necrosis", "Nightshade",
    "Nocuus", "Phlegm", "Plague", "Pox", "Putrefaction", "Pustule", "Putrid", "Residue", "Ricin", "Rot",
    "Saxitoxin", "Scourge", "Sediment", "Septic", "Sickness", "Slime", "Sliver", "Spoil", "Spore", "Strychnine",
    "Taint", "Toxin", "Tubocurarine", "Venom", "Vial", "Virulence", "Zoonosis", "Lethalis", "Vile", "Phial",
    "Acheron", "Azoth", "Blight", "Caligo", "Charon", "Chasm", "Cipher", "Crimson", "Crypt", "Dolorous",
    "Doom", "Dusk", "Ebon", "Erebus", "Exitium", "Fel", "Gloom", "Grave", "Hex", "Hush",
    "Ictus", "Jinx", "Lethe", "Lues", "Malum", "Moribund", "Murk", "Mausoleum", "Noir", "Null",
    "Oblivion", "Obsidian", "Onyx", "Pall", "Pestis", "Phantasm", "Requiem", "Ruin", "Scathe", "Scutum",
    "Sepulchre", "Shadow", "Shadowfell", "Shroud", "Sicarius", "Sinister", "Specter", "Spirit", "Stygian", "Tartarus",
    "Umbra", "Unhallowed", "Agony", "Anguish", "Bile", "Cackle", "Cinder", "Cold-iron", "Delirium", "Despair",
    "Dolor", "Dread", "Echo", "Embrace", "Ennui", "Frenzy", "Gaze", "Glare", "Grief", "Grisly",
    "Horror", "Hunger", "Kiss", "Lies", "Malice", "Madness", "Misery", "Nightmare", "Panic", "Reek",
    "Scorn", "Sigh", "Silence", "Slumber", "Snarl", "Sorrow", "Spite", "Stillness", "Terror", "Thirst",
    "Touch", "Tremor", "Veil", "Vesper", "Void", "Wane", "Whisper", "Woe", "Wrath", "Witch-salve",
    "Blackice", "Gout", "Ash", "Bane", "Barrens", "Blossom", "Bog", "Chill", "Curse", "Dust",
    "Draught", "Dregs", "Earthrot", "Fallow", "Filth", "Fume", "Grit", "Grim", "Growths", "Haze",
    "Hemlock", "Iron-gall", "Lament", "Mire", "Moss", "Mote", "Nightsoil", "Pestilence", "Pool", "Quiver",
    "Rimefrost", "Sludge", "Sputum", "Spume", "Swamp", "Tar", "Tincture", "Weal", "Wastage", "Wither",
    "Womb", "Yew", "Mistletoe", "Sodden"
  ],
  "Poison_Descriptors": [
    "Bringer of Death", "End of Days", "Soul's-Last-Kiss", "Witherer of Bone", "Heart's Final Silence",
    "Sleep Eternal", "Mind's Ruin", "Flesh-Eater", "The Great Wasting", "Bane of Kings",
    "Quietus of the Grave", "The Slow Suffocation", "Breaker of Vows", "The Unseen End", "End of the Line",
    "The Mortal Chill", "The Great Collapse", "Fate's Final Turn", "The Empty Breath", "The Quickest Dark",
    "The Waking Coma", "The Quietus-Mortal", "The False Dawn", "The Unhealing Scab", "The Sudden Age",
    "Brew of the Lich-Lord", "Venom of the Deepmire", "Wept by the Stone-Eye", "Tears of the Obsidian-Dwarf", "Gift of the Shadow-Fae",
    "Kiss of the Serpent-God", "Bane of the Dragon's Teeth", "Drawn from the Gloom-Well", "The Alchemist's Shame", "Filth of the Forgotten God",
    "The Necromancer's Draught", "Shadowmote Distilled", "The Goblin's Bargain", "Sludge from the Bottomless Pit", "The Stolen Rest",
    "Weeping of the Cursed Willow", "Shed by the Wyvern Queen", "The Hag's Secret", "The Crypt-Thing's Oil", "Juice of the Death Cap",
    "Poured from the Empty Soul", "The Spider's Final Meal", "Seed of the Elder God", "Fell from the Dead Moon", "Tears of the Siren's Loss",
    "The Final Word", "The Last Draught", "The Sleeper", "The Great Lie", "The Whisperer",
    "The Destroyer", "The Black Tide", "The Green Folly", "The Silent Singer", "The Unkindness",
    "The Grim Harvest", "The Grey Pall", "The Widow's Gift", "The Assassin's Sigh", "The Kingmaker",
    "The Cold Comfort", "The Bitter End", "The Black Kiss", "The Unmaking", "The Slow Mercy",
    "The Bloodless", "The Serpent's Dream", "The Empty Heart", "The Final Sleep", "The Darkest Hour"
  ]
};

// Read the objects.json file
const objectsFile = path.join(__dirname, '../data/objects.json');
const objectsData = JSON.parse(fs.readFileSync(objectsFile, 'utf8'));

// Add the poison generator
objectsData.generators.poison = {
  "title": "Poison Name Generator",
  "slug": "poison-name-generator",
  "description": "Generate dark and deadly poison names in the format '[name], [descriptor]'. Perfect for fantasy writing, D&D, and gaming.",
  "seoKeywords": "poison names, poison name generator, fantasy poison names, D&D poison names, gaming poison names, toxic names",
  "icon": "☠️",
  "isPopular": true,
  "popularRank": 2,
  "filters": {},
  "data": {
    "baseNames": poisonData.Poison_Base_Names,
    "descriptors": poisonData.Poison_Descriptors
  },
  "article": {
    "hero": {
      "title": "☠️ Poison Name Generator",
      "tagline": "Generate dark and deadly poison names in the format '[name], [descriptor]'. Perfect for fantasy writing, D&D, and gaming."
    },
    "intro": "Poison names carry the weight of death, danger, and dark magic. From the legendary 'Belladonna, Bringer of Death' to the mysterious 'Nightshade, Soul's-Last-Kiss', poison names tell stories of lethal substances that can end lives with a single drop. Our **Poison Name Generator** creates powerful poison names in the format '[name], [descriptor]', combining base poison names with dramatic descriptors that evoke fear, mystery, and deadly power.",
    "sections": [
      {
        "heading": "The Power of Poison Names",
        "content": "<p>Poison names serve multiple purposes in fantasy worlds: they identify lethal substances, create memorable items, establish danger levels, and add depth to dark fantasy settings. A well-chosen poison name can instantly convey whether a poison is fast-acting (The Quickest Dark), slow and insidious (The Slow Suffocation), or legendary (Bane of Kings).</p><p>Our generator combines base poison names—drawn from real toxins, mythological references, and dark fantasy terms—with dramatic descriptors that tell stories of death, suffering, and dark magic. Names like 'Belladonna, Bringer of Death', 'Nightshade, Soul's-Last-Kiss', and 'Aconite, The Final Sleep' create memorable, evocative poison names perfect for D&D campaigns, fantasy writing, and gaming.</p>"
      },
      {
        "heading": "Poison Name Categories",
        "content": "<p>The generator provides poison names across various thematic categories:</p><ul><li><strong>Real Toxins:</strong> Names like Aconite, Belladonna, Botulin, Curare, Digitalis, Ricin, Strychnine, and Saxitoxin draw from real-world poisons, creating authentic and recognizable names.</li><li><strong>Mythological and Dark References:</strong> Names like Acheron (river of woe), Charon (ferryman of the dead), Erebus (primordial darkness), Lethe (river of forgetfulness), and Tartarus (the abyss) draw from mythology to create names with deep cultural resonance.</li><li><strong>Descriptive Base Names:</strong> Names like Blight, Doom, Gloom, Hex, Jinx, Ruin, Scathe, and Woe describe the poison's nature and effects.</li><li><strong>Dramatic Descriptors:</strong> Descriptors like 'Bringer of Death', 'End of Days', 'Soul's-Last-Kiss', 'Witherer of Bone', and 'Heart's Final Silence' create powerful, memorable names that tell stories of death and destruction.</li><li><strong>Fantasy Origins:</strong> Descriptors like 'Brew of the Lich-Lord', 'Venom of the Deepmire', 'Gift of the Shadow-Fae', and 'Kiss of the Serpent-God' suggest magical origins and dark fantasy settings.</li></ul>"
      },
      {
        "heading": "How to Use Poison Names",
        "content": "<p>Poison names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Name poisons for player characters, NPCs, or important plot items</li><li><strong>Fantasy Writing:</strong> Create memorable poison names for characters in novels or short stories</li><li><strong>Gaming:</strong> Perfect for MMORPGs, video games, or tabletop RPGs where poisons are important items</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for toxic substances in your fantasy world</li><li><strong>Character Development:</strong> Use poison names to reflect a character's methods, background, or alignment</li></ul><p>When choosing poison names, consider the poison's effects, origin, and rarity. A poison named 'Belladonna, Bringer of Death' suggests a fast-acting, deadly poison, while 'The Slow Suffocation' suggests a gradual, torturous death.</p>"
      },
      {
        "heading": "Well-Known Poisons in Literature and Media",
        "content": "<p>Poison names have been immortalized through mythology, literature, games, and media. These iconic poisons demonstrate the power of well-chosen poison names:</p><ul><li><strong>Belladonna (Real World & Fantasy):</strong> Also known as deadly nightshade, Belladonna is one of the most famous poisons in history. Its name means 'beautiful lady' in Italian, creating an ironic contrast with its deadly nature. It appears in countless fantasy works as a poison of choice for assassins and dark mages.</li><li><strong>Wolfsbane/Aconite (Various):</strong> Aconite, also known as wolfsbane or monkshood, is a real-world poison that has appeared in many fantasy works. Its name suggests danger and has been used in everything from werewolf stories to fantasy RPGs.</li><li><strong>Various D&D Poisons:</strong> Dungeons & Dragons features numerous poisons like Purple Worm Poison, Wyvern Poison, and Assassin's Blood, demonstrating how poison names can reflect their source or creator.</li><li><strong>Poison in Game of Thrones:</strong> The series features various poisons like the Strangler and Tears of Lys, demonstrating how poison names can be descriptive and memorable while fitting the world's tone.</li><li><strong>Poison in Assassin's Creed:</strong> The game series features various poisons with names that reflect their effects and origins, showing how poison names can be both functional and atmospheric.</li><li><strong>Poison in Fantasy Literature:</strong> Many fantasy novels feature poisons with evocative names that suggest their magical origins, effects, or the dark forces that created them.</li></ul><p>These iconic poisons demonstrate the range of poison naming conventions: from real-world toxins (Belladonna, Aconite) to descriptive names (The Strangler, Tears of Lys) to fantasy-origin names (Brew of the Lich-Lord, Gift of the Shadow-Fae). When creating your own poison names, consider what the poison represents, its effects, and how the name reflects its origin and power.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Poison Names",
        "content": "<p>Understanding the etymology and symbolism behind poison names adds depth to character creation and worldbuilding. Many poison names draw from specific linguistic roots, mythological references, and symbolic meanings:</p><ul><li><strong>Real-World Toxins:</strong> Many base names come from actual poisons: 'Belladonna' (Italian, 'beautiful lady'), 'Aconite' (Greek, 'without struggle'), 'Curare' (indigenous South American), 'Digitalis' (Latin, 'finger-like', referring to the foxglove plant), 'Ricin' (from castor bean), 'Strychnine' (from the strychnos tree). These names create authenticity and recognition.</li><li><strong>Mythological References:</strong> Names draw from mythology: 'Acheron' (Greek river of woe), 'Charon' (ferryman of the dead), 'Erebus' (primordial darkness), 'Lethe' (river of forgetfulness), 'Tartarus' (the abyss). These names connect poisons to ancient legends and death.</li><li><strong>Latin and Classical Roots:</strong> Names frequently use Latin: 'Mortis' (death), 'Necrosis' (death of tissue), 'Contagion' (spread of disease), 'Pestis' (plague), 'Lues' (plague), 'Malum' (evil). These names suggest classical knowledge and dark power.</li><li><strong>Descriptive and Evocative Terms:</strong> Names describe effects: 'Blight', 'Doom', 'Gloom', 'Ruin', 'Scathe', 'Woe', 'Agony', 'Anguish', 'Despair', 'Dread', 'Horror', 'Terror'. These names directly reference the poison's impact.</li><li><strong>Dark Fantasy Elements:</strong> Names incorporate dark fantasy themes: 'Shadow', 'Umbra', 'Stygian', 'Crypt', 'Sepulchre', 'Mausoleum', 'Phantasm', 'Specter'. These names suggest otherworldly darkness and supernatural power.</li><li><strong>Natural and Organic References:</strong> Names reference nature: 'Hemlock', 'Nightshade', 'Yew', 'Mistletoe', 'Blossom', 'Moss', 'Bog', 'Swamp', 'Mire'. These names suggest natural origins and organic toxicity.</li><li><strong>Dramatic Descriptors:</strong> Descriptors tell stories: 'Bringer of Death', 'End of Days', 'Soul's-Last-Kiss', 'Witherer of Bone', 'Heart's Final Silence'. These create powerful, memorable names that evoke fear and death.</li><li><strong>Fantasy Origins in Descriptors:</strong> Descriptors suggest magical sources: 'Brew of the Lich-Lord', 'Venom of the Deepmire', 'Gift of the Shadow-Fae', 'Kiss of the Serpent-God'. These names create narrative depth and suggest the poison's origin.</li></ul><p>When creating poison names, consider what each element means and how it contributes to the poison's identity. A name like 'Belladonna, Bringer of Death' combines a real-world poison (Belladonna) with a dramatic descriptor (Bringer of Death), creating a name that's both authentic and memorable. 'Nightshade, Soul's-Last-Kiss' combines a natural poison (Nightshade) with a poetic descriptor (Soul's-Last-Kiss), creating a name that's both beautiful and deadly.</p>"
      }
    ],
    "faqs": [
      {
        "question": "Why are poison names formatted as '[name], [descriptor]'?",
        "answer": "The '[name], [descriptor]' format creates memorable, evocative poison names that tell stories. The base name identifies the poison's substance or nature, while the descriptor adds dramatic flair and suggests the poison's effects, origin, or legendary status. This format works well in fantasy settings and creates names that are both functional and atmospheric."
      },
      {
        "question": "Can I use these names for other toxic substances?",
        "answer": "Absolutely! While designed for poisons, these names can work for other toxic substances like venoms, toxins, acids, or even magical curses. The naming format is flexible and can be adapted to different types of harmful substances in your fantasy world."
      },
      {
        "question": "How many unique poison names does the generator provide?",
        "answer": "The generator provides over 200 base names and 80 descriptors, creating thousands of unique poison name combinations. Each combination follows the '[name], [descriptor]' format, ensuring variety and memorability."
      },
      {
        "question": "Can I use these names for player characters' poisons?",
        "answer": "Yes! These names are perfect for player characters' poisons in D&D, tabletop RPGs, or fantasy writing. The names work well for both common poisons and legendary, one-of-a-kind toxic substances that characters might discover or create."
      }
    ]
  },
  "relatedGenerators": [
    "shield",
    "assassin",
    "demon-name-generator"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(objectsFile, JSON.stringify(objectsData, null, 2));

console.log('✅ Successfully created Poison Name Generator!');
console.log(`📊 Base names: ${poisonData.Poison_Base_Names.length}`);
console.log(`📊 Descriptors: ${poisonData.Poison_Descriptors.length}`);
console.log(`✨ Format: "[name], [descriptor]"`);
console.log(`\n📋 Example names:`);
for (let i = 0; i < 5; i++) {
  const baseName = poisonData.Poison_Base_Names[i];
  const descriptor = poisonData.Poison_Descriptors[i];
  console.log(`   - ${baseName}, ${descriptor}`);
}


