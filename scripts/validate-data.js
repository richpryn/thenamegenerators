#!/usr/bin/env node

/**
 * Validate Data Script
 * Validates all JSON files for required fields and data quality
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

let errors = [];
let warnings = [];
let validCount = 0;

/**
 * Count names in a data structure recursively
 */
function countNames(data) {
  if (Array.isArray(data)) {
    return data.length;
  }
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).reduce((sum, val) => sum + countNames(val), 0);
  }
  return 0;
}

/**
 * Validate a single category file
 */
function validateCategory(categorySlug, categoryData) {
  const issues = [];

  // Validate categoryInfo
  if (!categoryData.categoryInfo) {
    issues.push({ type: 'error', message: 'Missing categoryInfo' });
    return issues;
  }

  const info = categoryData.categoryInfo;
  const requiredFields = ['name', 'slug', 'icon', 'description', 'seoDescription', 'navLabel'];
  for (const field of requiredFields) {
    if (!info[field]) {
      issues.push({ type: 'error', message: `categoryInfo missing required field: ${field}` });
    }
  }

  if (info.slug !== categorySlug) {
    issues.push({ type: 'warning', message: `categoryInfo.slug (${info.slug}) doesn't match filename (${categorySlug})` });
  }

  // Validate generators
  if (!categoryData.generators || Object.keys(categoryData.generators).length === 0) {
    issues.push({ type: 'warning', message: 'No generators found in category' });
    return issues;
  }

  const seenSlugs = new Set();

  for (const [generatorKey, generator] of Object.entries(categoryData.generators)) {
    // Required fields
    const requiredGenFields = ['title', 'slug', 'description', 'seoKeywords', 'icon', 'data', 'article'];
    for (const field of requiredGenFields) {
      if (!generator[field]) {
        issues.push({ 
          type: 'error', 
          message: `Generator '${generatorKey}' missing required field: ${field}` 
        });
      }
    }

    // Check for duplicate slugs
    if (generator.slug) {
      if (seenSlugs.has(generator.slug)) {
        issues.push({ 
          type: 'error', 
          message: `Duplicate slug found: ${generator.slug}` 
        });
      }
      seenSlugs.add(generator.slug);
    }

    // Validate SEO fields
    if (generator.seoKeywords && generator.seoKeywords.trim() === '') {
      issues.push({ 
        type: 'warning', 
        message: `Generator '${generatorKey}' has empty seoKeywords` 
      });
    }

    // Validate data structure and count names
    if (generator.data) {
      const nameCount = countNames(generator.data);
      if (nameCount < 100) {
        issues.push({ 
          type: 'warning', 
          message: `Generator '${generatorKey}' has only ${nameCount} names (minimum recommended: 100)` 
        });
      }
      if (nameCount === 0) {
        issues.push({ 
          type: 'error', 
          message: `Generator '${generatorKey}' has no names in data` 
        });
      }
    }

    // Validate filters structure if present
    if (generator.filters) {
      for (const [filterKey, filter] of Object.entries(generator.filters)) {
        if (!filter.label || !filter.options || !Array.isArray(filter.options)) {
          issues.push({ 
            type: 'error', 
            message: `Generator '${generatorKey}' has invalid filter structure for '${filterKey}'` 
          });
        }
        if (filter.options && filter.options.length === 0) {
          issues.push({ 
            type: 'error', 
            message: `Generator '${generatorKey}' filter '${filterKey}' has no options` 
          });
        }
      }
    }

    // Validate article structure
    if (generator.article) {
      if (!generator.article.hero || !generator.article.hero.title || !generator.article.hero.tagline) {
        issues.push({ 
          type: 'error', 
          message: `Generator '${generatorKey}' article.hero missing required fields` 
        });
      }
      if (!generator.article.intro) {
        issues.push({ 
          type: 'warning', 
          message: `Generator '${generatorKey}' article missing intro` 
        });
      }
    }

    // Validate related generators (check if they exist)
    if (generator.relatedGenerators) {
      if (!Array.isArray(generator.relatedGenerators)) {
        issues.push({ 
          type: 'error', 
          message: `Generator '${generatorKey}' relatedGenerators must be an array` 
        });
      }
    }

    // Validate popular flag
    if (generator.isPopular && !generator.popularRank) {
      issues.push({ 
        type: 'warning', 
        message: `Generator '${generatorKey}' is marked popular but has no popularRank` 
      });
    }
  }

  return issues;
}

/**
 * Main validation function
 */
function validate() {
  console.log('🔍 Validating JSON data files...\n');

  if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ Data directory not found:', DATA_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('⚠️  No JSON files found in data directory');
    return;
  }

  for (const file of files) {
    const categorySlug = path.basename(file, '.json');
    const filePath = path.join(DATA_DIR, file);

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const issues = validateCategory(categorySlug, data);

      if (issues.length === 0) {
        console.log(`✅ ${categorySlug}.json - Valid`);
        validCount++;
      } else {
        console.log(`\n📄 ${categorySlug}.json:`);
        
        for (const issue of issues) {
          if (issue.type === 'error') {
            console.log(`  ❌ Error: ${issue.message}`);
            errors.push({ file: categorySlug, ...issue });
          } else {
            console.log(`  ⚠️  Warning: ${issue.message}`);
            warnings.push({ file: categorySlug, ...issue });
          }
        }
      }
    } catch (e) {
      console.log(`\n📄 ${categorySlug}.json:`);
      console.log(`  ❌ Error: ${e.message}`);
      errors.push({ file: categorySlug, type: 'error', message: e.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ ${validCount} file(s) valid`);
  console.log(`⚠️  ${warnings.length} warning(s)`);
  console.log(`❌ ${errors.length} error(s)`);

  if (errors.length > 0) {
    console.log('\n❌ Validation failed. Please fix errors before building pages.');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Validation passed with warnings.');
    process.exit(0);
  } else {
    console.log('\n✨ All files valid!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  validate();
}

module.exports = { validate, validateCategory };


