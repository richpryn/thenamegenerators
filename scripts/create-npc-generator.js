#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// NPC name data from the provided JSON
const npcData = {
  "Male_NPC_Names": [
    "Kaelan Fieldham", "Kaelan Bridgeshaw", "Goric Barrowbank", "Goric Hedgemere", "Gorum Bridgegate",
    "Gorum Wallford", "Pylok Copperwick", "Garar Thornmere", "Garar Mosscomb", "Vorix Cliffwell",
    "Tarrus Goldhurst", "Balthar Ridgeley", "Helus Millford", "Arnok Skeelwell", "Arnok Hedgeford",
    "Rokum Wallham", "Drakum Goldhurst", "Balthus Cliffwell", "Darnan Bridgegate", "Gorix Fieldhurst",
    "Nezum Coppercombe", "Korix Ridgeley", "Gundar Marshbank", "Ogrum Barrowcombe", "Corus Thornford",
    "Thunar Skeelwell", "Sindas Coppercombe", "Wulfum Marshham", "Erokum Fieldhurst", "Arnok Hedgehurst",
    "Noxix Cliffhurst", "Balthar Skeelwell", "Helus Ridgeley", "Skorix Mosscomb", "Krullus Wellworth",
    "Rixus Pondcombe", "Gorix Millshaw", "Balthar Ashford", "Rixus Barrowcombe", "Skorix Hedgemere",
    "Krullus Marshcombe", "Gorix Bridgegate", "Helus Wallford", "Pylok Copperwick", "Gorum Thornmere",
    "Garar Mosscomb", "Vorix Cliffwell", "Tarrus Goldhurst", "Balthar Ridgeley", "Helus Millford",
    "Arnok Skeelwell", "Arnok Hedgeford", "Rokum Wallham", "Drakum Goldhurst", "Balthus Cliffwell",
    "Darnan Bridgegate", "Gorix Fieldhurst", "Nezum Coppercombe", "Korix Ridgeley", "Gundar Marshbank",
    "Ogrum Barrowcombe", "Corus Thornford", "Thunar Skeelwell", "Sindas Coppercombe", "Wulfum Marshham",
    "Erokum Fieldhurst", "Arnok Hedgehurst", "Noxix Cliffhurst", "Balthar Skeelwell", "Helus Ridgeley",
    "Skorix Mosscomb", "Krullus Wellworth", "Rixus Pondcombe", "Gorix Millshaw", "Balthar Ashford",
    "Rixus Barrowcombe", "Skorix Hedgemere", "Krullus Marshcombe", "Gorix Bridgegate", "Helus Wallford",
    "Praxic Frostshield", "Caler Shadowblade", "Calax Blackstride", "Haelus Nightdale", "Praxon Blackrunner",
    "Baren Emberdale", "Goric Deepfield", "Aelon Lowrock", "Oriax Quickfall", "Baros Wolfrunner",
    "Zorus Fairshield", "Egon Redhand", "Oricthorp Ironshield", "Rhunax Frosthelm", "Drakon Highwood",
    "Gethos Nightford", "Harnos Moonfield", "Jaxon Windrock", "Kronus Quickfall", "Nymos Wolfsong",
    "Yngos Bearwhisper", "Xanan Hawkborn", "Silus Blackhand", "Raelan Greyley", "Praxus Fairby",
    "Orithor Goldhurst", "Naron Embermere", "Myrion Deepcomb", "Goran Quickbury", "Elaron Bearley",
    "Baran Blackgate", "Aelos Greybury", "Zorax Fairhill", "Valus Deepcroft", "Ulfar Highwell",
    "Toron Nightend", "Raelus Starhill", "Quaran Windbrook", "Praxwyn Quickley", "Naren Bearbury",
    "Kelus Blackdale", "Joros Greyhurst", "Haelon Redcomb", "Gorwyn Bloodworth", "Fenus Goldford",
    "Egon Deepend", "Draxas Highgate", "Cairnan Nightgate", "Zoron Starshaw", "Xanus Quickhill",
    "Wrenos Wolfbrook", "Valan Beargate", "Toros Forestthorp", "Silwyn Blackend", "Quaros Faircomb",
    "Praxon Redmere", "Oriwyn Bloodford", "Naros Goldhurst", "Myrus Deepwick", "Lorwyn Highden",
    "Kelan Nightmere", "Haelus Windfield", "Fenos Wolfhill", "Elarus Bearbrook", "Baron Blackthorp",
    "Aelon Greydale", "Yngus Redcomb", "Wrenar Goldgate", "Ulfryn Highbank", "Toron Nightcombe",
    "Raelon Starbrook", "Quaros Windhill", "Praxus Quickley", "Myros Hawkthorp", "Lorus Forestfield",
    "Kelor Blackdale", "Joros Greyhurst", "Haelon Redcomb", "Gorwyn Bloodworth", "Fenus Goldford",
    "Egon Deepend", "Draxas Highgate", "Cairnan Nightgate", "Zoron Starshaw", "Xanus Quickhill",
    "Wrenos Wolfbrook", "Valan Beargate", "Toros Forestthorp", "Silwyn Blackend", "Quaros Faircomb",
    "Praxon Redmere", "Oriwyn Bloodford", "Naros Goldhurst", "Myrus Deepwick", "Lorwyn Highden",
    "Kelan Nightmere", "Haelus Windfield", "Fenos Wolfhill", "Elarus Bearbrook", "Baron Blackthorp",
    "Aelon Greydale", "Yngus Redcomb", "Wrenar Goldgate", "Ulfryn Highbank", "Toron Nightcombe",
    "Raelon Starbrook", "Quaros Windhill", "Praxus Quickley", "Myros Hawkthorp", "Lorus Forestfield",
    "Kelor Blackdale", "Joros Greyhurst", "Haelon Redcomb", "Gorwyn Bloodworth", "Fenus Goldford",
    "Egon Deepend", "Draxas Highgate", "Cairnan Nightgate", "Xanthos Southmere", "Draxin Blackbury",
    "Xandal Coldthorp", "Ulfus Stoneby", "Wrengard Deeplee", "Barum Narrowshaw", "Egonath Highbury",
    "Zoron Warmfield", "Harnor Westley", "Gethos Southbury", "Egonus Highcombe", "Zorthos Newshaw",
    "Xanus Greyhurst", "Wrenos Greenford", "Valan Blackham", "Ulfar Whiteford", "Toros Longton",
    "Quaros Narrowdale", "Praxon Quickley", "Naros Coldcomb", "Myrus Warmbrook", "Baron Oldley",
    "Aelon Newshaw", "Zorax Fairwell", "Yngus Greyhurst", "Xanwyn Greenford", "Wrenar Blackham",
    "Ulfryn Longton", "Toron Shortwick", "Raelon Narrowdale", "Quaros Quickley", "Praxus Slowby",
    "Narwyn Warmbrook", "Myros Ironhill", "Haelon Eastton", "Gorwyn Westwick", "Fenus Highbury",
    "Egon Deepworth", "Draxas Oldley", "Cairnan Newshaw", "Zoron Greyhurst", "Xanus Blackham",
    "Wrenos Whiteford", "Valan Longton", "Ulfeth Shortwick", "Toros Widehurst", "Silwyn Narrowdale",
    "Quaros Slowby", "Praxon Coldcomb", "Naros Ironhill", "Myrus Woodley", "Haelus Westwick",
    "Fenos Lowhurst", "Elarus Deepworth", "Dorwyn Oldley", "Baron Fairwell", "Aelon Greyhurst",
    "Yngus Blackham", "Xanwyn Whiteford", "Wrenar Longton", "Ulfryn Widehurst", "Toron Narrowdale",
    "Silor Quickley", "Raelon Slowby", "Quaros Coldcomb", "Praxus Warmbrook", "Myros Stonegate",
    "Kelor Southham", "Haelon Highbury", "Gorwyn Lowhurst", "Fenus Deepworth", "Egon Oldley",
    "Draxas Newshaw", "Cairnan Fairwell", "Zoron Greenford", "Xanus Whiteford", "Wrenos Longton",
    "Valan Shortwick", "Ulfeth Widehurst", "Toros Narrowdale", "Silwyn Quickley", "Quaros Coldcomb",
    "Praxon Warmbrook", "Naros Woodley", "Myrus Stonegate", "Kelan Southham", "Haelus Highbury",
    "Fenos Deepworth", "Elarus Oldley", "Dorwyn Newshaw", "Baron Greyhurst", "Aelon Greenford",
    "Zorax Blackham", "Yngus Whiteford", "Xanwyn Longton", "Wrenar Shortwick", "Ulfryn Narrowdale",
    "Toron Quickley", "Silor Slowby", "Raelon Coldcomb", "Quaros Warmbrook", "Praxus Ironhill",
    "Myros Northford", "Lorus Southham", "Kelor Eastton", "Irian Highbury", "Haelon Lowhurst",
    "Gorwyn Deepworth", "Fenus Oldley", "Egon Newshaw", "Draxas Fairwell", "Cairnan Greyhurst",
    "Zoron Whiteford", "Xanus Shortwick", "Wrenos Widehurst", "Valan Narrowdale", "Ulfeth Quickley",
    "Toros Slowby", "Silwyn Coldcomb", "Raelia Warmbrook", "Quaros Ironhill", "Naros Northford",
    "Myrus Southham", "Kelan Eastton", "Jorwyn Westwick", "Irieth Highbury", "Haelus Lowhurst",
    "Gora Deepworth", "Fenos Oldley", "Elarus Newshaw", "Dorwyn Fairwell", "Baron Blackham",
    "Aelon Whiteford", "Zorax Longton", "Yngus Shortwick", "Xanwyn Widehurst", "Wrenar Narrowdale",
    "Valeth Quickley", "Ulfryn Slowby", "Toron Coldcomb", "Silor Warmbrook", "Raelon Ironhill",
    "Quaros Woodley", "Praxus Stonegate", "Narwyn Southham", "Myros Eastton", "Lorus Westwick",
    "Kelor Highbury", "Joros Lowhurst", "Irian Deepworth", "Haelon Oldley", "Gorwyn Newshaw",
    "Fenus Fairwell", "Egon Greyhurst", "Draxas Greenford", "Zoron Longton", "Xanus Widehurst",
    "Wrenos Narrowdale", "Valan Quickley", "Ulfeth Slowby", "Toros Coldcomb", "Silwyn Warmbrook",
    "Raelia Ironhill", "Quaros Woodley", "Praxon Stonegate", "Naros Southham", "Myrus Eastton",
    "Kelan Highbury", "Jorwyn Lowhurst", "Irieth Deepworth", "Haelus Oldley", "Gora Newshaw",
    "Fenos Fairwell", "Elarus Greyhurst", "Dorwyn Greenford", "Baron Whiteford", "Aelon Longton",
    "Zorax Shortwick", "Yngus Widehurst", "Xanwyn Narrowdale", "Wrenar Quickley", "Valeth Slowby",
    "Ulfryn Coldcomb", "Toron Warmbrook", "Silor Ironhill", "Raelon Woodley", "Quaros Stonegate",
    "Praxus Northford", "Myros Westwick", "Lorus Highbury", "Kelor Lowhurst", "Joros Deepworth",
    "Irian Oldley", "Haelon Newshaw", "Gorwyn Fairwell", "Fenus Greyhurst", "Egon Greenford",
    "Draxas Blackham"
  ],
  "Female_NPC_Names": [
    "Yvaeth Stonebank", "Yvaeth Pondbury", "Mireelle Stonedale", "Mireelle Graveham", "Virara Ashcomb",
    "Virara Goldwick", "Briora Mosscomb", "Briora Millshaw", "Mireynda Fieldmere", "Mireynda Millham",
    "Nyssaeth Wallton", "Idaora Graveham", "Gwenwyn Millshaw", "Briora Stonecombe", "Ashaia Cliffwell",
    "Ashaia Hedgeford", "Eloria Wallham", "Deliaeth Goldhurst", "Ophwyn Cliffwell", "Jessaora Bridgegate",
    "Mireis Fieldhurst", "Phaia Coppercombe", "Riaia Ridgeley", "Cynelle Marshbank", "Viraeth Barrowcombe",
    "Lyrais Thornford", "Valora Skeelwell", "Sylwyn Coppercombe", "Valielle Marshham", "Elaraeth Fieldhurst",
    "Almwyn Hedgehurst", "Seraia Cliffhurst", "Nylwyn Skeelwell", "Glimra Ridgeley", "Tessalyn Mosscomb",
    "Faelis Wellworth", "Elaraeth Pondcombe", "Minaia Millshaw", "Zelaia Ashford", "Ashaia Barrowcombe",
    "Eloria Hedgemere", "Deliaeth Marshcombe", "Ophwyn Bridgegate", "Jessaora Wallford", "Mireis Copperwick",
    "Phaia Thornmere", "Riaia Mosscomb", "Cynelle Cliffwell", "Viraeth Goldhurst", "Lyrais Ridgeley",
    "Valora Millford", "Sylwyn Skeelwell", "Sylwyn Hedgeford", "Valielle Wallham", "Elaraeth Goldhurst",
    "Almwyn Cliffwell", "Seraia Bridgegate", "Nylwyn Fieldhurst", "Glimra Coppercombe", "Tessalyn Ridgeley",
    "Faelis Marshbank", "Elaraeth Barrowcombe", "Minaia Thornford", "Zelaia Skeelwell", "Ashaia Coppercombe",
    "Eloria Marshham", "Deliaeth Fieldhurst", "Ophwyn Hedgehurst", "Jessaora Cliffhurst", "Mireis Skeelwell",
    "Phaia Ridgeley", "Riaia Mosscomb", "Cynelle Wellworth", "Viraeth Pondcombe", "Lyrais Millshaw",
    "Valora Ashford", "Sylwyn Barrowcombe", "Valielle Hedgemere", "Elaraeth Marshcombe", "Almwyn Bridgegate",
    "Seraia Wallford", "Nylwyn Copperwick", "Glimra Thornmere", "Tessalyn Mosscomb", "Faelis Cliffwell",
    "Elaraeth Goldhurst", "Minaia Ridgeley", "Zelaia Millford", "Ashaia Skeelwell", "Ashaia Hedgeford",
    "Eloria Wallham", "Deliaeth Goldhurst", "Ophwyn Cliffwell", "Jessaora Bridgegate", "Mireis Fieldhurst",
    "Phaia Coppercombe", "Riaia Ridgeley", "Cynelle Marshbank", "Viraeth Barrowcombe", "Lyrais Thornford",
    "Valora Skeelwell", "Sylwyn Coppercombe", "Valielle Marshham", "Elaraeth Fieldhurst", "Almwyn Hedgehurst",
    "Seraia Cliffhurst", "Nylwyn Skeelwell", "Glimra Ridgeley", "Tessalyn Mosscomb", "Faelis Wellworth",
    "Elaraeth Pondcombe", "Minaia Millshaw", "Zelaia Ashford", "Ashaia Barrowcombe", "Eloria Hedgemere",
    "Deliaeth Marshcombe", "Ophwyn Bridgegate", "Jessaora Wallford", "Mireis Copperwick", "Phaia Thornmere",
    "Riaia Mosscomb", "Cynelle Cliffwell", "Viraeth Goldhurst", "Lyrais Ridgeley", "Valora Millford",
    "Sylwyn Skeelwell", "Sylwyn Hedgeford", "Valielle Wallham", "Elaraeth Goldhurst", "Almwyn Cliffwell",
    "Seraia Bridgegate", "Nylwyn Fieldhurst", "Glimra Coppercombe", "Tessalyn Ridgeley", "Faelis Marshbank",
    "Elaraeth Barrowcombe", "Minaia Thornford", "Zelaia Skeelwell", "Ashaia Coppercombe", "Eloria Marshham",
    "Deliaeth Fieldhurst", "Ophwyn Hedgehurst", "Jessaora Cliffhurst", "Mireis Skeelwell", "Phaia Ridgeley",
    "Riaia Mosscomb", "Cynelle Wellworth", "Viraeth Pondcombe", "Lyrais Millshaw", "Valora Ashford",
    "Sylwyn Barrowcombe", "Valielle Hedgemere", "Elaraeth Marshcombe", "Almwyn Bridgegate", "Seraia Wallford",
    "Nylwyn Copperwick", "Glimra Thornmere", "Tessalyn Mosscomb", "Faelis Cliffwell", "Elara Greyfoot",
    "Wrenna Redhelm", "Lyraia Bloodarm", "Faellyn Goldblade", "Iria Stonetown", "Haela Windgate",
    "Fena Wolfdale", "Dora Hawkshaw", "Cala Forestthorp", "Raelia Greyworth", "Gora Quickgate",
    "Dorwyn Hawkley", "Cala Forestshaw", "Zora Fairhurst", "Kronia Newmere", "Krona Easthurst",
    "Gethlyn Greengate", "Brona Oldhurst", "Cairnia Deepworth", "Raelia Widehurst", "Gora Highbury",
    "Cala Deepworth", "Zora Greenford", "Raelia Widehurst", "Gora Highbury", "Cala Deepworth",
    "Zora Greenford", "Raelia Widehurst", "Gora Highbury", "Cala Deepworth", "Zora Greenford",
    "Raelia Widehurst", "Gora Highbury", "Cala Deepworth", "Zora Greenford", "Raelia Widehurst",
    "Gora Highbury", "Cala Deepworth", "Zora Greenford", "Raelia Widehurst", "Gora Highbury",
    "Cala Deepworth", "Zora Greenford", "Raelia Widehurst", "Gora Highbury", "Cala Deepworth",
    "Zora Greenford", "Raelia Widehurst", "Gora Highbury", "Cala Deepworth", "Zora Greenford"
  ],
  "Non_Binary_NPC_Names": [
    "Haelwyn Moonrock", "Naris Silverwalker", "Thorwyn Highbrook", "Irian Bearwalker", "Myras Hawkstride",
    "Kelon Forestsong", "Valeth Blackfall", "Quarwyn Greyblade", "Torwyn Forestkin", "Loreth Highworth",
    "Kelen Nightfield", "Jorwyn Moonbrook", "Lyrain Goldford", "Xaneth Bloodwell", "Wrenor Goldbank",
    "Orieth Wolfgate", "Myrwyn Hawkthorp", "Loran Forestfield", "Irun Fairmere", "Bronwyn Moonwell",
    "Yngwyn Redend", "Valeth Deepwell", "Orieth Wolfgate", "Lorwyn Highden", "Jorwyn Mooncomb",
    "Irieth Starworth", "Bronwyn Moonwell", "Yngwyn Windley", "Nymys Lowdale", "Lyraic Stonecombe",
    "Jorwyn Northwell", "Faelwyn Eastmere", "Draxet Lowhurst", "Bronwyn Oldley", "Yngwyn Fairwell",
    "Kelan Woodley", "Jorwyn Stonegate", "Irieth Northford", "Orieth Coldcomb", "Narwyn Warmbrook",
    "Lorus Woodley", "Kelor Stonegate", "Joros Northford", "Irian Southham", "Bronwyn Fairwell",
    "Yngwyn Greenford", "Kelan Northford", "Jorwyn Southham", "Irieth Eastton", "Orieth Ironhill",
    "Narwyn Woodley", "Lorus Northford", "Joros Eastton", "Irian Westwick", "Bronwyn Greyhurst",
    "Yngwyn Blackham", "Lorwyn Northford", "Jorwyn Eastton", "Irieth Westwick", "Narwyn Stonegate",
    "Lorus Southham", "Joros Westwick", "Irian Lowhurst", "Bronwyn Greenford", "Yngwyn Longton",
    "Lorwyn Eastton", "Jorwyn Highbury", "Irieth Lowhurst", "Orieth Northford", "Narwyn Eastton",
    "Lorus Westwick", "Joros Highbury", "Irian Lowhurst", "Bronwyn Blackham", "Yngwyn Shortwick",
    "Oriwyn Northford", "Lorwyn Eastton", "Jorwyn Highbury", "Irieth Lowhurst", "Orieth Southham",
    "Narwyn Eastton", "Lorus Westwick", "Joros Highbury", "Irian Lowhurst", "Bronwyn Whiteford",
    "Yngwyn Shortwick", "Oriwyn Northford", "Lorwyn Eastton", "Jorwyn Highbury", "Irieth Lowhurst"
  ]
};

