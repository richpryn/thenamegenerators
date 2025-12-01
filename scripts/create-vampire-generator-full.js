#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to extract first name from full name
function getFirstName(fullName) {
  const parts = fullName.split(' ');
  if (parts.length >= 2) {
    // Check if second part is a prefix (Van, de, von)
    if (['Van', 'de', 'von'].includes(parts[1])) {
      return parts[0];
    }
    return parts[0];
  }
  return fullName;
}

// Read the JSON data from the user's query
// Since the data is very large, we'll need to parse it from the actual JSON structure
// For now, I'll create a script that can be run with the JSON data

// The user provided the JSON in their query - I need to parse it
// Let me create a script that reads from a file or accepts JSON as argument

const args = process.argv.slice(2);
let vampireData;

if (args.length > 0) {
  // Try to parse as JSON string
  try {
    vampireData = JSON.parse(args[0]);
  } catch (e) {
    // If that fails, try reading from file
    const filePath = args[0];
    if (fs.existsSync(filePath)) {
      vampireData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      console.error('Error: Could not parse JSON or find file:', args[0]);
      process.exit(1);
    }
  }
} else {
  // Read from stdin
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    try {
      vampireData = JSON.parse(input);
      processVampireData(vampireData);
    } catch (e) {
      console.error('Error parsing JSON from stdin:', e.message);
      process.exit(1);
    }
  });
  return; // Exit early, will process when stdin ends
}

// Process the data
processVampireData(vampireData);

