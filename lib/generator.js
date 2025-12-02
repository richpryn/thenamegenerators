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

    // Special handling for Ogryn generator - three formats
    if (generatorKey === 'ogryn') {
      const format = (filters.format && filters.format.trim()) || 'full_name';
      const firstNames = generator.data.firstNames || [];
      const surnames = generator.data.surnames || [];
      const epithets = generator.data.epithets || [];
      
      if (!firstNames || firstNames.length === 0 || !surnames || surnames.length === 0) {
        throw new Error('Invalid data structure for Ogryn generator. First names or surnames not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let firstShuffled = this.namePools.get(`${poolKey}:first`);
      let firstIndex = this.nameIndices.get(`${poolKey}:first`) || 0;
      let surnameShuffled = this.namePools.get(`${poolKey}:surname`);
      let surnameIndex = this.nameIndices.get(`${poolKey}:surname`) || 0;
      let epithetShuffled = this.namePools.get(`${poolKey}:epithet`);
      let epithetIndex = this.nameIndices.get(`${poolKey}:epithet`) || 0;
      
      // Initialize pools if needed
      if (!firstShuffled || firstIndex >= firstShuffled.length) {
        firstShuffled = this.shuffleArray([...firstNames]);
        this.namePools.set(`${poolKey}:first`, firstShuffled);
        firstIndex = 0;
      }
      if (!surnameShuffled || surnameIndex >= surnameShuffled.length) {
        surnameShuffled = this.shuffleArray([...surnames]);
        this.namePools.set(`${poolKey}:surname`, surnameShuffled);
        surnameIndex = 0;
      }
      if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
        epithetShuffled = this.shuffleArray([...epithets]);
        this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
        epithetIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted first names, reshuffle
        if (firstIndex >= firstShuffled.length) {
          firstShuffled = this.shuffleArray([...firstNames]);
          this.namePools.set(`${poolKey}:first`, firstShuffled);
          firstIndex = 0;
        }
        // If we've exhausted surnames, reshuffle
        if (surnameIndex >= surnameShuffled.length) {
          surnameShuffled = this.shuffleArray([...surnames]);
          this.namePools.set(`${poolKey}:surname`, surnameShuffled);
          surnameIndex = 0;
        }
        // If we've exhausted epithets, reshuffle
        if (epithetIndex >= epithetShuffled.length) {
          epithetShuffled = this.shuffleArray([...epithets]);
          this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
          epithetIndex = 0;
        }
        
        let formattedName;
        
        if (format === 'short_name') {
          // Format: [Surname], [Epithet]
          const surname = surnameShuffled[surnameIndex];
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${surname}, ${epithet}`;
          surnameIndex++;
          epithetIndex++;
        } else if (format === 'full_name_epithet') {
          // Format: [First Name] [Surname], [Epithet]
          const firstName = firstShuffled[firstIndex];
          const surname = surnameShuffled[surnameIndex];
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${firstName} ${surname}, ${epithet}`;
          firstIndex++;
          surnameIndex++;
          epithetIndex++;
        } else {
          // Format: [First Name] [Surname] (default)
          const firstName = firstShuffled[firstIndex];
          const surname = surnameShuffled[surnameIndex];
          formattedName = `${firstName} ${surname}`;
          firstIndex++;
          surnameIndex++;
        }
        
        results.push(formattedName);
      }
      
      // Update indices
      if (format === 'short_name') {
        this.nameIndices.set(`${poolKey}:surname`, surnameIndex);
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else if (format === 'full_name_epithet') {
        this.nameIndices.set(`${poolKey}:first`, firstIndex);
        this.nameIndices.set(`${poolKey}:surname`, surnameIndex);
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else {
        this.nameIndices.set(`${poolKey}:first`, firstIndex);
        this.nameIndices.set(`${poolKey}:surname`, surnameIndex);
      }
      
      return results;
    }

    // Special handling for Wand generator - three templates
    if (generatorKey === 'wand') {
      const template = (filters.template && filters.template.trim()) || 'compound_artifact';
      const baseNames = generator.data.baseNames || [];
      const descriptors = generator.data.descriptors || [];
      const epithets = generator.data.epithets || [];
      const weaponTypes = generator.data.weaponTypes || [];
      
      if (!baseNames || baseNames.length === 0 || !descriptors || descriptors.length === 0) {
        throw new Error('Invalid data structure for Wand generator. Base names or descriptors not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let baseShuffled = this.namePools.get(`${poolKey}:base`);
      let baseIndex = this.nameIndices.get(`${poolKey}:base`) || 0;
      let descriptorShuffled = this.namePools.get(`${poolKey}:descriptor`);
      let descriptorIndex = this.nameIndices.get(`${poolKey}:descriptor`) || 0;
      let epithetShuffled = this.namePools.get(`${poolKey}:epithet`);
      let epithetIndex = this.nameIndices.get(`${poolKey}:epithet`) || 0;
      let weaponShuffled = this.namePools.get(`${poolKey}:weapon`);
      let weaponIndex = this.nameIndices.get(`${poolKey}:weapon`) || 0;
      
      // Initialize pools if needed
      if (!baseShuffled || baseIndex >= baseShuffled.length) {
        baseShuffled = this.shuffleArray([...baseNames]);
        this.namePools.set(`${poolKey}:base`, baseShuffled);
        baseIndex = 0;
      }
      if (!descriptorShuffled || descriptorIndex >= descriptorShuffled.length) {
        descriptorShuffled = this.shuffleArray([...descriptors]);
        this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
        descriptorIndex = 0;
      }
      if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
        epithetShuffled = this.shuffleArray([...epithets]);
        this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
        epithetIndex = 0;
      }
      if (!weaponShuffled || weaponIndex >= weaponShuffled.length) {
        weaponShuffled = this.shuffleArray([...weaponTypes]);
        this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
        weaponIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted base names, reshuffle
        if (baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(`${poolKey}:base`, baseShuffled);
          baseIndex = 0;
        }
        // If we've exhausted descriptors, reshuffle
        if (descriptorIndex >= descriptorShuffled.length) {
          descriptorShuffled = this.shuffleArray([...descriptors]);
          this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
          descriptorIndex = 0;
        }
        // If we've exhausted epithets, reshuffle
        if (epithetIndex >= epithetShuffled.length) {
          epithetShuffled = this.shuffleArray([...epithets]);
          this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
          epithetIndex = 0;
        }
        // If we've exhausted weapon types, reshuffle
        if (weaponIndex >= weaponShuffled.length) {
          weaponShuffled = this.shuffleArray([...weaponTypes]);
          this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
          weaponIndex = 0;
        }
        
        const descriptor = descriptorShuffled[descriptorIndex];
        let formattedName;
        
        if (template === 'named_artifact') {
          // Template 2: [C2 Descriptor], [C3 Epithet]
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor}, ${epithet}`;
          descriptorIndex++;
          epithetIndex++;
        } else if (template === 'complex_weapon') {
          // Template 3: [C2 Descriptor] + [C1 Weapon Type], [C3 Epithet]
          const weapon = weaponShuffled[weaponIndex];
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor} ${weapon}, ${epithet}`;
          descriptorIndex++;
          weaponIndex++;
          epithetIndex++;
        } else {
          // Template 1: [C2 Descriptor] + [C1 Base Name] (default)
          const baseName = baseShuffled[baseIndex];
          formattedName = `${descriptor} ${baseName}`;
          descriptorIndex++;
          baseIndex++;
        }
        
        results.push(formattedName);
      }
      
      // Update indices
      this.nameIndices.set(`${poolKey}:descriptor`, descriptorIndex);
      if (template === 'named_artifact') {
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else if (template === 'complex_weapon') {
        this.nameIndices.set(`${poolKey}:weapon`, weaponIndex);
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else {
        this.nameIndices.set(`${poolKey}:base`, baseIndex);
      }
      
      return results;
    }

    // Special handling for Warhammer generator - three templates
    if (generatorKey === 'warhammer') {
      const template = (filters.template && filters.template.trim()) || 'compound_artifact';
      const baseNames = generator.data.baseNames || [];
      const descriptors = generator.data.descriptors || [];
      const epithets = generator.data.epithets || [];
      const weaponTypes = generator.data.weaponTypes || [];
      
      if (!baseNames || baseNames.length === 0 || !descriptors || descriptors.length === 0) {
        throw new Error('Invalid data structure for Warhammer generator. Base names or descriptors not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let baseShuffled = this.namePools.get(`${poolKey}:base`);
      let baseIndex = this.nameIndices.get(`${poolKey}:base`) || 0;
      let descriptorShuffled = this.namePools.get(`${poolKey}:descriptor`);
      let descriptorIndex = this.nameIndices.get(`${poolKey}:descriptor`) || 0;
      let epithetShuffled = this.namePools.get(`${poolKey}:epithet`);
      let epithetIndex = this.nameIndices.get(`${poolKey}:epithet`) || 0;
      let weaponShuffled = this.namePools.get(`${poolKey}:weapon`);
      let weaponIndex = this.nameIndices.get(`${poolKey}:weapon`) || 0;
      
      // Initialize pools if needed
      if (!baseShuffled || baseIndex >= baseShuffled.length) {
        baseShuffled = this.shuffleArray([...baseNames]);
        this.namePools.set(`${poolKey}:base`, baseShuffled);
        baseIndex = 0;
      }
      if (!descriptorShuffled || descriptorIndex >= descriptorShuffled.length) {
        descriptorShuffled = this.shuffleArray([...descriptors]);
        this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
        descriptorIndex = 0;
      }
      if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
        epithetShuffled = this.shuffleArray([...epithets]);
        this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
        epithetIndex = 0;
      }
      if (!weaponShuffled || weaponIndex >= weaponShuffled.length) {
        weaponShuffled = this.shuffleArray([...weaponTypes]);
        this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
        weaponIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted base names, reshuffle
        if (baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(`${poolKey}:base`, baseShuffled);
          baseIndex = 0;
        }
        // If we've exhausted descriptors, reshuffle
        if (descriptorIndex >= descriptorShuffled.length) {
          descriptorShuffled = this.shuffleArray([...descriptors]);
          this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
          descriptorIndex = 0;
        }
        // If we've exhausted epithets, reshuffle
        if (epithetIndex >= epithetShuffled.length) {
          epithetShuffled = this.shuffleArray([...epithets]);
          this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
          epithetIndex = 0;
        }
        // If we've exhausted weapon types, reshuffle
        if (weaponIndex >= weaponShuffled.length) {
          weaponShuffled = this.shuffleArray([...weaponTypes]);
          this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
          weaponIndex = 0;
        }
        
        const descriptor = descriptorShuffled[descriptorIndex];
        let formattedName;
        
        if (template === 'named_artifact') {
          // Template 2: [C2 Descriptor], [C3 Epithet]
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor}, ${epithet}`;
          descriptorIndex++;
          epithetIndex++;
        } else if (template === 'complex_weapon') {
          // Template 3: [C2 Descriptor] + [C1 Weapon Type], [C3 Epithet]
          const weapon = weaponShuffled[weaponIndex];
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor} ${weapon}, ${epithet}`;
          descriptorIndex++;
          weaponIndex++;
          epithetIndex++;
        } else {
          // Template 1: [C2 Descriptor] + [C1 Base Name] (default)
          const baseName = baseShuffled[baseIndex];
          formattedName = `${descriptor} ${baseName}`;
          descriptorIndex++;
          baseIndex++;
        }
        
        results.push(formattedName);
      }
      
      // Update indices
      this.nameIndices.set(`${poolKey}:descriptor`, descriptorIndex);
      if (template === 'named_artifact') {
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else if (template === 'complex_weapon') {
        this.nameIndices.set(`${poolKey}:weapon`, weaponIndex);
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else {
        this.nameIndices.set(`${poolKey}:base`, baseIndex);
      }
      
      return results;
    }

    // Special handling for Axe generator - three templates
    if (generatorKey === 'axe') {
      const template = (filters.template && filters.template.trim()) || 'compound_artifact';
      const baseNames = generator.data.baseNames || [];
      const descriptors = generator.data.descriptors || [];
      const epithets = generator.data.epithets || [];
      const weaponTypes = generator.data.weaponTypes || [];
      
      if (!baseNames || baseNames.length === 0 || !descriptors || descriptors.length === 0) {
        throw new Error('Invalid data structure for Axe generator. Base names or descriptors not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let baseShuffled = this.namePools.get(`${poolKey}:base`);
      let baseIndex = this.nameIndices.get(`${poolKey}:base`) || 0;
      let descriptorShuffled = this.namePools.get(`${poolKey}:descriptor`);
      let descriptorIndex = this.nameIndices.get(`${poolKey}:descriptor`) || 0;
      let epithetShuffled = this.namePools.get(`${poolKey}:epithet`);
      let epithetIndex = this.nameIndices.get(`${poolKey}:epithet`) || 0;
      let weaponShuffled = this.namePools.get(`${poolKey}:weapon`);
      let weaponIndex = this.nameIndices.get(`${poolKey}:weapon`) || 0;
      
      // Initialize pools if needed
      if (!baseShuffled || baseIndex >= baseShuffled.length) {
        baseShuffled = this.shuffleArray([...baseNames]);
        this.namePools.set(`${poolKey}:base`, baseShuffled);
        baseIndex = 0;
      }
      if (!descriptorShuffled || descriptorIndex >= descriptorShuffled.length) {
        descriptorShuffled = this.shuffleArray([...descriptors]);
        this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
        descriptorIndex = 0;
      }
      if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
        epithetShuffled = this.shuffleArray([...epithets]);
        this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
        epithetIndex = 0;
      }
      if (!weaponShuffled || weaponIndex >= weaponShuffled.length) {
        weaponShuffled = this.shuffleArray([...weaponTypes]);
        this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
        weaponIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted base names, reshuffle
        if (baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(`${poolKey}:base`, baseShuffled);
          baseIndex = 0;
        }
        // If we've exhausted descriptors, reshuffle
        if (descriptorIndex >= descriptorShuffled.length) {
          descriptorShuffled = this.shuffleArray([...descriptors]);
          this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
          descriptorIndex = 0;
        }
        // If we've exhausted epithets, reshuffle
        if (epithetIndex >= epithetShuffled.length) {
          epithetShuffled = this.shuffleArray([...epithets]);
          this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
          epithetIndex = 0;
        }
        // If we've exhausted weapon types, reshuffle
        if (weaponIndex >= weaponShuffled.length) {
          weaponShuffled = this.shuffleArray([...weaponTypes]);
          this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
          weaponIndex = 0;
        }
        
        const descriptor = descriptorShuffled[descriptorIndex];
        let formattedName;
        
        if (template === 'named_artifact') {
          // Template 2: [C2 Descriptor], [C3 Epithet]
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor}, ${epithet}`;
          descriptorIndex++;
          epithetIndex++;
        } else if (template === 'complex_weapon') {
          // Template 3: [C2 Descriptor] + [C1 Weapon Type], [C3 Epithet]
          const weapon = weaponShuffled[weaponIndex];
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor} ${weapon}, ${epithet}`;
          descriptorIndex++;
          weaponIndex++;
          epithetIndex++;
        } else {
          // Template 1: [C2 Descriptor] + [C1 Base Name] (default)
          const baseName = baseShuffled[baseIndex];
          formattedName = `${descriptor} ${baseName}`;
          descriptorIndex++;
          baseIndex++;
        }
        
        results.push(formattedName);
      }
      
      // Update indices
      this.nameIndices.set(`${poolKey}:descriptor`, descriptorIndex);
      if (template === 'named_artifact') {
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else if (template === 'complex_weapon') {
        this.nameIndices.set(`${poolKey}:weapon`, weaponIndex);
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else {
        this.nameIndices.set(`${poolKey}:base`, baseIndex);
      }
      
      return results;
    }

    // Special handling for Sword generator - three templates
    if (generatorKey === 'sword') {
      const template = (filters.template && filters.template.trim()) || 'compound_artifact';
      const baseNames = generator.data.baseNames || [];
      const descriptors = generator.data.descriptors || [];
      const epithets = generator.data.epithets || [];
      const weaponTypes = generator.data.weaponTypes || [];
      
      if (!baseNames || baseNames.length === 0 || !descriptors || descriptors.length === 0) {
        throw new Error('Invalid data structure for Sword generator. Base names or descriptors not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let baseShuffled = this.namePools.get(`${poolKey}:base`);
      let baseIndex = this.nameIndices.get(`${poolKey}:base`) || 0;
      let descriptorShuffled = this.namePools.get(`${poolKey}:descriptor`);
      let descriptorIndex = this.nameIndices.get(`${poolKey}:descriptor`) || 0;
      let epithetShuffled = this.namePools.get(`${poolKey}:epithet`);
      let epithetIndex = this.nameIndices.get(`${poolKey}:epithet`) || 0;
      let weaponShuffled = this.namePools.get(`${poolKey}:weapon`);
      let weaponIndex = this.nameIndices.get(`${poolKey}:weapon`) || 0;
      
      // Initialize pools if needed
      if (!baseShuffled || baseIndex >= baseShuffled.length) {
        baseShuffled = this.shuffleArray([...baseNames]);
        this.namePools.set(`${poolKey}:base`, baseShuffled);
        baseIndex = 0;
      }
      if (!descriptorShuffled || descriptorIndex >= descriptorShuffled.length) {
        descriptorShuffled = this.shuffleArray([...descriptors]);
        this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
        descriptorIndex = 0;
      }
      if (!epithetShuffled || epithetIndex >= epithetShuffled.length) {
        epithetShuffled = this.shuffleArray([...epithets]);
        this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
        epithetIndex = 0;
      }
      if (!weaponShuffled || weaponIndex >= weaponShuffled.length) {
        weaponShuffled = this.shuffleArray([...weaponTypes]);
        this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
        weaponIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted base names, reshuffle
        if (baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(`${poolKey}:base`, baseShuffled);
          baseIndex = 0;
        }
        // If we've exhausted descriptors, reshuffle
        if (descriptorIndex >= descriptorShuffled.length) {
          descriptorShuffled = this.shuffleArray([...descriptors]);
          this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
          descriptorIndex = 0;
        }
        // If we've exhausted epithets, reshuffle
        if (epithetIndex >= epithetShuffled.length) {
          epithetShuffled = this.shuffleArray([...epithets]);
          this.namePools.set(`${poolKey}:epithet`, epithetShuffled);
          epithetIndex = 0;
        }
        // If we've exhausted weapon types, reshuffle
        if (weaponIndex >= weaponShuffled.length) {
          weaponShuffled = this.shuffleArray([...weaponTypes]);
          this.namePools.set(`${poolKey}:weapon`, weaponShuffled);
          weaponIndex = 0;
        }
        
        const descriptor = descriptorShuffled[descriptorIndex];
        let formattedName;
        
        if (template === 'named_artifact') {
          // Template 2: [C2 Descriptor], [C3 Epithet]
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor}, ${epithet}`;
          descriptorIndex++;
          epithetIndex++;
        } else if (template === 'complex_weapon') {
          // Template 3: [C2 Descriptor] + [C1 Weapon Type], [C3 Epithet]
          const weapon = weaponShuffled[weaponIndex];
          const epithet = epithetShuffled[epithetIndex];
          formattedName = `${descriptor} ${weapon}, ${epithet}`;
          descriptorIndex++;
          weaponIndex++;
          epithetIndex++;
        } else {
          // Template 1: [C2 Descriptor] + [C1 Base Name] (default)
          const baseName = baseShuffled[baseIndex];
          formattedName = `${descriptor} ${baseName}`;
          descriptorIndex++;
          baseIndex++;
        }
        
        results.push(formattedName);
      }
      
      // Update indices
      this.nameIndices.set(`${poolKey}:descriptor`, descriptorIndex);
      if (template === 'named_artifact') {
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else if (template === 'complex_weapon') {
        this.nameIndices.set(`${poolKey}:weapon`, weaponIndex);
        this.nameIndices.set(`${poolKey}:epithet`, epithetIndex);
      } else {
        this.nameIndices.set(`${poolKey}:base`, baseIndex);
      }
      
      return results;
    }

    // Special handling for Poison generator - combine base names with descriptors
    if (generatorKey === 'poison') {
      const baseNames = generator.data.baseNames || [];
      const descriptors = generator.data.descriptors || [];
      
      if (!baseNames || baseNames.length === 0 || !descriptors || descriptors.length === 0) {
        throw new Error('Invalid data structure for Poison generator. Base names or descriptors not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let baseShuffled = this.namePools.get(`${poolKey}:base`);
      let baseIndex = this.nameIndices.get(`${poolKey}:base`) || 0;
      let descriptorShuffled = this.namePools.get(`${poolKey}:descriptor`);
      let descriptorIndex = this.nameIndices.get(`${poolKey}:descriptor`) || 0;
      
      // Initialize pools if needed
      if (!baseShuffled || baseIndex >= baseShuffled.length) {
        baseShuffled = this.shuffleArray([...baseNames]);
        this.namePools.set(`${poolKey}:base`, baseShuffled);
        baseIndex = 0;
      }
      if (!descriptorShuffled || descriptorIndex >= descriptorShuffled.length) {
        descriptorShuffled = this.shuffleArray([...descriptors]);
        this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
        descriptorIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted base names, reshuffle
        if (baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(`${poolKey}:base`, baseShuffled);
          baseIndex = 0;
        }
        // If we've exhausted descriptors, reshuffle
        if (descriptorIndex >= descriptorShuffled.length) {
          descriptorShuffled = this.shuffleArray([...descriptors]);
          this.namePools.set(`${poolKey}:descriptor`, descriptorShuffled);
          descriptorIndex = 0;
        }
        
        const baseName = baseShuffled[baseIndex];
        const descriptor = descriptorShuffled[descriptorIndex];
        
        // Format: "[name], [descriptor]"
        const formattedName = `${baseName}, ${descriptor}`;
        
        results.push(formattedName);
        
        baseIndex++;
        descriptorIndex++;
      }
      
      // Update indices
      this.nameIndices.set(`${poolKey}:base`, baseIndex);
      this.nameIndices.set(`${poolKey}:descriptor`, descriptorIndex);
      
      return results;
    }

    // Special handling for Shield generator - format variations
    if (generatorKey === 'shield') {
      const format = (filters.format && filters.format.trim()) || 'the_name_shield';
      const baseNames = generator.data.baseNames || [];
      const protectorOfNames = generator.data.protectorOfNames || [];
      
      if (!baseNames || baseNames.length === 0) {
        throw new Error('Invalid data structure for Shield generator. Base names not found.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pools
      let baseShuffled = this.namePools.get(`${poolKey}:base`);
      let baseIndex = this.nameIndices.get(`${poolKey}:base`) || 0;
      let protectorShuffled = this.namePools.get(`${poolKey}:protector`);
      let protectorIndex = this.nameIndices.get(`${poolKey}:protector`) || 0;
      
      // Initialize pools if needed
      if (!baseShuffled || baseIndex >= baseShuffled.length) {
        baseShuffled = this.shuffleArray([...baseNames]);
        this.namePools.set(`${poolKey}:base`, baseShuffled);
        baseIndex = 0;
      }
      if (!protectorShuffled || protectorIndex >= protectorShuffled.length) {
        protectorShuffled = this.shuffleArray([...protectorOfNames]);
        this.namePools.set(`${poolKey}:protector`, protectorShuffled);
        protectorIndex = 0;
      }
      
      const results = [];
      
      for (let i = 0; i < count; i++) {
        // If we've exhausted base names, reshuffle
        if (baseIndex >= baseShuffled.length) {
          baseShuffled = this.shuffleArray([...baseNames]);
          this.namePools.set(`${poolKey}:base`, baseShuffled);
          baseIndex = 0;
        }
        // If we've exhausted protector names, reshuffle
        if (protectorIndex >= protectorShuffled.length) {
          protectorShuffled = this.shuffleArray([...protectorOfNames]);
          this.namePools.set(`${poolKey}:protector`, protectorShuffled);
          protectorIndex = 0;
        }
        
        const baseName = baseShuffled[baseIndex];
        const protectorName = protectorShuffled[protectorIndex];
        
        let formattedName;
        
        if (format === 'shield_of_the_name') {
          formattedName = `The Shield of the ${baseName}`;
        } else if (format === 'name_protector_of_name') {
          formattedName = `${baseName}, Protector of ${protectorName}`;
        } else {
          // Default: the_name_shield
          formattedName = `The ${baseName} Shield`;
        }
        
        results.push(formattedName);
        
        baseIndex++;
        if (format === 'name_protector_of_name') {
          protectorIndex++;
        }
      }
      
      // Update indices
      this.nameIndices.set(`${poolKey}:base`, baseIndex);
      if (format === 'name_protector_of_name') {
        this.nameIndices.set(`${poolKey}:protector`, protectorIndex);
      }
      
      return results;
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

    // Special handling for Assassin generator - combine prefixes and suffixes intelligently
    if (generatorKey === 'assassin') {
      const category = (filters.category && filters.category.trim()) || 'modern';
      
      // Handle single aliases
      if (category === 'single_aliases') {
        const aliases = generator.data.single_aliases || [];
        if (!aliases || aliases.length === 0) {
          throw new Error('Invalid data structure for assassin generator. Single aliases not found.');
        }
        
        const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
        let shuffledPool = this.namePools.get(poolKey);
        let currentIndex = this.nameIndices.get(poolKey) || 0;
        
        if (!shuffledPool || currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...aliases]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
        }
        
        const results = [];
        for (let i = 0; i < count; i++) {
          if (currentIndex >= shuffledPool.length) {
            shuffledPool = this.shuffleArray([...aliases]);
            this.namePools.set(poolKey, shuffledPool);
            currentIndex = 0;
          }
          results.push(shuffledPool[currentIndex]);
          currentIndex++;
        }
        
        this.nameIndices.set(poolKey, currentIndex);
        return results;
      }
      
      // Handle compound names based on category
      let prefixes = [];
      let suffixes = [];
      
      if (category === 'modern') {
        prefixes = generator.data.modern_prefixes || [];
        suffixes = generator.data.modern_suffixes || [];
      } else if (category === 'fantasy_dark') {
        prefixes = generator.data.fantasy_dark_prefixes || [];
        suffixes = generator.data.fantasy_dark_suffixes || [];
      } else if (category === 'ethnic_thematic') {
        prefixes = generator.data.ethnic_thematic_prefixes || [];
        // Ethnic thematic uses modern suffixes since it only has prefixes
        suffixes = generator.data.modern_suffixes || [];
      } else {
        // Default to modern if category not recognized
        prefixes = generator.data.modern_prefixes || [];
        suffixes = generator.data.modern_suffixes || [];
      }
      
      if (!prefixes || prefixes.length === 0) {
        throw new Error(`Invalid data structure for assassin generator. Prefixes not found for category: ${category}`);
      }
      if (!suffixes || suffixes.length === 0) {
        throw new Error(`Invalid data structure for assassin generator. Suffixes not found for category: ${category}`);
      }
      
      // Helper function to capitalize first letter
      const capitalize = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
      
      // Helper function to generate compound name
      const generateCompoundName = (prefix, suffix) => {
        // Check if suffix starts with lowercase (like 'shade' from FANTASY_DARK_SUFFIXES)
        const suffixStartsLowercase = suffix.charAt(0) === suffix.charAt(0).toLowerCase();
        
        // If suffix starts with lowercase, concatenate without space and capitalize: "Nightshade"
        if (suffixStartsLowercase) {
          return prefix + capitalize(suffix);
        }
        
        // If prefix contains a space (like "Subject Thirty-One"), always add space before suffix
        if (prefix.includes(' ')) {
          return `${prefix} ${suffix}`;
        }
        
        // If prefix is a single word and suffix is capitalized (surname-like), add space
        // Check if suffix is a surname (starts with uppercase and is longer than 3 chars)
        const suffixIsSurname = suffix.charAt(0) === suffix.charAt(0).toUpperCase() && suffix.length > 3;
        const prefixIsSingleWord = !prefix.includes(' ') && prefix.length < 20;
        
        if (prefixIsSingleWord && suffixIsSurname) {
          // Insert space: "Knox Grimshaw", "Grim March", "Thorstein Hawk"
          return `${prefix} ${suffix}`;
        }
        
        // Default: concatenate without space for single-word combinations
        return prefix + suffix;
      };
      
      // Create pool keys based on category
      const prefixPoolKey = `${categorySlug}:${generatorKey}:prefixes:${category}`;
      const suffixPoolKey = `${categorySlug}:${generatorKey}:suffixes:${category}`;
      
      // Get or create shuffled pools
      let prefixShuffled = this.namePools.get(prefixPoolKey);
      let prefixIndex = this.nameIndices.get(prefixPoolKey) || 0;
      let suffixShuffled = this.namePools.get(suffixPoolKey);
      let suffixIndex = this.nameIndices.get(suffixPoolKey) || 0;
      
      // Initialize pools if needed
      if (!prefixShuffled || prefixIndex >= prefixShuffled.length) {
        prefixShuffled = this.shuffleArray([...prefixes]);
        this.namePools.set(prefixPoolKey, prefixShuffled);
        prefixIndex = 0;
      }
      if (!suffixShuffled || suffixIndex >= suffixShuffled.length) {
        suffixShuffled = this.shuffleArray([...suffixes]);
        this.namePools.set(suffixPoolKey, suffixShuffled);
        suffixIndex = 0;
      }
      
      // Generate combined names
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted prefixes, reshuffle
        if (prefixIndex >= prefixShuffled.length) {
          prefixShuffled = this.shuffleArray([...prefixes]);
          this.namePools.set(prefixPoolKey, prefixShuffled);
          prefixIndex = 0;
        }
        // If we've exhausted suffixes, reshuffle
        if (suffixIndex >= suffixShuffled.length) {
          suffixShuffled = this.shuffleArray([...suffixes]);
          this.namePools.set(suffixPoolKey, suffixShuffled);
          suffixIndex = 0;
        }
        
        const prefix = prefixShuffled[prefixIndex];
        const suffix = suffixShuffled[suffixIndex];
        const compoundName = generateCompoundName(prefix, suffix);
        results.push(compoundName);
        
        prefixIndex++;
        suffixIndex++;
      }
      
      // Update indices
      this.nameIndices.set(prefixPoolKey, prefixIndex);
      this.nameIndices.set(suffixPoolKey, suffixIndex);
      
      return results;
    }

    // Special handling for Guild generator - combine prefixes with organizational titles
    if (generatorKey === 'guild') {
      const style = (filters.style && filters.style.trim()) || 'compound';
      
      // Handle simple names (single-word aliases)
      if (style === 'simple') {
        const aliases = generator.data.single_aliases || [];
        if (!aliases || aliases.length === 0) {
          throw new Error('Invalid data structure for guild generator. Single aliases not found.');
        }
        
        const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
        let shuffledPool = this.namePools.get(poolKey);
        let currentIndex = this.nameIndices.get(poolKey) || 0;
        
        if (!shuffledPool || currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...aliases]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
        }
        
        const results = [];
        for (let i = 0; i < count; i++) {
          if (currentIndex >= shuffledPool.length) {
            shuffledPool = this.shuffleArray([...aliases]);
            this.namePools.set(poolKey, shuffledPool);
            currentIndex = 0;
          }
          
          const alias = shuffledPool[currentIndex];
          // 50% chance to prepend "The "
          const guildName = Math.random() < 0.5 ? `The ${alias}` : alias;
          results.push(guildName);
          currentIndex++;
        }
        
        this.nameIndices.set(poolKey, currentIndex);
        return results;
      }
      
      // Handle compound names (prefix + organizational title)
      const prefixes = generator.data.prefixes || [];
      const suffixes = generator.data.suffixes || [];
      
      if (!prefixes || prefixes.length === 0) {
        throw new Error('Invalid data structure for guild generator. Prefixes not found.');
      }
      if (!suffixes || suffixes.length === 0) {
        throw new Error('Invalid data structure for guild generator. Suffixes not found.');
      }
      
      // Create pool keys
      const prefixPoolKey = `${categorySlug}:${generatorKey}:prefixes`;
      const suffixPoolKey = `${categorySlug}:${generatorKey}:suffixes`;
      
      // Get or create shuffled pools
      let prefixShuffled = this.namePools.get(prefixPoolKey);
      let prefixIndex = this.nameIndices.get(prefixPoolKey) || 0;
      let suffixShuffled = this.namePools.get(suffixPoolKey);
      let suffixIndex = this.nameIndices.get(suffixPoolKey) || 0;
      
      // Initialize pools if needed
      if (!prefixShuffled || prefixIndex >= prefixShuffled.length) {
        prefixShuffled = this.shuffleArray([...prefixes]);
        this.namePools.set(prefixPoolKey, prefixShuffled);
        prefixIndex = 0;
      }
      if (!suffixShuffled || suffixIndex >= suffixShuffled.length) {
        suffixShuffled = this.shuffleArray([...suffixes]);
        this.namePools.set(suffixPoolKey, suffixShuffled);
        suffixIndex = 0;
      }
      
      // Generate combined names
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted prefixes, reshuffle
        if (prefixIndex >= prefixShuffled.length) {
          prefixShuffled = this.shuffleArray([...prefixes]);
          this.namePools.set(prefixPoolKey, prefixShuffled);
          prefixIndex = 0;
        }
        // If we've exhausted suffixes, reshuffle
        if (suffixIndex >= suffixShuffled.length) {
          suffixShuffled = this.shuffleArray([...suffixes]);
          this.namePools.set(suffixPoolKey, suffixShuffled);
          suffixIndex = 0;
        }
        
        const prefix = prefixShuffled[prefixIndex];
        const suffixFormat = suffixShuffled[suffixIndex];
        // Replace [Name] placeholder with the prefix
        const guildName = suffixFormat.replace(/\[Name\]/g, prefix);
        results.push(guildName);
        
        prefixIndex++;
        suffixIndex++;
      }
      
      // Update indices
      this.nameIndices.set(prefixPoolKey, prefixIndex);
      this.nameIndices.set(suffixPoolKey, suffixIndex);
      
      return results;
    }

    // Special handling for Brand generator - category-based name selection
    if (generatorKey === 'brand') {
      const category = (filters.category && filters.category.trim()) || 'all_categories';
      
      // Determine which categories to use
      let categoriesToUse = [];
      if (category === 'all_categories') {
        // Use all categories - find all keys that end with "_Brands"
        categoriesToUse = Object.keys(generator.data).filter(key => 
          key.endsWith('_Brands') && Array.isArray(generator.data[key])
        );
      } else {
        // Convert filter category to data key format (tech_innovation -> Tech_Innovation_Brands)
        const categoryKey = category.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('_') + '_Brands';
        
        if (generator.data[categoryKey] && Array.isArray(generator.data[categoryKey])) {
          categoriesToUse = [categoryKey];
        } else {
          throw new Error(`Invalid category for brand generator: ${category} (looking for ${categoryKey})`);
        }
      }
      
      // Collect all names from selected categories
      let allNames = [];
      categoriesToUse.forEach(catKey => {
        const names = generator.data[catKey] || [];
        allNames = allNames.concat(names);
      });
      
      if (!allNames || allNames.length === 0) {
        throw new Error('Invalid data structure for brand generator. No names found for selected category.');
      }
      
      // Create pool key
      const poolKey = this.createPoolKey(categorySlug, generatorKey, filters);
      
      // Get or create shuffled pool
      let shuffledPool = this.namePools.get(poolKey);
      let currentIndex = this.nameIndices.get(poolKey) || 0;
      
      if (!shuffledPool || currentIndex >= shuffledPool.length) {
        shuffledPool = this.shuffleArray([...allNames]);
        this.namePools.set(poolKey, shuffledPool);
        currentIndex = 0;
      }
      
      // Generate names
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted the pool, reshuffle
        if (currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...allNames]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
        }
        
        results.push(shuffledPool[currentIndex]);
        currentIndex++;
      }
      
      // Update index
      this.nameIndices.set(poolKey, currentIndex);
      
      return results;
    }

    // Special handling for Fantasy NPC generator - gender-based name selection
    if (generatorKey === 'fantasy_npc') {
      const gender = (filters.gender && filters.gender.trim()) || 'male';
      
      // Get names for selected gender
      let namePool = [];
      if (gender === 'male') {
        namePool = generator.data.male || [];
      } else if (gender === 'female') {
        namePool = generator.data.female || [];
      } else if (gender === 'non_binary') {
        namePool = generator.data.non_binary || [];
      } else {
        // Default to male if gender not recognized
        namePool = generator.data.male || [];
      }
      
      if (!namePool || namePool.length === 0) {
        throw new Error(`Invalid data structure for fantasy NPC generator. Names not found for gender: ${gender}`);
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
      
      // Generate names
      const results = [];
      for (let i = 0; i < count; i++) {
        // If we've exhausted the pool, reshuffle
        if (currentIndex >= shuffledPool.length) {
          shuffledPool = this.shuffleArray([...namePool]);
          this.namePools.set(poolKey, shuffledPool);
          currentIndex = 0;
        }
        
        results.push(shuffledPool[currentIndex]);
        currentIndex++;
      }
      
      // Update index
      this.nameIndices.set(poolKey, currentIndex);
      
      return results;
    }

    // Special handling for Vampire generator - combine first and last names with first name repetition prevention
    if (generatorKey === 'vampire') {
      const gender = (filters.gender && filters.gender.trim()) || 'male';
      
      // Get gender data
      let genderData;
      if (gender === 'male') {
        genderData = generator.data.male;
      } else if (gender === 'female') {
        genderData = generator.data.female;
      } else if (gender === 'non_binary') {
        genderData = generator.data.non_binary;
      } else {
        // Default to male if gender not recognized
        genderData = generator.data.male;
      }
      
      if (!genderData || !genderData.firstNames || !genderData.lastNames) {
        throw new Error(`Invalid data structure for vampire generator. Gender: ${gender}`);
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
      
      // Generate combined names with first name repetition prevention
      const results = [];
      const usedFirstNames = new Set();
      let attempts = 0;
      const maxAttempts = firstNames.length * lastNames.length * 3; // Prevent infinite loops
      
      while (results.length < count && attempts < maxAttempts) {
        // If we've exhausted first names, reshuffle and reset
        if (firstIndex >= firstShuffled.length) {
          firstShuffled = this.shuffleArray([...firstNames]);
          this.namePools.set(firstPoolKey, firstShuffled);
          firstIndex = 0;
          usedFirstNames.clear(); // Reset used first names when reshuffling
        }
        // If we've exhausted last names, reshuffle
        if (lastIndex >= lastShuffled.length) {
          lastShuffled = this.shuffleArray([...lastNames]);
          this.namePools.set(lastPoolKey, lastShuffled);
          lastIndex = 0;
        }
        
        const firstName = firstShuffled[firstIndex];
        const lastName = lastShuffled[lastIndex];
        
        // Check if this first name has already been used
        if (!usedFirstNames.has(firstName)) {
          // Combine first and last name
          const fullName = String(firstName).trim() + ' ' + String(lastName).trim();
          results.push(fullName);
          usedFirstNames.add(firstName);
          
          // Move to next first name (to ensure no repetition)
          firstIndex++;
        } else {
          // First name already used, try next first name
          firstIndex++;
        }
        
        // Always advance last name to get variety in surnames
        lastIndex++;
        
        attempts++;
      }
      
      // Update indices
      this.nameIndices.set(firstPoolKey, firstIndex);
      this.nameIndices.set(lastPoolKey, lastIndex);
      
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

