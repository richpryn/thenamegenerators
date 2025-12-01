#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the current shield generator
const objectsFile = path.join(__dirname, '../data/objects.json');
const objectsData = JSON.parse(fs.readFileSync(objectsFile, 'utf8'));

const shieldGen = objectsData.generators.shield;

// Extract base names - check if data is already structured or is an array
let baseNames;
if (Array.isArray(shieldGen.data)) {
  // Extract base names from current format "The [name] Shield"
  baseNames = shieldGen.data.map(name => {
    // Remove "The " prefix and " Shield" suffix
    return name.replace(/^The /, '').replace(/ Shield$/, '');
  });
} else if (shieldGen.data && shieldGen.data.baseNames) {
  // Data is already structured
  baseNames = shieldGen.data.baseNames;
} else {
  throw new Error('Invalid shield data structure');
}

// For "Protector of [name]", we'll use a subset of names that work well as protected entities
// These are names that sound good as things being protected (places, concepts, etc.)
const protectorOfNames = [
  "Aegis", "Aeternus", "Aether", "Anathema", "Apex", "Arcanum", "Archon", "Argus", "Ariel", "Astra",
  "Atlas", "Aura", "Aurelian", "Aurora", "Axiom", "Baron", "Bastion", "Bellator", "Blizzard", "Breeze",
  "Cadence", "Caelus", "Cairn", "Catharsis", "Chalice", "Chaos", "Chieftain", "Chrysalis", "Cinder", "Cipher",
  "Comet", "Cosmos", "Covenant", "Crest", "Crown", "Crux", "Crystal", "Cynosure", "Diadem", "Dignity",
  "Dominion", "Draconian", "Drekar", "Drengr", "Duke", "Ebon", "Edict", "Eld", "Elegy", "Ember",
  "Empire", "Ephemeral", "Epoch", "Equinox", "Erlking", "Eulogy", "Fallow", "Fealty", "Fell", "Ferox",
  "Fjord", "Flint", "Fortitude", "Frostbite", "Fylgja", "Garnet", "Geode", "Geyser", "Gjallar", "Glacier",
  "Gleipnir", "Glimmer", "Goliath", "Gorgon", "Harkon", "Harrow", "Hearth", "Heath", "Hecate", "Herald",
  "Hreidmar", "Hrim", "Hydrus", "Iconoclast", "Imperator", "Inception", "Inertia", "Invictus", "Ironside", "Ithaca",
  "Jarl", "Jotun", "Kratos", "Krig", "Krom", "Kyrios", "Legate", "Locus", "Loom", "Lumin",
  "Lunar", "Magma", "Magnus", "Marquis", "Meteor", "Miasma", "Mien", "Monarch", "Moor", "Nebula",
  "Nemesis", "Nostos", "Obelisk", "Obsidian", "Odeum", "Olympus", "Onyx", "Opal", "Overlord", "Paladin",
  "Paramount", "Pardus", "Penumbra", "Phalanx", "Phantasm", "Praetor", "Prefect", "Prism", "Pylon", "Pyre",
  "Quasar", "Quiescence", "Quill", "Ragnarok", "Rapture", "Regent", "Reliquary", "Requiem", "Rexus", "Rime",
  "Riven", "Rune", "Sable", "Saga", "Scepter", "Scroll", "Scutum", "Sentinel", "Sepulchre", "Shard",
  "Silentium", "Skjold", "Skofnung", "Skoll", "Sol", "Solstice", "Sovereign", "Stratum", "Stygian", "Styx",
  "Suzerain", "Sylvan", "Targe", "Tempest", "Terra", "Thane", "Thralldom", "Threnody", "Throne", "Tidal",
  "Titan", "Token", "Tribune", "Triton", "Tryst", "Ulfr", "Umbra", "Vail", "Veil", "Vellum",
  "Veridian", "Vestige", "Vexillum", "Victor", "Vigil", "Vindex", "Visage", "Viscount", "Vorpal", "Vortex",
  "Warlord", "Weal", "Whisper", "Wisp", "Woad", "Wyrd", "Wyrm", "Zeitgeist", "Zenith", "Zephyr"
];

// Update the generator structure
shieldGen.filters = {
  "format": {
    "label": "Name Format",
    "options": [
      "the_name_shield",
      "shield_of_the_name",
      "name_protector_of_name"
    ],
    "optionLabels": {
      "the_name_shield": "The [name] Shield",
      "shield_of_the_name": "The Shield of the [name]",
      "name_protector_of_name": "[name], Protector of [name]"
    }
  }
};

// Store base names and protector names separately
shieldGen.data = {
  "baseNames": baseNames,
  "protectorOfNames": protectorOfNames
};

// Update description
shieldGen.description = "Generate powerful and legendary shield names in multiple formats. Choose from 'The [name] Shield', 'The Shield of the [name]', or '[name], Protector of [name]' formats.";

// Update article to mention the formats
shieldGen.article.intro = "Shield names carry the weight of legend, protection, and honor. From the mythical Aegis of Zeus to the legendary shields of fantasy heroes, a well-chosen shield name can define a character's identity and tell stories of battles won and lives protected. Our **Shield Name Generator** creates powerful shield names in three distinct formats: 'The [name] Shield', 'The Shield of the [name]', and '[name], Protector of [name]', drawing from mythology, history, and fantasy to create names that resonate with power and protection.";

// Add a section about the different formats
shieldGen.article.sections.splice(1, 0, {
  "heading": "Shield Name Formats",
  "content": "<p>The generator offers three distinct naming formats, each with its own character and feel:</p><ul><li><strong>The [name] Shield:</strong> The classic format, perfect for legendary artifacts. Examples: 'The Aegis Shield', 'The Tempest Shield', 'The Ragnarok Shield'. This format emphasizes the shield's name as its primary identity.</li><li><strong>The Shield of the [name]:</strong> A more formal, possessive format that suggests the shield belongs to or represents something greater. Examples: 'The Shield of the Aegis', 'The Shield of the Tempest', 'The Shield of the Crown'. This format works well for shields with strong associations to places, concepts, or entities.</li><li><strong>[name], Protector of [name]:</strong> A descriptive format that tells a story of what the shield protects. Examples: 'Aegis, Protector of Olympus', 'Tempest, Protector of the Realm', 'Sentinel, Protector of the Crown'. This format emphasizes the shield's protective role and creates narrative depth.</li></ul><p>Each format has its own strengths: 'The [name] Shield' is direct and memorable, 'The Shield of the [name]' suggests heritage and belonging, and '[name], Protector of [name]' tells a story of purpose and protection.</p>"
});

// Write the updated data back
fs.writeFileSync(objectsFile, JSON.stringify(objectsData, null, 2));

console.log('✅ Successfully updated Shield Name Generator with format variations!');
console.log(`📊 Base names: ${baseNames.length}`);
console.log(`📊 Protector names: ${protectorOfNames.length}`);
console.log(`\n📋 Format options:`);
console.log(`   1. The [name] Shield`);
console.log(`   2. The Shield of the [name]`);
console.log(`   3. [name], Protector of [name]`);

