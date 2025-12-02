#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Alien name data from the provided JSON
const alienData = {
  "Alien_First_Names_Male": [
    "K'Tharr", "Zylos", "Xarok", "Varrus", "G'Naash", "Jaxx", "Rydak", "Gorok", "Fenix", "T'lar",
    "Drakon", "Kaelus", "Karrn", "Vexx", "Scythe", "Q'ol", "Zh'rak", "Balthar", "Grom", "Vulkar",
    "Akkad", "Zorn", "Drayk", "Krull", "Shaxx", "Vrak", "Korben", "Xylo", "Narak", "Thrax",
    "Gr'aagh", "Zod", "Rexx", "Vortek", "Kael'en", "Zytan", "Harkon", "Skarr", "Rexus", "Tarkus",
    "Jorn", "Zax", "Drom", "Tybor", "Velkor", "Shaz", "Torvin", "Vylos", "K'han", "Xylon",
    "Grax", "Jezz", "Rygar", "Vorg", "Dragan", "Kaelar", "Shazar", "Zydar", "Xendos", "Vorlag",
    "K'rell", "Raxus", "Ghul", "Drokk", "Vexor", "Thorn", "Z'Lor", "Karax", "Grimnar", "Varrn",
    "Xypher", "Krog", "Skarus", "Ragnar", "Velox", "Zhul", "Tarak", "K'rik", "Shivan", "Drex",
    "Grox", "Korag", "Tytan", "Jakar", "Nylos", "Rexor", "Vulkanus", "Xylth", "Zydan", "Hektor",
    "Karzan", "Tharok", "Vargul", "Zant", "Joran", "Krellus", "Zyron", "Draxus", "Garr", "Vortexx",
    "Kyrak", "Shalok", "Ryken", "Tarrus", "Xalor", "Zarr", "Geth", "Jarl", "Khorak", "Veloc",
    "Zydos", "Axion", "Darthus", "Graxx", "Jaxus", "Kylor", "Raxx", "Varrick", "Xandar", "Zykor",
    "Harg", "Joranis", "Karaxus", "Thornar", "Vog", "Zylax", "Dread", "Gorth", "Jexx", "Kylarr",
    "Rennoc", "Voruk", "Xaluk", "Zarg", "Harth", "Jolarr", "Kryll", "Tarrk", "Vandor", "Xen",
    "Zor", "Falkor", "Grakon", "Jerox", "Kyzak", "Ryzen", "Vylkar", "Xerxes", "Drakul", "Kragnos",
    "Torvak", "Xar'gul", "Gortag", "Rhaz", "Tyrion", "Vrok'ash", "Krazzic", "Durn", "Zakk", "Trogg",
    "Varos", "Gorvan", "Throk", "Zakar", "Vorik", "Krogan", "Jarrus", "Feral", "Xyzar", "Varrg",
    "Dracon", "Ragnok", "Groxar", "Kypt", "Shorn", "Toruk", "Narn", "Blazik", "Vylkas", "Xarth",
    "Zhorne", "Karrus", "Drogan", "Thraz", "Jarek", "Gorval", "Rydell", "Vax", "Korox", "Tyros",
    "Zarthos", "Krill", "Sharok", "Vortus", "Dregor", "Jaxar", "Frak", "Xylar", "Grolak", "Rygart",
    "Vargos", "Tharn", "Zylak", "Drogg", "Jark", "Xarthus", "Goron", "Rylos", "Vorrax", "Krellos",
    "Shornax", "Tydus", "Zarthok", "Drakkar", "Jexal", "Faryn", "Xyll", "Grok'tar", "Rylakk", "Varrgal",
    "Kryliss", "Thorox", "Naxxar", "Blight", "Vylarr", "Zylith", "Krazgar", "Droganok", "Thraxar", "Jarkus",
    "Gorthar", "Rydoc", "Vexxar", "Korvan", "Tyranus", "Zarrack", "Kryllar", "Sharlok", "Vortax"
  ],
  "Alien_First_Names_Female": [
    "Saelen", "Lyra'sha", "Iridis", "Ka'lia", "Sh'vanni", "Zethra", "Nyx", "Vela", "Aiyana", "Kyra",
    "Elara", "Seraph", "Lyrana", "Zylia", "Xy'sha", "Orina", "Dae'lyn", "Astria", "Rina", "Vanya",
    "Shiara", "Kassia", "Zyra", "Nevaeh", "Sha'la", "Thalya", "Jezebel", "Lyra'na", "Xaelia", "Vessa",
    "Sarina", "Diora", "Elora", "Kaelis", "Zelia", "Aeliana", "Lysandra", "Serrin", "Ny'al", "Shalia",
    "Tariana", "Vestra", "Xylo'na", "Zylara", "Aris", "Drea", "Kaelira", "Lyria", "Sha'ri", "Syna",
    "Theia", "Vayra", "Xylenne", "Zoria", "Eris", "Illaria", "Jelena", "Kira", "Leira", "Myra'sha",
    "Nylia", "Orana", "Raena", "Sy'lar", "Tylia", "Viera", "Xyla", "Zelene", "Amara", "Dysis",
    "Faela", "Irina", "Jaelen", "Kalis", "Lira", "Nia", "Rhia", "Siri", "Talia", "Vixia",
    "Xena", "Zanna", "Anya", "Brisa", "Cyra", "Dalia", "Eila", "Fayra", "Gemma", "Halia",
    "Inara", "Jara", "Kaelan", "Lana", "Mira", "Nera", "Olyssa", "Pylia", "Quira", "Rylen",
    "Sorina", "Tessa", "Uma", "Vivian", "Wyla", "Ylana", "Zyana", "Aeris", "Betha", "Caelen",
    "Danya", "Elina", "Fiona", "Gaya", "Hera", "Iona", "Jina", "Kaila", "Lexi", "Maelis",
    "Naira", "Ophira", "Phaedra", "Qy'ra", "Rhea", "Syrin", "Taranis", "Ursula", "Valerie", "Wren",
    "Xyla'ra", "Yara", "Zyla", "Aelia", "Bylia", "Cira", "Dysisa", "Evia", "Fae'ra", "Gyla",
    "Hyrana", "Irys", "Juria", "Krysa", "Lysa", "Shaelyn", "Lyrissa", "Sylana", "Aelindra", "Irana",
    "Kyllia", "Zareen", "Naelis", "Sorina", "Vyllia", "Xantha", "Zenaida", "Lyara", "Shalae", "Irida",
    "Kaelani", "Zylanna", "Naris", "Soraya", "Vayli", "Xyra", "Zylaena", "Lyrisa", "Shaelen", "Iralyn",
    "Kaelina", "Zyrina", "Narissa", "Sorielle", "Valena", "Xyrisa", "Zylanis", "Lyralia", "Shayna", "Iryssia",
    "Kylara", "Zyllana", "Nalini", "Soriya", "Veridia", "Xylene", "Zylanna", "Aeliya", "Shayrin", "Iranae",
    "Kylari", "Zyleena", "Nalira", "Soriella", "Vaelia", "Xylina", "Zylanae", "Lyrielle", "Shayra", "Iriela",
    "Kylae", "Zylexa", "Naliya", "Vyria", "Xylaes", "Zylissa", "Lyrae", "Shaylanna", "Iriana", "Kylanna",
    "Zyraes", "Narina", "Sorienne", "Vaelira", "Xyralia", "Zylinae", "Lyrian", "Shaylyn", "Irianis", "Kylaera",
    "Zyran", "Narisha", "Sorinael", "Vaelisa", "Xyrell", "Zylithia", "Lyris", "Shaynael", "Iriath", "Kylaeen",
    "Zyraesys", "Narinis", "Sorianna", "Valenia", "Xyraen", "Zylarae", "Lyras", "Shayraen", "Iridia", "Kylaris",
    "Zyreena"
  ],
  "Alien_First_Names_NonBinary": [
    "Aethel", "Xe-vyn", "Q'tol", "Emnas", "Drev", "Irid", "J'lar", "Kess", "Myn", "Zeff",
    "Sol'an", "Lumin", "Voidis", "Cypher", "Drill", "Skylos", "Ryn", "Phex", "Ael", "Eon",
    "Sy'on", "Vex", "Zh'rak", "Grix", "Sorn", "Tyk", "Vel'da", "K'rikk", "Jux", "Moth",
    "Nyl", "Pyn", "Ryxx", "Xen", "Zyl", "Drekk", "Fyre", "Glitch", "Halk", "Iron",
    "Jornn", "Kryll", "Moss", "Nebula", "Omen", "Prism", "Quark", "Rift", "Shatter", "Thresh",
    "Umbra", "Vortex", "Wisp", "Xyn", "Yss", "Zarrn", "Aether", "Blight", "Cinder", "Dust",
    "Echo", "Flux", "Glare", "Haze", "Inertia", "Jolt", "Krypt", "Logic", "Matrix", "Nexus",
    "Orbit", "Pulse", "Query", "Rotor", "Static", "Talon", "Unit", "Vector", "Warden", "Xyla",
    "Yggr", "Zenith", "Arcane", "Binary", "Cortex", "Datum", "Entropy", "Flicker", "Graviton", "Holon",
    "Ichor", "Kinetic", "Locus", "Morpheus", "Node", "Onyx", "Phantom", "Quasar", "Relic", "Sentinel",
    "Tessera", "Utopi", "Qy'jix", "Drathos", "Myn'ak", "Jylos", "K'tek", "Pylot", "Z'rell", "Tyk'on",
    "Xe-ton", "Gryx", "Srynn", "Emnos", "Thrak", "Vorl", "Nyk'ol", "Qarn", "Jaxxan", "Kroll'a",
    "Dyrn", "Sylen", "Xal", "Myrrax", "Zek'on", "Tyros", "Vorlakk", "Nykta", "Qylos", "Jykarr",
    "Krolos", "Dylos", "Syll", "Xar", "Myrraxys", "Zekos", "Tyrann", "Vorlokk", "Nyktar", "Qylosys",
    "Jykarris", "Krogan", "Dylann", "Syllus", "Xyran", "Myrn", "Zylosys", "Tyrannus", "Vorlak", "Nyktarus",
    "Qylar", "Jykarrn", "Krola", "Dyrix", "Sylix", "Xyr", "Myras", "Zylosys", "Tyrant", "Vorlaxx",
    "Nyktalos", "Qyron", "Jykarrus", "Kroganus", "Dyris", "Sylia", "Xyris", "Myrassa", "Zylon", "Tyrannis",
    "Vorlakis", "Nyktalis", "Qyra", "Jykarril", "Kroga", "Dyrisys", "Sylina", "Xyrissa", "Myrassil", "Zyloth",
    "Tyrannos"
  ],
  "Alien_Surnames": [
    "K'han", "V'rax", "Talos", "Shien", "Vorlag", "Zy'than", "Akkaron", "Dra'nak", "Faelen", "Ghorok",
    "Harkos", "Ithil", "Jarnoc", "Kryllos", "Lyra'shai", "Mog'dar", "Naxus", "Orion'des", "Phyrix", "Q'tarr",
    "Ryn'tal", "Saros", "Talonis", "Ul'dar", "Vorok", "Wastelord", "Xylthos", "Yggrd", "Zornak", "Aeris",
    "Balthar", "Cygnus", "Drakonus", "Emnas", "Fyra'xis", "Glitchlord", "Harkonus", "Iskandar", "Jakarus", "Kharon",
    "Lykos", "Myrdian", "Nexos", "Ophion", "Phaedrus", "Quillax", "Raxus", "Sydonian", "Taryon", "Ulysses",
    "Vesperax", "Wyvern", "Xenaris", "Yridis", "Zydonian", "Axion", "Dorian", "Etherea", "Gryphon", "Hydra",
    "Ion", "Jotun", "Kaelus", "Luminos", "Mantis", "Nexus", "Olympus", "Phoenix", "Quasar", "Riftlord",
    "Shadowmere", "Titan", "Umbra", "Vortex", "Whisperwind", "Xylos", "Yttrium", "Zenithar", "Aeon", "Basilius",
    "Celeste", "Draco", "Electra", "Falkon", "Gemini", "Hades", "Icarus", "Juno", "Kronos", "Leo",
    "Mars", "Neptune", "Octavis", "Pluton", "Raptor", "Scorpio", "Solara", "Terra", "Uranus", "Valhalla",
    "Vulcan", "Zeus", "Andromeda", "Cassiopeia", "Centauri", "Draconis", "Hydrus", "Indus", "Lacerta", "Lyra",
    "Norma", "Orion", "Pegasus", "Phoenix", "Sagitta", "Serpens", "Taurus", "Ursa", "Vela", "Virgo",
    "Volans", "Xystra", "Yith", "Zalt", "Krazz", "Vrokk", "Zy'ra", "Sh'tan", "Lykarr", "Gnathus",
    "Phorus", "Cylix", "Drexel", "Fennik", "Grask", "Hyrith", "Jaxxar", "Kyzan", "Lornak", "Mytos",
    "Nylos", "Oran", "Pryce", "Qyren", "Raelan", "Skorne", "Tykos", "Varth", "Xanthos", "Yorn",
    "Zartus", "Aelix", "Bythos", "Cygnar", "Drexar", "Ethon", "Faeron", "Grommash", "Hylos", "Iskon",
    "Jolax", "Kordax", "Lyssar", "Mornak", "Nyxus", "Ozrik", "Pyran", "Qylos", "Rithos", "Stryker",
    "Thael", "Urthan", "Vylos", "Warrick", "Xyzal", "Yvgen", "Zymos", "Arak", "Bylarr", "Crell",
    "Drakar", "Ethos", "Fayden", "Garrus", "Horax", "Ithos", "Jynx", "Krytos", "Lyzar", "Mylos",
    "Nyzal", "Onyx", "Praxis", "Qyzor", "Raxen", "Skylarr", "Thornax", "Ulyss", "Vaylen", "Wyndom",
    "Xyrak", "Ythor", "Zaltar", "Aelmar", "Brant", "Cylin", "Dregor", "Ezran", "Faeton", "Gralax",
    "Hyron", "Ithas", "Jakar", "Kryn", "Lyssarus", "Mykon", "Nyxal", "Ozark", "Pyrith", "Qyrl",
    "Rylos", "Stormlord", "Thyrion", "Ulnar", "Velkor", "Wargul", "Xyl", "Yriel", "Zanthar", "Arkon",
    "Bral", "Cylax", "Drekk", "Eran", "Faela", "Gralos", "Hyronus", "Ithosian", "Jaxxus", "Krynus",
    "Lyssin", "Mykonos", "Nyxis", "Ozrak", "Pyrrha", "Qyron", "Ryloth", "Stormrider", "Thyrus", "Ulrax",
    "Veloxis", "Warrin", "Xylor", "Yrin", "Zantharus"
  ],
  "Alien_Epithets": [
    "Slayer of Xylos", "The Eighth Ascendant", "Pilot of the Void-Run", "Speaker of the Crystal Code", "Warp-Breaker of Sector 7",
    "The Architect of Pain", "Harbinger of the Great Silence", "The Unseen Hand of the Collective", "Keeper of the Hive Mind's Lore", "The Blood-Sealed Covenant",
    "Engineer of the Graviton Coil", "The First to Taste Starlight", "Shadow Hunter of the Outer Veil", "Master of the Xeno-Blade", "The Relic of the Sunless Age",
    "Woven into the Astral Web", "The Gilded Drone", "Herald of the Deep Warp", "Vanguard of the K'Tharr Fleet", "The Echo of the Dying Star",
    "Binder of the Three Dimensions", "The Flaw in the Matrix", "Scribe of the Final Decree", "Voice of the Silent Oracle", "The Unblinking Eye of Zarkon",
    "Weaver of the Time-Thread", "The Exiled Scion of Lyra", "Hunter of the Chronos Beast", "The Sentinel of the Zero-Point", "Prophet of the Sixth Cycle",
    "Wielder of the Plasma Whip", "The Living Catalyst", "Commander of the Phalanx", "The Obsidian-Clad", "Whisperer to the Old Gods",
    "The Last of the Dragon Kin", "Slicer of the Dimensional Plane", "Kin to the Void-Born", "The One Who Remembers Earth", "Shaper of the Biomech Shell",
    "Master of the Hidden Singularity", "The Unbound Psion", "Reaper of the Star-Harvest", "Pilot of the Serpent Drive", "Guardian of the Crystal Core",
    "The Silent Navigator", "The Living Weapon", "Destroyer of the Solar Gate", "Heir to the Fallen Dynasty", "The Great Consumer",
    "Forged in the Dying Light", "The Blade of the Shadow Host", "Warden of the Forbidden Cluster", "The Xenotech Alchemist", "Breaker of the Iron Vow",
    "The Voice That Shatters Worlds", "Survivor of the Great Flood", "The Architect of the New Dawn", "Chaser of the Fading Signal", "The Steel-Feathered",
    "Keeper of the Lost Artifact", "The Mind That Holds the Universe", "Initiate of the Eleventh Grade", "The Swift Retaliator", "Seer of the Crimson Nebula",
    "The Last True Scale", "Master of the Gravitic Field", "Scribe of the Blood Scrolls", "The Unwavering Gaze", "The Ghost in the Machine",
    "The Star That Guides the Lost", "The Reason for the Scourge", "The Flesh Made Logic", "Rider of the Cosmic Tides", "The Chosen of the Elder Ones",
    "The Scar on the Face of God", "The One Who Transcended Code", "Wielder of the Singularity Cannon", "The Echo of Alpha Centauri", "The Silent Protector of the Brood",
    "The Sixth Sister of Cygnus", "The Unsleeping Watcher", "The Hand That Deals Finality", "The Unknowable Entity", "Master of the Three Factions",
    "The Core Logic Unit", "The Bio-Engineered Perfection", "The Whisper of the Void", "The Blade of the Star-Children", "Guardian of the Final Frontier",
    "The Unseen Threat", "The Messenger of the Dying Empire", "The Soul That Fled the Machine", "The Light That Will Not Fade", "The Hunter of the Star-Ghosts",
    "The Catalyst of the New Age", "The Heir of the First Hive", "The One Who Broke the Timeline", "The Shadow of Andromeda", "The Unspoken Truth",
    "The Master of the Quantum Rift", "The Eye That Sees All Forms", "The Unholy Communion", "Warden of the Crystal Wastes", "The Architect of the Zero-Day",
    "The Star-Eater", "The Blade of Necessary Sacrifice", "The Great Experiment", "The Last Signal Before Silence", "The Keeper of the Lost Language",
    "The Bloodline of Xylth", "The One Who Feared No Sun", "The Scourge of the Xeno-Wastes", "The Unwavering Shield", "The Swift and Silent Death",
    "The Voice That Commanded the Void", "The Final Piece of the Puzzle", "The One Who Walks Through Walls", "The Sentinel of the Forgotten War", "The Wielder of the Star-Whip",
    "The Engineer of the Dark-Matter", "The Silent Harbinger of Chaos", "The Architect of the Eternal Code", "The Mind That Contains the Cosmos", "The Unbreakable Shell",
    "The Living Map of the Galaxy", "The One Who Remained True", "The Scion of the Tenth Planet", "The Weaver of Dreams and Dust", "The Blood-Bound Warrior",
    "The Pilot Who Flew Too Close", "The Guardian of the Last Seed", "The Seeker of the True Form", "The Unseen Master of Puppets", "The Light of the Distant Star",
    "The Shadow of the Emperor", "The Destroyer of the Old Gods", "The Architect of the New Order", "The Voice of the Collective Will", "The Blade That Never Tires",
    "The Vessel of the Forbidden Power", "The One Who Witnessed Creation", "The Sentinel of the Lost Sector", "The Engineer of the Time-Loop", "The Catalyst of Destruction",
    "The Heir to the First Throne", "The One Who Holds the Secret", "The Star-Touched Shaman", "The Unending Pursuit", "The Master of the Astral Fleet",
    "The Unseen Observer", "The Blade of Pure Energy", "The Guardian of the Sleeping God", "The Architect of the Great Wall", "The Whisper of the Ancestors",
    "The Silent Executioner", "The One Who Defied Fate", "The Keeper of the Ancient Tech", "The Blood of the First Beast", "The Navigator of the Dark Flow",
    "The Scion of the Void-Dragon", "The Unbreakable Will", "The Catalyst of the Final War", "The Heir to the Sunken City", "The One Who Speaks to Machines",
    "The Star-Woven Protector", "The Unending Vengeance", "The Master of the Ghost Fleet", "The Architect of the Last Hope", "The Voice of the Unseen Choir",
    "The Blade That Knows No Mercy", "The Vessel of the Perfect Form", "The One Who Controls the Weather", "The Sentinel of the Burning Planet", "The Engineer of the Life-Code",
    "The Catalyst of Life and Death", "The Heir to the Empty Throne", "The One Who Sees the Future", "The Star-Drifter", "The Unending Task",
    "The Master of the Quantum Leap", "The Architect of the Great Trap", "The Voice of the Forgotten Race", "The Blade of Pure Logic", "The Vessel of Infinite Energy",
    "The One Who Commands the Elements", "The Sentinel of the Last Star", "The Engineer of the New Brain", "The Catalyst of the Grand Design", "The Heir to the Shadow Empire",
    "The One Who Controls the Dreams", "The Star-Seeded Wanderer", "The Unending Quest", "The Master of the Time-Warp", "The Architect of the Perfect Clone",
    "The Voice of the Cosmic Stream", "The Blade of the Soul's Desire", "The Vessel of the Living Light", "The One Who Sings to the Stars", "The Sentinel of the Cosmic Dust",
    "The Engineer of the Mind-Link", "The Catalyst of the Evolution", "The Heir to the Stolen World", "The One Who Reads the Wind", "The Star-Born Messiah",
    "The Unending Dance", "The Master of the Gravity Well", "The Architect of the Endless City", "The Voice of the Silent Majority", "The Blade of the Moral Code",
    "The Vessel of the Universal Truth", "The One Who Walks on Water", "The Sentinel of the First Tear", "The Engineer of the Heart-Beat", "The Catalyst of the Great Change",
    "The Heir to the Empty Galaxy", "The One Who Paints the Sky", "The Star-Guardian", "The Unending Watch", "The Master of the Illusions",
    "The Architect of the Final Sleep", "The Voice of the Inner Self", "The Blade of the Last Stand", "The Vessel of the Perfect Soul", "The One Who Knows the Answer",
    "The Sentinel of the Ancient Ruins", "The Engineer of the Perfect Bomb", "The Catalyst of the Beginning", "The Heir to the Buried Treasure", "The One Who Stops the Rain",
    "The Star-Weaver", "The Unending Journey", "The Master of the Teleport", "The Architect of the Grand Illusion", "The Voice of the Forgotten Lore",
    "The Blade of the Raging Storm", "The Vessel of the Purest Blood", "The One Who Commands the Tides", "The Sentinel of the Silent Sea", "The Engineer of the Perfect Lie",
    "The Catalyst of the Golden Age", "The Heir to the Cosmic Dust", "The One Who Finds the Way", "The Star-Guide", "The Unending Silence",
    "The Master of the Mind Control", "The Architect of the Great Failure", "The Voice of the Lost Children", "The Blade of the First Cry", "The Vessel of the Universal Fear",
    "The One Who Calls the Shadows", "The Sentinel of the Dark Forest", "The Engineer of the Cosmic Clock", "The Catalyst of the Final Act", "The Heir to the Ruins of Time",
    "The One Who Opens the Gates", "The Star-Herald", "The Unending Hunger", "The Master of the Dark Arts", "The Architect of the Beautiful End",
    "The Voice of the Last Man", "The Blade of the Dying Sun", "The Vessel of the Ultimate Power", "The One Who Steals the Light", "The Sentinel of the Frozen Wasteland",
    "The Engineer of the Dream Machine", "The Catalyst of the New Beginning", "The Heir to the Great Beyond", "The One Who Speaks No Word", "The Star-Shaped Terror",
    "The Unending Night", "The Master of the Ancient Runes", "The Architect of the Terrible Truth", "The Voice of the Elder Race", "The Blade of the Silent Vow",
    "The Vessel of the Living Stone", "The One Who Cannot Be Killed", "The Sentinel of the Endless Maze", "The Engineer of the Soul Trap"
  ]
};

