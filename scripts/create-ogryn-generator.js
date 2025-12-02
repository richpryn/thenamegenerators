#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ogryn name data from the provided JSON
const ogrynData = {
  "Ogryn_First_Names": [
    "Graug", "Vaus", "Qodd", "Zrog", "Thunk", "Kraog", "Ganduk", "Crolg", "Vreadd", "Sguad",
    "Bazz", "Hukk", "Fogg", "Snag", "Bruk", "Snuff", "Drok", "Mogg", "Nogg", "Bog",
    "Gog", "Wug", "Zog", "Grutt", "Hunk", "Varg", "Drokk", "Skab", "Flogg", "Blagg",
    "Krol", "Gork", "Mork", "Thorg", "Zakk", "Krag", "Shokk", "Brog", "Slab", "Bluto",
    "Lug", "Chunk", "Zug", "Stomp", "Grog", "Ruk", "Grug", "Tank", "Rig", "Grimm",
    "Snort", "Drogg", "Gut", "Glug", "Scab", "Mung", "Krutt", "Thrug", "Grak", "Bozz",
    "Fleg", "Klunk", "Moggol", "Ogg", "Huzz", "Fuzz", "Lurr", "Marr", "Rinn", "Yug",
    "Zugz", "Vozz", "Shlug", "Brag", "Stug", "Karr", "Plog", "Vurr", "Narl", "Krump",
    "Gritz", "Snortle", "Blutt", "Trigg", "Warg", "Slagg", "Fraz", "Muzz", "Kuss", "Krolg",
    "Boggart", "Grimlok", "Stompa", "Slabbs", "Gruntok", "Drakk", "Scrog", "Rimm", "Hoss", "Bullg"
  ],
  "Ogryn_Surnames": [
    "Metalmight", "Stonestrength", "Lonestriker", "Krageyes", "Ironmight", "Wildback", "Manbranch", "Bluntcleaver", "Loneripper", "Bonefoot",
    "Tankbuster", "Shieldbreaker", "Gun-Loader", "Trench-Hewer", "Skullthrone", "Rockchewer", "Bad-Aim", "Quickfoot", "Slowhand", "Iron-Grip",
    "Brass-Head", "Lead-Spine", "Grave-Fist", "Guts-Eater", "Muck-Digger", "Wall-Smasher", "Door-Kicker", "Blockhead", "Hardcase", "Bunker-Cleaver",
    "Heavy-Lifter", "Blood-Guzzler", "Ration-Hog", "Wrong-Think", "Loud-Voice", "Meat-Shield", "Shell-Eater", "Grim-Chomper", "Fire-Bane", "Ice-Bane",
    "Acid-Spewer", "Jungle-Crusher", "Forge-Born", "Wasteland-Nomad", "Rubble-Raker", "Canyon-Hulk", "Flat-Nose", "One-Eye", "Stub-Hand", "Scar-Face",
    "Headbut", "Ironback", "Footstomp", "Gutwall", "Steelarm", "Skullsmash", "Chainbrawn", "Goregut", "Dirtchew", "Mudlump",
    "Badtemper", "Loudsnort", "Simplemind", "Trueblind", "Fastdrink", "Slowrun", "Brokenlimb", "Stronglung", "Wetfur", "Coldgut",
    "Warhammer", "Macehead", "Spikefist", "Clubarm", "Flailfoot", "Rockbiter", "Glassguts", "Paperbone", "Ammo-Thief", "Rig-Wrecker",
    "Tank-Puller", "Door-Jumper", "Wall-Climber", "Hole-Digger", "Wire-Chewer", "Mine-Kicker", "Flare-Eater", "Bomb-Hugger", "Friend-Hitter", "Leader-Loser",
    "Map-Rip", "Box-Throw", "Barrel-Roll", "Dirt-Nap", "Heavy-Haul", "Load-Shift", "Gun-Swinger", "Blast-Runner", "Fog-Stomper", "Rain-Drinker"
  ],
  "Ogryn_Epithets": [
    "Ripper of the Regiments", "The Smartest of the Dumb", "The One Who Follows Orders", "Crusher of Tiny Men", "The Loudest in the Barracks",
    "Wielder of the Heavy 88", "Bane of the Barricade", "The Wall That Walks", "Eater of All Rations", "The Unstoppable Charge",
    "Hammer of the Commissar", "The One Who Forgot His Name", "Shovel-Master of the Trenches", "The Fastest at the Mess-Hall", "Terror of the Supply-Depot",
    "The Unwitting Hero", "The Lucky Shot", "Sentinel of the Line", "The Grotesque Guardian", "Ironclad Fist of the Imperium",
    "Voice of the Loudest Roar", "The Unbreakable Back", "Breaker of Chainfists", "Friend to the Ratlings", "The Simple Truth",
    "Guardian of the Colonel's Hat", "The Constant Threat", "Born of the Slag-Heaps", "The Deepest Sleeper", "The Quietest Eater",
    "Stopper of Projectiles", "The Accident Waiting to Happen", "Lumberer of the Lines", "The One Who Broke the Drill", "The Grunt's Grunt",
    "Saviour of the Supply-Crate", "The Last to Understand", "The First to Charge", "Rager of the Front Line", "The Man-Mountain",
    "Doom of the Enemy Trenches", "The Unexpected Flank", "The Loyal Fool", "The Simpleton Savage", "The Slab-Shield King",
    "He Who Cannot Be Stopped", "The Biggest of the Big", "The Unflinching Target", "The Friendly Cannibal", "The Quiet Despair",
    "The One Who Saw A Book", "Keeper of the Broken Shovel", "The Boss's Last Mistake", "Defender of the Empty Crate", "The Loudest Nap",
    "He Who Forgot to Load", "Saviour of the General's Dog", "Bane of the Kitchen Staff", "The Gentle Giant Killer", "The Only Clean One",
    "The Unending Thirst", "Lord of the Latrines", "The Master of Falling Down", "The King of the Trench Mud", "The Biggest Liar",
    "The Honest Stupid", "The Accidental Sniper", "The Reluctant Runner", "The Unflinching Glare", "The Smell of the Entire Regiment",
    "The One Who Knows Where the Food Is", "The Slow-Witted Strategist", "The Best At Standing Still", "The Worst At Following Directions", "The Hammer of the Unseen Enemy",
    "The Voice of One Thought", "The Reason The Gate Is Closed", "The Scourge of the Supply Lines", "The Unintentional Grenadier", "The Great Belly",
    "The Man Who Ate The Map", "The Survivor of Friendly Fire", "The Last One Left", "The Iron-Jaw Protector", "The Stone-Hearted Looter",
    "The One Who Carries The Wall", "The Great Big Dumb", "The Unaware Lookout", "The Champion of Eating Contests", "The Reason For The Re-Deployment",
    "The Big One", "The Grinning Fool", "The One Who Likes Pinks", "The Man Who Talked To A Tree", "The Best Friend Of The Rat",
    "The Unbreakable Guard", "The Target Practice King", "The Unstoppable Drunk", "The Eternal Grunt", "The Wettest Socks"
  ]
};

