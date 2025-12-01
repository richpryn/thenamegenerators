#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// New vampire data structure from user
const vampireData = {
  "Female_First_Names": [
    "Adelina", "Amethyst", "Anastasia", "Aurora", "Azriel", "Belladonna", "Bianca",
    "Carmilla", "Cassandra", "Dahlia", "Elara", "Elowen", "Esmeralda", "Evangeline",
    "Genevieve", "Isabella", "Isolde", "Lenore", "Lilith", "Lucrezia", "Lysandra",
    "Morwen", "Nyx", "Ophelia", "Persephone", "Ravenna", "Rowan", "Selene",
    "Seraphina", "Sybella", "Valeria", "Vespera", "Victoria", "Viola", "Vivienne", "Zara"
  ],
  "Non_Binary_First_Names": [
    "Ash", "Aura", "Bellamy", "Blaze", "Caelen", "Dread", "Echo", "Eris", "Faelan",
    "Glimmer", "Halo", "Indigo", "Jael", "Kael", "Lyra", "Nyx", "Orion", "Pax",
    "Raven", "Rune", "Seraph", "Shadow", "Silver", "Slate", "Sterling", "Storm",
    "Thorne", "Vesper", "Wren", "Zephyr"
  ],
  "Male_First_Names": [
    "Alaric", "Alistair", "Balthazar", "Caius", "Corbin", "Damon", "Dorian", "Draven",
    "Estrid", "Hadrian", "Hemlock", "Jasper", "Julian", "Kane", "Killian", "Lazarus",
    "Lucian", "Malachi", "Marius", "Merrick", "Octavian", "Phineas", "Raiden",
    "Renwick", "Rhys", "Silas", "Sterling", "Stellan", "Thane", "Theron", "Tristan",
    "Valerian", "Victor", "Xylos", "Zorian"
  ],
  "Last_Names_Titles": [
    "Aether", "Aethelred", "Ash", "Ashwood", "Bathory", "Black", "Blood", "Bloodwick",
    "Corvus", "Crimson", "Crypte", "Dracul", "Dusk", "Ebon", "Estre", "Fae", "Gloom",
    "Graves", "Grey", "Grim", "Grimalkin", "Grimm", "Halo", "Iron", "Ironfall",
    "Kaelen", "Kresnik", "Lace", "Lycanis", "Moon", "Morne", "Mort", "Morte",
    "Nightfall", "Nightshade", "Noir", "Obsidian", "Onyx", "Orsini", "Pax",
    "Ravenclaw", "Ravenna", "Rune", "Seraph", "Serpent", "Shadow", "Shadowsong",
    "Silas", "Silken", "Slate", "Sorrow", "Spire", "Starr", "Stone", "Strix",
    "Tepes", "Valeriu", "Vane", "Veil", "Vesper", "Vex", "Vipera", "Void",
    "Whisper", "Wren", "de Bathory", "de Bloodwick", "de Morne", "de Shadowsong",
    "von Bathory", "von Bloodwick", "von Morne", "von Shadowsong"
  ]
};

// Update people.json
const peopleFile = path.join(__dirname, '../data/people.json');
const peopleData = JSON.parse(fs.readFileSync(peopleFile, 'utf8'));

if (!peopleData.generators.vampire) {
  console.error('❌ Vampire generator not found in people.json');
  process.exit(1);
}

// Update data structure to use first names and last names separately
peopleData.generators.vampire.data = {
  male: {
    firstNames: vampireData.Male_First_Names,
    lastNames: vampireData.Last_Names_Titles
  },
  female: {
    firstNames: vampireData.Female_First_Names,
    lastNames: vampireData.Last_Names_Titles
  },
  non_binary: {
    firstNames: vampireData.Non_Binary_First_Names,
    lastNames: vampireData.Last_Names_Titles
  }
};

fs.writeFileSync(peopleFile, JSON.stringify(peopleData, null, 2));

console.log('✅ Updated vampire generator data structure');
console.log(`\n📊 Data Summary:`);
console.log(`- Male first names: ${vampireData.Male_First_Names.length}`);
console.log(`- Female first names: ${vampireData.Female_First_Names.length}`);
console.log(`- Non-binary first names: ${vampireData.Non_Binary_First_Names.length}`);
console.log(`- Last names/titles: ${vampireData.Last_Names_Titles.length}`);
console.log(`\n✨ Total possible combinations:`);
console.log(`- Male: ${vampireData.Male_First_Names.length * vampireData.Last_Names_Titles.length} combinations`);
console.log(`- Female: ${vampireData.Female_First_Names.length * vampireData.Last_Names_Titles.length} combinations`);
console.log(`- Non-binary: ${vampireData.Non_Binary_First_Names.length * vampireData.Last_Names_Titles.length} combinations`);

