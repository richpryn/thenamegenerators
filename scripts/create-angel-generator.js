#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Angel name data from the provided JSON
const angelData = {
  "Angel_First_Names_Male": [
    "Adriel", "Serafiel", "Raziel", "Auriel", "Cassiel", "Zadkiel", "Haniel", "Israfel", "Jophiel", "Uriel",
    "Azrael", "Gabriel", "Michael", "Rafael", "Samiel", "Sariel", "Zaphiel", "Ramiel", "Muriel", "Peniel",
    "Jeremiel", "Chamuel", "Raguel", "Phanuel", "Barakiel", "Kochbiel", "Simkiel", "Shamshiel", "Yofiel", "Zotiel",
    "Metatron", "Sandalphon", "Sargon", "Tiberius", "Severus", "Quintus", "Titus", "Aurelian", "Helios", "Zephyrus",
    "Boreas", "Notus", "Eurus", "Palamon", "Ekon", "Shiel", "Varun", "Kyon", "Raan", "Theron",
    "Evran", "Tyrus", "Zenos", "Varis", "Hadriel", "Elijah", "Yael", "Sachiel", "Simiel", "Tzafkiel",
    "Mebahiah", "Hakamiah", "Lauviah", "Vehuel", "Manakel", "Hahasiah", "Seheiah", "Rehael", "Iezalel", "Mehiel",
    "Damabiah", "Vasariah", "Mihael", "Tsuriel", "Shemeshiel", "Kael", "Erel", "Luxian", "Aeriel", "Verrin",
    "Kyros", "Demos", "Alistair", "Phaneos", "Eron", "Lycidas", "Soriel", "Xadriel", "Tyrian", "Valor",
    "Creed", "Lorian", "Orin", "Rylan", "Lysander", "Corvus", "Xael", "Vael", "Zael", "Tael",
    "Rael", "Nael", "Lael", "Gael", "Dael", "Fael", "Hael", "Khael", "Mael", "Psael",
    "Shael", "Abir", "Adar", "Amon", "Arnan", "Benaiah", "Boaz", "Caleb", "Dan", "Eldad",
    "Eliel", "Etan", "Gad", "Hanan", "Hizqiah", "Iddo", "Joah", "Joash", "Kelaiah", "Lavi",
    "Maaz", "Neriah", "Ophir", "Phinehas", "Rehob", "Shemaiah", "Uriah", "Zev", "Zichri", "Zophar",
    "Zuriel", "Azariah", "Gilon", "Hodiah", "Hoshaiah", "Igal", "Ishmaiah", "Kishi", "Mattenai", "Othniel",
    "Pedaiah", "Seraiah", "Uzziel", "Zebadiah", "Zurishaddai"
  ],
  "Angel_First_Names_Female": [
    "Anael", "Elara", "Nyssa", "Lyra", "Asteria", "Selene", "Eos", "Vespera", "Astra", "Vesper",
    "Lunis", "Jerah", "Hesperus", "Vinael", "Xinael", "Yinael", "Lyssia", "Amaris", "Erelah", "Aethel",
    "Zerah", "Xylos", "Elissa", "Sarina", "Zelia", "Thalia", "Evadne", "Ione", "Liora", "Myra",
    "Celeste", "Divina", "Seraphina", "Angelica", "Lumena", "Aurea", "Sola", "Luna", "Stella", "Nova",
    "Vega", "Maia", "Dina", "Talia", "Ora", "Liel", "Aura", "Eira", "Sonia", "Kyra",
    "Corina", "Valena", "Zara", "Phina", "Miela", "Ria", "Zoe", "Enya", "Aria", "Shayla",
    "Rielle", "Linnea", "Soraya", "Aeliana", "Caelia", "Oriana", "Esther", "Judith", "Ruth", "Naomi",
    "Dinah", "Shifra", "Adah", "Huldah", "Jemima", "Keren", "Michal", "Tamar", "Zipporah", "Abigail",
    "Delilah", "Jael", "Kezia", "Leah", "Mara", "Rebekah", "Sapphira", "Susanna", "Tabitha", "Vashti",
    "Hadassah", "Tirzah", "Zinah", "Anya", "Briar", "Dahlia", "Fae", "Gemma", "Holly", "Iris",
    "Jasmine", "Kendra", "Lilac", "Misty", "Oriel", "Pearl", "Quilla", "Rose", "Sage", "Teal",
    "Willow", "Xena", "Yara", "Zinna", "Annis", "Briella", "Cerise", "Danya", "Eleni", "Fiona",
    "Giselle", "Heidi", "Ilsa", "Jocelyn", "Kyla", "Lynda", "Marni", "Nadia", "Oona", "Petra",
    "Quinn", "Rhiannon", "Sylvie", "Tamsin", "Uma", "Vianne", "Wynne", "Xanthe", "Yasmine", "Zora",
    "Aelita", "Aislin", "Brynn", "Carys", "Delyth", "Eiraen", "Faelan", "Gwenllian", "Iriel", "Llora",
    "Niamh", "Rona", "Sian", "Tegan", "Viviane", "Zelena", "Arabel", "Cynthia", "Diana", "Electra",
    "Freya", "Geneva", "Helena", "Isolde", "Juno", "Katia", "Lorelei", "Minerva", "Ophelia", "Pandora",
    "Selena", "Venus", "Viola", "Willowby"
  ],
  "Angel_First_Names_NonBinary": [
    "Orphiel", "Razael", "Suriel", "Ariel", "Camael", "Leliel", "Purael", "Zien", "Eldren", "Rime",
    "Zephyr", "Aetheros", "Orion", "Altair", "Sirius", "Corvus", "Draco", "Cygnus", "Sol", "Nariel",
    "Zerachiel", "Azael", "Amriel", "Armaros", "Ulael", "Zinael", "Jael", "Zauriel", "Remiel", "Keter",
    "Hokmah", "Binah", "Chesed", "Geburah", "Tiphereth", "Netzach", "Hod", "Yesod", "Malkuth", "Numen",
    "Lux", "Caelus", "Aion", "Purity", "Clarity", "Light", "Duty", "Vow", "Scion", "Hearth",
    "Brand", "Word", "Zeal", "Jera", "Asher", "Kyon", "Rhan", "Solen", "Vesper", "Alcor",
    "Mizar", "Deneb", "Rigel", "Bellatrix", "Lumos", "Nitor", "Castus", "Fidus", "Magnus", "Celeritas",
    "Vindex", "Lex", "Fides", "Spes", "Caritas", "Patientia", "Concordia", "Pietas", "Veritas", "Aequitas",
    "Justitia", "Prudentia", "Fortitudo", "Temperantia", "Kyriel", "Corin", "Creed", "Oath", "Solas", "Rhan",
    "Tyr", "Lorian", "Orin", "Rylan", "Corvus", "Orion", "Orionis", "Lyrae", "Cygnis", "Aquila",
    "Phoenix", "Xylos", "Aethel", "Kael", "Erel", "Xael", "Vael", "Zael", "Tael", "Rael",
    "Nael", "Lael", "Gael", "Dael", "Fael", "Hael", "Khael", "Mael", "Psael", "Shael",
    "Alastor", "Anakim", "Anathema", "Asmodeus", "Balam", "Beelzebul", "Belial", "Caim", "Dantalion", "Focalor",
    "Glasya", "Haagenti", "Ipos", "Malphas", "Orias", "Paimon", "Phenex", "Purson", "Ronove", "Sallos",
    "Valefor", "Vepar", "Vine", "Zagan", "Zepar", "Abalam", "Agares", "Amdusias", "Andras", "Andromalius",
    "Asmoday", "Baal", "Barbatos", "Bifrons", "Botis", "Buer", "Buné", "Decarabia", "Eligos", "Flauros",
    "Forneus", "Furfur", "Gaap", "Gremory", "Leraje", "Marbas", "Morax", "Orobos", "Raum", "Sabnock",
    "Shax", "Sitri", "Stolas", "Vassago"
  ],
  "Angel_Surnames": [
    "Lightbringer", "Starseeker", "Faithshield", "Heavensward", "Pureheart", "Truthbound", "Wordgiver", "Firewing", "Sunblade", "Dawncaller",
    "Stormbinder", "Oathkeeper", "Soulguard", "Aetherspear", "Celestian", "Judgemental", "Vowsworn", "Dutybound", "Seraphic", "Cherubic",
    "Empyrean", "Glorious", "Radiance", "Lumina", "Aethelred", "Puresteel", "Hallowbrand", "Vigilance", "Temperance", "Justice",
    "Mercy", "Zealot", "Scionborn", "Gold-Woven", "Silver-Haired", "Bronze-Armored", "Voice-of-Law", "Sword-of-Will", "Scion-of-Light", "Mirror-of-Truth",
    "Keeper-of-Vows", "Watcher-of-Souls", "Silent-Judge", "Grand-Architect", "Shield-of-Ages", "Sky-Wrought", "Rune-Scriven", "Time-Walker", "Ever-Shining", "True-Gazing",
    "Final-Word", "First-Light", "Last-Hope", "Eternal-Vigil", "Unseen-Hand", "Silent-Wing", "Bronze-Plated", "Star-Forged", "Soul-Bound", "Spirit-Woven",
    "Pure-Sight", "Clear-Mind", "Iron-Will", "Gold-Clad", "Silver-Winged", "Azure-Eyed", "Crimson-Born", "Sapphire-Core", "Emerald-Heart", "Diamond-Light",
    "Opal-Soul", "Amethyst-Veil", "Pearl-Skin", "Ethereal", "Astral-Born", "Nimbus-Crowned", "Halo-Bearer", "Virtue-Made", "Angel-Forged", "God-Touched",
    "Divine-Spark", "Graceful-Step", "Unending-Task", "Swift-Justice", "Silent-Oath", "Sacred-Vessel", "Holy-Fire", "Blessed-One", "Promised-Blade", "Truth-Speaker",
    "Seraphim", "Cherubim", "Dominion", "Throne-Guard", "Power-Wrought", "Virtue-Heart", "Soulforged", "Gracebound", "Sun-Heart", "Moon-Mirror",
    "Star-Veil", "Comet-Born", "Nebula-Woven", "Sky-Crowned", "Aether-Wing", "Will-of-God", "Voice-of-Truth", "Sword-of-Dawn", "Seraph-Heart", "Cherub-Mind",
    "Throne-Wrought", "Dominion-Clad", "Power-Bound", "Virtue-Core", "Mightspear", "Justice-Hand", "Law-Keeper", "Order-Made", "Peace-Singer", "Woe-Bringer",
    "Final-Judge", "Ever-Vigilant", "Swift-Aegis", "Pure-Blade", "Chastity", "Humility", "Kindness", "Diligence", "Patience", "Charity",
    "Clarity", "Purity", "Sanctity", "Divinity", "Authority", "Sovereignty", "Dominion", "Serenity", "Tranquility", "Resilience",
    "Integrity", "Rectitude", "Verity", "Wisdom", "Counsel", "Understanding", "Knowledge", "Piety", "Fear-of-God", "Angelic",
    "Radiant", "Luminous", "Incandescent", "Transcendent", "Heavenly", "Holy-Shield", "Blessed-Wing", "Star-Shaped", "Crystal-Eye", "Gold-Skin",
    "Obsidian-Plated", "Shadow-Scourge", "Demon-Bane", "Hell-Warden", "Eden-Guard", "Promised-Land", "Final-Vow", "Unending-Duty", "Silent-Gaze", "Bronze-Shield",
    "Copper-Helm", "Mithril-Mail", "Adamant-Core", "Time-Shield", "Fate-Bound", "Destiny-Woven", "Eternity-Seer", "Cosmic-Gazer", "Sky-Warden", "Void-Hunter",
    "Star-Fisher", "Sun-Bearer", "Truth-Eater", "Silence-Walker", "Iron-Vigil", "Silver-Gaze", "Azure-Plume", "Ruby-Blade", "Pearl-Grip", "Amethyst-Eye",
    "Topaz-Guard", "Jade-Wielder", "Saphire-Heart", "Emerald-Blade", "Steel-Feather", "Platinum-Wing", "Silver-Shade", "Gold-Glow", "Shadow-Edge", "Pure-Edge",
    "Will-Edge", "Word-Edge", "Soul-Edge", "Mind-Edge", "Truth-Edge", "Faith-Edge", "Shield-Edge", "Star-Edge", "Sun-Edge", "Moon-Edge",
    "Fire-Edge", "Ice-Edge", "Storm-Edge", "Light-Edge", "Dark-Edge", "Final-Edge", "First-Edge"
  ],
  "Angel_Epithets": [
    "Wielder of the Sacred Flame", "Architect of the Sixth Heaven", "Voice of the Silent Law", "Keeper of the Eternal Vows", "Judge of the Final Hour",
    "Shield Against the Void", "Scion of the First Dawn", "Herald of the Crimson Sun", "The Sorrow of Fallen Kin", "Sword of the Divine Will",
    "Witness to the Mortal Fall", "Guardian of the Unborn Star", "The Unwavering Light", "Whisperer of the Cosmic Truth", "Binder of the Shadow-Fae",
    "The Reflection of Purity", "Executor of the Grand Design", "Watcher over Sleeping Kings", "The Blade That Knew No Stain", "Bearer of the Seven Seals",
    "Speaker of the Final Word", "The Last Hope of Man", "The Architect of Grace", "Defender of the Celestial Gates", "The Scourge of Heresy",
    "Guide to the Lost Souls", "The Hand That Measures Time", "The Great Balm", "The Unseen Sentinel", "The Vigil That Never Ends",
    "Light in the Deepest Night", "Keeper of the Forbidden Scroll", "The Purest Heart in the Host", "The Unburdened Soul", "The First to Descend",
    "The Last to Return", "The Silent Intercessor", "The Promised Deliverer", "The Star Made Flesh", "The Law Written in Sky-Fire",
    "The Calm Before the Storm", "The End of All Lies", "The True Reflection", "The Divine Spark Made Manifest", "The Witness of Genesis",
    "The Keeper of the Unbroken Thread", "The Sun's Shadow", "The Moon's Tear", "The Emissary of Peace", "The Harbinger of War",
    "The Final Judgment", "The Beginning of Forever", "The Unstained Blade", "The Light of Truth", "The Hand of Justice",
    "The Heart of Mercy", "The Soul of Zeal", "The Shield of Faith", "The Eye of Providence", "The Voice of Redemption",
    "The Path of Virtue", "The Sign of Forgiveness", "The Song of Grace", "The Word of Power", "The Mirror of Duty",
    "The Seal of the Covenant", "The Key to Paradise", "The Crown of Sanctity", "The Mantle of Purity", "The Veil of Light",
    "The Dawn of Hope", "The Dusk of Sorrow", "The Flame of Obedience", "The Anchor of Trust", "The Call of Duty",
    "The Watchman of the Walls", "The Sentinel of the Gates", "The Blade of Vengeance", "The Balm of Healing", "The Ray of Hope",
    "The Chorus of Praise", "The Scribe of Deeds", "The Witness of Ages", "The Herald of the Dawn", "The Star of Guidance",
    "The Whisper of Conscience", "The Steadfast Protector", "The Holy Warrior", "The Perfect Servant", "The Living Law",
    "The Boundless Love", "The Unfailing Light", "The Immortal Oath", "Bearer of the Chalice", "Sentinel of the Sun's Path",
    "The Gilded Messenger", "The Wing of Silence", "The Decree of the Throne", "The Living Word of the Sky", "Scourge of the Tainted Host",
    "Protector of the Eleventh Seal", "The Ray That Pierces Doubt", "The Anchor of God's Patience", "Witness to the Silence of the Stars", "The Flame That Burns Away Deceit",
    "Bearer of the Iron Decree", "The Sentinel Who Sleeps Not", "The Voice That Calms the Tempest", "Guide to the Celestial Labyrinth", "The Unseen Thread of Destiny",
    "The Spark That Lit the Cosmos", "The Unending Song of Praise", "The Hand That Signed the Covenant", "The Mirror That Shows All Sin", "The First Blade Drawn in Eden",
    "The Light That Lingers After Death", "Judge of the False Prophets", "Commander of the Star-Vessels", "Architect of the Unseen Bridge", "The Whisper That Turned the Tide",
    "The Oath Sworn Before the Void", "The Pen That Writes the Final Law", "The Watcher of the Mortal Coil", "The Hand That Heals All Wounds", "The Sword That Cuts Through Lies",
    "The Shadow of the Divine Presence", "The Unflinching Gaze of Judgment", "The Balm for All Sorrow", "The Living Testament", "The Boundless Horizon",
    "The Eternal Echo of Creation", "The Shield of Unstained Glass", "The Keeper of the Nameless Stars", "The Guardian of Lost Virtue", "The Light Found in the Deepest Pit",
    "The Messenger of Unspoken Grace", "The Architect of the Final Peace", "The Vengeance of the Forgotten", "The True Master of the Keys", "The Last Defender of the Innocence",
    "The Star That Fell to Rise Again", "The Keeper of the First Breath", "The Unraveler of Mysteries", "The Whisperer of Dreams", "The Voice in the Wilderness",
    "The Sentinel of the Dawn", "The Herald of the Sun's Return", "The Silent Guardian of the Unseen", "The Promise Written in Light", "The Decree That Cannot Be Broken",
    "The Strength Against Despair", "The Wisdom Beyond Measure", "The Light of Redemption", "The Path of the Righteous", "The Mirror of the Soul",
    "The Seal of the Heavens", "The Key to the Seven Spheres", "The Crown of Everlasting Life", "The Mantle of Righteousness", "The Veil of True Sight",
    "The Dawn of Eternal Life", "The Dusk of Mortal Fear", "The Flame of Undying Faith", "The Anchor of Divine Love", "The Call of the Highest Duty",
    "The Watchman of the Mortal Realm", "The Sentinel of the First Gate", "The Blade of Necessary Pain", "The Balm of Perfect Hope", "The Ray of Celestial Light",
    "The Chorus of Divine Majesty", "The Scribe of the Great Book", "The Witness of All Time", "The Herald of the Resurrection", "The Star of Glorious Purpose",
    "The Whisper of the Almighty", "The Steadfast Rock", "The Perfect Warrior", "The Living Word", "The Unconditional Love",
    "The Light That Never Fails", "The Boundless Grace", "The Immortal Will", "The Unending Grace", "The Sword of Retribution",
    "The Hammer of Heretics", "The Shaper of Worlds", "The Weaver of Stars", "The Seeker of Lost Light", "The Listener to All Prayers",
    "The Final Guardian"
  ]
};

