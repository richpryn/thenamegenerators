const fs = require('fs');

// Read the text files
const firstNamesContent = fs.readFileSync('/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators/Name txt files/database_dwarf_first_names.txt', 'utf8');
const surnamesContent = fs.readFileSync('/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators/Name txt files/database_dwarf_surnames.txt', 'utf8');

function extractNames(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return [];
  
  let endIdx = text.indexOf(endMarker, startIdx);
  if (endIdx === -1) endIdx = text.length;
  
  const section = text.substring(startIdx, endIdx);
  const names = [];
  
  // Find the line after the header (skip the "Strong, martial..." description line)
  const lines = section.split('\n');
  let collecting = false;
  
  for (const line of lines) {
    // Skip header and description lines
    if (line.includes('════') || line.includes('TOTAL:') || line.trim() === '') {
      continue;
    }
    if (line.includes(startMarker.split('(')[0])) {
      collecting = true;
      continue;
    }
    if (!collecting) continue;
    
    // Split by comma and extract names
    const parts = line.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed && trimmed.length >= 2) {
        // Check if it's a valid name (starts with capital, mostly letters)
        if (/^[A-Z][a-zA-Z'-]+$/.test(trimmed)) {
          names.push(trimmed);
        }
      }
    }
  }
  
  return names.filter((name, idx, arr) => arr.indexOf(name) === idx); // Remove duplicates
}

// Extract first names
const mountainMale = extractNames(firstNamesContent, 'MOUNTAIN DWARF MALE NAMES', 'MOUNTAIN DWARF FEMALE');
const mountainFemale = extractNames(firstNamesContent, 'MOUNTAIN DWARF FEMALE NAMES', 'MOUNTAIN DWARF NON-BINARY');
const mountainNeutral = extractNames(firstNamesContent, 'MOUNTAIN DWARF NON-BINARY/NEUTRAL NAMES', 'HILL DWARF MALE');
const hillMale = extractNames(firstNamesContent, 'HILL DWARF MALE NAMES', 'HILL DWARF FEMALE');
const hillFemale = extractNames(firstNamesContent, 'HILL DWARF FEMALE NAMES', 'HILL DWARF NON-BINARY');
const hillNeutral = extractNames(firstNamesContent, 'HILL DWARF NON-BINARY/NEUTRAL NAMES', 'USAGE NOTES');

// Extract surnames
const surnamesClan = extractNames(surnamesContent, 'CLAN/FAMILY NAMES', 'CRAFT-BASED');
const surnamesCraft = extractNames(surnamesContent, 'CRAFT-BASED SURNAMES', 'DEED-BASED');
const surnamesDeed = extractNames(surnamesContent, 'DEED-BASED SURNAMES', 'DESCRIPTIVE');
const surnamesDesc = extractNames(surnamesContent, 'DESCRIPTIVE SURNAMES', 'USAGE BY');

const allSurnames = [...surnamesClan, ...surnamesCraft, ...surnamesDeed, ...surnamesDesc]
  .filter((name, idx, arr) => arr.indexOf(name) === idx);

console.log(JSON.stringify({
  mountain_male: mountainMale,
  mountain_female: mountainFemale,
  mountain_neutral: mountainNeutral,
  hill_male: hillMale,
  hill_female: hillFemale,
  hill_neutral: hillNeutral,
  surnames: allSurnames
}, null, 2));