// Read the pop_culture.json file
const popCultureFile = path.join(__dirname, '../data/pop_culture.json');
const popCultureData = JSON.parse(fs.readFileSync(popCultureFile, 'utf8'));

// Add the ogryn generator
popCultureData.generators.ogryn = {
  "title": "Ogryn Name Generator",
  "slug": "ogryn-name-generator",
  "description": "Generate authentic Ogryn names from the Warhammer 40K universe. Create short names, full names, or full names with epithets perfect for Warhammer 40K characters, tabletop gaming, and fan fiction.",
  "seoKeywords": "ogryn name generator, ogryn names, warhammer 40k ogryn names, ogre name generator warhammer, warhammer ogryn names, 40k ogryn names, warhammer name generator",
  "icon": "👹",
  "isPopular": true,
  "popularRank": 10,
  "filters": {
    "format": {
      "label": "Name Format",
      "options": [
        "short_name",
        "full_name",
        "full_name_epithet"
      ],
      "optionLabels": {
        "short_name": "Short Name (e.g., Tankbuster, The Unstoppable Charge)",
        "full_name": "Full Name (e.g., Thunk Ironmight)",
        "full_name_epithet": "Full Name with Epithet (e.g., Kraog Trench-Hewer, Bane of the Barricade)"
      }
    }
  },
  "data": {
    "firstNames": ogrynData.Ogryn_First_Names,
    "surnames": ogrynData.Ogryn_Surnames,
    "epithets": ogrynData.Ogryn_Epithets
  },
  "article": {
    "hero": {
      "title": "👹 Ogryn Name Generator",
      "tagline": "Generate authentic Ogryn names from the Warhammer 40K universe. Create short names, full names, or full names with epithets perfect for Warhammer 40K characters, tabletop gaming, and fan fiction."
    },
    "intro": "Ogryn names in the Warhammer 40K universe reflect the brutal, simple, and often comedic nature of these massive abhuman soldiers. From the straightforward 'Thunk Ironmight' to the epic 'Kraog Trench-Hewer, Bane of the Barricade', Ogryn names tell stories of strength, loyalty, and the grim humor of the 41st millennium. Our **Ogryn Name Generator** creates authentic Warhammer 40K Ogryn names using three distinct formats: Short Names (Tankbuster, The Unstoppable Charge), Full Names (Thunk Ironmight), and Full Names with Epithets (Kraog Trench-Hewer, Bane of the Barricade), drawing from the rich lore of the Warhammer 40K universe to create names that capture the essence of these loyal, powerful, and often simple-minded warriors of the Imperium.",
    "sections": [
      {
        "heading": "The Power of Ogryn Names in Warhammer 40K",
        "content": "<p>Ogryn names serve multiple purposes in the Warhammer 40K universe: they identify these massive abhuman soldiers, create memorable characters, establish a character's reputation, and add depth to the grimdark setting. A well-chosen Ogryn name can instantly convey whether a character is a simple soldier (Thunk Ironmight), a legendary warrior (Kraog Trench-Hewer, Bane of the Barricade), or a battlefield hero (Tankbuster, The Unstoppable Charge).</p><p>Our generator uses three distinct formats to create Ogryn names with different levels of detail and formality. Each format has its own character: Short Names are quick battlefield identifiers, Full Names are used in official documents and roll calls, and Full Names with Epithets are epic titles used in battle reports or by those who know their full reputation.</p>"
      },
      {
        "heading": "Ogryn Name Formats in Warhammer 40K",
        "content": "<p>The generator offers three distinct naming formats, each with its own character and use in the Warhammer 40K universe:</p><ul><li><strong>Short Name (Surname + Epithet):</strong> This format creates quick, descriptive battlefield names. Format: [Surname], [Epithet]. Examples: 'Tankbuster, The Unstoppable Charge', 'Skullthrone, Hammer of the Commissar', 'Ironmight, The Wall That Walks'. This format combines a descriptive surname with a memorable epithet, creating names that are easy to remember and shout on the battlefield.</li><li><strong>Full Name (First Name + Surname):</strong> This format creates the standard name used in roll calls and official Imperial Guard documents. Format: [First Name] [Surname]. Examples: 'Thunk Ironmight', 'Snort Simplemind', 'Grog Bad-Aim'. This format is the base name used for identification and record-keeping in the Imperium.</li><li><strong>Full Name with Epithet (First Name + Surname + Epithet):</strong> This format creates the full, epic title used in battle reports or by those who know the Ogryn's full reputation. Format: [First Name] [Surname], [Epithet]. Examples: 'Kraog Trench-Hewer, Bane of the Barricade', 'Grog Bad-Aim, The Accidental Sniper', 'Thunk Ironmight, The Unstoppable Charge'. This format provides maximum detail about the Ogryn's identity and legendary status.</li></ul><p>Each format has its own strengths: Short Names are memorable and easy to use in combat, Full Names are official and formal, and Full Names with Epithets provide the most narrative depth and legendary status.</p>"
      },
      {
        "heading": "Ogryn Name Components in Warhammer 40K",
        "content": "<p>The generator uses three component lists to create Ogryn names:</p><ul><li><strong>First Names:</strong> Simple, guttural names like Graug, Vaus, Qodd, Zrog, Thunk, Kraog, Grog, Snort, Stomp, Tank. These names reflect the Ogryn's simple nature and brutal culture. Many names are short and punchy, emphasizing strength and directness: 'Thunk', 'Stomp', 'Tank', 'Grog', 'Snort'.</li><li><strong>Surnames:</strong> Descriptive surnames that often reference physical traits, combat roles, or personality characteristics. Examples include 'Ironmight', 'Tankbuster', 'Shieldbreaker', 'Bad-Aim', 'Simplemind', 'Blockhead', 'Meat-Shield', 'Ration-Hog'. These surnames tell stories about the Ogryn's role, appearance, or reputation within the Imperial Guard.</li><li><strong>Epithets:</strong> Epic titles that describe the Ogryn's legendary deeds, reputation, or characteristics. Examples include 'The Unstoppable Charge', 'Bane of the Barricade', 'The Wall That Walks', 'The Accidental Sniper', 'Hammer of the Commissar', 'The One Who Forgot His Name'. These epithets add legendary status, humor, and narrative depth, often reflecting both the Ogryn's strength and their simple-minded nature.</li></ul><p>By combining these components in different ways, the generator creates thousands of unique Ogryn names that work across different Warhammer 40K settings and campaigns, with a focus on strength, loyalty, simplicity, and the grim humor of the 41st millennium.</p>"
      },
      {
        "heading": "How to Use Ogryn Names in Warhammer 40K",
        "content": "<p>Ogryn names work excellently for:</p><ul><li><strong>Warhammer 40K Tabletop Gaming:</strong> Name Ogryn characters for your Imperial Guard armies, creating memorable units that stand out on the battlefield</li><li><strong>Warhammer 40K Role-Playing Games:</strong> Create Ogryn characters for Dark Heresy, Only War, or other 40K RPG systems, using names that reflect their simple nature and brutal strength</li><li><strong>Fan Fiction and Creative Writing:</strong> Write Warhammer 40K stories featuring Ogryn characters, using names that capture the grimdark humor and brutal nature of the setting</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions for Ogryn characters in your Warhammer 40K campaigns or stories</li><li><strong>Character Development:</strong> Use Ogryn names to reflect a character's personality, background, or role—simple soldiers, legendary warriors, or comedic relief characters</li></ul><p>When choosing Ogryn names, consider the character's role, reputation, and the tone of your campaign. A name like 'Thunk Ironmight' suggests a straightforward, strong soldier, while 'Grog Bad-Aim, The Accidental Sniper' suggests both strength and the comedic potential of Ogryn characters in Warhammer 40K.</p>"
      },
      {
        "heading": "Well-Known Ogryn in Warhammer 40K Literature and Media",
        "content": "<p>Ogryn characters have been featured throughout Warhammer 40K literature, games, and media. These iconic Ogryn demonstrate the power of well-chosen Ogryn names:</p><ul><li><strong>Various Warhammer 40K Novels:</strong> Warhammer 40K novels feature numerous Ogryn characters, often serving as loyal bodyguards, heavy weapons operators, or simple soldiers in the Imperial Guard. Names like 'Bone'ead' (a term for Ogryn with enhanced intelligence) and various unnamed Ogryn characters demonstrate how Ogryn names reflect their simple nature and role in the Imperium.</li><li><strong>Warhammer 40K Tabletop Game:</strong> The Warhammer 40K tabletop game features Ogryn units in the Imperial Guard (now Astra Militarum) army, with models and rules that emphasize their brute strength and simple loyalty. Ogryn characters in campaigns often receive memorable names that reflect their deeds and characteristics.</li><li><strong>Warhammer 40K Video Games:</strong> Games like Dawn of War, Space Marine, and various Warhammer 40K adaptations feature Ogryn characters with names that capture their brutal nature and simple loyalty. These characters often serve as heavy support units or memorable NPCs.</li><li><strong>Warhammer 40K Role-Playing Games:</strong> RPGs like Dark Heresy and Only War feature Ogryn as playable characters or important NPCs, with names that reflect their role as abhuman soldiers in the Imperium. Character creation often involves choosing names that fit the grimdark setting.</li><li><strong>Warhammer 40K Comics and Media:</strong> Various Warhammer 40K comics, animations, and media feature Ogryn characters with names that emphasize their strength, loyalty, and often comedic nature. These characters often serve as both powerful warriors and sources of grim humor.</li><li><strong>Ogryn in Warhammer 40K Lore:</strong> The Warhammer 40K lore describes Ogryn as massive, simple-minded abhumans who serve as loyal soldiers in the Imperial Guard. Their names reflect their brutal culture, simple nature, and role as powerful but often misunderstood warriors of the Imperium.</li></ul><p>These iconic Ogryn demonstrate the range of Ogryn naming conventions in Warhammer 40K: from simple, direct names (Thunk Ironmight) to epic titles with epithets (Kraog Trench-Hewer, Bane of the Barricade) to comedic names that reflect their simple nature (Grog Bad-Aim, The Accidental Sniper). When creating your own Ogryn names, consider what the character represents, their role in the Imperial Guard, and how the name reflects their strength, loyalty, and the grim humor of the Warhammer 40K universe.</p>"
      },
      {
        "heading": "The Meaning and Derivation of Ogryn Names in Warhammer 40K",
        "content": "<p>Understanding the etymology and symbolism behind Ogryn names adds depth to character creation and Warhammer 40K worldbuilding. Many Ogryn names draw from specific linguistic roots, Warhammer 40K lore, and symbolic meanings:</p><ul><li><strong>Guttural and Simple Sounds:</strong> First names often use guttural, simple sounds: 'Graug', 'Thunk', 'Grog', 'Snort', 'Stomp', 'Tank'. These names reflect the Ogryn's simple nature and brutal culture, emphasizing directness and strength over complexity.</li><li><strong>Physical Descriptors:</strong> Surnames often reference physical traits: 'Ironmight', 'Blockhead', 'Flat-Nose', 'One-Eye', 'Stub-Hand', 'Scar-Face', 'Ironback', 'Gutwall'. These names describe the Ogryn's appearance, often emphasizing their massive size and brutal strength.</li><li><strong>Combat Roles and Functions:</strong> Surnames reference combat roles: 'Tankbuster', 'Shieldbreaker', 'Gun-Loader', 'Trench-Hewer', 'Meat-Shield', 'Wall-Smasher', 'Door-Kicker'. These names describe the Ogryn's function in battle, often emphasizing their role as heavy support or shock troops.</li><li><strong>Personality and Behavior:</strong> Surnames reference personality traits: 'Simplemind', 'Bad-Aim', 'Wrong-Think', 'Loud-Voice', 'Badtemper', 'Trueblind'. These names reflect the Ogryn's simple nature, often with grim humor that acknowledges their limitations.</li><li><strong>Material and Craftsmanship:</strong> Surnames reference materials and construction: 'Metalmight', 'Stonestrength', 'Iron-Grip', 'Brass-Head', 'Lead-Spine', 'Steelarm'. These names suggest the Ogryn's durability and connection to industrial warfare.</li><li><strong>Warhammer 40K Military Terms:</strong> Surnames reference military equipment and roles: 'Gun-Loader', 'Trench-Hewer', 'Bunker-Cleaver', 'Heavy-Lifter', 'Ammo-Thief', 'Rig-Wrecker', 'Tank-Puller'. These names reflect the Ogryn's role in the Imperial Guard and their connection to military equipment.</li><li><strong>Grimdark Humor:</strong> Many names incorporate grimdark humor: 'Bad-Aim', 'Wrong-Think', 'The One Who Forgot His Name', 'The Accidental Sniper', 'The Man Who Ate The Map'. These names acknowledge the Ogryn's simple nature while maintaining the grimdark tone of Warhammer 40K.</li><li><strong>Legendary Deeds and Reputation:</strong> Epithets emphasize legendary deeds: 'The Unstoppable Charge', 'Bane of the Barricade', 'The Wall That Walks', 'Hammer of the Commissar', 'The Unwitting Hero', 'The Lucky Shot'. These names suggest the Ogryn's reputation and legendary status, often with a mix of respect and humor.</li><li><strong>Simple Truths and Characteristics:</strong> Epithets reference simple characteristics: 'The Smartest of the Dumb', 'The One Who Follows Orders', 'The Simple Truth', 'The Last to Understand', 'The First to Charge'. These names reflect the Ogryn's simple nature and unwavering loyalty.</li><li><strong>Warhammer 40K Lore References:</strong> Epithets reference Warhammer 40K lore: 'Ironclad Fist of the Imperium', 'Born of the Slag-Heaps', 'Friend to the Ratlings', 'Guardian of the Colonel's Hat'. These names connect Ogryn to the broader Warhammer 40K universe and its grimdark setting.</li></ul><p>When creating Ogryn names, consider what each element means and how it contributes to the character's identity in the Warhammer 40K universe. A name like 'Thunk Ironmight' immediately suggests a straightforward, strong soldier, while 'Kraog Trench-Hewer, Bane of the Barricade' suggests both combat prowess (Trench-Hewer) and legendary reputation (Bane of the Barricade). 'Grog Bad-Aim, The Accidental Sniper' combines a simple name (Grog), a humorous trait (Bad-Aim), and a legendary epithet (The Accidental Sniper), creating a name that tells a story of strength, simplicity, and grim humor in the Warhammer 40K universe.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the three name formats?",
        "answer": "Short Name creates quick battlefield identifiers (Tankbuster, The Unstoppable Charge). Full Name creates official names used in roll calls (Thunk Ironmight). Full Name with Epithet creates epic titles used in battle reports (Kraog Trench-Hewer, Bane of the Barricade). Each format has its own character and works best for different situations in Warhammer 40K campaigns."
      },
      {
        "question": "Can I use these names for other Warhammer 40K abhumans?",
        "answer": "While designed specifically for Ogryn, these names could work for other large abhumans in Warhammer 40K, though Ogryn have a very specific naming style that reflects their simple nature and brutal culture. For other abhumans like Ratlings or Beastmen, you might want to use different naming conventions."
      },
      {
        "question": "How many unique Ogryn names does the generator provide?",
        "answer": "The generator provides thousands of unique Ogryn name combinations across all three formats. With 100 first names, 100 surnames, and 100 epithets, the generator can create over 1,000,000 unique combinations for Full Names with Epithets, 10,000 for Full Names, and 10,000 for Short Names, ensuring maximum variety for your Warhammer 40K campaigns."
      },
      {
        "question": "Can I use these names for Warhammer 40K tabletop gaming?",
        "answer": "Yes! These names are perfect for Warhammer 40K tabletop gaming, whether you're naming Ogryn units in your Imperial Guard army, creating characters for campaigns, or developing NPCs for Warhammer 40K role-playing games. The names work well for both individual characters and entire units."
      },
      {
        "question": "Are these names based on official Warhammer 40K lore?",
        "answer": "These names are inspired by Warhammer 40K lore and the naming conventions used for Ogryn characters in official Games Workshop materials, novels, and games. While not all names are directly from official sources, they follow the established patterns and themes of Ogryn naming in the Warhammer 40K universe."
      }
    ]
  },
  "relatedGenerators": []
};

// Write the updated data back to the file
fs.writeFileSync(popCultureFile, JSON.stringify(popCultureData, null, 2));

console.log('✅ Successfully created Ogryn Name Generator!');
console.log(`📊 First names: ${ogrynData.Ogryn_First_Names.length}`);
console.log(`📊 Surnames: ${ogrynData.Ogryn_Surnames.length}`);
console.log(`📊 Epithets: ${ogrynData.Ogryn_Epithets.length}`);
console.log(`✨ Three formats available`);
console.log(`\n📋 Example names:`);
console.log(`   Short Name: Tankbuster, The Unstoppable Charge`);
console.log(`   Full Name: Thunk Ironmight`);
console.log(`   Full Name with Epithet: Kraog Trench-Hewer, Bane of the Barricade`);

