#!/usr/bin/env node
/**
 * Script to add ALL vampire names from the user's JSON query
 * This script processes the complete JSON structure and updates people.json
 * 
 * Usage:
 *   node scripts/add-all-vampire-names.js [path-to-json-file]
 *   OR
 *   cat your-vampire-data.json | node scripts/add-all-vampire-names.js
 */

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

// Read JSON data
const args = process.argv.slice(2);
let jsonData;

if (args.length > 0) {
  // Read from file
  const filePath = args[0];
  if (fs.existsSync(filePath)) {
    jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    console.error('Error: File not found:', filePath);
    process.exit(1);
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
      jsonData = JSON.parse(input);
      processData(jsonData);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      process.exit(1);
    }
  });
  return; // Exit early, will process when stdin ends
}

// Process the data
processData(jsonData);

function processData(data) {
  const collection = data.Vampire_Names_Collection || data;
  
  const maleNames = collection.Male_Vampire_Names || [];
  const femaleNames = collection.Female_Vampire_Names || [];
  const nonBinaryNames = collection.Non_Binary_Vampire_Names || [];

  console.log(`\n📊 Processing vampire names...`);
  console.log(`Total Male Names: ${maleNames.length}`);
  console.log(`Total Female Names: ${femaleNames.length}`);
  console.log(`Total Non-Binary Names: ${nonBinaryNames.length}`);

  // Extract unique first names
  const maleFirstNames = [...new Set(maleNames.map(getFirstName))];
  const femaleFirstNames = [...new Set(femaleNames.map(getFirstName))];
  const nonBinaryFirstNames = [...new Set(nonBinaryNames.map(getFirstName))];

  console.log(`\n📈 Unique First Names:`);
  console.log(`- Male: ${maleFirstNames.length} unique first names`);
  console.log(`- Female: ${femaleFirstNames.length} unique first names`);
  console.log(`- Non-Binary: ${nonBinaryFirstNames.length} unique first names`);

  // Update people.json
  const peopleFile = path.join(__dirname, '../data/people.json');
  const peopleData = JSON.parse(fs.readFileSync(peopleFile, 'utf8'));

  if (!peopleData.generators.vampire) {
    console.error('❌ Vampire generator not found in people.json');
    console.error('Please run scripts/create-vampire-generator-full.js first to create the generator structure.');
    process.exit(1);
  }

  // Update the data
  peopleData.generators.vampire.data = {
    male: maleNames,
    female: femaleNames,
    non_binary: nonBinaryNames
  };
  
  fs.writeFileSync(peopleFile, JSON.stringify(peopleData, null, 2));
  
  console.log('\n✅ Successfully updated vampire generator with all names!');
  console.log(`\n📋 Final Summary:`);
  console.log(`- Male names: ${maleNames.length} total, ${maleFirstNames.length} unique first names`);
  console.log(`- Female names: ${femaleNames.length} total, ${femaleFirstNames.length} unique first names`);
  console.log(`- Non-binary names: ${nonBinaryNames.length} total, ${nonBinaryFirstNames.length} unique first names`);
  console.log(`\n✨ The generator is now ready with all names and first name repetition prevention!`);
}