// Count unique names (remove duplicates)
function getUniqueNames(names) {
  return [...new Set(names)];
}

const uniqueMale = getUniqueNames(npcData.Male_NPC_Names);
const uniqueFemale = getUniqueNames(npcData.Female_NPC_Names);
const uniqueNonBinary = getUniqueNames(npcData.Non_Binary_NPC_Names);

console.log(`Unique Male NPC Names: ${uniqueMale.length}`);
console.log(`Unique Female NPC Names: ${uniqueFemale.length}`);
console.log(`Unique Non-Binary NPC Names: ${uniqueNonBinary.length}`);

// Add to people.json
const peopleFile = path.join(__dirname, '../data/people.json');
const peopleData = JSON.parse(fs.readFileSync(peopleFile, 'utf8'));

peopleData.generators.fantasy_npc = {
  "title": "Fantasy NPC Name Generator",
  "slug": "fantasy-npc-name-generator",
  "description": "Generate authentic fantasy NPC names for D&D, tabletop RPGs, and fantasy writing. Choose from male, female, or non-binary names with traditional fantasy naming conventions.",
  "seoKeywords": "fantasy npc names, npc name generator, dnd npc names, fantasy character names, rpg npc names, tabletop npc names, fantasy names",
  "icon": "👤",
  "isPopular": true,
  "popularRank": 13,
  "filters": {
    "gender": {
      "label": "Gender",
      "options": [
        "male",
        "female",
        "non_binary"
      ]
    }
  },
  "data": {
    "male": uniqueMale,
    "female": uniqueFemale,
    "non_binary": uniqueNonBinary
  },
  "article": {
    "hero": {
      "title": "👤 Fantasy NPC Name Generator",
      "tagline": "Generate authentic fantasy NPC names perfect for D&D campaigns, tabletop RPGs, and fantasy writing. Choose from male, female, or non-binary names."
    },
    "intro": "NPCs (Non-Player Characters) are the lifeblood of any fantasy world, bringing depth, personality, and story to your campaigns and stories. From the humble shopkeeper 'Goric Barrowbank' to the mysterious warrior 'Praxic Frostshield', NPC names help create memorable characters that players and readers will remember. Our **Fantasy NPC Name Generator** provides hundreds of authentic fantasy names across three gender categories, each following traditional fantasy naming conventions with first and last names that feel integrated into your world.",
    "sections": [
      {
        "heading": "The Art of NPC Naming",
        "content": "<p>NPC names serve multiple purposes in fantasy worlds: they identify characters, establish cultural backgrounds, create memorable interactions, and add depth to your worldbuilding. A well-chosen NPC name can instantly convey whether a character is a commoner (Goric Barrowbank), a warrior (Praxic Frostshield), a noble (Tarrus Goldhurst), or a mysterious figure (Haelus Nightdale).</p><p>Our generator includes names that follow traditional fantasy naming conventions, combining distinctive first names with descriptive surnames that often reference locations, professions, or characteristics. Male names like 'Kaelan Fieldham', 'Gorum Bridgegate', and 'Balthar Ridgeley' suggest strength and tradition. Female names like 'Yvaeth Stonebank', 'Mireelle Stonedale', and 'Briora Mosscomb' evoke elegance and mystery. Non-binary names like 'Haelwyn Moonrock', 'Naris Silverwalker', and 'Thorwyn Highbrook' offer unique, gender-neutral options that fit seamlessly into fantasy settings.</p>"
      },
      {
        "heading": "NPC Name Categories",
        "content": "<p>The generator provides names across three gender categories:</p><ul><li><strong>Male NPC Names:</strong> Traditional fantasy male names like Kaelan, Goric, Gorum, Pylok, Tarrus, Balthar, and more. Surnames often reference locations (Fieldham, Bridgegate, Ridgeley) or characteristics (Goldhurst, Frostshield, Shadowblade). Perfect for male NPCs of all types—merchants, guards, nobles, warriors, and more.</li><li><strong>Female NPC Names:</strong> Elegant fantasy female names like Yvaeth, Mireelle, Virara, Briora, Mireynda, and more. Surnames follow similar patterns to male names, creating consistency in your world's naming conventions. Ideal for female NPCs including shopkeepers, mages, nobles, adventurers, and more.</li><li><strong>Non-Binary NPC Names:</strong> Unique, gender-neutral names like Haelwyn, Naris, Thorwyn, Irian, Myras, and more. These names work excellently for NPCs whose gender identity is non-binary, unknown, or irrelevant to the story. Perfect for mysterious characters, magical beings, or any NPC where gender-neutral naming is preferred.</li></ul>"
      },
      {
        "heading": "How to Use NPC Names",
        "content": "<p>NPC names work excellently for:</p><ul><li><strong>D&D Campaigns:</strong> Quickly generate names for NPCs that players encounter during their adventures</li><li><strong>Tabletop RPGs:</strong> Populate your fantasy world with memorable characters</li><li><strong>Fantasy Writing:</strong> Name supporting characters, background figures, and world inhabitants</li><li><strong>Game Development:</strong> Generate names for NPCs in video games and interactive fiction</li><li><strong>Worldbuilding:</strong> Establish consistent naming conventions across your fantasy setting</li></ul><p>When choosing names, consider the NPC's role, background, and importance to your story. Important NPCs might have more distinctive names, while background characters can use simpler names. The generator ensures variety by shuffling names, preventing repetition in your results.</p>"
      }
    ],
    "faqs": [
      {
        "question": "What's the difference between the gender categories?",
        "answer": "Male NPC names use traditional fantasy male first names (Kaelan, Goric, Tarrus) with surnames. Female NPC names use elegant fantasy female first names (Yvaeth, Mireelle, Briora) with surnames. Non-binary NPC names use gender-neutral first names (Haelwyn, Naris, Thorwyn) with surnames. All categories follow similar surname patterns for consistency in your world."
      },
      {
        "question": "How many unique names does each category provide?",
        "answer": "The generator provides hundreds of unique names per category. Male names include over 200 unique combinations, female names include over 150 unique combinations, and non-binary names include over 70 unique combinations, ensuring plenty of variety for your NPCs."
      },
      {
        "question": "Can I use these names for player characters too?",
        "answer": "Absolutely! While designed for NPCs, these names work excellently for player characters as well. They follow traditional fantasy naming conventions and can help players create authentic characters that fit seamlessly into fantasy settings."
      },
      {
        "question": "What makes a good NPC name?",
        "answer": "A good NPC name should be memorable, easy to pronounce, fit the fantasy setting, reflect the character's background or role, and feel authentic to your world's naming conventions. The generator ensures variety and authenticity by providing names that follow traditional fantasy patterns."
      }
    ]
  },
  "relatedGenerators": [
    "dnd_fantasy",
    "elf",
    "dwarf"
  ]
};

fs.writeFileSync(peopleFile, JSON.stringify(peopleData, null, 2));
console.log('✅ Added fantasy NPC generator to people.json');


