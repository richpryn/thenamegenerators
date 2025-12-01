/**
 * Core Name Generator Library
 * Handles all name generation logic from JSON data
 */

class NameGenerator {
  constructor() {
    this.data = null;
    this.currentCategory = null;
    this.currentGenerator = null;
    // Determine base path for data files
    this.basePath = this.getBasePath();
    
    // Track shuffled name pools and current indices to prevent repetition
    // Key format: "categorySlug:generatorKey:filterKey1:filterValue1:filterKey2:filterValue2..."
    this.namePools = new Map(); // Stores shuffled arrays
    this.nameIndices = new Map(); // Stores current index in shuffled array
    
    // Check if running from file:// protocol and warn
    if (window.location.protocol === 'file:') {
      // Only show file:// warnings in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        console.error('⚠️ WARNING: This page is being opened via file:// protocol.');
        console.error('⚠️ Fetch API does not work with file:// for security reasons.');
        console.error('⚠️ Please use a web server instead:');
        console.error('⚠️   1. Run: python3 -m http.server 8000');
        console.error('⚠️   2. Open: http://localhost:8000/posts/dwarf-name-generator.html');
      }
      alert('⚠️ ERROR: This page must be accessed through a web server, not by opening the file directly.\n\nPlease:\n1. Run: python3 -m http.server 8000\n2. Open: http://localhost:8000/posts/dwarf-name-generator.html');
    }
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Create a unique key for a generator/filter combination
   * @param {string} categorySlug - The category slug
   * @param {string} generatorKey - The generator key
   * @param {Object} filters - Filter object
   * @returns {string} Unique key
   */
  createPoolKey(categorySlug, generatorKey, filters) {
    const filterParts = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join(':');
    return `${categorySlug}:${generatorKey}:${filterParts || 'no-filters'}`;
  }

  /**
   * Get the correct base path for data files
   * Always use absolute path from root for maximum reliability
   */
  getBasePath() {
    // Use absolute path from root - works from any page location
    return '/data/';
  }

