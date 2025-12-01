#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Brand name data from the provided JSON
const brandData = {
  "Tech_Innovation_Brands": [
    "Nexus", "Vertex", "Apex", "Zenith", "Prism", "Pulse", "Spark", "Flux", "Echo", "Vibe",
    "Sync", "Flow", "Grid", "Core", "Link", "Node", "Edge", "Beam", "Wave", "Surge",
    "Peak", "Rise", "Shift", "Drift", "Bolt", "Charge", "Circuit", "Vector", "Matrix", "Cipher",
    "Quantum", "Nexum", "Vortex", "Axiom", "Epoch", "Lumina", "Spectra", "Aether", "Helix", "Kinetic",
    "Velocity", "Momentum", "Catalyst", "Radiant", "Infinite", "Sublime", "Elevate", "Ascend", "Transcend", "Paramount",
    "Celestial", "Stellar", "Cosmic", "Nebula", "Aurora", "Eclipse", "Solstice", "Equinox", "Meridian", "Zenon",
    "Photon", "Neutron", "Proton", "Electron", "Polaris", "Nova", "Supernova", "Astral", "Lunar", "Solar",
    "Pioneer", "Satellite", "Protocol", "Binary", "Cogent", "Fusion", "Orbit", "Stellaris", "Teleport", "Signal",
    "Byte", "Mesh", "Data", "Hyperion", "Chronos", "Sentry", "Sentinel", "Alacrity", "Celerity", "Dynamo",
    "Insight", "Clarity", "Vision", "Foresight", "Schema", "Algorithm", "Module", "System", "Process", "Interface",
    "Infinitum", "Veridian", "Tetra", "Penta", "Exa", "Zeta", "Tera", "Peta", "Giga", "Fido",
    "Logic", "Meta", "Kilo", "Zett", "Yotta", "Octa", "Hecto", "Deca", "Nano", "Pico",
    "Femto", "Atto", "Zepto", "Yocto", "Jolt", "Blast", "Zip", "Quickstep", "Run", "Sprint",
    "Leap", "Bound", "Spring", "Cyber", "Digit", "Wired", "Connect", "Remote", "Sphere", "Globe"
  ],
  "Luxury_Premium_Brands": [
    "Luxe", "Elite", "Regal", "Noble", "Grand", "Prime", "Royal", "Crown", "Crest", "Manor",
    "Estate", "Palace", "Château", "Villa", "Prestige", "Opulent", "Sovereign", "Majestic", "Imperial", "Monarch",
    "Dynasty", "Heritage", "Legacy", "Regent", "Vanguard", "Pinnacle", "Summit", "Paramount", "Distinction", "Exquisite",
    "Refined", "Elegant", "Graceful", "Sterling", "Platinum", "Diamond", "Sapphire", "Emerald", "Obsidian", "Onyx",
    "Pearl", "Ivory", "Aurora", "Luxor", "Versailles", "Monaco", "Geneva", "Milano", "Firenze", "Venezia",
    "Roma", "Athens", "Vienna", "Cambridge", "Oxford", "Westminster", "Brighton", "Richmond", "Kensington", "Belmont",
    "Fairmont", "Westmont", "Eastmont", "Northmont", "Southmont",
    "Suede", "Velvet", "Cashmere", "Silken", "Carat", "Gilded", "Polished", "Gleam", "Shimmer", "Luster",
    "Brilliance", "Grandeur", "Magnate", "Baron", "Duke", "Earl", "Prince", "Sultan", "Pasha", "Maharajah",
    "Rajah", "Czar", "Kaiser", "Shah", "Emperor", "King", "Queen", "Peerage", "Nobility", "Patrician",
    "Senator", "Consul", "Tribune", "Curia", "Forum", "Pantheon", "Triumvirate", "Decurion", "Praetor", "Quaestor",
    "Aedile", "Censor", "Proconsul", "Legate", "Lictor", "Centurion", "Optio", "Signifer", "Aquilifer", "Vexillarius",
    "Imaginifer", "Cornicen", "Tesserarius", "Duplicarius", "Primus", "Princeps", "Hastatus", "Triarius", "Velites", "Socii",
    "Auxilia", "Chiffon", "Silk", "Damask", "Brocade", "Tweed"
  ],
  "Nature_Organic_Brands": [
    "Terra", "Flora", "Fauna", "Verde", "Jade", "Sage", "Moss", "Fern", "Leaf", "Root",
    "Bark", "Branch", "Grove", "Forest", "Woods", "Meadow", "Field", "Garden", "Orchard", "Harvest",
    "Bloom", "Blossom", "Petal", "Nectar", "Honey", "Amber", "Cedar", "Oak", "Pine", "Maple",
    "Willow", "Birch", "Aspen", "Sequoia", "Redwood", "Cypress", "Juniper", "Hawthorn", "Thistle", "Clover",
    "Ivy", "Heather", "Lavender", "Rosemary", "Thyme", "Basil", "Mint", "Pepper", "Ginger", "Cinnamon",
    "Vanilla", "Cocoa", "Chai", "Karma", "Zen", "Om", "Bodhi", "Lotus", "Chakra", "Aura",
    "Spirit", "Soul", "Essence", "Pure", "Natural", "Vital", "Living", "Organic", "Green", "Earth",
    "Planet", "Gaia", "Eden", "Oasis", "Paradise", "Haven", "Sanctuary",
    "Glacier", "Canyon", "Summit", "Tundra", "Delta", "Sprout", "Tendril", "Vine", "Fjord", "Inlet",
    "Sound", "Lagoon", "Bayou", "Bog", "Fen", "Heath", "Marsh", "Mire", "Moor", "Swamp",
    "Tangle", "Thicket", "Undergrowth", "Brushwood", "Copse", "Coppice", "Spinney", "Weald", "Bracken", "Gorse",
    "Broom", "Furze", "Rush", "Sedge", "Cattail", "Reed", "Bulrush", "Waterlily", "Foxglove", "Primrose",
    "Bluebell", "Daffodil", "Snowdrop", "Crocus", "Tulip", "Hyacinth", "Iris", "Lily", "Daisy", "Poppy",
    "Rose", "Violet", "Pansy", "Zinnia", "Marigold", "Petunia", "Dahlia", "Sunflower", "Gladiolus", "Carnation",
    "Dew", "Mist", "Fog", "Haze", "Rain", "Snow", "Hail", "Sleet", "Vapour", "Aura"
  ],
  "Bold_Athletic_Brands": [
    "Titan", "Atlas", "Hercules", "Spartan", "Warrior", "Gladiator", "Champion", "Victor", "Triumph", "Glory",
    "Honor", "Valor", "Courage", "Brave", "Bold", "Strong", "Power", "Force", "Might", "Impact",
    "Rush", "Blast", "Thunder", "Lightning", "Storm", "Tempest", "Cyclone", "Tornado", "Hurricane", "Blizzard",
    "Avalanche", "Rockslide", "Earthquake", "Volcano", "Inferno", "Wildfire", "Ember", "Flame", "Blaze", "Ignite",
    "Scorch", "Burn", "Forge", "Anvil", "Hammer", "Steel", "Iron", "Titanium", "Alloy", "Metal",
    "Chrome", "Carbon", "Granite", "Marble", "Obsidian", "Flint", "Slate", "Boulder", "Mountain", "Peak",
    "Summit", "Cliff", "Ridge", "Crest", "Pinnacle",
    "Velocity", "Momentum", "Surge", "Drive", "Thrust", "Torque", "Kinetic", "Dynamic", "Vigor", "Grit",
    "Edge", "Sharp", "Keen", "Fierce", "Brutal", "Savage", "Unbroken", "Relentless", "Tenacious", "Endure",
    "Withstand", "Fortitude", "Mettle", "Spine", "Backbone", "Iridium", "Osmium", "Tungsten", "Chromium", "Vanadium",
    "Niobium", "Tantalum", "Zirconium", "Hafnium", "Rhenium", "Technetium", "Promethium", "Neptunium", "Plutonium", "Americium",
    "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium", "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium",
    "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Darmstadtium", "Roentgenium", "Copernicium", "Nihonium", "Flerovium", "Moscovium",
    "Livermorium", "Tennessine", "Oganesson", "Raze", "Crush", "Smash", "Shatter", "Decimate"
  ],
  "Modern_Minimalist_Brands": [
    "Mono", "Duo", "Trio", "Quad", "Penta", "Hexa", "Octa", "Deca", "Uni", "Solo",
    "Pure", "Base", "Core", "Root", "Main", "True", "Real", "Bare", "Void", "Null",
    "Zero", "One", "Two", "Alpha", "Beta", "Gamma", "Delta", "Sigma", "Omega", "Plain",
    "Simple", "Clear", "Clean", "Fresh", "Crisp", "Sharp", "Smooth", "Sleek", "Slim", "Lean",
    "Light", "Soft", "Calm", "Quiet", "Still", "Rest", "Ease", "Peace", "Zen", "Hush",
    "Mute", "Silent", "Whisper", "Echo", "Faint", "Subtle", "Mild", "Gentle", "Kind", "Good",
    "Nice", "Fine", "Fair", "Just", "True", "Right", "Proper", "Decent", "Sound", "Solid",
    "Stable", "Steady", "Firm", "Fixed",
    "Pause", "Break", "Blank", "Empty", "Stark", "Sheer", "Utter", "Mere", "Stem", "Trunk",
    "Heart", "Soul", "Spirit", "Mind", "Thought", "Idea", "Notion", "Concept", "Principle", "Rule",
    "Law", "Order", "System", "Method", "Way", "Path", "Route", "Course", "Track", "Trail",
    "Line", "Row", "Rank", "File", "Series", "Sequence", "Chain", "Link", "Loop", "Ring",
    "Circle", "Cycle", "Spiral", "Helix", "Curve", "Arc", "Bend", "Turn", "Twist", "Coil",
    "Curl", "Swirl", "Aero", "Leno", "Cera", "Stilo", "Velo", "Aura", "Hako", "Mira",
    "Niko", "Zela", "Tyme", "Loka", "Vada", "Melo", "Kido", "Fomo", "Yono", "Tana"
  ],
  "Food_Beverage_Brands": [
    "Savory", "Sweet", "Spice", "Zest", "Tang", "Zing", "Snap", "Crunch", "Crisp", "Bite",
    "Morsel", "Nibble", "Feast", "Dine", "Sup", "Sip", "Gulp", "Quench", "Refresh", "Revive",
    "Nourish", "Fuel", "Energy", "Vitality", "Vigor", "Boost", "Lift", "Rise", "Peak", "Prime",
    "Chef", "Cook", "Baker", "Brew", "Roast", "Toast", "Grill", "Smoke", "Cure", "Pickle",
    "Preserve", "Jar", "Bottle", "Can", "Tin", "Box", "Basket", "Barrel", "Cask", "Keg",
    "Vat", "Kettle", "Pot", "Pan", "Skillet", "Wok", "Oven", "Kiln", "Hearth", "Kitchen",
    "Table", "Counter", "Board", "Block", "Slab", "Stone", "Clay", "Wood", "Copper", "Cast",
    "Vessel",
    "Swirl", "Carafe", "Decanter", "Tumbler", "Goblet", "Flute", "Chalice", "Mug", "Cup", "Saucer",
    "Plate", "Bowl", "Dish", "Platter", "Tray", "Server", "Ladle", "Spoon", "Fork", "Knife",
    "Spatula", "Whisk", "Grater", "Pantry", "Larder", "Cellar", "Bistro", "Cafe", "Tavern", "Inn",
    "Diner", "Eatery", "Chop", "Slice", "Dice", "Mince", "Shred", "Julienne", "Bake", "Fry",
    "Sauté", "Simmer", "Boil", "Steam", "Poach", "Blanch", "Braise", "Stew", "Garnish", "Infuse",
    "Extract", "Distill", "Filter", "Strain", "Sieve", "Sift", "Blend", "Mix", "Whip", "Fold",
    "Stir", "Shake", "Drizzle", "Sprinkle", "Dust", "Glaze", "Baste", "Marinate", "Rub", "Season"
  ],
  "Creative_Artistic_Brands": [
    "Canvas", "Palette", "Easel", "Brush", "Stroke", "Sketch", "Draft", "Draw", "Paint", "Color",
    "Hue", "Shade", "Tint", "Tone", "Pigment", "Dye", "Ink", "Charcoal", "Graphite", "Pastel",
    "Crayon", "Marker", "Pencil", "Pen", "Quill", "Stylus", "Tool", "Craft", "Make", "Build",
    "Create", "Design", "Form", "Shape", "Mold", "Cast", "Sculpt", "Carve", "Chisel", "Etch",
    "Engrave", "Print", "Press", "Stamp", "Mark", "Sign", "Seal", "Brand", "Logo", "Icon",
    "Symbol", "Emblem", "Badge", "Crest", "Shield", "Banner", "Flag", "Pendant", "Medallion", "Token",
    "Coin", "Medal", "Trophy", "Award", "Prize", "Crown", "Wreath", "Laurel", "Garland",
    "Studio", "Gallery", "Museum", "Exhibition", "Showcase", "Display", "View", "Sight", "Scene", "Vision",
    "Dream", "Fantasy", "Imagination", "Idea", "Concept", "Notion", "Thought", "Mind", "Soul", "Spirit",
    "Heart", "Essence", "Focus", "Compose", "Curate", "Exhibit", "Animate", "Render", "Script", "Muse",
    "Inspire", "Aesthetic", "Motif", "Texture", "Pattern", "Rhythm", "Tempo", "Scale", "Proportion", "Volume",
    "Angle", "Perspective", "Depth", "Horizon", "Focal", "Gesso", "Fresco", "Mosaic", "Sfumato", "Impasto",
    "Decoupage", "Collage", "Montage", "Diorama", "Mobile", "Kinetic", "Statue", "Bust", "Figure", "Relief",
    "Column", "Capital", "Frieze", "Pedestal", "Pediment", "Entablature", "Architrave", "Metope", "Triglyph"
  ],
  "Urban_Street_Brands": [
    "Metro", "City", "Urban", "Street", "Avenue", "Boulevard", "Lane", "Road", "Path", "Trail",
    "Route", "Way", "Drive", "Court", "Place", "Square", "Plaza", "Park", "Green", "Common",
    "Market", "Bazaar", "Arcade", "Gallery", "Studio", "Workshop", "Loft", "Attic", "Basement", "Cellar",
    "Vault", "Chamber", "Room", "Hall", "Corridor", "Passage", "Alley", "Shortcut", "Bypass", "Detour",
    "Junction", "Crossing", "Corner", "Edge", "Border", "Frontier", "Boundary", "Limit", "Line", "Divide",
    "Split", "Fork", "Branch", "Merge", "Join", "Unite", "Gather", "Collect", "Assemble", "Group",
    "Crew", "Gang", "Squad", "Team", "Unit", "Force", "Brigade", "Legion", "Regiment", "Battalion",
    "Company", "Division",
    "Sector", "District", "Quarter", "Zone", "Precinct", "Ward", "Turf", "Turret", "Gable", "Façade",
    "Pavement", "Asphalt", "Concrete", "Sidewalk", "Footpath", "Overpass", "Underpass", "Flyover", "Subway", "Tram",
    "Bus", "Taxi", "Rider", "Skate", "Board", "Bike", "Cycle", "Run", "Walk", "Stride",
    "Roam", "Wander", "Drifter", "Loiter", "Hustle", "Grind", "Graffiti", "Mural", "Tag", "Piece",
    "Wall", "Brick", "Steel", "Glass", "Shutter", "Blind", "Awning", "Canopy", "Balcony", "Terrace",
    "Rooftop", "Skyline", "Tower", "Slab", "Plinth", "Pedestal", "Fountain", "Statue", "Monument", "Pillar",
    "Bench", "Lamp", "Kiosk", "Stall", "Vendor", "Streetlight", "Manhole", "Gutter", "Drain"
  ],
  "Ocean_Maritime_Brands": [
    "Pacific", "Atlantic", "Arctic", "Marine", "Maritime", "Naval", "Nautical", "Aquatic", "Oceanic", "Coastal",
    "Harbor", "Port", "Bay", "Cove", "Inlet", "Gulf", "Sound", "Strait", "Channel", "Current",
    "Tide", "Wave", "Surf", "Swell", "Ripple", "Splash", "Spray", "Foam", "Froth", "Bubble",
    "Pearl", "Shell", "Coral", "Reef", "Lagoon", "Atoll", "Island", "Isle", "Beach", "Shore",
    "Coast", "Sand", "Pebble", "Stone", "Rock", "Cliff", "Bluff", "Headland", "Point", "Cape",
    "Peninsula", "Delta", "Estuary", "River", "Stream", "Creek", "Brook", "Rivulet", "Cascade", "Falls",
    "Rapids", "Whirlpool", "Eddy", "Pool", "Pond", "Lake", "Reservoir", "Basin", "Depth", "Trench",
    "Abyss",
    "Fjord", "Marina", "Quay", "Wharf", "Jetty", "Dock", "Slip", "Pier", "Anchor", "Mooring",
    "Rigging", "Sail", "Mast", "Rudder", "Helm", "Keel", "Hull", "Bow", "Stern", "Starboard",
    "Deck", "Cabin", "Galley", "Scuttle", "Porthole", "Hatch", "Companionway", "Bridge", "Seabird", "Gull",
    "Albatross", "Petrel", "Cormorant", "Tern", "Wader", "Puffin", "Penguin", "Dolphin", "Whale", "Orca",
    "Seal", "Walrus", "Manatee", "Dugong", "Otter", "Shark", "Tuna", "Cod", "Salmon", "Trout",
    "Herring", "Mackerel", "Sardine", "Crab", "Lobster", "Shrimp", "Prawn", "Squid", "Octopus", "Jellyfish",
    "Anemone", "Kelp", "Seaweed", "Plankton", "Triton", "Neptune", "Poseidon", "Ariel", "Ondine", "Mermaid",
    "Siren", "Corsair", "Buccaneer", "Privateer", "Skipper", "Captain", "Commodore", "Admiral", "Flotilla", "Armada"
  ],
  "Desert_Earth_Brands": [
    "Sahara", "Mojave", "Gobi", "Kalahari", "Sonora", "Mesa", "Butte", "Canyon", "Ravine", "Gorge",
    "Valley", "Basin", "Plateau", "Plain", "Prairie", "Savanna", "Steppe", "Tundra", "Taiga", "Boreal",
    "Alpine", "Highland", "Lowland", "Midland", "Upland", "Inland", "Outback", "Frontier", "Wilderness", "Wild",
    "Untamed", "Raw", "Rough", "Rugged", "Hardy", "Tough", "Durable", "Lasting", "Enduring", "Eternal",
    "Timeless", "Ageless", "Ancient", "Primal", "Primitive", "Original", "First", "Pioneer", "Trailblazer", "Pathfinder",
    "Wayfinder", "Navigator", "Explorer", "Voyager", "Traveler", "Wanderer", "Nomad", "Ranger", "Scout", "Guide",
    "Leader", "Chief", "Captain", "Commander", "Director", "Manager", "Executive", "President",
    "Senator", "Consul", "Tribune", "Curia", "Forum", "Pantheon", "Triumvirate", "Decurion", "Praetor", "Quaestor",
    "Aedile", "Censor", "Proconsul", "Legate", "Lictor", "Centurion", "Optio", "Signifer", "Aquilifer", "Vexillarius",
    "Imaginifer", "Cornicen", "Tesserarius", "Duplicarius", "Primus", "Princeps", "Hastatus", "Triarius", "Velites", "Socii",
    "Auxilia", "Sultan", "Pasha", "Maharajah", "Rajah", "Czar", "Kaiser", "Shah", "Emperor", "King",
    "Queen", "Peerage", "Nobility", "Patrician", "Lava", "Magma", "Crater", "Volcano", "Fumarole", "Geyser",
    "Hotspring", "Tuff", "Ash", "Cinder", "Pumice", "Basalt", "Shale", "Clay", "Loam", "Silt",
    "Gravel", "Sandstone", "Limestone", "Dolomite", "Quartzite", "Mica", "Talc", "Gypsum", "Saltpeter", "Borax"
  ],
  "Space_Cosmic_Brands": [
    "Galaxy", "Cosmos", "Universe", "Infinity", "Eternity", "Forever", "Always", "Constant", "Eternal", "Perpetual",
    "Endless", "Boundless", "Limitless", "Vast", "Immense", "Enormous", "Massive", "Colossal", "Giant", "Titan",
    "Mammoth", "Jumbo", "Mega", "Ultra", "Super", "Hyper", "Extra", "Plus", "Max", "Peak",
    "Top", "High", "Upper", "Supreme", "Ultimate", "Final", "Last", "End", "Terminal", "Finish",
    "Complete", "Total", "Full", "Whole", "Entire", "All", "Every", "Each", "Single", "Sole",
    "Only", "Unique", "Rare", "Special", "Distinct", "Different", "Other", "Another", "New", "Novel",
    "Fresh", "Modern", "Current", "Present", "Now", "Today", "Tomorrow", "Future", "Next", "Coming",
    "Upcoming", "Approaching", "Nearing", "Close", "Near",
    "Orbit", "Trajectory", "Vector", "Warp", "Grav", "Inertia", "Propulsion", "Thruster", "Phaser", "Blaster",
    "Ray", "Beam", "Pulse", "Laser", "Plasma", "Fission", "Fusion", "Quasar", "Pulsar", "Magnetar",
    "Dwarf", "Starlet", "Cluster", "Constellation", "Asteroid", "Meteor", "Satellite", "Probe", "Shuttle", "Rover",
    "Lander", "Station", "Colony", "Base", "Outpost", "Citadel", "Beacon", "Signal", "Broadcast", "Uplink",
    "Downlink", "Teleport", "Jump", "Gate", "Portal", "Rift", "Aperture", "Window", "View", "Vista",
    "Panorama", "Scope", "Vision", "Field", "Horizon", "Zenith", "Nadir", "Apex", "Cardinal", "Ordinal",
    "Void", "Vacuum", "Cradle", "Echo", "Mantle", "Sphere", "Globe", "Axis", "Pivot", "Zen"
  ],
  "Heritage_Vintage_Brands": [
    "Classic", "Vintage", "Retro", "Antique", "Historic", "Ancient", "Old", "Original", "Authentic", "Genuine",
    "Real", "True", "Honest", "Sincere", "Frank", "Open", "Direct", "Straight", "Plain", "Simple",
    "Basic", "Essential", "Fundamental", "Primary", "Main", "Chief", "Principal", "Leading", "Major", "Key",
    "Central", "Core", "Heart", "Soul", "Spirit", "Essence", "Nature", "Character", "Quality", "Grade",
    "Class", "Rank", "Level", "Tier", "Stage", "Phase", "Step", "Point", "Mark", "Sign",
    "Signal", "Indicator", "Gauge", "Measure", "Meter", "Scale", "Range", "Scope", "Span", "Reach",
    "Extent", "Degree", "Amount", "Quantity", "Volume", "Mass", "Weight", "Load", "Burden", "Cargo",
    "Freight", "Haul", "Carry", "Transport", "Move", "Shift",
    "Archive", "Chronicle", "Relic", "Heirloom", "Keepsake", "Souvenir", "Memento", "Token", "Artifact", "Curio",
    "Trove", "Treasury", "Repository", "Vault", "Strongbox", "Coffer", "Chest", "Cabinet", "Cupboard", "Shelf",
    "Rack", "Stand", "Display", "Exhibit", "Showcase", "Museum", "Gallery", "Hall", "Chamber", "Room",
    "Suite", "Apartment", "Flat", "Loft", "Studio", "Workshop", "Atelier", "Den", "Library", "Study",
    "Office", "Bureau", "Desk", "Table", "Bench", "Stool", "Chair", "Sofa", "Couch", "Divan",
    "Settee", "Chaise", "Ottoman", "Pouf", "Hassock", "Cushion", "Pillow", "Blanket", "Throw", "Rug",
    "Carpet", "Mat", "Runner", "Tapestry", "Textile", "Fabric", "Cloth", "Linen", "Silk", "Velvet",
    "Cotton", "Twill", "Denim", "Satin", "Brocade", "Damask", "Muslin", "Percale", "Chintz", "Crepe"
  ],
  "Energy_Power_Brands": [
    "Dynamo", "Generator", "Reactor", "Engine", "Motor", "Turbine", "Piston", "Cylinder", "Valve", "Gear",
    "Cog", "Wheel", "Axle", "Shaft", "Rod", "Bar", "Beam", "Post", "Pillar", "Column",
    "Tower", "Spire", "Steeple", "Dome", "Arch", "Vault", "Span", "Bridge", "Link", "Chain",
    "Cable", "Wire", "Cord", "Rope", "String", "Thread", "Fiber", "Strand", "Filament", "Line",
    "Strip", "Band", "Belt", "Strap", "Tie", "Bind", "Fasten", "Secure", "Lock", "Bolt",
    "Latch", "Clasp", "Clip", "Pin", "Nail", "Screw", "Rivet", "Weld", "Join", "Connect",
    "Attach", "Fix", "Mount", "Install", "Set", "Place", "Position", "Locate", "Site", "Station",
    "Base", "Foundation", "Ground", "Floor", "Level",
    "Surge", "Current", "Flow", "Volt", "Amp", "Watt", "Ohm", "Joule", "Erg", "Newton",
    "Tesla", "Faraday", "Coulomb", "Henry", "Hertz", "Siemens", "Weber", "Lumen", "Lux", "Candela",
    "Becquerel", "Gray", "Sievert", "Katal", "Pascal", "Bar", "Atmosphere", "Torr", "Kilo", "Mega",
    "Giga", "Tera", "Peta", "Exa", "Zetta", "Yotta", "Jolt", "Shock", "Blast", "Burst",
    "Pop", "Snap", "Crackle", "Spark", "Flash", "Glow", "Glint", "Shine", "Radiate", "Emit",
    "Focus", "Direct", "Guide", "Channel", "Conduit", "Pipe", "Tube", "Duct", "Vent", "Flue",
    "Stack", "Chimney", "Exhaust", "Inlet", "Outlet", "Spout", "Nozzle", "Tip", "Head", "Mouth",
    "Opening", "Plasma", "Kinetic", "Thermal", "Friction", "Pressure", "Aura", "Field", "Charge", "Grid"
  ],
  "Fashion_Style_Brands": [
    "Vogue", "Style", "Fashion", "Trend", "Mode", "Chic", "Sleek", "Sharp", "Smart", "Crisp",
    "Clean", "Fresh", "Bright", "Light", "Pale", "Fair", "Clear", "Pure", "White", "Black",
    "Gray", "Beige", "Tan", "Brown", "Red", "Blue", "Green", "Yellow", "Orange", "Purple",
    "Pink", "Violet", "Indigo", "Cyan", "Magenta", "Crimson", "Scarlet", "Ruby", "Rose", "Coral",
    "Peach", "Apricot", "Gold", "Silver", "Bronze", "Copper", "Brass", "Pewter", "Lead", "Zinc",
    "Nickel", "Tin", "Aluminum", "Titanium", "Platinum", "Palladium", "Rhodium", "Iridium", "Osmium", "Ruthenium",
    "Chrome", "Cobalt", "Mercury", "Cadmium", "Antimony", "Bismuth", "Tungsten", "Molybdenum",
    "Tailor", "Seamstress", "Couturier", "Designer", "Stylist", "Curator", "Editor", "Critic", "Reviewer", "Blogger",
    "Influencer", "Model", "Muse", "Icon", "Idol", "Celebrity", "Star", "Diva", "Glamour", "Glimmer",
    "Shimmer", "Sparkle", "Twinkle", "Flash", "Flare", "Beacon", "Lamp", "Lantern", "Torch", "Candle",
    "Wick", "Blaze", "Fire", "Inferno", "Pyre", "Bonfire", "Campfire", "Hearth", "Furnace", "Forge",
    "Kiln", "Oven", "Stove", "Range", "Cooker", "Grill", "Broiler", "Roaster", "Toaster", "Warmer",
    "Heater", "Radiator", "Boiler", "Burner", "Element", "Coil", "Plate", "Pan", "Pot", "Kettle",
    "Cauldron", "Crucible", "Vessel", "Container", "Holder", "Receptacle", "Gown", "Tuxedo", "Blazer", "Jacket",
    "Vest", "Skirt", "Trousers", "Jeans", "Shirt", "Blouse", "Sweater", "Cardigan", "Scarf", "Shawl"
  ],
  "Health_Wellness_Brands": [
    "Vitality", "Wellness", "Health", "Fitness", "Strength", "Energy", "Power", "Force", "Vigor", "Vim",
    "Verve", "Zeal", "Zest", "Passion", "Fire", "Flame", "Spark", "Glow", "Shine", "Radiance",
    "Brilliance", "Luster", "Gleam", "Glimmer", "Shimmer", "Sparkle", "Twinkle", "Flash", "Flare", "Beacon",
    "Light", "Lamp", "Lantern", "Torch", "Candle", "Wick", "Flame", "Blaze", "Fire", "Inferno",
    "Pyre", "Bonfire", "Campfire", "Hearth", "Furnace", "Forge", "Kiln", "Oven", "Stove", "Range",
    "Cooker", "Grill", "Broiler", "Roaster", "Toaster", "Warmer", "Heater", "Radiator", "Boiler", "Burner",
    "Element", "Coil", "Plate", "Pan", "Pot", "Kettle", "Cauldron", "Crucible", "Vessel", "Container",
    "Holder", "Receptacle",
    "Zenith", "Aura", "Balance", "Calm", "Serene", "Tranquil", "Peace", "Quiet", "Still", "Hush",
    "Mute", "Silent", "Whisper", "Echo", "Faint", "Subtle", "Mild", "Gentle", "Kind", "Good",
    "Nice", "Fine", "Fair", "Just", "True", "Right", "Proper", "Decent", "Sound", "Solid",
    "Stable", "Steady", "Firm", "Fixed", "Restore", "Renew", "Revive", "Refresh", "Recharge", "Rejuvenate",
    "Heal", "Soothe", "Comfort", "Relief", "Ease", "Mend", "Cure", "Therapy", "Sanctuary", "Asylum",
    "Haven", "Retreat", "Refuge", "Shelter", "Nourish", "Sustain", "Feed", "Grow", "Flourish", "Thrive",
    "Bloom", "Sprout", "Seed", "Root", "Stem", "Leaf", "Bud", "Flower", "Fruit", "Berry",
    "Herb", "Spice", "Tonic", "Elixir", "Potion", "Balm", "Salve", "Lotion", "Cream", "Gel"
  ],
  "Adventure_Outdoor_Brands": [
    "Trek", "Hike", "Trail", "Path", "Journey", "Voyage", "Quest", "Mission", "Expedition", "Safari",
    "Odyssey", "Adventure", "Venture", "Enterprise", "Endeavor", "Pursuit", "Chase", "Hunt", "Search", "Seek",
    "Find", "Discover", "Uncover", "Reveal", "Expose", "Show", "Display", "Exhibit", "Present", "Demonstrate",
    "Prove", "Confirm", "Verify", "Validate", "Authenticate", "Certify", "Approve", "Endorse", "Support", "Back",
    "Sponsor", "Fund", "Finance", "Invest", "Stake", "Share", "Part", "Portion", "Piece", "Section",
    "Segment", "Division", "Unit", "Module", "Component", "Element", "Factor", "Aspect", "Feature", "Trait",
    "Quality", "Attribute", "Property", "Characteristic", "Mark", "Sign", "Token", "Symbol", "Emblem", "Badge",
    "Crest", "Shield",
    "Gear", "Equipment", "Tackle", "Rig", "Kit", "Outfit", "Apparel", "Clothing", "Jacket", "Coat",
    "Parka", "Anorak", "Vest", "Fleece", "Wool", "Gore", "Shell", "Layer", "Base", "Mid",
    "Outer", "Boot", "Shoe", "Hiker", "Runner", "Climber", "Mountaineer", "Alpinist", "Camper", "Backpacker",
    "Tenter", "Sleeping", "Bag", "Pad", "Mat", "Hammock", "Stove", "Fuel", "Lantern", "Headlamp",
    "Compass", "Map", "GPS", "Locator", "Beacon", "Survival", "Firstaid", "Rope", "Cord", "Webbing",
    "Carabiner", "Harness", "Helmet", "Gloves", "Mitt", "Gaiter", "Crampon", "Axe", "Pole", "Staff",
    "Canteen", "Reservoir", "Filter", "Purifier", "Rations", "MRE", "Freeze", "Dried", "Campfire", "Cookset"
  ],
  "Home_Living_Brands": [
    "Haven", "Nest", "Hearth", "Home", "House", "Dwelling", "Abode", "Residence", "Domicile", "Lodge",
    "Cabin", "Cottage", "Bungalow", "Villa", "Manor", "Estate", "Mansion", "Castle", "Palace", "Château",
    "Fort", "Keep", "Tower", "Citadel", "Stronghold", "Fortress", "Bastion", "Refuge", "Shelter", "Sanctuary",
    "Asylum", "Harbor", "Port", "Anchorage", "Berth", "Dock", "Wharf", "Pier", "Jetty", "Quay",
    "Landing", "Terminal", "Station", "Depot", "Hub", "Center", "Core", "Heart", "Nucleus", "Focus",
    "Point", "Spot", "Place", "Site", "Location", "Position", "Setting", "Scene", "Stage", "Platform",
    "Base", "Foundation", "Ground", "Earth", "Soil", "Land", "Territory", "Region", "Area", "Zone",
    "District", "Quarter", "Sector",
    "Room", "Hall", "Chamber", "Suite", "Apartment", "Flat", "Loft", "Studio", "Workshop", "Atelier",
    "Den", "Library", "Study", "Office", "Bureau", "Desk", "Table", "Bench", "Stool", "Chair",
    "Sofa", "Couch", "Divan", "Settee", "Chaise", "Ottoman", "Pouf", "Hassock", "Cushion", "Pillow",
    "Blanket", "Throw", "Rug", "Carpet", "Mat", "Runner", "Tapestry", "Textile", "Fabric", "Cloth",
    "Linen", "Silk", "Velvet", "Cotton", "Twill", "Denim", "Satin", "Brocade", "Damask", "Muslin",
    "Percale", "Chintz", "Crepe", "Wardrobe", "Closet", "Dresser", "Chest", "Cabinet", "Shelf", "Bookcase",
    "Cupboard", "Sideboard", "Console", "Credenza", "Armoire", "Commode", "Buffet", "Hutch", "Display", "Unit"
  ],
  "Entertainment_Media_Brands": [
    "Studio", "Stage", "Screen", "Scene", "Show", "Act", "Play", "Drama", "Theater", "Cinema",
    "Film", "Movie", "Picture", "Image", "Video", "Audio", "Sound", "Music", "Song", "Tune",
    "Melody", "Harmony", "Rhythm", "Beat", "Tempo", "Pulse", "Cadence", "Measure", "Bar", "Note",
    "Chord", "Key", "Scale", "Pitch", "Tone", "Timbre", "Volume", "Amplitude", "Frequency", "Wavelength",
    "Cycle", "Period", "Phase", "Stage", "Step", "Level", "Tier", "Rank", "Grade", "Class",
    "Category", "Type", "Kind", "Sort", "Variety", "Brand", "Make", "Model", "Version", "Edition",
    "Release", "Issue", "Publication", "Print", "Press", "Media", "News", "Report", "Story", "Article",
    "Feature", "Column", "Section", "Page", "Spread", "Layout", "Design", "Format", "Style",
    "Broadcast", "Network", "Channel", "Feed", "Stream", "Podcast", "Series", "Miniseries", "Special", "Documentary",
    "Reality", "Game", "Talk", "Comedy", "Tragedy", "Farce", "Satire", "Musical", "Opera", "Ballet",
    "Dance", "Choreography", "Mime", "Puppet", "Marionette", "Ventriloquist", "Magician", "Illusionist", "Juggler", "Acrobat",
    "Clown", "Carnival", "Circus", "Festival", "Gala", "Concert", "Recital", "Session", "Jam", "Set",
    "Album", "Record", "Vinyl", "Tape", "Cassette", "CD", "Digital", "Download", "Stream", "Subscribe",
    "Listen", "Watch", "Read", "View", "Hear", "Perceive", "Sense", "Feel", "Experience", "Imagine"
  ]
};