// Read the fantasy.json file
const fantasyFile = path.join(__dirname, '../data/fantasy.json');
const fantasyData = JSON.parse(fs.readFileSync(fantasyFile, 'utf8'));

// Add the angel generator
fantasyData.generators.angel = {
  "title": "Angel Name Generator",
  "slug": "angel-name-generator",
  "description": "Generate authentic angel names with gender filters and format options. Create first names, full names, or full names with epithets perfect for fantasy writing, D&D, and religious/mythological characters.",
  "seoKeywords": "angel names, angel name generator, angelic names, biblical angel names, fantasy angel names, dnd angel names, archangel names, seraphim names",
  "icon": "😇",
  "isPopular": true,
  "popularRank": 8,
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
        "first_name": "First Name Only (e.g., Gabriel, Seraphina)",
        "full_name": "Full Name (e.g., Gabriel Lightbringer, Seraphina Starseeker)",
        "full_name_epithet": "Full Name with Epithet (e.g., Gabriel Lightbringer, Wielder of the Sacred Flame)"
      }
    }
  },
  "data": {
    "male": angelData.Angel_First_Names_Male,
    "female": angelData.Angel_First_Names_Female,
    "non_binary": angelData.Angel_First_Names_NonBinary,
    "surnames": angelData.Angel_Surnames,
    "epithets": angelData.Angel_Epithets
  },
  "article": {
    "hero": {
      "title": "😇 Angel Name Generator",
      "tagline": "Generate authentic angel names with gender filters and format options. Create first names, full names, or full names with epithets perfect for fantasy writing, D&D, and religious/mythological characters."
    },
    "intro": "Angel names carry the weight of divine authority, celestial power, and sacred purpose. From the classic 'Gabriel' to the epic 'Gabriel Lightbringer, Wielder of the Sacred Flame', angel names tell stories of divine messengers, celestial guardians, and heavenly warriors. Our **Angel Name Generator** creates authentic angel names using three distinct formats: First Names Only (Gabriel, Seraphina), Full Names (Gabriel Lightbringer, Seraphina Starseeker), and Full Names with Epithets (Gabriel Lightbringer, Wielder of the Sacred Flame), with gender filters for Male, Female, and Non-Binary angels, drawing from Hebrew, Latin, Greek, and classical angelic naming conventions to create names that resonate with divine authority and celestial power.",
    "sections": [
      {
        "heading": "The Power of Angel Names",
        "content": "<p>Angel names serve multiple purposes in fantasy worlds, religious texts, and mythology: they identify divine messengers, create memorable celestial characters, establish a character's role in the heavenly hierarchy, and add depth to religious and mythological settings. A well-chosen angel name can instantly convey whether a character is an archangel (Gabriel, Michael), a seraphim (Seraphina), or a guardian angel (Ariel Lightbringer).</p><p>Our generator uses three distinct formats to create angel names with different levels of detail and formality. Each format has its own character: First Names are simple and direct, Full Names add titles and roles, and Full Names with Epithets provide the most narrative depth and legendary status.</p>"
      },
      {
        "heading": "Angel Name Formats",
        "content": "<p>The generator offers three distinct naming formats, each with its own character and use:</p><ul><li><strong>First Name Only:</strong> This format creates simple, direct angel names. Examples: 'Gabriel', 'Seraphina', 'Michael', 'Ariel'. This format is perfect for archangels, seraphim, and other high-ranking angels where the name alone carries sufficient weight and recognition.</li><li><strong>Full Name (First Name + Surname/Title):</strong> This format creates complete angel names with titles. Format: [First Name] [Surname/Title]. Examples: 'Gabriel Lightbringer', 'Seraphina Starseeker', 'Michael Truthbound', 'Ariel Pureheart'. This format combines a first name with a descriptive title or surname that reflects the angel's role, virtue, or celestial function.</li><li><strong>Full Name with Epithet (First Name + Surname + Epithet):</strong> This format creates the most detailed and epic angel names. Format: [First Name] [Surname], [Epithet]. Examples: 'Gabriel Lightbringer, Wielder of the Sacred Flame', 'Seraphina Starseeker, Architect of the Sixth Heaven', 'Michael Truthbound, Voice of the Silent Law'. This format provides maximum detail about the angel's identity, role, and legendary status.</li></ul><p>Each format has its own strengths: First Names are direct and memorable, Full Names add descriptive context, and Full Names with Epithets provide the most narrative depth and legendary status.</p>"
      },
      {
        "heading": "Angel Name Components and Naming Conventions",
        "content": "<p>The generator uses three component lists to create angel names, following classical angelic naming conventions:</p><ul><li><strong>First Names (Gender-Specific):</strong> Angelic first names follow distinct naming conventions based on gender:<ul><li><strong>Male Angels (150 names):</strong> Strong Hebrew/Latin roots; often ending in -*iel*, -*ael*, -*us*, or Roman/Virtue names. Examples: 'Gabriel', 'Michael', 'Rafael', 'Uriel', 'Azrael', 'Cassiel', 'Tiberius', 'Aurelian', 'Helios'. These names emphasize strength, divine authority, and classical roots from Hebrew and Latin traditions.</li><li><strong>Female Angels (150 names):</strong> Softer Latin/Greek/Hebrew roots; often ending in -*a*, -*e*, -*is*, -*ia*, or star/celestial names. Examples: 'Seraphina', 'Celeste', 'Asteria', 'Selene', 'Lyra', 'Astra', 'Luna', 'Stella', 'Nova'. These names emphasize grace, celestial beauty, and connections to stars, light, and heavenly bodies.</li><li><strong>Non-Binary Angels (150 names):</strong> Androgynous, elemental, conceptual, or celestial body names; strong focus on the classical suffix -*el*. Examples: 'Ariel', 'Orphiel', 'Razael', 'Suriel', 'Camael', 'Orion', 'Altair', 'Sirius', 'Zephyr', 'Aetheros'. These names emphasize androgyny, elemental forces, celestial bodies, and conceptual virtues, often using the classical -*el* suffix that appears in many angelic names.</li></ul></li><li><strong>Surnames/Titles (300 names, Gender-Neutral):</strong> Descriptive titles that reflect the angel's role, virtue, or celestial function. Examples include 'Lightbringer', 'Starseeker', 'Faithshield', 'Heavensward', 'Pureheart', 'Truthbound', 'Wordgiver', 'Firewing', 'Sunblade', 'Dawncaller'. These surnames tell stories about the angel's purpose, virtue, or role in the heavenly hierarchy.</li><li><strong>Epithets (300 names, Gender-Neutral):</strong> Epic titles that describe the angel's legendary deeds, role, or divine purpose. Examples include 'Wielder of the Sacred Flame', 'Architect of the Sixth Heaven', 'Voice of the Silent Law', 'Keeper of the Eternal Vows', 'Judge of the Final Hour', 'Shield Against the Void'. These epithets add legendary status, divine purpose, and narrative depth, often referencing the angel's role in divine hierarchy, cosmic order, or celestial warfare.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique angel names that work across different fantasy settings, religious contexts, and mythological traditions, with a focus on divine authority, celestial power, and sacred purpose.</p>"
      },
      {
        "heading": "Classical Angelic Naming Conventions",
        "content": "<p>Angelic names follow specific linguistic and cultural conventions that have evolved over millennia:</p><ul><li><strong>The -*el* Suffix:</strong> One of the most common patterns in angelic names is the suffix -*el* (meaning 'of God' in Hebrew). This appears in names like Gabriel, Michael, Uriel, Raphael, and many others. The generator includes numerous names following this pattern across all gender categories.</li><li><strong>Hebrew Roots:</strong> Many angelic names derive from Hebrew, reflecting the origins of angelic lore in Jewish and Christian traditions. Names like 'Gabriel' (God is my strength), 'Michael' (Who is like God?), 'Raphael' (God heals), and 'Uriel' (God is my light) demonstrate this pattern.</li><li><strong>Latin and Roman Influences:</strong> Classical Roman names and Latin roots appear in many angelic names, particularly for male angels. Names like 'Tiberius', 'Severus', 'Quintus', 'Titus', and 'Aurelian' reflect this influence, suggesting divine authority and classical power.</li><li><strong>Greek Mythology:</strong> Female angel names often draw from Greek mythology, particularly names of goddesses and celestial beings. Names like 'Selene' (moon goddess), 'Eos' (dawn goddess), 'Asteria' (star goddess), and 'Thalia' (muse) demonstrate this pattern.</li><li><strong>Celestial and Elemental Themes:</strong> Many angel names reference celestial bodies, stars, and elemental forces. Names like 'Orion', 'Altair', 'Sirius', 'Zephyr', 'Astra', 'Nova', 'Stella', and 'Luna' emphasize the angel's connection to the cosmos and natural forces.</li><li><strong>Virtue Names:</strong> Some angel names directly reference virtues or divine qualities. Names like 'Purity', 'Clarity', 'Light', 'Duty', 'Vow', 'Zeal', and various Latin virtue names (Veritas, Aequitas, Justitia) emphasize the angel's role as a bearer of divine principles.</li><li><strong>Descriptive Surnames:</strong> Angel surnames often describe the angel's function, virtue, or appearance. Compound names like 'Lightbringer', 'Starseeker', 'Faithshield', 'Pureheart', and 'Truthbound' directly communicate the angel's purpose and role.</li><li><strong>Epic Epithets:</strong> Angel epithets often reference the angel's role in divine hierarchy, cosmic order, or specific legendary deeds. Phrases like 'Wielder of the Sacred Flame', 'Architect of the Sixth Heaven', 'Voice of the Silent Law', and 'Keeper of the Eternal Vows' emphasize the angel's importance and divine purpose.</li></ul><p>Understanding these naming conventions helps create authentic angel names that resonate with classical traditions while allowing for creative interpretation in fantasy and mythological settings.</p>"
      },
      {
        "heading": "How to Use Angel Names",
        "content": "<p>Angel names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Name angelic NPCs, player characters, or celestial beings for your campaigns, especially in settings involving divine powers, celestial planes, or religious themes</li><li><strong>Fantasy Writing:</strong> Create memorable angel characters for novels or short stories, particularly in high fantasy, urban fantasy, or religious fantasy genres</li><li><strong>Religious and Mythological Projects:</strong> Use angel names for religious education, biblical studies, or mythological retellings, drawing from authentic naming conventions</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for celestial beings in your fantasy world, creating a coherent angelic hierarchy and naming system</li><li><strong>Character Development:</strong> Use angel names to reflect a character's role, virtue, or position in the heavenly hierarchy—archangels, seraphim, cherubim, or guardian angels</li></ul><p>When choosing angel names, consider the character's role, gender, and the tone of your setting. A name like 'Gabriel Lightbringer' suggests a messenger or herald, while 'Seraphina Starseeker, Architect of the Sixth Heaven' suggests a high-ranking seraphim with specific cosmic responsibilities.</p>"
      },
      {
        "heading": "Well-Known Angels in Literature and Media",
        "content": "<p>Angel names have been immortalized through religious texts, literature, games, and media. These iconic angels demonstrate the power of well-chosen angel names:</p><ul><li><strong>Archangels in Religious Texts:</strong> The most famous angels come from religious texts: Gabriel (the messenger), Michael (the warrior), Raphael (the healer), and Uriel (the light-bearer). These names have Hebrew roots and follow the -*el* suffix pattern, meaning 'of God'. Their names have been used for millennia in religious contexts.</li><li><strong>Angels in Literature:</strong> Literature features numerous angel characters, from John Milton's 'Paradise Lost' (featuring angels like Gabriel, Michael, and Raphael) to modern fantasy novels. Names like 'Castiel' (from 'Supernatural') and various angel characters in urban fantasy demonstrate how angel names can be adapted for modern settings.</li><li><strong>Angels in D&D:</strong> Dungeons & Dragons features various angelic beings with names that follow classical conventions. Angels, archons, and other celestial beings often have names ending in -*el* or drawing from religious traditions, adapted for fantasy settings.</li><li><strong>Angels in Video Games:</strong> Games like 'Diablo', 'Dragon Age', and various RPGs feature angel characters with names that blend classical angelic naming with fantasy elements. Names often emphasize the angel's role, virtue, or divine purpose.</li><li><strong>Angels in Comics and Media:</strong> Comics, TV shows, and films feature angel characters with names that draw from religious traditions while adapting to modern storytelling. Characters like Castiel from 'Supernatural' and various angel characters in comics demonstrate this adaptation.</li><li><strong>Angels in Art and Culture:</strong> Angel names have influenced art, music, and culture for centuries. Names like 'Seraphina' and 'Gabriel' appear in various cultural contexts, from classical art to modern music, demonstrating the enduring power of angelic naming conventions.</li></ul><p>These iconic angels demonstrate the range of angel naming conventions: from classical religious names (Gabriel, Michael, Raphael) to modern adaptations (Castiel), from simple names to complex titles with epithets. When creating your own angel characters, consider what the name says about the angel's role, gender, and position in the heavenly hierarchy, drawing from classical conventions while allowing for creative interpretation.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Angel Names",
        "content": "<p>Understanding the etymology and symbolism behind angel names adds depth to character creation and worldbuilding. Many angel names draw from specific linguistic roots, religious traditions, and symbolic meanings:</p><ul><li><strong>Hebrew Roots and the -*el* Suffix:</strong> The most common pattern in angelic names is the Hebrew suffix -*el* (meaning 'of God'). Names like 'Gabriel' (God is my strength), 'Michael' (Who is like God?), 'Raphael' (God heals), 'Uriel' (God is my light), and 'Azrael' (Helper of God) demonstrate this pattern. This suffix appears in hundreds of angelic names across traditions.</li><li><strong>Latin and Roman Influences:</strong> Many male angel names draw from Latin and Roman traditions, suggesting classical authority and divine power. Names like 'Tiberius', 'Severus', 'Quintus', 'Titus', and 'Aurelian' reflect Roman naming conventions adapted for celestial beings.</li><li><strong>Greek Mythology and Celestial Names:</strong> Female angel names often reference Greek mythology, particularly goddesses and celestial beings. Names like 'Selene' (moon goddess), 'Eos' (dawn goddess), 'Asteria' (star goddess), 'Thalia' (muse of comedy), and 'Nyx' (night goddess) demonstrate this pattern.</li><li><strong>Celestial Bodies and Stars:</strong> Many angel names reference stars, constellations, and celestial bodies. Names like 'Orion', 'Altair', 'Sirius', 'Vega', 'Nova', 'Stella', 'Luna', and 'Astra' emphasize the angel's connection to the cosmos and heavenly realms.</li><li><strong>Elemental and Natural Forces:</strong> Some angel names reference elemental forces and natural phenomena. Names like 'Zephyr' (west wind), 'Boreas' (north wind), 'Helios' (sun), and 'Aetheros' (upper air) connect angels to natural forces and cosmic elements.</li><li><strong>Virtue and Concept Names:</strong> Some angel names directly reference virtues, concepts, or divine qualities. Names like 'Purity', 'Clarity', 'Light', 'Duty', 'Vow', 'Zeal', and Latin virtue names (Veritas - truth, Aequitas - equity, Justitia - justice) emphasize the angel's role as a bearer of divine principles.</li><li><strong>Descriptive Surnames:</strong> Angel surnames often describe function, virtue, or appearance. Compound names like 'Lightbringer' (one who brings light), 'Starseeker' (one who seeks stars), 'Faithshield' (shield of faith), 'Pureheart' (pure heart), and 'Truthbound' (bound to truth) directly communicate the angel's purpose.</li><li><strong>Epic Epithets:</strong> Angel epithets often reference the angel's role in divine hierarchy or legendary deeds. Phrases like 'Wielder of the Sacred Flame' (one who wields divine fire), 'Architect of the Sixth Heaven' (builder of heavenly realms), 'Voice of the Silent Law' (speaker of divine law), and 'Keeper of the Eternal Vows' (guardian of divine promises) emphasize the angel's importance and cosmic role.</li><li><strong>Religious and Mythological References:</strong> Many angel names draw from specific religious texts, mythological traditions, or historical sources. Names from the Bible, apocryphal texts, and various religious traditions provide authentic foundations for angelic naming.</li><li><strong>Gender-Specific Conventions:</strong> Male angel names often emphasize strength and authority (ending in -*iel*, -*ael*, -*us*), female names emphasize grace and beauty (ending in -*a*, -*e*, -*ia*), and non-binary names emphasize androgyny and elemental forces (using -*el* suffix or celestial/elemental references).</li></ul><p>When creating angel names, consider what each element means and how it contributes to the angel's identity. A name like 'Gabriel Lightbringer' immediately suggests a messenger (Gabriel) who brings divine light (Lightbringer), while 'Seraphina Starseeker, Architect of the Sixth Heaven' suggests a high-ranking seraphim (Seraphina) who seeks celestial knowledge (Starseeker) and builds heavenly realms (Architect of the Sixth Heaven). Understanding these naming conventions helps create authentic angel names that resonate with classical traditions while allowing for creative interpretation in fantasy and mythological settings.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three name formats?",
        "answer": "First Name Only creates simple, direct names (Gabriel, Seraphina). Full Name creates complete names with titles (Gabriel Lightbringer, Seraphina Starseeker). Full Name with Epithet creates epic names with legendary titles (Gabriel Lightbringer, Wielder of the Sacred Flame). Each format has its own character and works best for different power levels and narrative styles."
      },
      {
        "question": "What's the difference between the gender categories?",
        "answer": "Male angel names use strong Hebrew/Latin roots, often ending in -*iel*, -*ael*, -*us*, or Roman/Virtue names (Gabriel, Michael, Tiberius). Female angel names use softer Latin/Greek/Hebrew roots, often ending in -*a*, -*e*, -*is*, -*ia*, or star/celestial names (Seraphina, Celeste, Asteria). Non-binary angel names use androgynous, elemental, or celestial body names with a focus on the -*el* suffix (Ariel, Orphiel, Orion)."
      },
      {
        "question": "How many unique angel names does the generator provide?",
        "answer": "The generator provides thousands of unique angel name combinations across all formats and genders. With 150 first names per gender category, 300 surnames, and 300 epithets, the generator can create over 13,500,000 unique combinations for Full Names with Epithets, 45,000 for Full Names, and 450 for First Names Only, ensuring maximum variety for your fantasy world."
      },
      {
        "question": "Are these names based on real angelic traditions?",
        "answer": "Yes! These names draw from authentic angelic naming conventions found in Hebrew, Latin, Greek, and classical religious traditions. Many names follow the classical -*el* suffix pattern (meaning 'of God' in Hebrew), and the naming conventions reflect patterns found in religious texts, apocryphal writings, and mythological traditions."
      },
      {
        "question": "Can I use these names for D&D campaigns?",
        "answer": "Absolutely! These names are perfect for D&D campaigns involving angels, archons, or other celestial beings. The names work well for both NPCs and player characters, especially in campaigns with religious themes, celestial planes, or divine powers."
      }
    ]
  },
  "relatedGenerators": [
    "demon-name-generator",
    "vampire"
  ]
};

// Write the updated data back to the file
fs.writeFileSync(fantasyFile, JSON.stringify(fantasyData, null, 2));

console.log('✅ Successfully created Angel Name Generator!');
console.log(`📊 Male first names: ${angelData.Angel_First_Names_Male.length}`);
console.log(`📊 Female first names: ${angelData.Angel_First_Names_Female.length}`);
console.log(`📊 Non-binary first names: ${angelData.Angel_First_Names_NonBinary.length}`);
console.log(`📊 Surnames: ${angelData.Angel_Surnames.length}`);
console.log(`📊 Epithets: ${angelData.Angel_Epithets.length}`);
console.log(`✨ Three formats available`);
console.log(`✨ Three gender options available`);
console.log(`\n📋 Example names:`);
console.log(`   First Name: Gabriel, Seraphina, Ariel`);
console.log(`   Full Name: Gabriel Lightbringer, Seraphina Starseeker`);
console.log(`   Full Name with Epithet: Gabriel Lightbringer, Wielder of the Sacred Flame`);

