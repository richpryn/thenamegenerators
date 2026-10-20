#!/usr/bin/env node

/**
 * Validate Data Script
 * Checks content/ for missing fields, broken recipes and thin name lists.
 * The build runs the same checks and stops on errors.
 */

const { loadContent, validate } = require('./content');

const content = loadContent();
const { errors, warnings } = validate(content);

console.log(`🔍 Checked ${Object.keys(content.generators).length} generators in ${content.categories.length} categories\n`);
warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
errors.forEach((e) => console.log(`  ❌ ${e}`));
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
