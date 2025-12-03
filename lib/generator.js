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
      console.error('⚠️ WARNING: This page is being opened via file:// protocol.');
      console.error('⚠️ Fetch API does not work with file:// for security reasons.');
      console.error('⚠️ Please use a web server instead:');
      console.error('⚠️   1. Run: python3 -m http.server 8000');
      console.error('⚠️   2. Open: http://localhost:8000/posts/dwarf-name-generator.html');
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
      console.error(`Error loading category '${categorySlug}':`, error);
      console.error(`Attempted path: /data/${categorySlug}.json`);
      console.error(`Current location: ${window.location.href}`);
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
    let generator = await this.getGenerator(categorySlug, generatorKey);
    if (!generator) {
      throw new Error(`Generator not found: ${categorySlug}/${generatorKey}`);
    }
    
    // Handle cross-category data references
    if (generator.data && generator.data._reference) {
      const [refCategory, refGenerator] = generator.data._reference.split(':');
      const refGen = await this.getGenerator(refCategory, refGenerator);
      if (refGen && refGen.data) {
        generator = { ...generator, data: refGen.data };
      }
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

    // Special handling for generators with format filter (angel, alien, fairy) - combine first names, surnames, and epithets
    if (filters.format && (generatorKey === 'angel' || generatorKey === 'alien' || generatorKey === 'fairy')) {
      const gender = filters.gender || 'male';
      const format = filters.format || 'first_name';
      
      // Get data arrays
      const firstNames = generator.data[gender];
      const surnames = generator.data.surnames || [];
      const epithets = generator.data.epithets || [];
      
      if (!firstNames || !Array.isArray(firstNames) || firstNames.length === 0) {
        throw new Error(`Invalid data structure for ${generatorKey} generator. Gender: ${gender}`);
      }
      
      // Create unique pool keys
      const firstPoolKey = `${categorySlug}:${generatorKey}:first:${gender}`;
      const surnamePoolKey = `${categorySlug}:${generatorKey}:surname`;
      const epithetPoolKey = `${categorySlug}:${generatorKey}:epithet`;
      
      // Get or create shuffled pools for first names
      let firstShuffled = this.namePools.get(firstPoolKey);
      let firstIndex = this.nameIndices.get(firstPoolKey) || 0;
      
      if (!firstShuffled || firstIndex >= firstShuffled.length) {
        firstShuffled = this.shuffleArray([...firstNames]);
        this.namePools.set(firstPoolKey, firstShuffled);
        firstIndex = 0;
      }
      
      // Get or create shuffled pools for surnames (if needed)
      let surnameShuffled = null;
      let surnameIndex = 0;
      if (format === 'full_name' || format === 'full_name_epithet') {
        if (surnames.length === 0) {
          throw new Error(`Surnames not available for ${generatorKey} generator`);
        }
        surnameShuffled = this.namePools.get(surnamePoolKey);
        surnameIndex = this.nameIndices.get(surnamePoolKey) || 0;
        
        if (!surnameShuffled || surnameIndex >= surnameShuffled.length) {
          surnameShuffled = this.shuffleArray([...surnames]);
          this.namePools.set(surnamePoolKey, surnameShuffled);
          surnameIndex = 0;
        }
      }
      
      // Get or create shuffled pools for epithets (if needed)
      let epithetShuffled = null;
      let epithetIndex = 0;
      if (format === 'full_name_epithet') {
        if (epithets.length === 0) {
          throw new Error(`Epithets not available for ${generatorKey} generator`);
        }
        epithetShuffled = this.namePools.get(epithetPoolKey);
        epithetIndex = this.nameIndices.get(epithetPoolKey) || 0;
        
        if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
          epithetShuffled = this.shuffleArray([...epithets]);
          this.namePools.set(epithetPoolKey, epithetShuffled);
          epithetIndex = 0;
        }
      }
      
      // Generate names based on format
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted first names, reshuffle
        if (firstIndex >= firstShuffled.length) {
          firstShuffled = this.shuffleArray([...firstNames]);
          this.namePools.set(firstPoolKey, firstShuffled);
          firstIndex = 0;
        }
        
        const firstName = firstShuffled[firstIndex];
        let name = String(firstName).trim();
        
        // Add surname if needed
        if (format === 'full_name' || format === 'full_name_epithet') {
          // If we've exhausted surnames, reshuffle
          if (surnameIndex >= surnameShuffled.length) {
            surnameShuffled = this.shuffleArray([...surnames]);
            this.namePools.set(surnamePoolKey, surnameShuffled);
            surnameIndex = 0;
          }
          
          const surname = surnameShuffled[surnameIndex];
          name += ' ' + String(surname).trim();
          surnameIndex++;
        }
        
        // Add epithet if needed
        if (format === 'full_name_epithet') {
          // If we've exhausted epithets, reshuffle
          if (epithetIndex >= epithetShuffled.length) {
            epithetShuffled = this.shuffleArray([...epithets]);
            this.namePools.set(epithetPoolKey, epithetShuffled);
            epithetIndex = 0;
          }
          
          const epithet = epithetShuffled[epithetIndex];
          name += ', ' + String(epithet).trim();
          epithetIndex++;
        }
        
        results.push(name);
        firstIndex++;
      }
      
      // Update indices
      this.nameIndices.set(firstPoolKey, firstIndex);
      if (surnameShuffled !== null) {
        this.nameIndices.set(surnamePoolKey, surnameIndex);
      }
      if (epithetShuffled !== null) {
        this.nameIndices.set(epithetPoolKey, epithetIndex);
      }
      
      return results;
    }

    // Special handling for object generators with format/template filters
    if ((filters.format || filters.template) && generator.data && generator.data.baseNames && Array.isArray(generator.data.baseNames)) {
      const format = filters.format || filters.template || 'the_name_shield';
      const baseNames = generator.data.baseNames;
      
      if (!baseNames || baseNames.length === 0) {
        throw new Error(`Invalid data structure for ${generatorKey} generator. No baseNames found.`);
      }

      // Handle format-based generators (shield, etc.)
      if (filters.format) {
        // Determine object type from generator key
        let objectType = 'Shield'; // default
        if (generatorKey.includes('sword')) objectType = 'Sword';
        else if (generatorKey.includes('axe')) objectType = 'Axe';
        else if (generatorKey.includes('wand')) objectType = 'Wand';
        else if (generatorKey.includes('shield')) objectType = 'Shield';
        else if (generatorKey.includes('poison')) objectType = 'Poison';
        else if (generatorKey.includes('warhammer')) objectType = 'Warhammer';
        else if (generatorKey.includes('hammer')) objectType = 'Hammer';

        // Create pool key
        const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
        
        // Get or create shuffled pool
        let shuffledPool = this.namePools.get(poolKey);
        let currentIndex = this.nameIndices.get(poolKey) || 0;
        
        if (!shuffledPool || currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...baseNames]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
        }

        // Generate names based on format
        const results = [];
        for (let i = 0; i < count; i++) {
          // If we've exhausted the pool, reshuffle
          if (currentIndex >= shuffledPool.length) {
            shuffledPool = this.shuffleArray([...baseNames]);
            this.namePools.set(poolKey, shuffledPool);
            currentIndex = 0;
          }
          
          const baseName = String(shuffledPool[currentIndex]).trim();
          let name = '';
          
          // Format based on format option
          if (format === 'the_name_shield' || format === 'the_name_sword' || format === 'the_name_axe' || format === 'the_name_wand' || format === 'the_name_warhammer' || format === 'the_name_hammer') {
            // Format: "The [name] [object]"
            name = `The ${baseName} ${objectType}`;
          } else if (format === 'shield_of_the_name' || format === 'sword_of_the_name' || format === 'axe_of_the_name' || format === 'wand_of_the_name' || format === 'warhammer_of_the_name' || format === 'hammer_of_the_name') {
            // Format: "The [object] of the [name]"
            name = `The ${objectType} of the ${baseName}`;
          } else if (format === 'name_protector_of_name' || format === 'name_bane_of_name' || format === 'name_slayer_of_name') {
            // Format: "[name], Protector of [name]" - need two names
            if (currentIndex + 1 >= shuffledPool.length) {
              shuffledPool = this.shuffleArray([...baseNames]);
              this.namePools.set(poolKey, shuffledPool);
              currentIndex = 0;
            }
            const secondName = String(shuffledPool[(currentIndex + 1) % shuffledPool.length]).trim();
            
            if (format === 'name_protector_of_name') {
              name = `${baseName}, Protector of ${secondName}`;
            } else if (format === 'name_bane_of_name') {
              name = `${baseName}, Bane of ${secondName}`;
            } else if (format === 'name_slayer_of_name') {
              name = `${baseName}, Slayer of ${secondName}`;
            }
          } else {
            // Default: just the base name
            name = baseName;
          }
          
          results.push(name);
          currentIndex++;
        }
        
        // Update index
        this.nameIndices.set(poolKey, currentIndex);
        
        return results;
      }
      
      // Handle template-based generators (sword, axe, warhammer, etc.)
      if (filters.template) {
        const descriptors = generator.data.descriptors || [];
        const epithets = generator.data.epithets || [];
        const weaponTypes = generator.data.weaponTypes || [];
        
        if (descriptors.length === 0) {
          throw new Error(`Invalid data structure for ${generatorKey} generator. No descriptors found.`);
        }

        // Create pool keys for each component
        const basePoolKey = `${categorySlug}:${generatorKey}:base:${format}`;
        const descPoolKey = `${categorySlug}:${generatorKey}:desc:${format}`;
        const epithetPoolKey = `${categorySlug}:${generatorKey}:epithet:${format}`;
        const weaponPoolKey = `${categorySlug}:${generatorKey}:weapon:${format}`;
        
        // Get or create shuffled pools
        let baseShuffled = this.namePools.get(basePoolKey);
        let baseIndex = this.nameIndices.get(basePoolKey) || 0;
        if (!baseShuffled || baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(basePoolKey, baseShuffled);
          baseIndex = 0;
        }
        
        let descShuffled = this.namePools.get(descPoolKey);
        let descIndex = this.nameIndices.get(descPoolKey) || 0;
        if (!descShuffled || descIndex >= descShuffled.length) {
          descShuffled = this.shuffleArray([...descriptors]);
          this.namePools.set(descPoolKey, descShuffled);
          descIndex = 0;
        }
        
        let epithetShuffled = null;
        let epithetIndex = 0;
        if (format === 'named_artifact' || format === 'complex_weapon') {
          if (epithets.length === 0) {
            throw new Error(`Epithets not available for ${generatorKey} generator`);
          }
          epithetShuffled = this.namePools.get(epithetPoolKey);
          epithetIndex = this.nameIndices.get(epithetPoolKey) || 0;
          if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
            epithetShuffled = this.shuffleArray([...epithets]);
            this.namePools.set(epithetPoolKey, epithetShuffled);
            epithetIndex = 0;
          }
        }
        
        let weaponShuffled = null;
        let weaponIndex = 0;
        if (format === 'complex_weapon') {
          if (weaponTypes.length === 0) {
            throw new Error(`Weapon types not available for ${generatorKey} generator`);
          }
          weaponShuffled = this.namePools.get(weaponPoolKey);
          weaponIndex = this.nameIndices.get(weaponPoolKey) || 0;
          if (!weaponShuffled || weaponIndex >= weaponShuffled.length) {
            weaponShuffled = this.shuffleArray([...weaponTypes]);
            this.namePools.set(weaponPoolKey, weaponShuffled);
            weaponIndex = 0;
          }
        }

        // Generate names based on template
        const results = [];
        for (let i = 0; i < count; i++) {
          // Reshuffle if needed
          if (baseIndex >= baseShuffled.length) {
            baseShuffled = this.shuffleArray([...baseNames]);
            this.namePools.set(basePoolKey, baseShuffled);
            baseIndex = 0;
          }
          if (descIndex >= descShuffled.length) {
            descShuffled = this.shuffleArray([...descriptors]);
            this.namePools.set(descPoolKey, descShuffled);
            descIndex = 0;
          }
          if (epithetShuffled && epithetIndex >= epithetShuffled.length) {
            epithetShuffled = this.shuffleArray([...epithets]);
            this.namePools.set(epithetPoolKey, epithetShuffled);
            epithetIndex = 0;
          }
          if (weaponShuffled && weaponIndex >= weaponShuffled.length) {
            weaponShuffled = this.shuffleArray([...weaponTypes]);
            this.namePools.set(weaponPoolKey, weaponShuffled);
            weaponIndex = 0;
          }
          
          const baseName = String(baseShuffled[baseIndex]).trim();
          const descriptor = String(descShuffled[descIndex]).trim();
          let name = '';
          
          if (format === 'compound_artifact') {
            // Format: [Descriptor] + [Base Name]
            name = `${descriptor} ${baseName}`;
          } else if (format === 'named_artifact') {
            // Format: [Descriptor], [Epithet]
            const epithet = String(epithetShuffled[epithetIndex]).trim();
            name = `${descriptor}, ${epithet}`;
            epithetIndex++;
          } else if (format === 'complex_weapon') {
            // Format: [Descriptor] + [Weapon Type], [Epithet]
            const weaponType = String(weaponShuffled[weaponIndex]).trim();
            const epithet = String(epithetShuffled[epithetIndex]).trim();
            name = `${descriptor} ${weaponType}, ${epithet}`;
            weaponIndex++;
            epithetIndex++;
          } else {
            // Default: just the base name
            name = baseName;
          }
          
          results.push(name);
          baseIndex++;
          descIndex++;
        }
        
        // Update indices
        this.nameIndices.set(basePoolKey, baseIndex);
        this.nameIndices.set(descPoolKey, descIndex);
        if (epithetShuffled !== null) {
          this.nameIndices.set(epithetPoolKey, epithetIndex);
        }
        if (weaponShuffled !== null) {
          this.nameIndices.set(weaponPoolKey, weaponIndex);
        }
        
        return results;
      }
    }

    // Special handling for D&D fantasy generator - combine first and last names
    if (generatorKey === 'dnd_fantasy') {
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

    let namePool = generator.data;
    const appliedFilters = [];

    // Navigate through filter structure
    // Process gender first (if present), then other filters
    const filterOrder = ['gender', 'type', 'origin', 'style']; // Common filter order
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
        console.warn(`Filter combination not available. Using ${arrayKeys[0]} instead.`);
      } else {
        // Try one level deeper
        const firstKey = availableKeys[0];
        if (namePool[firstKey] && Array.isArray(namePool[firstKey])) {
          namePool = namePool[firstKey];
          console.warn(`Filter combination not available. Using ${firstKey} instead.`);
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
   * Extract key words from a generator title
   * @param {string} title - Generator title
   * @returns {Array} Array of key words
   */
  extractKeyWords(title) {
    // Remove common words and extract meaningful terms
    const commonWords = new Set(['name', 'generator', 'the', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'to', 'in', 'on', 'at', 'by']);
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));
    return words;
  }

  /**
   * Calculate similarity score between two generators
   * @param {Object} currentGen - Current generator
   * @param {Object} candidateGen - Candidate generator
   * @param {string} currentCategorySlug - Current category slug
   * @param {string} candidateCategorySlug - Candidate category slug
   * @returns {number} Similarity score (higher is better)
   */
  calculateSimilarityScore(currentGen, candidateGen, currentCategorySlug, candidateCategorySlug) {
    let score = 0;
    
    // Extract key words from titles
    const currentWords = this.extractKeyWords(currentGen.title);
    const candidateWords = this.extractKeyWords(candidateGen.title);
    
    // Exact word matching (highest priority - 200 points per match)
    const matchingWords = currentWords.filter(word => candidateWords.includes(word));
    score += matchingWords.length * 200;
    
    // Partial word matches (100 points per partial match, but only if not already exact match)
    const usedWords = new Set(matchingWords);
    for (const currentWord of currentWords) {
      if (usedWords.has(currentWord)) continue;
      for (const candidateWord of candidateWords) {
        if (usedWords.has(candidateWord)) continue;
        // Check if one word contains the other (but not vice versa to avoid double counting)
        if (currentWord.length > candidateWord.length && currentWord.includes(candidateWord)) {
          score += 100;
          usedWords.add(candidateWord);
        } else if (candidateWord.length > currentWord.length && candidateWord.includes(currentWord)) {
          score += 100;
          usedWords.add(currentWord);
        }
      }
    }
    
    // Same category (50 points)
    if (currentCategorySlug === candidateCategorySlug) {
      score += 50;
    }
    
    // Popular generators (20 points)
    if (candidateGen.isPopular) {
      score += 20;
    }
    
    return score;
  }

  /**
   * Get related generators with smart matching
   * @param {string} categorySlug - The category slug
   * @param {string} generatorKey - The generator key
   * @returns {Promise<Array>} Array of related generator objects (3-6 items)
   */
  async getRelatedGenerators(categorySlug, generatorKey) {
    const generator = await this.getGenerator(categorySlug, generatorKey);
    if (!generator) {
      return [];
    }

    const currentSlug = `${categorySlug}:${generatorKey}`;
    const categories = await this.getCategories();
    const allGenerators = [];
    
    // Collect all generators from all categories
    for (const category of categories) {
      try {
        const generators = await this.getGenerators(category.slug);
        for (const [key, gen] of Object.entries(generators)) {
          const genSlug = `${category.slug}:${key}`;
          // Exclude current generator
          if (genSlug !== currentSlug) {
            allGenerators.push({
              ...gen,
              categorySlug: category.slug,
              generatorKey: key
            });
          }
        }
      } catch (e) {
        // Skip categories that fail to load
        console.debug(`Error loading category ${category.slug}:`, e.message);
      }
    }

    // Calculate similarity scores
    const scoredGenerators = allGenerators.map(gen => ({
      ...gen,
      score: this.calculateSimilarityScore(generator, gen, categorySlug, gen.categorySlug)
    }));

    // Sort by score (highest first), then by popularity
    scoredGenerators.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // If scores are equal, prioritize popular generators
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });

    // Get top generators (max 6), ensuring no duplicates
    let related = [];
    const relatedSlugs = new Set();
    const seenSlugs = new Set(); // Track by slug to prevent duplicates across categories
    
    // Add top scored generators, avoiding duplicates
    for (const gen of scoredGenerators) {
      if (related.length >= 6) break;
      const genSlug = `${gen.categorySlug}:${gen.generatorKey}`;
      const slugKey = gen.slug; // Use slug as unique identifier
      
      // Skip if it's the current generator or we've already seen this slug
      if (genSlug === currentSlug || seenSlugs.has(slugKey)) {
        continue;
      }
      
      related.push(gen);
      relatedSlugs.add(genSlug);
      seenSlugs.add(slugKey);
    }

    // If we have fewer than 3, prioritize same category generators
    if (related.length < 3) {
      // Get generators from same category first
      const sameCategoryGenerators = allGenerators
        .filter(gen => {
          const genSlug = `${gen.categorySlug}:${gen.generatorKey}`;
          const slugKey = gen.slug;
          return gen.categorySlug === categorySlug && 
                 genSlug !== currentSlug && 
                 !relatedSlugs.has(genSlug) &&
                 !seenSlugs.has(slugKey);
        });
      
      // Add same category generators until we have 3 or run out
      for (const gen of sameCategoryGenerators) {
        if (related.length >= 6) break;
        const genSlug = `${gen.categorySlug}:${gen.generatorKey}`;
        const slugKey = gen.slug;
        related.push(gen);
        relatedSlugs.add(genSlug);
        seenSlugs.add(slugKey);
      }
    }

    // If still fewer than 3, fill with popular generators
    if (related.length < 3) {
      const popular = await this.getPopularGenerators();
      
      for (const pop of popular) {
        if (related.length >= 6) break;
        const popSlug = `${pop.categorySlug}:${pop.generatorKey}`;
        const slugKey = pop.slug;
        if (popSlug !== currentSlug && !relatedSlugs.has(popSlug) && !seenSlugs.has(slugKey)) {
          related.push(pop);
          relatedSlugs.add(popSlug);
          seenSlugs.add(slugKey);
        }
      }
    }

    // If still fewer than 3, fill with any available generators
    if (related.length < 3 && allGenerators.length >= 3) {
      for (const gen of allGenerators) {
        if (related.length >= 6) break;
        const genSlug = `${gen.categorySlug}:${gen.generatorKey}`;
        const slugKey = gen.slug;
        if (genSlug !== currentSlug && !relatedSlugs.has(genSlug) && !seenSlugs.has(slugKey)) {
          related.push(gen);
          relatedSlugs.add(genSlug);
          seenSlugs.add(slugKey);
        }
      }
    }

    // Final check: remove any duplicates and ensure current generator is excluded
    const finalRelated = [];
    const finalSeenSlugs = new Set();
    
    for (const gen of related) {
      const slugKey = gen.slug;
      const genSlug = `${gen.categorySlug}:${gen.generatorKey}`;
      
      if (genSlug !== currentSlug && !finalSeenSlugs.has(slugKey)) {
        finalRelated.push(gen);
        finalSeenSlugs.add(slugKey);
      }
    }

    // Limit to 6
    return finalRelated.slice(0, 6);
  }
}

// Initialize global instance
window.nameGenerator = new NameGenerator();

// Export for Node.js (for build scripts)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NameGenerator;
}

