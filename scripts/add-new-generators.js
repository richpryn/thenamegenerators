#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse company names
function parseCompanyNames() {
  const file = '/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators/Name txt files/company_names_generator.txt';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const categories = {
    single_word: [],
    portmanteau: [],
    trendy_suffix: [],
    invented: [],
    combinations: []
  };
  
  let currentCategory = null;
  let inCategory = false;
  
  lines.forEach((line, idx) => {
    line = line.trim();
    if (!line) return;
    
    // Detect category headers
    if (line.includes('CATEGORY 1: SINGLE WORD')) {
      currentCategory = 'single_word';
      inCategory = true;
      return;
    }
    if (line.includes('CATEGORY 2: PORTMANTEAU')) {
      currentCategory = 'portmanteau';
      inCategory = true;
      return;
    }
    if (line.includes('CATEGORY 3: TRENDY SUFFIX')) {
      currentCategory = 'trendy_suffix';
      inCategory = true;
      return;
    }
    if (line.includes('CATEGORY 4: MADE-UP')) {
      currentCategory = 'invented';
      inCategory = true;
      return;
    }
    if (line.includes('CATEGORY 5: SHORT MEMORABLE')) {
      currentCategory = 'combinations';
      inCategory = true;
      return;
    }
    
    // Stop at next major section
    if (line.includes('CATEGORY') && inCategory) {
      inCategory = false;
      return;
    }
    if (line.includes('TOTAL:') || line.includes('SUMMARY')) {
      inCategory = false;
      return;
    }
    
    // Skip headers and separators
    if (line.includes('═') || line.includes('WITH -') || line.includes('Strong, memorable') || 
        line.includes('Clever combinations') || line.includes('Modern naming') || 
        line.includes('Pronounceable invented')) {
      return;
    }
    
    // Extract names (format: "1. Name" or just "Name")
    if (inCategory && currentCategory) {
      const match = line.match(/^\d+\.\s*(.+)$/);
      if (match) {
        const name = match[1].trim();
        if (name && !name.includes('CATEGORY') && !name.includes('WITH')) {
          categories[currentCategory].push(name);
        }
      } else if (line && !line.match(/^\d+$/) && !line.includes('═') && 
                 !line.includes('CATEGORY') && line.length > 1) {
        // Some lines might not have numbers
        categories[currentCategory].push(line);
      }
    }
  });
  
  // Flatten trendy_suffix subcategories
  // The file has subcategories but we'll combine them all
  return categories;
}

// Parse fantasy city names
function parseFantasyCityNames() {
  const file = '/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators/Name txt files/fantasy_city_names.txt';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const names = [];
  
  lines.forEach(line => {
    line = line.trim();
    if (!line || line.includes('FANTASY CITY NAMES') || line.includes('─')) return;
    
    // Format: "1. Name" or "Name"
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      names.push(match[1].trim());
    }
  });
  
  return names;
}

// Main execution
const companyData = parseCompanyNames();
const cityNames = parseFantasyCityNames();

console.log('Company names parsed:');
console.log('  Single word:', companyData.single_word.length);
console.log('  Portmanteau:', companyData.portmanteau.length);
console.log('  Trendy suffix:', companyData.trendy_suffix.length);
console.log('  Invented:', companyData.invented.length);
console.log('  Combinations:', companyData.combinations.length);
console.log('\nFantasy city names:', cityNames.length);

// Write parsed data to temp files for inspection
fs.writeFileSync('/tmp/company_parsed.json', JSON.stringify(companyData, null, 2));
fs.writeFileSync('/tmp/city_parsed.json', JSON.stringify(cityNames.slice(0, 50), null, 2));

console.log('\nParsed data written to /tmp/company_parsed.json and /tmp/city_parsed.json');

