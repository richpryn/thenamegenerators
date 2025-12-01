#!/usr/bin/env node
// Script to process the full JSON from user's query and update people.json
// This script reads the full JSON structure and adds all names

const fs = require('fs');
const path = require('path');

// Read the full JSON from the user's query
// The user provided the complete JSON structure, so we'll process it directly
// Since it's very large, we'll read it from a file or stdin

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
  return;
}

// Process the data
processData(jsonData);

function processData(data) {
  const collection = data.Vampire_Names_Collection || data;
  
  const maleNames = collection.Male_Vampire_Names || [];
  const femaleNames = collection.Female_Vampire_Names || [];
  const nonBinaryNames = collection.Non_Binary_Vampire_Names || [];

  console.log(`Total Male Names: ${maleNames.length}`);
  console.log(`Total Female Names: ${femaleNames.length}`);
  console.log(`Total Non-Binary Names: ${nonBinaryNames.length}`);

  // Helper to extract first name
  function getFirstName(fullName) {
    const parts = fullName.split(' ');
    if (parts.length >= 2 && ['Van', 'de', 'von'].includes(parts[1])) {
      return parts[0];
    }
    return parts[0];
  }

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
    console.log('\n✅ Updated vampire generator with all names');
    console.log(`\nSummary:`);
    console.log(`- Male names: ${maleNames.length} total, ${maleFirstNames.length} unique first names`);
    console.log(`- Female names: ${femaleNames.length} total, ${femaleFirstNames.length} unique first names`);
    console.log(`- Non-binary names: ${nonBinaryNames.length} total, ${nonBinaryFirstNames.length} unique first names`);
  } else {
    console.log('❌ Vampire generator not found in people.json');
  }
}
