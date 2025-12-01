#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to extract first name
function getFirstName(fullName) {
  const parts = fullName.split(' ');
  if (parts.length >= 2 && ['Van', 'de', 'von'].includes(parts[1])) {
    return parts[0];
  }
  return parts[0];
}

// Full JSON data from user's query - ALL names included
// This includes the complete JSON structure the user provided
const fullVampireData = require('./vampire-complete-data.json');

function processData() {
  const collection = fullVampireData.Vampire_Names_Collection || fullVampireData;
  const maleNames = collection.Male_Vampire_Names || [];
  const femaleNames = collection.Female_Vampire_Names || [];
  const nonBinaryNames = collection.Non_Binary_Vampire_Names || [];

  console.log(`Processing vampire names...`);
  console.log(`Male: ${maleNames.length}, Female: ${femaleNames.length}, Non-Binary: ${nonBinaryNames.length}`);

  // Extract unique first names
  const maleFirstNames = [...new Set(maleNames.map(getFirstName))];
  const femaleFirstNames = [...new Set(femaleNames.map(getFirstName))];
  const nonBinaryFirstNames = [...new Set(nonBinaryNames.map(getFirstName))];

  console.log(`Unique Male First Names: ${maleFirstNames.length}`);
  console.log(`Unique Female First Names: ${femaleFirstNames.length}`);
  console.log(`Unique Non-Binary First Names: ${nonBinaryFirstNames.length}`);

  // Update people.json
  const peopleFile = path.join(__dirname, '../data/people.json');
  const peopleData = JSON.parse(fs.readFileSync(peopleFile, 'utf8'));

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
  } else {
    console.log('❌ Vampire generator not found in people.json');
  }
}

// Run if data file exists
try {
  processData();
} catch (e) {
  console.error('Error:', e.message);
  console.log('\nPlease create scripts/vampire-complete-data.json with the full JSON data from the user\'s query');
  process.exit(1);
}