// Read the fantasy.json file
const fantasyFile = path.join(__dirname, '../data/fantasy.json');
const fantasyData = JSON.parse(fs.readFileSync(fantasyFile, 'utf8'));

// Add the alien generator
fantasyData.generators.alien = {
  "title": "Alien Name Generator",
  "slug": "alien-name-generator",
  "description": "Generate authentic alien names with gender filters and format options. Create first names, full names, or full names with epithets perfect for sci-fi writing, space operas, and science fiction characters.",
  "seoKeywords": "alien names, alien name generator, sci-fi names, space names, extraterrestrial names, science fiction names, alien character names",
  "icon": "👽",
  "isPopular": true,
  "popularRank": 9,
  "filters": {
    "gender": {
      "label": "Gender",
      "options": [
        "male",
        "female",
        "non_binary"
      ]
    },
    "format": {
      "label": "Name Format",
      "options": [
        "first_name",
        "full_name",
        "full_name_epithet"
      ],
      "optionLabels": {
        "first_name": "First Name Only (e.g., K'Tharr, Saelen, Aethel)",
        "full_name": "Full Name (e.g., K'Tharr K'han, Saelen Lyra'shai)",
        "full_name_epithet": "Full Name with Epithet (e.g., K'Tharr K'han, Slayer of Xylos)"
      }
    }
  },
  "data": {
    "male": alienData.Alien_First_Names_Male,
    "female": alienData.Alien_First_Names_Female,
    "non_binary": alienData.Alien_First_Names_NonBinary,
    "surnames": alienData.Alien_Surnames,
    "epithets": alienData.Alien_Epithets
  },
  "article": {
    "hero": {
      "title": "👽 Alien Name Generator",
      "tagline": "Generate authentic alien names with gender filters and format options. Create first names, full names, or full names with epithets perfect for sci-fi writing, space operas, and science fiction characters."
    },
    "intro": "Alien names carry the weight of otherworldly origins, advanced civilizations, and cosmic mystery. From the harsh, guttural 'K'Tharr' to the fluid, sibilant 'Saelen' to the conceptual 'Aethel', alien names tell stories of distant worlds, advanced technology, and beings beyond human comprehension. Our **Alien Name Generator** creates authentic alien names using three distinct formats: First Names Only (K'Tharr, Saelen, Aethel), Full Names (K'Tharr K'han, Saelen Lyra'shai), and Full Names with Epithets (K'Tharr K'han, Slayer of Xylos), with gender filters for Male, Female, and Non-Binary aliens, drawing from sci-fi naming conventions to create names that resonate with extraterrestrial authority and cosmic power.",
    "sections": [
      {
        "heading": "The Power of Alien Names",
        "content": "<p>Alien names serve multiple purposes in science fiction: they identify extraterrestrial beings, create memorable characters, establish a character's origin and culture, and add depth to sci-fi settings. A well-chosen alien name can instantly convey whether a character is from a warrior culture (K'Tharr K'han), a graceful civilization (Saelen Lyra'shai), or a conceptual entity (Aethel Voidis).</p><p>Our generator uses three distinct formats to create alien names with different levels of detail and formality. Each format has its own character: First Names are simple and direct, Full Names add clan or family identifiers, and Full Names with Epithets provide the most narrative depth and legendary status.</p>"
      },
      {
        "heading": "Alien Name Formats",
        "content": "<p>The generator offers three distinct naming formats, each with its own character and use:</p><ul><li><strong>First Name Only:</strong> This format creates simple, direct alien names. Examples: 'K'Tharr', 'Saelen', 'Aethel', 'Zylos', 'Iridis'. This format is perfect for casual interactions, first meetings, or when the name alone carries sufficient weight and recognition.</li><li><strong>Full Name (First Name + Surname):</strong> This format creates complete alien names with clan or family identifiers. Format: [First Name] [Surname]. Examples: 'K'Tharr K'han', 'Saelen Lyra'shai', 'Aethel Voidis', 'Zylos Talos'. This format combines a first name with a surname that reflects the alien's clan, family, or origin world.</li><li><strong>Full Name with Epithet (First Name + Surname + Epithet):</strong> This format creates the most detailed and epic alien names. Format: [First Name] [Surname], [Epithet]. Examples: 'K'Tharr K'han, Slayer of Xylos', 'Saelen Lyra'shai, The Eighth Ascendant', 'Aethel Voidis, Pilot of the Void-Run'. This format provides maximum detail about the alien's identity, achievements, and legendary status.</li></ul><p>Each format has its own strengths: First Names are direct and memorable, Full Names add cultural context, and Full Names with Epithets provide the most narrative depth and legendary status.</p>"
      },
      {
        "heading": "Alien Name Components and Naming Conventions",
        "content": "<p>The generator uses three component lists to create alien names, following sci-fi naming conventions:</p><ul><li><strong>First Names (Gender-Specific):</strong> Alien first names follow distinct naming conventions based on gender:<ul><li><strong>Male Aliens (250 names):</strong> Harsh, guttural names with strong consonant endings. Examples: 'K'Tharr', 'Zylos', 'Xarok', 'Varrus', 'G'Naash', 'Jaxx', 'Rydak', 'Gorok'. These names emphasize strength, aggression, and warrior culture, often using harsh consonants, apostrophes, and strong endings like -*k*, -*x*, -*r*.</li><li><strong>Female Aliens (250 names):</strong> Fluid, sibilant names with high vowels and ethereal feel. Examples: 'Saelen', 'Lyra'sha', 'Iridis', 'Ka'lia', 'Sh'vanni', 'Zethra', 'Nyx', 'Vela'. These names emphasize grace, beauty, and otherworldly elegance, often using soft consonants, apostrophes, and endings like -*a*, -*ia*, -*is*.</li><li><strong>Non-Binary Aliens (200 names):</strong> Conceptual, elemental names with complex phonemes and ambiguous structures. Examples: 'Aethel', 'Xe-vyn', 'Q'tol', 'Emnas', 'Drev', 'Irid', 'Voidis', 'Cypher'. These names emphasize androgyny, conceptual thinking, and elemental forces, often using rare phonemes, complex syllable breaks, and conceptual terms.</li></ul></li><li><strong>Surnames (200+ names, Gender-Neutral):</strong> Clan, family, or origin identifiers that reflect the alien's cultural background. Examples include 'K'han', 'V'rax', 'Talos', 'Shien', 'Vorlag', 'Lyra'shai', 'Akkaron', 'Dra'nak'. These surnames tell stories about the alien's clan, family, homeworld, or cultural affiliation.</li><li><strong>Epithets (200+ names, Gender-Neutral):</strong> Epic titles that describe the alien's legendary deeds, role, or cosmic significance. Examples include 'Slayer of Xylos', 'The Eighth Ascendant', 'Pilot of the Void-Run', 'Speaker of the Crystal Code', 'Warp-Breaker of Sector 7'. These epithets add legendary status, cosmic importance, and narrative depth, often referencing space travel, technology, cosmic events, or legendary achievements.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique alien names that work across different sci-fi settings and genres, with a focus on otherworldly origins, advanced civilizations, and cosmic mystery.</p>"
      },
      {
        "heading": "How to Use Alien Names",
        "content": "<p>Alien names work excellently for:</p><ul><li><strong>Science Fiction Writing:</strong> Create memorable alien characters for novels or short stories, particularly in space opera, hard sci-fi, or alien contact genres</li><li><strong>Tabletop RPGs:</strong> Name alien NPCs, player characters, or entire alien species for your sci-fi campaigns, especially in systems like Starfinder, Traveler, or custom sci-fi settings</li><li><strong>Video Game Development:</strong> Perfect for naming alien characters, species, or civilizations in sci-fi video games</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for alien species in your sci-fi universe, creating coherent cultural systems and naming patterns</li><li><strong>Character Development:</strong> Use alien names to reflect a character's origin, culture, or role—warrior aliens, diplomatic aliens, or mysterious entities</li></ul><p>When choosing alien names, consider the character's origin, culture, and the tone of your setting. A name like 'K'Tharr K'han' suggests a warrior from a harsh culture, while 'Saelen Lyra'shai, The Eighth Ascendant' suggests a graceful being with cosmic significance.</p>"
      },
      {
        "heading": "Well-Known Aliens in Literature and Media",
        "content": "<p>Alien names have been immortalized through science fiction literature, films, games, and media. These iconic aliens demonstrate the power of well-chosen alien names:</p><ul><li><strong>Aliens in Classic Sci-Fi Literature:</strong> Classic science fiction features numerous memorable alien characters with names that reflect their otherworldly origins. From H.G. Wells' Martians to various alien species in works by Isaac Asimov, Arthur C. Clarke, and other sci-fi masters, alien names often emphasize strangeness, otherworldliness, and the difficulty of human pronunciation.</li><li><strong>Aliens in Star Trek:</strong> The Star Trek franchise features numerous alien species with distinctive naming conventions. Vulcans (Spock, T'Pol), Klingons (Worf, Gowron), Romulans (Sela, Tomalak), and other species each have unique naming patterns that reflect their cultures and languages.</li><li><strong>Aliens in Star Wars:</strong> Star Wars features countless alien species with names that range from simple (Chewbacca, Yoda) to complex (Jabba the Hutt, Watto). Alien names in Star Wars often reflect the species' culture, homeworld, and role in the galaxy.</li><li><strong>Aliens in Mass Effect:</strong> The Mass Effect series features numerous alien species with distinct naming conventions. Turians (Garrus, Saren), Asari (Liara, Aria), Krogans (Wrex, Grunt), and other species each have unique naming patterns that reflect their cultures and languages.</li><li><strong>Aliens in Various Sci-Fi Games:</strong> Games like Halo, Destiny, and various sci-fi RPGs feature alien characters with names that blend otherworldly sounds with recognizable patterns. Names often emphasize the alien's origin, culture, and role in the story.</li><li><strong>Aliens in Comics and Media:</strong> Comics, TV shows, and films feature countless alien characters with names that draw from various sci-fi traditions while adapting to modern storytelling. Characters range from simple, memorable names to complex, unpronounceable alien designations.</li></ul><p>These iconic aliens demonstrate the range of alien naming conventions: from simple, memorable names (Spock, Yoda) to complex, unpronounceable designations, from harsh, guttural names (Klingon names) to fluid, elegant names (Asari names). When creating your own alien characters, consider what the name says about the alien's origin, culture, and role in your story, drawing from sci-fi traditions while allowing for creative interpretation.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Alien Names",
        "content": "<p>Understanding the etymology and symbolism behind alien names adds depth to character creation and worldbuilding. Many alien names draw from specific linguistic patterns, sci-fi conventions, and symbolic meanings:</p><ul><li><strong>Harsh Consonants and Guttural Sounds:</strong> Male alien names often use harsh consonants (K, X, Z, R) and guttural sounds to emphasize strength and warrior culture. Names like 'K'Tharr', 'Xarok', 'Zylos', 'Gorok' use these patterns to create a sense of power and aggression.</li><li><strong>Fluid Consonants and Sibilant Sounds:</strong> Female alien names often use fluid consonants (S, L, R) and sibilant sounds to emphasize grace and elegance. Names like 'Saelen', 'Lyra'sha', 'Iridis', 'Zethra' use these patterns to create a sense of beauty and otherworldly elegance.</li><li><strong>Conceptual and Elemental Terms:</strong> Non-binary alien names often use conceptual terms, elemental forces, or abstract concepts. Names like 'Voidis', 'Cypher', 'Nebula', 'Prism', 'Quark', 'Rift' emphasize androgyny, conceptual thinking, and connection to cosmic forces.</li><li><strong>Apostrophes and Special Characters:</strong> Many alien names use apostrophes (K'Tharr, Lyra'sha, Q'tol) to create a sense of otherworldliness and difficulty in human pronunciation. These characters suggest alien languages and cultural differences.</li><li><strong>Complex Phonemes and Syllable Breaks:</strong> Alien names often use complex phoneme combinations and unusual syllable breaks to create a sense of strangeness. Names like 'Xe-vyn', 'Myn'ak', 'Zek'on' demonstrate these patterns.</li><li><strong>Cosmic and Technological References:</strong> Alien surnames and epithets often reference space, technology, and cosmic concepts. Names like 'Void-Run', 'Crystal Code', 'Warp-Breaker', 'Graviton Coil', 'Quantum Rift' emphasize the alien's connection to advanced technology and cosmic forces.</li><li><strong>Clan and Family Identifiers:</strong> Alien surnames often reflect clan, family, or cultural affiliations. Names like 'K'han', 'Lyra'shai', 'Vorlag' suggest cultural groups and social structures within alien societies.</li><li><strong>Legendary Achievements and Cosmic Significance:</strong> Alien epithets often reference legendary deeds, cosmic events, or significant achievements. Phrases like 'Slayer of Xylos', 'The Eighth Ascendant', 'Pilot of the Void-Run', 'Architect of the New Dawn' emphasize the alien's importance and legendary status.</li><li><strong>Sci-Fi Naming Conventions:</strong> Alien names follow established sci-fi naming conventions, drawing from patterns found in classic science fiction literature, films, and games. These conventions help create authentic, recognizable alien names that fit within the sci-fi genre.</li><li><strong>Cultural and Linguistic Diversity:</strong> Alien names reflect the diversity of alien cultures and languages, with different naming patterns for different species, clans, and civilizations. This diversity adds depth and authenticity to sci-fi worldbuilding.</li></ul><p>When creating alien names, consider what each element means and how it contributes to the alien's identity. A name like 'K'Tharr K'han' immediately suggests a warrior from a harsh culture (K'Tharr) with a strong clan affiliation (K'han), while 'Saelen Lyra'shai, The Eighth Ascendant' suggests a graceful being (Saelen) from an elegant culture (Lyra'shai) with cosmic significance (The Eighth Ascendant). Understanding these naming conventions helps create authentic alien names that resonate with sci-fi traditions while allowing for creative interpretation in your own stories.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three name formats?",
        "answer": "First Name Only creates simple, direct names (K'Tharr, Saelen, Aethel). Full Name creates complete names with clan identifiers (K'Tharr K'han, Saelen Lyra'shai). Full Name with Epithet creates epic names with legendary titles (K'Tharr K'han, Slayer of Xylos). Each format has its own character and works best for different situations in sci-fi stories."
      },
      {
        "question": "What's the difference between the gender categories?",
        "answer": "Male alien names use harsh, guttural sounds with strong consonant endings (K'Tharr, Zylos, Xarok). Female alien names use fluid, sibilant sounds with high vowels (Saelen, Lyra'sha, Iridis). Non-binary alien names use conceptual, elemental terms with complex phonemes (Aethel, Voidis, Cypher). Each category reflects different cultural and linguistic patterns."
      },
      {
        "question": "How many unique alien names does the generator provide?",
        "answer": "The generator provides thousands of unique alien name combinations across all formats and genders. With 250 male first names, 250 female first names, 200 non-binary first names, 200+ surnames, and 200+ epithets, the generator can create over 12,500,000 unique combinations for Full Names with Epithets, 50,000+ for Full Names, and 700 for First Names Only, ensuring maximum variety for your sci-fi world."
      },
      {
        "question": "Can I use these names for different alien species?",
        "answer": "Absolutely! While the names follow general sci-fi conventions, you can adapt them for different alien species in your universe. Consider how different species might have different naming patterns, and feel free to mix and match names to create unique cultural identities for each species."
      },
      {
        "question": "Are these names based on real languages?",
        "answer": "These names are inspired by sci-fi naming conventions found in science fiction literature, films, and games. While they don't directly derive from real languages, they follow patterns established in the sci-fi genre, using sounds, structures, and conventions that create a sense of otherworldliness and alien culture."
      }
    ]
  },
  "relatedGenerators": [
    "angel",
    "demon-name-generator"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(fantasyFile, JSON.stringify(fantasyData, null, 2));

console.log('✅ Successfully created Alien Name Generator!');
console.log(`📊 Male first names: ${alienData.Alien_First_Names_Male.length}`);
console.log(`📊 Female first names: ${alienData.Alien_First_Names_Female.length}`);
console.log(`📊 Non-binary first names: ${alienData.Alien_First_Names_NonBinary.length}`);
console.log(`📊 Surnames: ${alienData.Alien_Surnames.length}`);
console.log(`📊 Epithets: ${alienData.Alien_Epithets.length}`);
console.log(`✨ Three formats available`);
console.log(`✨ Three gender options available`);
console.log(`\n📋 Example names:`);
console.log(`   First Name: K'Tharr, Saelen, Aethel`);
console.log(`   Full Name: K'Tharr K'han, Saelen Lyra'shai`);
console.log(`   Full Name with Epithet: K'Tharr K'han, Slayer of Xylos`);

