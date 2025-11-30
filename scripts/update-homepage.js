#!/usr/bin/env node

/**
 * Update Homepage Script
 * Updates category counts and popular generators on homepage
 */

const fs = require('fs');
const path = require('path');
const { loadAllCategories } = require('./build-pages');

const HOMEPAGE_PATH = path.join(__dirname, '../index.html');

/**
 * Count generators in a category
 */
function countGenerators(category) {
  return Object.keys(category.generators || {}).length;
}

/**
 * Get all popular generators sorted by rank
 */
function getPopularGenerators(categories) {
  const popular = [];

  for (const [categorySlug, category] of Object.entries(categories)) {
    for (const [generatorKey, generator] of Object.entries(category.generators || {})) {
      if (generator.isPopular) {
        popular.push({
          ...generator,
          categorySlug,
          categoryName: category.categoryInfo.name,
          categoryIcon: category.categoryInfo.icon,
          generatorKey
        });
      }
    }
  }

  return popular.sort((a, b) => (a.popularRank || 999) - (b.popularRank || 999));
}

/**
 * Update homepage HTML
 */
function updateHomepage() {
  console.log('🔄 Updating homepage...\n');

  if (!fs.existsSync(HOMEPAGE_PATH)) {
    console.log('⚠️  Homepage not found. Creating template...');
    // We'll create it in the main index.html file
    return;
  }

  const categories = loadAllCategories();
  const categoryCounts = {};
  const popularGenerators = getPopularGenerators(categories);

  // Count generators per category
  for (const [categorySlug, category] of Object.entries(categories)) {
    categoryCounts[categorySlug] = countGenerators(category);
  }

  // Read homepage
  let homepage = fs.readFileSync(HOMEPAGE_PATH, 'utf8');

  // Update category counts (if data-category attributes exist)
  for (const [categorySlug, count] of Object.entries(categoryCounts)) {
    const regex = new RegExp(
      `(<div[^>]*data-category=["']${categorySlug}["'][^>]*>)[^<]*(</div>)`,
      'gi'
    );
    homepage = homepage.replace(regex, `$1${count} Generator${count !== 1 ? 's' : ''}$2`);
  }

  // Update total count if exists
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  homepage = homepage.replace(
    /(\d+)\s+Generators/g,
    `${totalCount} Generators`
  );

  // Generate popular generators HTML
  const popularHTML = popularGenerators.slice(0, 20).map(gen => `
    <a href="posts/${gen.slug}.html" class="popular-generator-card">
      <span class="generator-icon">${gen.icon}</span>
      <div class="generator-info">
        <h3>${gen.title}</h3>
        <p>${gen.description}</p>
        <span class="category-badge">${gen.categoryIcon} ${gen.categoryName}</span>
      </div>
    </a>
  `).join('\n    ');

  // Replace popular generators section if placeholder exists
  if (homepage.includes('<!-- POPULAR_GENERATORS -->')) {
    homepage = homepage.replace(
      '<!-- POPULAR_GENERATORS -->',
      popularHTML
    );
  } else if (homepage.includes('id="popular-generators"')) {
    // Try to replace content inside popular-generators div
    homepage = homepage.replace(
      /(<div[^>]*id=["']popular-generators["'][^>]*>)[\s\S]*?(<\/div>)/,
      `$1\n    ${popularHTML}\n    $2`
    );
  }

  // Generate category dropdown HTML
  const categoryDropdownHTML = Object.values(categories).map(cat => {
    const catInfo = cat.categoryInfo;
    return `<a href="categories/${catInfo.slug}-names.html">${catInfo.icon} ${catInfo.navLabel}</a>`;
  }).join('\n        ');

  // Replace category dropdown if placeholder exists
  if (homepage.includes('<!-- CATEGORY_DROPDOWN -->')) {
    homepage = homepage.replace(
      '<!-- CATEGORY_DROPDOWN -->',
      categoryDropdownHTML
    );
  }

  // Write updated homepage
  fs.writeFileSync(HOMEPAGE_PATH, homepage);
  console.log(`✅ Updated category counts (${Object.keys(categoryCounts).length} categories)`);
  console.log(`✅ Updated popular generators (${popularGenerators.length} total, showing top 20)`);
  console.log(`✅ Updated category dropdown`);
  console.log(`\n✨ Homepage updated successfully!`);
}

// Run if called directly
if (require.main === module) {
  updateHomepage();
}

module.exports = { updateHomepage, getPopularGenerators };