function processVampireData(vampireData) {
  const collection = vampireData.Vampire_Names_Collection || vampireData;
  
  const maleNames = collection.Male_Vampire_Names || [];
  const femaleNames = collection.Female_Vampire_Names || [];
  const nonBinaryNames = collection.Non_Binary_Vampire_Names || [];

  console.log(`Total Male Names: ${maleNames.length}`);
  console.log(`Total Female Names: ${femaleNames.length}`);
  console.log(`Total Non-Binary Names: ${nonBinaryNames.length}`);

  // Extract unique first names for reference
  const maleFirstNames = [...new Set(maleNames.map(getFirstName))];
  const femaleFirstNames = [...new Set(femaleNames.map(getFirstName))];
  const nonBinaryFirstNames = [...new Set(nonBinaryNames.map(getFirstName))];

  console.log(`Unique Male First Names: ${maleFirstNames.length}`);
  console.log(`Unique Female First Names: ${femaleFirstNames.length}`);
  console.log(`Unique Non-Binary First Names: ${nonBinaryFirstNames.length}`);

  // Update people.json
  const peopleFile = path.join(__dirname, '../data/people.json');
  const peopleData = JSON.parse(fs.readFileSync(peopleFile, 'utf8'));

  // If vampire generator already exists, just update the data
  if (peopleData.generators.vampire) {
    peopleData.generators.vampire.data = {
      male: maleNames,
      female: femaleNames,
      non_binary: nonBinaryNames
    };
    fs.writeFileSync(peopleFile, JSON.stringify(peopleData, null, 2));
    console.log('✅ Updated vampire generator with all names');
    console.log(`\nSummary:`);
    console.log(`- Male names: ${maleNames.length} total, ${maleFirstNames.length} unique first names`);
    console.log(`- Female names: ${femaleNames.length} total, ${femaleFirstNames.length} unique first names`);
    console.log(`- Non-binary names: ${nonBinaryNames.length} total, ${nonBinaryFirstNames.length} unique first names`);
    return;
  }

  // Otherwise, create the full generator structure
  peopleData.generators.vampire = {
    "title": "Vampire Name Generator",
    "slug": "vampire-name-generator",
    "description": "Generate elegant and dark vampire names perfect for fantasy writing, D&D, and gothic stories. Choose from male, female, or non-binary names with traditional vampire naming conventions.",
    "seoKeywords": "vampire names, vampire name generator, gothic names, dark fantasy names, vampire character names, vampire rpg names",
    "icon": "🧛",
    "isPopular": true,
    "popularRank": 14,
    "filters": {
      "gender": {
        "label": "Gender",
        "options": [
          "male",
          "female",
          "non_binary"
        ]
      }
    },
    "data": {
      "male": maleNames,
      "female": femaleNames,
      "non_binary": nonBinaryNames
    },
    "article": {
      "hero": {
        "title": "🧛 Vampire Name Generator",
        "tagline": "Generate elegant and dark vampire names perfect for fantasy writing, D&D, and gothic stories. Choose from male, female, or non-binary names."
      },
      "intro": "Vampire names evoke elegance, darkness, and timeless power. From the aristocratic 'Alistair Blackwood' to the mysterious 'Lilith Nightshade', vampire names tell stories of immortal beings who have walked the earth for centuries. Our **Vampire Name Generator** provides thousands of authentic vampire names across three gender categories, each following traditional vampire naming conventions with first names paired with dark, elegant surnames.",
      "sections": [
        {
          "heading": "The Art of Vampire Naming",
          "content": "<p>Vampire names serve multiple purposes in fantasy worlds: they identify immortal beings, establish aristocratic backgrounds, create memorable characters, and add depth to gothic settings. A well-chosen vampire name can instantly convey whether a character is aristocratic (Alistair Blackwood, Valerius de Shadowmere), mysterious (Lilith Nightshade, Nyx Obsidian), or powerful (Vlad Dracul, Seraph Sanguine).</p><p>Our generator includes names that follow traditional vampire naming conventions, combining elegant first names with dark, sophisticated surnames. Male names like 'Alistair Blackwood', 'Lucien Nightshade', and 'Valerius de Shadowmere' suggest aristocratic elegance and dark power. Female names like 'Adelina Bathory', 'Carmilla Bloodwick', and 'Lilith Nightshade' evoke mystery, beauty, and danger. Non-binary names like 'Ash Aether', 'Nyx Obsidian', and 'Vesper Void' offer unique, gender-neutral options that fit seamlessly into vampire settings.</p>"
        },
        {
          "heading": "Vampire Name Categories",
          "content": "<p>The generator provides names across three gender categories:</p><ul><li><strong>Male Vampire Names:</strong> Elegant male names like Alistair, Armand, Balthazar, Caelen, Cain, Casimir, Corvin, Damian, Dante, Dimitri, Dorian, Draco, Elias, Gideon, Julien, Kaelen, Leandros, Lorenzo, Lucien, Lysander, Malachi, Marcus, Marius, Nicodemus, Orion, Ragnar, Rurik, Seraph, Severin, Silas, Sterling, Thorne, Valerius, Vance, Varian, and Vlad. Surnames often reference darkness (Blackwood, Nightshade, Shadowmere), blood (Sanguine, Bloodwick, Crimson), or aristocratic titles (de Blackwood, von Dracul, Van Bane). Perfect for male vampires of all types—nobles, warriors, mystics, and more.</li><li><strong>Female Vampire Names:</strong> Elegant female names like Adelina, Amethyst, Anastasia, Aurora, Azriel, Belladonna, Bianca, Carmilla, Cassandra, Dahlia, Elara, Elowen, Esmeralda, Evangeline, Genevieve, Isabella, Isolde, Lenore, Lilith, Lucrezia, Lysandra, Morwen, Nyx, Ophelia, Persephone, Ravenna, Rowan, Selene, Seraphina, Sybella, Valeria, Vespera, Victoria, Viola, Vivienne, and Zara. Surnames follow similar patterns to male names, creating consistency in your world's naming conventions. Ideal for female vampires including nobles, seductresses, warriors, and mystics.</li><li><strong>Non-Binary Vampire Names:</strong> Unique, gender-neutral names like Ash, Aura, Bellamy, Blaze, Caelen, Dread, Echo, Eris, Faelan, Glimmer, Halo, Indigo, Jael, Kael, Lyra, Nyx, Orion, Pax, Raven, Rune, Seraph, Shadow, Silver, Slate, Sterling, Storm, Thorne, Vesper, Wren, and Zephyr. These names work excellently for vampires whose gender identity is non-binary, unknown, or irrelevant to the story. Perfect for mysterious characters, ancient vampires, or any vampire where gender-neutral naming is preferred.</li></ul>"
        },
        {
          "heading": "How to Use Vampire Names",
          "content": "<p>Vampire names work excellently for:</p><ul><li><strong>Fantasy Writing:</strong> Name vampires in novels, short stories, or gothic fiction</li><li><strong>D&D Campaigns:</strong> Create memorable vampire NPCs or player characters</li><li><strong>Tabletop RPGs:</strong> Populate your gothic fantasy world with immortal beings</li><li><strong>Game Development:</strong> Generate vampire names for video games and interactive fiction</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions across your vampire setting</li></ul><p>When choosing names, consider the vampire's age, background, and importance to your story. Ancient vampires might have more elaborate names with prefixes (de, von, Van), while younger vampires might have simpler names. The generator ensures variety by preventing first name repetition in a single result set, ensuring each generated name has a unique first name.</p>"
        }
      ],
      "faqs": [
        {
          "question": "What's the difference between the gender categories?",
          "answer": "Male vampire names use elegant male first names (Alistair, Lucien, Valerius) with dark surnames. Female vampire names use elegant female first names (Adelina, Lilith, Carmilla) with dark surnames. Non-binary vampire names use gender-neutral first names (Ash, Nyx, Vesper) with dark surnames. All categories follow similar surname patterns for consistency in your world."
        },
        {
          "question": "How does the first name repetition prevention work?",
          "answer": "The generator ensures that no first name appears more than once in a single result set. This means if you generate 10 names, each will have a unique first name, preventing results like 'Alistair Blackwood' and 'Alistair Caron' from appearing together. This ensures maximum variety in your generated names."
        },
        {
          "question": "How many unique names does each category provide?",
          "answer": "The generator provides thousands of unique name combinations per category. Male names include over 30 unique first names paired with dozens of surnames, female names include over 30 unique first names, and non-binary names include over 20 unique first names, ensuring plenty of variety for your vampires."
        },
        {
          "question": "Can I use these names for player characters too?",
          "answer": "Absolutely! While designed for vampires, these names work excellently for player characters as well. They follow traditional vampire naming conventions and can help players create authentic characters that fit seamlessly into gothic fantasy settings."
        }
      ]
    },
    "relatedGenerators": [
      "assassin",
      "demon-name-generator",
      "fantasy_npc"
    ]
  };

  fs.writeFileSync(peopleFile, JSON.stringify(peopleData, null, 2));
  console.log('✅ Added vampire generator to people.json');
  console.log(`\nSummary:`);
  console.log(`- Male names: ${maleNames.length} total, ${maleFirstNames.length} unique first names`);
  console.log(`- Female names: ${femaleNames.length} total, ${femaleFirstNames.length} unique first names`);
  console.log(`- Non-binary names: ${nonBinaryNames.length} total, ${nonBinaryFirstNames.length} unique first names`);
}