  /**
   * Load category data from JSON
   * @param {string} categorySlug - The category slug (e.g., 'fantasy')
   * @returns {Promise<Object>} Category data
   */
  async loadCategory(categorySlug) {
    try {
      // Try absolute path first
      let dataPath = `/data/${categorySlug}.json`;
      let response = await fetch(dataPath, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });
      
      // If absolute path fails, try relative paths based on current location
      if (!response.ok) {
        const pathname = window.location.pathname;
        if (pathname.includes('/posts/') || pathname.includes('/categories/')) {
          dataPath = `../data/${categorySlug}.json`;
        } else {
          dataPath = `data/${categorySlug}.json`;
        }
        response = await fetch(dataPath, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-cache'
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load category: ${categorySlug} (HTTP ${response.status})`);
      }
      
      this.data = await response.json();
      this.currentCategory = categorySlug;
      return this.data;
    } catch (error) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error(`Error loading category '${categorySlug}':`, error);
        console.error(`Attempted path: /data/${categorySlug}.json`);
        console.error(`Current location: ${window.location.href}`);
      }
      throw error;
    }
  }

  /**
   * Get all available categories
   * @returns {Promise<Array>} Array of category info objects
   */
  async getCategories() {
    // This will be populated by build script or fetched from a manifest
    // For now, we'll try to detect available categories
    const categories = [];
    const categorySlugs = ['fantasy', 'folklore', 'pop_culture', 'places', 'people', 'objects', 'music', 'organizations', 'events', 'concepts'];
    
    for (const slug of categorySlugs) {
      try {
        // Try absolute path first
        let response = await fetch(`/data/${slug}.json`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-cache'
        });
        
        // If that fails, try relative path
        if (!response.ok) {
          const pathname = window.location.pathname;
          const relPath = (pathname.includes('/posts/') || pathname.includes('/categories/')) 
            ? `../data/${slug}.json` 
            : `data/${slug}.json`;
          response = await fetch(relPath, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-cache'
          });
        }
        
        if (response.ok) {
          const data = await response.json();
          categories.push(data.categoryInfo);
        }
      } catch (e) {
        // Category doesn't exist yet, skip silently
        console.debug(`Category ${slug} not available:`, e.message);
      }
    }
    
    return categories;
  }

  /**
   * Get all generators for a category
   * @param {string} categorySlug - The category slug
   * @returns {Promise<Object>} Generators object
   */
  async getGenerators(categorySlug) {
    if (!this.data || this.currentCategory !== categorySlug) {
      await this.loadCategory(categorySlug);
    }
    return this.data.generators;
  }

  /**
   * Get a specific generator
   * @param {string} categorySlug - The category slug
   * @param {string} generatorKey - The generator key (e.g., 'elf')
   * @returns {Promise<Object>} Generator object
   */
  async getGenerator(categorySlug, generatorKey) {
    if (!this.data || this.currentCategory !== categorySlug) {
      await this.loadCategory(categorySlug);
    }
    return this.data.generators[generatorKey];
  }

  /**
   * Generate a random name based on filters
   * @param {string} categorySlug - The category slug
   * @param {string} generatorKey - The generator key
   * @param {Object} filters - Filter object (e.g., {gender: 'male', origin: 'tolkien'})
   * @param {number} count - Number of names to generate
   * @returns {Promise<Array>} Array of generated names
   */
  async generateNames(categorySlug, generatorKey, filters = {}, count = 10) {
    const generator = await this.getGenerator(categorySlug, generatorKey);
    if (!generator) {
      throw new Error(`Generator not found: ${categorySlug}/${generatorKey}`);
    }

    // Special handling for Funny Wizard generator - avoid similar sounding names
    if (generatorKey === 'funny_wizard') {
      // Extract the main name part (first word, before "the" if present)
      const getMainName = (fullName) => {
        let name = fullName.toLowerCase().trim();
        // Remove "the" and everything after it
        const theIndex = name.indexOf(' the ');
        if (theIndex > 0) {
          name = name.substring(0, theIndex);
        }
        // Get first word
        const firstWord = name.split(/\s+/)[0] || name;
        return firstWord;
      };
      
      // Extract sound pattern from a name (first 3-4 characters)
      const getSoundPattern = (fullName) => {
        const mainName = getMainName(fullName);
        // Get first 4 characters as the sound pattern
        return mainName.substring(0, 4);
      };
      
      // Check if two names sound similar
      const namesSoundSimilar = (name1, name2) => {
        const pattern1 = getSoundPattern(name1);
        const pattern2 = getSoundPattern(name2);
        
        // If patterns are too short, skip comparison
        if (pattern1.length < 3 || pattern2.length < 3) {
          return false;
        }
        
        // Check if first 3 characters match (catches wizz/wibb/wobb, fizz/fidd, etc.)
        const prefix1 = pattern1.substring(0, 3);
        const prefix2 = pattern2.substring(0, 3);
        if (prefix1 === prefix2) {
          return true;
        }
        
        // Check for similar funny wizard patterns (wizzle/wibble/wobble are all similar)
        const main1 = getMainName(name1);
        const main2 = getMainName(name2);
        
        // Check for wizz/wibb/wobb pattern similarity
        if ((main1.startsWith('wizz') || main1.startsWith('wibb') || main1.startsWith('wobb')) &&
            (main2.startsWith('wizz') || main2.startsWith('wibb') || main2.startsWith('wobb'))) {
          return true;
        }
        
        // Check for fizz/fidd pattern similarity
        if ((main1.startsWith('fizz') || main1.startsWith('fidd')) &&
            (main2.startsWith('fizz') || main2.startsWith('fidd'))) {
          return true;
        }
        
        // Check for pudd/pidd pattern similarity
        if ((main1.startsWith('pudd') || main1.startsWith('pidd')) &&
            (main2.startsWith('pudd') || main2.startsWith('pidd'))) {
          return true;
        }
        
        // Check for mumb/dumb pattern similarity
        if ((main1.startsWith('mumb') || main1.startsWith('dumb')) &&
            (main2.startsWith('mumb') || main2.startsWith('dumb'))) {
          return true;
        }
        
        // Check for squizz/squibbl pattern similarity
        if ((main1.startsWith('squizz') || main1.startsWith('squibbl')) &&
            (main2.startsWith('squizz') || main2.startsWith('squibbl'))) {
          return true;
        }
        
        // Check for wobbl/wibbl pattern similarity
        if ((main1.startsWith('wobbl') || main1.startsWith('wibbl')) &&
            (main2.startsWith('wobbl') || main2.startsWith('wibbl'))) {
          return true;
        }
        
        return false;
      };
      
      const namePool = generator.data;
      if (!Array.isArray(namePool) || namePool.length === 0) {
        throw new Error('Invalid data structure for Funny Wizard generator');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pool
      let shuffledPool = this.namePools.get(poolKey);
      let currentIndex = this.nameIndices.get(poolKey) || 0;
      
      if (!shuffledPool || currentIndex >= shuffledPool.length) {
        shuffledPool = this.shuffleArray([...namePool]);
        this.namePools.set(poolKey, shuffledPool);
        currentIndex = 0;
      }
      
      // Generate names with similarity avoidance
      const results = [];
      const usedNames = [];
      let attempts = 0;
      const maxAttempts = shuffledPool.length * 3; // More attempts for similarity checking
      
      while (results.length < count && attempts < maxAttempts) {
        // If we've exhausted the pool, reshuffle and reset
        if (currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...namePool]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
          usedNames.length = 0; // Clear used names
        }
        
        const candidate = shuffledPool[currentIndex];
        
        // Check if this name sounds similar to any already selected name
        let isSimilar = false;
        for (const usedName of usedNames) {
          if (namesSoundSimilar(candidate, usedName)) {
            isSimilar = true;
            break;
          }
        }
        
        if (!isSimilar) {
          results.push(candidate);
          usedNames.push(candidate);
        }
        
        currentIndex++;
        attempts++;
      }
      
      // Update index
      this.nameIndices.set(poolKey, currentIndex);
      
      return results;
    }

    // Special handling for Path of Exile Witch generator - avoid similar names
    if (generatorKey === 'path_of_exile_witch') {
      // Parse names to extract first name and epithet
      const parseName = (fullName) => {
        let firstName, epithet;
        if (fullName.includes(' the ')) {
          const parts = fullName.split(' the ');
          firstName = parts[0].trim();
          epithet = 'the ' + parts[1].trim();
        } else if (fullName.includes(' of the ')) {
          const parts = fullName.split(' of the ');
          firstName = parts[0].trim();
          epithet = 'of the ' + parts[1].trim();
        } else {
          // Assume format is "FirstName Epithet" - split on last space
          const lastSpaceIndex = fullName.lastIndexOf(' ');
          if (lastSpaceIndex > 0) {
            firstName = fullName.substring(0, lastSpaceIndex).trim();
            epithet = fullName.substring(lastSpaceIndex + 1).trim();
          } else {
            firstName = fullName;
            epithet = '';
          }
        }
        return { firstName, epithet };
      };
      
      const namePool = generator.data;
      if (!Array.isArray(namePool) || namePool.length === 0) {
        throw new Error('Invalid data structure for Path of Exile Witch generator');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pool
      let shuffledPool = this.namePools.get(poolKey);
      let currentIndex = this.nameIndices.get(poolKey) || 0;
      
      if (!shuffledPool || currentIndex >= shuffledPool.length) {
        shuffledPool = this.shuffleArray([...namePool]);
        this.namePools.set(poolKey, shuffledPool);
        currentIndex = 0;
      }
      
      // Generate names with similarity avoidance
      const results = [];
      const usedFirstNames = new Set();
      const usedEpithets = new Set();
      let attempts = 0;
      const maxAttempts = shuffledPool.length * 2; // Prevent infinite loops
      
      while (results.length < count && attempts < maxAttempts) {
        // If we've exhausted the pool, reshuffle and reset
        if (currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...namePool]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
          usedFirstNames.clear();
          usedEpithets.clear();
        }
        
        const candidate = shuffledPool[currentIndex];
        const parsed = parseName(candidate);
        
        // Check if this name is too similar to already selected names
        const hasSimilarFirstName = usedFirstNames.has(parsed.firstName);
        const hasSimilarEpithet = parsed.epithet && usedEpithets.has(parsed.epithet);
        
        if (!hasSimilarFirstName && !hasSimilarEpithet) {
          results.push(candidate);
          usedFirstNames.add(parsed.firstName);
          if (parsed.epithet) {
            usedEpithets.add(parsed.epithet);
          }
        }
        
        currentIndex++;
        attempts++;
      }
      
      // Update index
      this.nameIndices.set(poolKey, currentIndex);
      
      return results;
    }

    // Special handling for Clan generator - combine title formats with clan names
    if (generatorKey === 'clan') {
      const type = (filters.type && filters.type.trim()) || 'animal';
      const titles = generator.data.titles || [];
      const clanNames = generator.data[type] || [];
      
      if (!titles || titles.length === 0) {
        throw new Error(`Invalid data structure for clan generator. Titles not found.`);
      }
      if (!clanNames || clanNames.length === 0) {
        throw new Error(`Invalid data structure for clan generator. Clan names not found for type: ${type}`);
      }
      
      // Create unique pool keys for titles and clan names
      const titlePoolKey = `${categorySlug}:${generatorKey}:titles`;
      const namePoolKey = `${categorySlug}:${generatorKey}:names:${type}`;
      
      // Get or create shuffled pools
      let titleShuffled = this.namePools.get(titlePoolKey);
      let titleIndex = this.nameIndices.get(titlePoolKey) || 0;
      let nameShuffled = this.namePools.get(namePoolKey);
      let nameIndex = this.nameIndices.get(namePoolKey) || 0;
      
      // Initialize pools if needed
      if (!titleShuffled || titleIndex >= titleShuffled.length) {
        titleShuffled = this.shuffleArray([...titles]);
        this.namePools.set(titlePoolKey, titleShuffled);
        titleIndex = 0;
      }
      if (!nameShuffled || nameIndex >= nameShuffled.length) {
        nameShuffled = this.shuffleArray([...clanNames]);
        this.namePools.set(namePoolKey, nameShuffled);
        nameIndex = 0;
      }
      
      // Generate combined names
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted titles, reshuffle
        if (titleIndex >= titleShuffled.length) {
          titleShuffled = this.shuffleArray([...titles]);
          this.namePools.set(titlePoolKey, titleShuffled);
          titleIndex = 0;
        }
        // If we've exhausted clan names, reshuffle
        if (nameIndex >= nameShuffled.length) {
          nameShuffled = this.shuffleArray([...clanNames]);
          this.namePools.set(namePoolKey, nameShuffled);
          nameIndex = 0;
        }
        
        const titleFormat = titleShuffled[titleIndex];
        const clanName = nameShuffled[nameIndex];
        
        // Replace [Name] in title format with clan name
        const fullName = String(titleFormat).replace(/\[Name\]/g, String(clanName).trim());
        results.push(fullName);
        
        titleIndex++;
        nameIndex++;
      }
      
      // Update indices
      this.nameIndices.set(titlePoolKey, titleIndex);
      this.nameIndices.set(namePoolKey, nameIndex);
      
      return results;
    }

    // Special handling for D&D fantasy and Elf generators - combine first and last names
    if (generatorKey === 'dnd_fantasy' || generatorKey === 'high_elf' || generatorKey === 'wood_elf' || generatorKey === 'dark_elf') {
      const gender = filters.gender || 'male';
      const genderData = generator.data[gender];
      
      if (!genderData || !genderData.firstNames || !genderData.lastNames) {
        throw new Error(`Invalid data structure for D&D fantasy generator. Gender: ${gender}`);
      }
      
      const firstNames = genderData.firstNames;
      const lastNames = genderData.lastNames;
      
      // Create unique pool keys for first and last names
      const firstPoolKey = `${categorySlug}:${generatorKey}:first:${gender}`;
      const lastPoolKey = `${categorySlug}:${generatorKey}:last:${gender}`;
      
      // Get or create shuffled pools
      let firstShuffled = this.namePools.get(firstPoolKey);
      let firstIndex = this.nameIndices.get(firstPoolKey) || 0;
      let lastShuffled = this.namePools.get(lastPoolKey);
      let lastIndex = this.nameIndices.get(lastPoolKey) || 0;
      
      // Initialize pools if needed
      if (!firstShuffled || firstIndex >= firstShuffled.length) {
        firstShuffled = this.shuffleArray([...firstNames]);
        this.namePools.set(firstPoolKey, firstShuffled);
        firstIndex = 0;
      }
      if (!lastShuffled || lastIndex >= lastShuffled.length) {
        lastShuffled = this.shuffleArray([...lastNames]);
        this.namePools.set(lastPoolKey, lastShuffled);
        lastIndex = 0;
      }
      
      // Generate combined names
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted first names, reshuffle
        if (firstIndex >= firstShuffled.length) {
          firstShuffled = this.shuffleArray([...firstNames]);
          this.namePools.set(firstPoolKey, firstShuffled);
          firstIndex = 0;
        }
        // If we've exhausted last names, reshuffle
        if (lastIndex >= lastShuffled.length) {
          lastShuffled = this.shuffleArray([...lastNames]);
          this.namePools.set(lastPoolKey, lastShuffled);
          lastIndex = 0;
        }
        
        const firstName = firstShuffled[firstIndex];
        const lastName = lastShuffled[lastIndex];
        
        // Combine first and last name
        const fullName = String(firstName).trim() + ' ' + String(lastName).trim();
        results.push(fullName);
        
        firstIndex++;
        lastIndex++;
      }
      
      // Update indices
      this.nameIndices.set(firstPoolKey, firstIndex);
      this.nameIndices.set(lastPoolKey, lastIndex);
      
      return results;
    }

    // Special handling for Blog Name generator - avoid similar names
    if (generatorKey === 'blog') {
      // Extract pattern from blog name (e.g., "The X Edit", "X Stories", "X Life")
      const extractPattern = (name) => {
        const lower = name.toLowerCase().trim();
        
        // Common blog name patterns
        const patterns = [
          { match: /^the (.+) edit$/i, pattern: 'The * Edit' },
          { match: /^the (.+) blog$/i, pattern: 'The * Blog' },
          { match: /^the (.+) diary$/i, pattern: 'The * Diary' },
          { match: /^the (.+) journal$/i, pattern: 'The * Journal' },
          { match: /^the (.+) post$/i, pattern: 'The * Post' },
          { match: /^the (.+) guide$/i, pattern: 'The * Guide' },
          { match: /^the (.+) beat$/i, pattern: 'The * Beat' },
          { match: /^the (.+) view$/i, pattern: 'The * View' },
          { match: /^the (.+) scene$/i, pattern: 'The * Scene' },
          { match: /^the (.+) spot$/i, pattern: 'The * Spot' },
          { match: /^the (.+) place$/i, pattern: 'The * Place' },
          { match: /^the (.+) zone$/i, pattern: 'The * Zone' },
          { match: /^the (.+) space$/i, pattern: 'The * Space' },
          { match: /^the (.+) times$/i, pattern: 'The * Times' },
          { match: /^the (.+) news$/i, pattern: 'The * News' },
          { match: /^the (.+) daily$/i, pattern: 'The * Daily' },
          { match: /^the (.+) update$/i, pattern: 'The * Update' },
          { match: /^the (.+) report$/i, pattern: 'The * Report' },
          { match: /^the (.+) line$/i, pattern: 'The * Line' },
          { match: /^the (.+) word$/i, pattern: 'The * Word' },
          { match: /^the (.+) point$/i, pattern: 'The * Point' },
          { match: /^the (.+) voice$/i, pattern: 'The * Voice' },
          { match: /^the (.+) pulse$/i, pattern: 'The * Pulse' },
          { match: /^the (.+) talk$/i, pattern: 'The * Talk' },
          { match: /^the (.+) stream$/i, pattern: 'The * Stream' },
          { match: /^the (.+) wave$/i, pattern: 'The * Wave' },
          { match: /^the (.+) flow$/i, pattern: 'The * Flow' },
          { match: /^the (.+) path$/i, pattern: 'The * Path' },
          { match: /^the (.+) road$/i, pattern: 'The * Road' },
          { match: /^the (.+) way$/i, pattern: 'The * Way' },
          { match: /^the (.+) trail$/i, pattern: 'The * Trail' },
          { match: /^the (.+) life$/i, pattern: 'The * Life' },
          { match: /^the (.+) blog$/i, pattern: 'The * Blog' },
          { match: /^the (.+)$/i, pattern: 'The *' },
          { match: /^(.+) stories$/i, pattern: '* Stories' },
          { match: /^(.+) life$/i, pattern: '* Life' },
          { match: /^(.+) blog$/i, pattern: '* Blog' },
          { match: /^(.+) daily$/i, pattern: '* Daily' },
          { match: /^(.+) tales$/i, pattern: '* Tales' },
          { match: /^(.+) moments$/i, pattern: '* Moments' },
          { match: /^(.+) thoughts$/i, pattern: '* Thoughts' },
          { match: /^(.+) reflections$/i, pattern: '* Reflections' },
          { match: /^(.+) wisdom$/i, pattern: '* Wisdom' },
          { match: /^(.+) knowledge$/i, pattern: '* Knowledge' },
          { match: /^(.+) learning$/i, pattern: '* Learning' },
          { match: /^(.+) discovery$/i, pattern: '* Discovery' },
          { match: /^(.+) exploration$/i, pattern: '* Exploration' },
          { match: /^(.+) adventures$/i, pattern: '* Adventures' },
          { match: /^(.+) journeys$/i, pattern: '* Journeys' },
          { match: /^(.+) travels$/i, pattern: '* Travels' },
          { match: /^(.+) destinations$/i, pattern: '* Destinations' },
          { match: /^(.+) escapes$/i, pattern: '* Escapes' },
          { match: /^(.+) retreats$/i, pattern: '* Retreats' },
          { match: /^(.+) havens$/i, pattern: '* Havens' },
          { match: /^(.+) sanctuaries$/i, pattern: '* Sanctuaries' },
          { match: /^(.+) paradises$/i, pattern: '* Paradises' },
          { match: /^(.+) getaways$/i, pattern: '* Getaways' },
          { match: /^(.+) experiences$/i, pattern: '* Experiences' },
          { match: /^(.+) lifestyle$/i, pattern: '* Lifestyle' },
          { match: /^(.+) living$/i, pattern: '* Living' },
          { match: /^(.+) life stories$/i, pattern: '* Life Stories' },
          { match: /^(.+) daily life$/i, pattern: '* Daily Life' },
          { match: /^(.+) forward$/i, pattern: '* Forward' },
          { match: /^(.+) essentials$/i, pattern: '* Essentials' },
          { match: /^(.+) must haves$/i, pattern: '* Must Haves' },
          { match: /^(.+) collection$/i, pattern: '* Collection' },
          { match: /^(.+) showcase$/i, pattern: '* Showcase' },
          { match: /^(.+) portfolio$/i, pattern: '* Portfolio' }
        ];
        
        // Try to match a pattern
        for (const { match, pattern } of patterns) {
          if (match.test(name)) {
            return pattern;
          }
        }
        
        // If no pattern matches, use first word as pattern
        const words = lower.split(/\s+/);
        if (words.length > 0) {
          return words[0];
        }
        
        return lower;
      };
      
      // Check if two blog names are similar
      const namesAreSimilar = (name1, name2) => {
        const pattern1 = extractPattern(name1);
        const pattern2 = extractPattern(name2);
        
        // If patterns match exactly, they're similar
        if (pattern1 === pattern2) {
          return true;
        }
        
        // Check if they share the same first word (especially "The")
        const words1 = name1.toLowerCase().split(/\s+/);
        const words2 = name2.toLowerCase().split(/\s+/);
        
        if (words1.length > 0 && words2.length > 0) {
          // If both start with "the", they're similar
          if (words1[0] === 'the' && words2[0] === 'the') {
            // Check if second word matches
            if (words1.length > 1 && words2.length > 1 && words1[1] === words2[1]) {
              return true;
            }
          }
          
          // If first words match, they're similar
          if (words1[0] === words2[0] && words1[0].length > 3) {
            return true;
          }
        }
        
        return false;
      };
      
      // Get the industry filter
      const industry = filters.industry || 'arts_crafts';
      const namePool = generator.data[industry];
      
      if (!Array.isArray(namePool) || namePool.length === 0) {
        throw new Error(`Invalid data structure for Blog generator. Industry: ${industry}`);
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pool
      let shuffledPool = this.namePools.get(poolKey);
      let currentIndex = this.nameIndices.get(poolKey) || 0;
      
      if (!shuffledPool || currentIndex >= shuffledPool.length) {
        shuffledPool = this.shuffleArray([...namePool]);
        this.namePools.set(poolKey, shuffledPool);
        currentIndex = 0;
      }
      
      // Generate names with similarity avoidance
      const results = [];
      const usedNames = [];
      let attempts = 0;
      const maxAttempts = shuffledPool.length * 3;
      
      while (results.length < count && attempts < maxAttempts) {
        // If we've exhausted the pool, reshuffle and reset
        if (currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...namePool]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
          usedNames.length = 0;
        }
        
        const candidate = shuffledPool[currentIndex];
        
        // Check if this name is similar to any already selected name
        let isSimilar = false;
        for (const usedName of usedNames) {
          if (namesAreSimilar(candidate, usedName)) {
            isSimilar = true;
            break;
          }
        }
        
        if (!isSimilar) {
          results.push(candidate);
          usedNames.push(candidate);
        }
        
        currentIndex++;
        attempts++;
      }
      
      // Update index
      this.nameIndices.set(poolKey, currentIndex);
      
      return results;
    }

    // Special handling for Business Name generator - avoid similar words
    if (generatorKey === 'business') {
      // Check if two words are similar (same prefix)
      const wordsAreSimilar = (word1, word2) => {
        const w1 = word1.toLowerCase().trim();
        const w2 = word2.toLowerCase().trim();
        
        // If words are identical, they're similar
        if (w1 === w2) {
          return true;
        }
        
        // Check if they start with the same 3-4 characters (prevents similar-sounding words)
        const prefix1 = w1.substring(0, Math.min(4, w1.length));
        const prefix2 = w2.substring(0, Math.min(4, w2.length));
        
        if (prefix1.length >= 3 && prefix2.length >= 3 && prefix1 === prefix2) {
          return true;
        }
        
        return false;
      };
      
      // Get the category filter
      const category = filters.category || 'aspirational_upward';
      const namePool = generator.data[category];
      
      if (!Array.isArray(namePool) || namePool.length === 0) {
        throw new Error(`Invalid data structure for Business generator. Category: ${category}`);
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pool
      let shuffledPool = this.namePools.get(poolKey);
      let currentIndex = this.nameIndices.get(poolKey) || 0;
      
      if (!shuffledPool || currentIndex >= shuffledPool.length) {
        shuffledPool = this.shuffleArray([...namePool]);
        this.namePools.set(poolKey, shuffledPool);
        currentIndex = 0;
      }
      
      // Generate names with similarity avoidance
      const results = [];
      const usedWords = [];
      let attempts = 0;
      const maxAttempts = shuffledPool.length * 3;
      
      while (results.length < count && attempts < maxAttempts) {
        // If we've exhausted the pool, reshuffle and reset
        if (currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...namePool]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
          usedWords.length = 0;
        }
        
        const candidate = shuffledPool[currentIndex];
        
        // Check if this word is similar to any already selected word
        let isSimilar = false;
        for (const usedWord of usedWords) {
          if (wordsAreSimilar(candidate, usedWord)) {
            isSimilar = true;
            break;
          }
        }
        
        if (!isSimilar) {
          results.push(candidate);
          usedWords.push(candidate);
        }
        
        currentIndex++;
        attempts++;
      }
      
      // Update index
      this.nameIndices.set(poolKey, currentIndex);
      
      return results;
    }

    let namePool = generator.data;
    const appliedFilters = [];

    // Navigate through filter structure
    // Process gender first (if present), then other filters
    const filterOrder = ['gender', 'type', 'origin', 'style', 'industry', 'house', 'category', 'domain']; // Common filter order
    const processedFilters = {};
    
    // First, process known filters in order
    for (const filterKey of filterOrder) {
      if (filters[filterKey] && namePool[filters[filterKey]]) {
        namePool = namePool[filters[filterKey]];
        appliedFilters.push(`${filterKey}:${filters[filterKey]}`);
        processedFilters[filterKey] = filters[filterKey];
      }
    }
    
    // Then process any remaining filters
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (!processedFilters[filterKey] && filterValue && namePool[filterValue]) {
        namePool = namePool[filterValue];
        appliedFilters.push(`${filterKey}:${filterValue}`);
      }
    }

    // If namePool is still an object, try to get a valid array
    if (typeof namePool === 'object' && !Array.isArray(namePool)) {
      // Check if we have any arrays at this level
      const availableKeys = Object.keys(namePool);
      const arrayKeys = availableKeys.filter(key => Array.isArray(namePool[key]));
      
      if (arrayKeys.length > 0) {
        // Use the first available array
        namePool = namePool[arrayKeys[0]];
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.warn(`Filter combination not available. Using ${arrayKeys[0]} instead.`);
        }
      } else {
        // Try one level deeper
        const firstKey = availableKeys[0];
        if (namePool[firstKey] && Array.isArray(namePool[firstKey])) {
          namePool = namePool[firstKey];
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn(`Filter combination not available. Using ${firstKey} instead.`);
          }
        } else {
          throw new Error(`Invalid filter combination for ${categorySlug}/${generatorKey}. Applied filters: ${appliedFilters.join(', ')}`);
        }
      }
    }

    // Ensure we have an array
    if (!Array.isArray(namePool)) {
      throw new Error(`Invalid data structure for generator: ${categorySlug}/${generatorKey}. Final namePool type: ${typeof namePool}`);
    }

    // Create unique key for this generator/filter combination
    const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
    
    // Get or create shuffled pool for this combination
    let shuffledPool = this.namePools.get(poolKey);
    let currentIndex = this.nameIndices.get(poolKey) || 0;
    
    // If we don't have a shuffled pool, or we've exhausted it, create a new one
    if (!shuffledPool || currentIndex >= shuffledPool.length) {
      shuffledPool = this.shuffleArray(namePool);
      this.namePools.set(poolKey, shuffledPool);
      currentIndex = 0;
    }
    
    // Generate names from the shuffled pool
    const results = [];
    for (let i = 0; i < count; i++) {
      // If we've reached the end, reshuffle and start over
      if (currentIndex >= shuffledPool.length) {
        shuffledPool = this.shuffleArray(namePool);
        this.namePools.set(poolKey, shuffledPool);
        currentIndex = 0;
      }
      
      results.push(shuffledPool[currentIndex]);
      currentIndex++;
    }
    
    // Save the updated index
    this.nameIndices.set(poolKey, currentIndex);

    return results;
  }

  /**
   * Get popular generators across all categories
   * @returns {Promise<Array>} Array of popular generator objects
   */
  async getPopularGenerators() {
    const categories = await this.getCategories();
    const popular = [];

    for (const category of categories) {
      try {
        const generators = await this.getGenerators(category.slug);
        for (const [key, generator] of Object.entries(generators)) {
          if (generator.isPopular) {
            popular.push({
              ...generator,
              categorySlug: category.slug,
              categoryName: category.name,
              categoryIcon: category.icon,
              generatorKey: key
            });
          }
        }
      } catch (e) {
        // Skip categories that fail to load
      }
    }

    // Sort by popularRank
    return popular.sort((a, b) => (a.popularRank || 999) - (b.popularRank || 999));
  }

  /**
   * Get related generators
   * @param {string} categorySlug - The category slug
   * @param {string} generatorKey - The generator key
   * @returns {Promise<Array>} Array of related generator objects
   */
  async getRelatedGenerators(categorySlug, generatorKey) {
    const generator = await this.getGenerator(categorySlug, generatorKey);
    if (!generator || !generator.relatedGenerators) {
      return [];
    }

    const related = [];
    for (const relatedKey of generator.relatedGenerators) {
      // First try same category
      try {
        const relatedGen = await this.getGenerator(categorySlug, relatedKey);
        if (relatedGen) {
          related.push({
            ...relatedGen,
            categorySlug: categorySlug,
            generatorKey: relatedKey
          });
          continue;
        }
      } catch (e) {
        // Not in same category, try other categories
      }

      // Search other categories
      const categories = await this.getCategories();
      for (const category of categories) {
        if (category.slug === categorySlug) continue;
        try {
          const relatedGen = await this.getGenerator(category.slug, relatedKey);
          if (relatedGen) {
            related.push({
              ...relatedGen,
              categorySlug: category.slug,
              generatorKey: relatedKey
            });
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    return related;
  }
}

// Initialize global instance
window.nameGenerator = new NameGenerator();

// Export for Node.js (for build scripts)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NameGenerator;
}