// Count total names
let totalNames = 0;
Object.values(brandData).forEach(category => {
  totalNames += category.length;
});
console.log(`Total brand names: ${totalNames}`);
console.log(`Categories: ${Object.keys(brandData).length}`);

// Add to concepts.json
const conceptsFile = path.join(__dirname, '../data/concepts.json');
const conceptsData = JSON.parse(fs.readFileSync(conceptsFile, 'utf8'));

// Add to organizations.json
const orgFile = path.join(__dirname, '../data/organizations.json');
const orgData = JSON.parse(fs.readFileSync(orgFile, 'utf8'));

// Create filter options
const categoryOptions = [
  "all_categories",
  "tech_innovation",
  "luxury_premium",
  "nature_organic",
  "bold_athletic",
  "modern_minimalist",
  "food_beverage",
  "creative_artistic",
  "urban_street",
  "ocean_maritime",
  "desert_earth",
  "space_cosmic",
  "heritage_vintage",
  "energy_power",
  "fashion_style",
  "health_wellness",
  "adventure_outdoor",
  "home_living",
  "entertainment_media"
];

// Create the generator object
const brandGenerator = {
  "title": "Brand Name Generator",
  "slug": "brand-name-generator",
  "description": "Generate modern, brandable brand names across 18 categories. From tech innovation to luxury premium, nature organic to bold athletic—find the perfect brand name for your business, product, or creative project.",
  "seoKeywords": "brand names, brand name generator, business brand names, product brand names, company brand names, brandable names, modern brand names",
  "icon": "🏷️",
  "isPopular": true,
  "popularRank": 7,
  "filters": {
    "category": {
      "label": "Brand Category",
      "options": categoryOptions
    }
  },
  "data": brandData,
  "article": {
    "hero": {
      "title": "🏷️ Brand Name Generator",
      "tagline": "Generate modern, brandable brand names across 18 categories. Perfect for businesses, products, startups, and creative projects."
    },
    "intro": "Brand names are the foundation of your brand identity, communicating your company's values, personality, and market position. From tech innovation names like 'Nexus' and 'Apex' to luxury premium names like 'Regal' and 'Opulent', brand names tell stories about your business's mission, vision, and character. Our **brand name generator** offers thousands of brandable names across 18 distinct categories, helping you find the perfect name for your business, product, startup, or creative project.",
    "sections": [
      {
        "heading": "The Power of Brand Names",
        "content": "<p>Brand names function as brand identifiers, communicating your company's values, personality, and market position in just one word. <strong>Tech Innovation</strong> names (Nexus, Apex, Zenith, Quantum) suggest cutting-edge technology and innovation. <strong>Luxury Premium</strong> names (Regal, Opulent, Sovereign, Exquisite) evoke elegance, sophistication, and high-end quality. <strong>Nature Organic</strong> names (Terra, Flora, Sage, Bloom) communicate natural, organic, and sustainable values.</p><p><strong>Bold Athletic</strong> names (Titan, Atlas, Champion, Thunder) suggest strength, power, and competitive spirit. <strong>Modern Minimalist</strong> names (Mono, Pure, Core, Void) indicate simplicity, clarity, and contemporary design. <strong>Food & Beverage</strong> names (Savory, Spice, Nourish, Brew) evoke culinary excellence and refreshment. <strong>Creative Artistic</strong> names (Canvas, Palette, Muse, Inspire) suggest creativity, artistry, and imagination. <strong>Urban Street</strong> names (Metro, Urban, Street, Hustle) communicate urban culture and street style.</p><p>Additional categories include <strong>Ocean Maritime</strong> (Pacific, Harbor, Tide, Pearl), <strong>Desert Earth</strong> (Sahara, Canyon, Pioneer, Nomad), <strong>Space Cosmic</strong> (Galaxy, Infinity, Orbit, Nova), <strong>Heritage Vintage</strong> (Classic, Vintage, Authentic, Archive), <strong>Energy Power</strong> (Dynamo, Surge, Current, Volt), <strong>Fashion Style</strong> (Vogue, Chic, Elegant, Glamour), <strong>Health Wellness</strong> (Vitality, Wellness, Balance, Heal), <strong>Adventure Outdoor</strong> (Trek, Quest, Expedition, Gear), <strong>Home Living</strong> (Haven, Nest, Hearth, Sanctuary), and <strong>Entertainment Media</strong> (Studio, Stage, Screen, Broadcast).</p>"
      },
      {
        "heading": "Brand Name Categories",
        "content": "<p>Each category offers distinct naming opportunities that communicate specific brand values and market positions:</p><ul><li><strong>Tech Innovation:</strong> Names like Nexus, Apex, Quantum, and Pulse suggest cutting-edge technology, innovation, and digital expertise. Perfect for tech startups, software companies, and digital products.</li><li><strong>Luxury Premium:</strong> Names like Regal, Opulent, Sovereign, and Exquisite communicate elegance, sophistication, and high-end quality. Ideal for luxury brands, premium products, and upscale services.</li><li><strong>Nature Organic:</strong> Names like Terra, Sage, Bloom, and Oasis evoke natural beauty, organic quality, and sustainability. Great for organic products, natural brands, and eco-friendly businesses.</li><li><strong>Bold Athletic:</strong> Names like Titan, Champion, Thunder, and Velocity suggest strength, power, and competitive spirit. Perfect for sports brands, athletic products, and fitness companies.</li><li><strong>Modern Minimalist:</strong> Names like Mono, Pure, Core, and Void indicate simplicity, clarity, and contemporary design. Ideal for minimalist brands, modern products, and clean design aesthetics.</li><li><strong>Food & Beverage:</strong> Names like Savory, Spice, Nourish, and Brew evoke culinary excellence and refreshment. Great for food brands, restaurants, and beverage companies.</li><li><strong>Creative Artistic:</strong> Names like Canvas, Palette, Muse, and Inspire suggest creativity, artistry, and imagination. Perfect for creative agencies, art brands, and design companies.</li><li><strong>Urban Street:</strong> Names like Metro, Urban, Hustle, and Graffiti communicate urban culture and street style. Ideal for streetwear brands, urban products, and city-focused businesses.</li></ul><p>Additional categories include Ocean Maritime, Desert Earth, Space Cosmic, Heritage Vintage, Energy Power, Fashion Style, Health Wellness, Adventure Outdoor, Home Living, and Entertainment Media—each offering unique brand name opportunities.</p>"
      },
      {
        "heading": "How to Use Brand Names",
        "content": "<p>Brand names work excellently for:</p><ul><li><strong>Businesses:</strong> Find a memorable, brandable name that stands out in the competitive market</li><li><strong>Products:</strong> Choose a name that reflects your product's values, benefits, and market position</li><li><strong>Startups:</strong> Select a name that works well for logos, marketing materials, and brand identity</li><li><strong>Creative Projects:</strong> Name brands in stories, games, or creative writing projects</li></ul><p>When choosing a name, consider your industry, target audience, brand values, and market position. Category-specific names work well for niche markets, while broader names suit diverse businesses. Choose 'All Categories' to explore names from all 18 categories, or select a specific category to focus on names that match your brand's identity.</p>"
      }
    ],
    "faqs": [
      {
        "question": "How do I choose the right category?",
        "answer": "Choose based on your brand values and market position: Tech Innovation for technology brands, Luxury Premium for high-end brands, Nature Organic for natural/organic brands, Bold Athletic for sports/fitness brands, Modern Minimalist for minimalist brands, Food & Beverage for culinary brands, Creative Artistic for creative brands, Urban Street for streetwear/urban brands, or choose 'All Categories' to explore names from all categories."
      },
      {
        "question": "What makes a good brand name?",
        "answer": "A good brand name is memorable, easy to pronounce, reflects your brand values and market position, appeals to your target audience, works well for branding and marketing, and stands out in the competitive market. It should communicate your company's personality and character in just one word."
      },
      {
        "question": "Can I use these names for my actual business?",
        "answer": "Yes, but always check trademark availability, domain availability, and business registration availability before using any name for your actual business. These names are provided as inspiration and starting points for your own creative naming process."
      },
      {
        "question": "What's the difference between 'All Categories' and specific categories?",
        "answer": "Choosing 'All Categories' will generate names from all 18 brand categories, providing maximum variety. Choosing a specific category (like Tech Innovation or Luxury Premium) will only generate names from that category, ensuring all names match that specific brand identity and market position."
      }
    ]
  },
  "relatedGenerators": [
    "company",
    "business"
  ]
};

// Add to concepts.json
conceptsData.generators.brand = brandGenerator;
fs.writeFileSync(conceptsFile, JSON.stringify(conceptsData, null, 2));
console.log('✅ Added brand generator to concepts.json');

// Add to organizations.json
orgData.generators.brand = brandGenerator;
fs.writeFileSync(orgFile, JSON.stringify(orgData, null, 2));
console.log('✅ Added brand generator to organizations.json');

