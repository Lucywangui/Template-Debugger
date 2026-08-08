import type { TemplateRule } from "./templateTypes";

type TemplateSeed = [string, string, string, string, ...string[]];

function makeRules(subject: string, seeds: TemplateSeed[]): TemplateRule[] {
  return seeds.map(([topic, subtopic, text, correct, ...wrong], index) => ({
    id: `${subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
    grade: "All",
    subject,
    topic,
    subtopic,
    maxUses: 5,
    usageCount: 0,
    minWords: 4,
    generate: () => ({
      text,
      options: [correct, ...wrong],
      correctAnswer: correct,
    }),
  }));
}

const mathematicsSeeds: TemplateSeed[] = [
  ["Numbers", "Place value", "What is the value of 7 in 7,245?", "7,000", "700", "70", "7"],
  ["Numbers", "Operations", "What is 36 + 27?", "63", "53", "73", "62"],
  ["Numbers", "Operations", "What is 84 − 39?", "45", "55", "43", "49"],
  ["Numbers", "Multiplication", "What is 8 × 7?", "56", "48", "54", "64"],
  ["Numbers", "Division", "What is 72 ÷ 9?", "8", "7", "9", "81"],
  ["Fractions", "Equivalent fractions", "Which fraction is equivalent to 1/2?", "2/4", "1/3", "3/5", "2/3"],
  ["Fractions", "Comparing fractions", "Which is the largest fraction?", "3/4", "1/4", "1/2", "2/5"],
  ["Decimals", "Place value", "What is 0.5 written as a fraction?", "1/2", "1/5", "5/10", "5/100"],
  ["Geometry", "Shapes", "How many sides does a hexagon have?", "Six", "Five", "Seven", "Eight"],
  ["Geometry", "Angles", "An angle of 90 degrees is called a:", "right angle", "acute angle", "obtuse angle", "straight angle"],
  ["Measurement", "Length", "How many centimetres are in one metre?", "100", "10", "1,000", "50"],
  ["Measurement", "Time", "How many minutes are in one hour?", "60", "30", "24", "100"],
  ["Data", "Averages", "What is the mean of 2, 4 and 6?", "4", "3", "6", "12"],
  ["Algebra", "Patterns", "What is the next number: 3, 6, 9, 12, ...?", "15", "13", "14", "18"],
  ["Financial mathematics", "Money", "How many cents make one shilling?", "100", "10", "50", "1,000"],
  ["Percentages", "Percent of a number", "What is 10% of 200?", "20", "2", "10", "100"],
  ["Perimeter", "Shapes", "What is the perimeter of a square with side 5 cm?", "20 cm", "10 cm", "25 cm", "15 cm"],
  ["Area", "Shapes", "What is the area of a rectangle 4 cm by 3 cm?", "12 cm²", "7 cm²", "14 cm²", "24 cm²"],
];

const englishSeeds: TemplateSeed[] = [
  ["Grammar", "Nouns", "Which word is a noun?", "teacher", "quickly", "beautiful", "jump"],
  ["Grammar", "Verbs", "Which word is a verb?", "run", "green", "happiness", "slowly"],
  ["Grammar", "Adjectives", "Which word describes a noun?", "adjective", "verb", "conjunction", "pronoun"],
  ["Grammar", "Pronouns", "Which pronoun can replace 'Amina'?", "she", "he", "they", "it"],
  ["Grammar", "Tenses", "Which sentence is in the past tense?", "They played football.", "They play football.", "They are playing football.", "They will play football."],
  ["Vocabulary", "Synonyms", "Which word means the same as 'begin'?", "start", "finish", "stop", "close"],
  ["Vocabulary", "Antonyms", "Which word is opposite in meaning to 'ancient'?", "modern", "old", "historic", "early"],
  ["Writing", "Punctuation", "Which mark ends a question?", "question mark", "full stop", "comma", "colon"],
  ["Reading", "Comprehension", "What is the main idea of a passage?", "What the passage is mostly about", "The longest word", "The title only", "The last sentence"],
  ["Writing", "Paragraphs", "A paragraph should mainly develop:", "one main idea", "many unrelated ideas", "only a title", "a list of names"],
  ["Literature", "Characters", "A character in a story is:", "a person or creature in the story", "the place of the story", "the lesson only", "the book cover"],
  ["Literature", "Setting", "The setting tells us:", "where and when a story happens", "who wrote it", "the price of the book", "the final word"],
  ["Oral skills", "Listening", "A good listener should:", "pay attention to the speaker", "interrupt constantly", "look away", "talk over others"],
  ["Functional writing", "Letters", "A formal letter should use:", "polite and clear language", "only slang", "no greeting", "random spelling"],
  ["Vocabulary", "Idioms", "The idiom 'break the ice' means to:", "start a friendly conversation", "break frozen water", "end a friendship", "become angry"],
];

const kiswahiliSeeds: TemplateSeed[] = [
  ["Sarufi", "Nomino", "Neno lipi ni nomino?", "mwalimu", "haraka", "mzuri", "anakimbia"],
  ["Sarufi", "Vitenzi", "Neno lipi ni kitenzi?", "anasoma", "kitabu", "mrefu", "polepole"],
  ["Sarufi", "Vivumishi", "Kivumishi hueleza:", "sifa ya nomino", "kitendo", "mahali", "wakati"],
  ["Sarufi", "Umoja na wingi", "Wingi wa 'mtoto' ni:", "watoto", "mitoto", "mwatoto", "kitoto"],
  ["Msamiati", "Visawe", "Kisawe cha 'furaha' ni:", "shangwe", "huzuni", "hasira", "hofu"],
  ["Msamiati", "Kinyume", "Kinyume cha 'kubwa' ni:", "ndogo", "refu", "pana", "nzito"],
  ["Uandishi", "Alama", "Alama ya kuuliza ni:", "?", ".", ",", ":"],
  ["Ufahamu", "Dhana kuu", "Dhana kuu ya kifungu ni:", "jambo kuu linalozungumziwa", "neno la mwisho", "jina la mwandishi", "idadi ya mistari"],
  ["Fasihi", "Hadithi", "Mhusika ni:", "mtu au kiumbe katika hadithi", "mahali pa hadithi", "kichwa cha habari", "alama ya uandishi"],
  ["Fasihi", "Methali", "Methali 'Haraka haraka haina baraka' hufundisha:", "kutofanya mambo kwa pupa", "kukimbia kila wakati", "kutolala", "kufanya kazi usiku"],
  ["Sarufi", "Nyakati", "Sentensi iliyo katika wakati uliopita ni:", "Alienda sokoni.", "Anaenda sokoni.", "Anaenda sokoni sasa.", "Atakwenda sokoni."],
  ["Mazungumzo", "Adabu", "Unapomsalimia mtu unapaswa kutumia:", "maneno ya heshima", "matusi", "ukimya", "kelele"],
  ["Ushairi", "BetI", "Mstari mmoja wa shairi huitwa:", "mshororo", "aya", "kifungu", "barua"],
  ["Uandishi", "Barua", "Barua rasmi huanza kwa:", "salamu ya heshima", "matusi", "jina la rafiki tu", "alama ya mshangao"],
  ["Sarufi", "Viwakilishi", "Neno linaloweza kuchukua nafasi ya jina huitwa:", "kiwakilishi", "kitenzi", "kivumishi", "kielezi"],
];

const scienceSeeds: TemplateSeed[] = [
  ["Living things", "Plants", "Which gas do green plants use during photosynthesis?", "carbon dioxide", "oxygen", "nitrogen", "hydrogen"],
  ["Living things", "Animals", "Which organ pumps blood around the body?", "heart", "lungs", "kidney", "stomach"],
  ["Matter", "States", "Water vapour is water in which state?", "gas", "solid", "liquid", "plasma"],
  ["Matter", "Changes", "What happens when ice is heated?", "it melts", "it freezes", "it disappears instantly", "it becomes soil"],
  ["Energy", "Sources", "Which is a renewable source of energy?", "sunlight", "coal", "petrol", "natural gas"],
  ["Forces", "Gravity", "Gravity pulls objects:", "towards the Earth", "towards the Moon only", "upward", "sideways"],
  ["Health", "Nutrition", "Which nutrient helps build and repair the body?", "protein", "water only", "fibre only", "salt"],
  ["Health", "Hygiene", "Why should we wash our hands before eating?", "to remove germs", "to make food hotter", "to grow taller", "to change our fingerprints"],
  ["Environment", "Conservation", "Planting trees helps to:", "protect soil and air", "increase pollution", "waste water", "remove oxygen"],
  ["Space", "Solar system", "Which planet is closest to the Sun?", "Mercury", "Earth", "Mars", "Jupiter"],
  ["Earth", "Water cycle", "Water changing from liquid to vapour is called:", "evaporation", "condensation", "collection", "freezing"],
  ["Technology", "Safety", "A safe way to use electricity is to:", "keep water away from sockets", "touch bare wires", "overload sockets", "use broken cables"],
  ["Materials", "Properties", "Which material is transparent?", "clear glass", "wood", "stone", "cardboard"],
  ["Sound", "Vibrations", "Sound is produced by:", "vibrations", "darkness", "stillness", "evaporation"],
  ["Weather", "Instruments", "An instrument used to measure temperature is a:", "thermometer", "rain gauge", "wind vane", "barometer"],
];

const agricultureSeeds: TemplateSeed[] = [
  ["Soil", "Types", "Which soil is usually best for growing most crops?", "loam soil", "gravel", "pure sand", "rock"],
  ["Soil", "Erosion", "Which practice helps prevent soil erosion?", "terracing", "deforestation", "overgrazing", "burning vegetation"],
  ["Crops", "Planting", "Seeds should be planted at the correct depth to:", "germinate and grow well", "prevent all rainfall", "stop roots forming", "make soil hard"],
  ["Crops", "Weeding", "Weeds should be removed because they:", "compete with crops", "increase crop space", "make crops mature instantly", "produce rainfall"],
  ["Crops", "Nutrients", "A common organic manure is:", "compost", "plastic", "glass", "kerosene"],
  ["Livestock", "Feeds", "A balanced animal ration contains:", "all needed nutrients", "water only", "stones only", "salt only"],
  ["Livestock", "Housing", "Good animal housing should be:", "clean and well ventilated", "dark and wet", "crowded", "without water"],
  ["Pests", "Control", "A safe way to control pests is to:", "use recommended methods", "spread disease", "burn every crop", "ignore the pests"],
  ["Water", "Irrigation", "Irrigation means:", "supplying water to crops", "removing all soil", "harvesting animals", "selling seeds"],
  ["Farm tools", "Uses", "A hoe is commonly used for:", "digging and weeding", "measuring rainfall", "milking cows", "storing grain"],
  ["Harvesting", "Timing", "Crops should be harvested when they are:", "mature", "still seeds", "always green", "completely rotten"],
  ["Storage", "Grain", "Dry grain before storage to reduce:", "mould and spoilage", "germination in the field", "sunlight", "soil fertility"],
  ["Agribusiness", "Marketing", "A farmer studies market prices in order to:", "make good selling decisions", "avoid all buyers", "destroy produce", "stop farming"],
  ["Conservation", "Water", "Mulching helps soil to:", "retain moisture", "lose all nutrients", "become rocky", "stop supporting roots"],
  ["Farm records", "Planning", "Farm records help a farmer to:", "track activities and costs", "forget expenses", "avoid planning", "remove crops"],
];

const homeScienceSeeds: TemplateSeed[] = [
  ["Nutrition", "Food groups", "Which food is a good source of protein?", "beans", "sugar", "salt", "water"],
  ["Nutrition", "Balanced diet", "A balanced diet contains:", "different nutrients in the right amounts", "only carbohydrates", "only fruit", "only water"],
  ["Food safety", "Hygiene", "Why should food be covered?", "to protect it from dirt and insects", "to make it poisonous", "to stop cooking", "to remove nutrients"],
  ["Cooking", "Methods", "Boiling uses:", "hot water", "dry sand", "ice", "sunlight only"],
  ["Clothing", "Care", "Clothes should be washed to:", "remove dirt and germs", "make them heavier", "remove all colour", "make them smaller"],
  ["Home management", "Cleaning", "A clean home helps to:", "prevent disease", "increase germs", "waste food", "damage furniture"],
  ["Safety", "Kitchen", "A safe kitchen practice is to:", "turn pot handles away from the edge", "leave knives on the floor", "touch hot pans", "spill water near sockets"],
  ["Consumer education", "Buying", "A wise buyer should:", "compare quality and price", "buy everything immediately", "ignore labels", "waste money"],
  ["Budgeting", "Money", "A budget is a plan for:", "using income and expenses", "hiding food", "washing clothes", "growing plants"],
  ["Personal hygiene", "Health", "Brushing teeth helps prevent:", "tooth decay", "good eyesight", "broken bones", "rainfall"],
  ["First aid", "Injuries", "The first action for a small cut is to:", "clean and cover it", "rub soil on it", "ignore bleeding", "use hot oil"],
  ["Textiles", "Materials", "Cotton is a:", "natural fibre", "metal", "plastic", "mineral"],
  ["Food preservation", "Storage", "Drying food helps to:", "reduce moisture and spoilage", "add germs", "make it raw", "remove all flavour"],
  ["Water", "Conservation", "One way to save water at home is to:", "repair leaking taps", "leave taps running", "pour it away", "wash one item repeatedly"],
  ["Family", "Cooperation", "Sharing household tasks shows:", "cooperation", "carelessness", "waste", "dishonesty"],
];

const socialStudiesSeeds: TemplateSeed[] = [
  ["Geography", "Maps", "A map is used to show:", "places and features", "only stories", "food recipes", "music"],
  ["Geography", "Directions", "The direction opposite east is:", "west", "north", "south", "up"],
  ["Kenya", "Counties", "Kenya is divided into:", "counties", "continents only", "villages only", "oceans"],
  ["History", "Heritage", "Historic sites help us to:", "learn about the past", "forget history", "stop farming", "measure rainfall"],
  ["Government", "Citizenship", "A responsible citizen should:", "obey laws", "destroy public property", "avoid duties", "spread violence"],
  ["Economy", "Activities", "Farming is an example of an:", "economic activity", "weather instrument", "landform", "language"],
  ["Culture", "Traditions", "Culture includes a community's:", "beliefs and way of life", "only buildings", "only roads", "only weather"],
  ["Environment", "Conservation", "A national park protects:", "wildlife", "traffic lights", "classrooms", "shops"],
  ["Population", "Settlement", "A settlement is:", "a place where people live", "a type of river", "a mountain peak", "a crop disease"],
  ["Leadership", "Democracy", "In a democracy, citizens can:", "choose representatives", "never speak", "avoid all laws", "remove schools"],
  ["Trade", "Markets", "A market is a place where people:", "buy and sell goods", "only sleep", "measure land", "study stars"],
  ["Resources", "Conservation", "A natural resource is:", "water", "a pencil case", "a classroom desk", "a timetable"],
  ["Transport", "Movement", "Roads are used mainly to:", "move people and goods", "grow crops", "make rain", "store books"],
  ["Weather", "Climate", "Climate describes weather conditions over:", "a long period", "one minute", "one meal", "one journey"],
  ["Peace", "Community", "People promote peace by:", "solving disagreements respectfully", "fighting", "spreading rumours", "destroying property"],
];

const artsSeeds: TemplateSeed[] = [
  ["Visual arts", "Colour", "Which are the primary colours?", "red, blue and yellow", "green, orange and purple", "black, white and grey", "pink, brown and gold"],
  ["Visual arts", "Drawing", "A pencil is commonly used for:", "drawing", "cooking", "weaving roads", "measuring temperature"],
  ["Music", "Rhythm", "Rhythm is the:", "pattern of beats in music", "colour of paint", "shape of a building", "name of a dancer"],
  ["Music", "Performance", "A singer uses the:", "voice", "ruler", "hammer", "compass"],
  ["Drama", "Characters", "An actor plays a:", "character", "landform", "recipe", "weather system"],
  ["Drama", "Audience", "The audience is the group that:", "watches a performance", "writes every song", "builds the stage only", "cooks the food"],
  ["Sports", "Teamwork", "Teamwork means:", "cooperating with others", "playing alone always", "ignoring rules", "refusing to pass"],
  ["Sports", "Fitness", "A warm-up prepares the body for:", "exercise", "sleep", "reading only", "eating"],
  ["Craft", "Materials", "Paper can be used to make:", "collages", "rain", "soil", "electricity"],
  ["Design", "Pattern", "A pattern is a design that:", "repeats", "never changes shape", "has no order", "uses no line"],
  ["Dance", "Movement", "Dance communicates through:", "body movement", "silence only", "soil", "a thermometer"],
  ["Art appreciation", "Artists", "An artist creates:", "artwork", "a rainfall table", "a farm tool", "a map scale"],
  ["Sports", "Fair play", "Fair play means:", "following rules and respecting others", "cheating", "arguing constantly", "hiding the ball"],
  ["Theatre", "Stage", "A stage is where performers:", "present to an audience", "store food", "measure crops", "wash clothes"],
  ["Creativity", "Ideas", "Creativity involves:", "making and exploring new ideas", "copying without thinking", "avoiding practice", "breaking equipment"],
];

const religionSeeds: TemplateSeed[] = [
  ["Values", "Honesty", "Honesty means:", "telling the truth", "taking what is not yours", "hiding every fact", "breaking promises"],
  ["Values", "Respect", "Respect means:", "treating people with dignity", "insulting others", "ignoring everyone", "causing harm"],
  ["Community", "Service", "Serving others means:", "helping those in need", "refusing all help", "wasting food", "spreading fear"],
  ["Peace", "Forgiveness", "Forgiveness helps people to:", "restore peaceful relationships", "increase anger", "spread revenge", "avoid kindness"],
  ["Family", "Love", "A loving family shows:", "care and support", "cruelty", "dishonesty", "neglect"],
  ["Worship", "Prayer", "Prayer is a way of:", "communicating with God", "measuring distance", "planting crops", "drawing maps"],
  ["Creation", "Environment", "People should care for the environment because it is:", "a shared responsibility", "worthless", "only for animals", "not connected to life"],
  ["Ethics", "Justice", "Justice means treating people:", "fairly", "unequally without reason", "with hatred", "without respect"],
  ["Values", "Courage", "Courage helps a person to:", "do what is right despite fear", "avoid every duty", "hurt others", "tell lies"],
  ["Community", "Cooperation", "Cooperation means:", "working together", "working against everyone", "refusing advice", "causing conflict"],
  ["Charity", "Sharing", "Sharing with others shows:", "generosity", "greed", "jealousy", "laziness"],
  ["Responsibility", "Choices", "A responsible person:", "accepts the results of choices", "blames everyone else", "breaks every rule", "avoids promises"],
  ["Peace", "Conflict", "A peaceful way to solve conflict is:", "dialogue", "violence", "threats", "revenge"],
  ["Values", "Kindness", "Kindness is shown by:", "helping and encouraging others", "mocking people", "spreading rumours", "excluding everyone"],
  ["Faith", "Hope", "Hope encourages people to:", "look forward with confidence", "give up immediately", "hurt others", "avoid all work"],
];

const technologySeeds: TemplateSeed[] = [
  ["Computing", "Hardware", "Which is an input device?", "keyboard", "monitor", "speaker", "printer"],
  ["Computing", "Hardware", "Which device displays information?", "monitor", "mouse", "keyboard", "microphone"],
  ["Computing", "Storage", "A device used to store files is a:", "flash disk", "keyboard", "screen", "speaker"],
  ["Computing", "Safety", "A strong password should:", "use a mixture of characters", "be your name only", "be shared publicly", "be one letter"],
  ["Computing", "Internet", "A web browser is used to:", "visit websites", "wash clothes", "measure rainfall", "cook food"],
  ["Computing", "Data", "Information processed by a computer is called:", "data", "soil", "steam", "paint"],
  ["Technology", "Design", "A flowchart uses symbols to show:", "steps in a process", "the weather only", "food groups", "map colours"],
  ["Technology", "Materials", "A screwdriver is used to:", "turn screws", "cut paper only", "measure heat", "plant seeds"],
  ["Technology", "Safety", "Protective equipment is worn to:", "reduce injury", "increase danger", "slow learning", "break tools"],
  ["Technology", "Structures", "A strong structure should have:", "a stable foundation", "no support", "loose parts", "only decoration"],
  ["Computer science", "Algorithms", "An algorithm is:", "a step-by-step solution", "a computer screen", "a battery", "a colour"],
  ["Computer science", "Debugging", "Debugging means:", "finding and fixing errors", "deleting all files", "drawing pictures", "turning off lights"],
  ["Digital citizenship", "Privacy", "Personal information online should be:", "kept private", "posted everywhere", "given to strangers", "written on walls"],
  ["Electricity", "Circuits", "A complete circuit allows:", "electric current to flow", "water to freeze", "sound to stop", "soil to form"],
  ["Innovation", "Problem solving", "Innovation means:", "creating a useful new idea", "avoiding all ideas", "copying mistakes", "destroying tools"],
];

export const mathTemplates = makeRules("Mathematics", mathematicsSeeds);
export const englishTemplates = makeRules("English", englishSeeds);
export const kiswahiliTemplates = makeRules("Kiswahili", kiswahiliSeeds);
export const agricultureTemplates = makeRules("Agriculture", agricultureSeeds);
export const homeScienceTemplates = makeRules("Home Science", homeScienceSeeds);
export const socialStudiesTemplates = makeRules("Social Studies", socialStudiesSeeds);
export const artsTemplates = makeRules("Creative Arts", artsSeeds);
export const technologyTemplates = makeRules("Computer Science", technologySeeds);

export const biologyTemplates = makeRules("Biology", scienceSeeds);
export const chemistryTemplates = makeRules("Chemistry", scienceSeeds);
export const integratedScienceTemplates = makeRules("Integrated Science", scienceSeeds);
export const physicsTemplates = makeRules("Physics", scienceSeeds);
export const environmentalActivitiesTemplates = makeRules("Environmental Activities", scienceSeeds);
export const hygieneAndNutritionTemplates = makeRules("Hygiene and Nutrition", homeScienceSeeds);
export const creTemplates = makeRules("Christian Religious Education", religionSeeds);
export const fasihiYaKiswahiliTemplates = makeRules("Fasihi ya Kiswahili", kiswahiliSeeds);
export const historyAndCitizenshipTemplates = makeRules("History and Citizenship", socialStudiesSeeds);
export const geographyTemplates = makeRules("Geography", socialStudiesSeeds);
export const businessStudiesTemplates = makeRules("Business Studies", socialStudiesSeeds);
export const computerScienceTemplates = makeRules("Computer Science", technologySeeds);
export const literatureTemplates = makeRules("Literature", englishSeeds);
export const preTechnicalTemplates = makeRules("Pre-Technical Studies", technologySeeds);
export const healthEducationTemplates = makeRules("Health Education", homeScienceSeeds);
export const creativeArtsAndSportsTemplates = makeRules("Creative Arts and Sports", artsSeeds);

// Source of truth: the grade and subject fields in the uploaded generator files.
// Some original files intentionally do not contain every grade (for example,
// the original Mathematics file has Grade 4 and Grades 7–12, but no Grade 5–6).
export const TEMPLATE_SUBJECTS_BY_GRADE = {
  "Grade 1": [
    "Christian Religious Education", "Creative Arts", "English",
    "Environmental Activities", "Hygiene and Nutrition", "Kiswahili", "Mathematics",
  ],
  "Grade 2": [
    "Christian Religious Education", "Creative Arts", "English",
    "Environmental Activities", "Hygiene and Nutrition", "Kiswahili", "Mathematics",
  ],
  "Grade 3": [
    "Christian Religious Education", "Creative Arts", "English",
    "Environmental Activities", "Hygiene and Nutrition", "Kiswahili", "Mathematics",
  ],
  "Grade 4": [
    "Agriculture", "Creative Arts", "English", "Home Science",
    "Kiswahili", "Mathematics", "Social Studies",
  ],
  "Grade 5": [
    "Agriculture", "Creative Arts", "English", "Home Science", "Kiswahili", "Social Studies",
  ],
  "Grade 6": [
    "Agriculture", "Creative Arts", "English", "Home Science", "Kiswahili", "Social Studies",
  ],
  "Grade 7": [
    "Agriculture", "Creative Arts and Sports", "Computer Science", "English",
    "Health Education", "Home Science", "Integrated Science", "Kiswahili",
    "Mathematics", "Pre-Technical Studies", "Social Studies",
  ],
  "Grade 8": [
    "Agriculture", "Creative Arts and Sports", "Computer Science", "English",
    "Health Education", "Home Science", "Integrated Science", "Kiswahili",
    "Mathematics", "Pre-Technical Studies", "Social Studies",
  ],
  "Grade 9": [
    "Agriculture", "Creative Arts and Sports", "Computer Science", "English",
    "Health Education", "Home Science", "Integrated Science", "Kiswahili",
    "Mathematics", "Pre-Technical Studies", "Social Studies",
  ],
  "Grade 10": [
    "Biology", "Business Studies", "Chemistry", "Computer Science", "English",
    "Fasihi ya Kiswahili", "Geography", "History and Citizenship", "Home Science",
    "Kiswahili", "Literature", "Mathematics", "Physics",
  ],
  "Grade 11": [
    "Biology", "Business Studies", "Chemistry", "Computer Science",
    "Christian Religious Education", "English", "Fasihi ya Kiswahili",
    "Geography", "History and Citizenship", "Home Science", "Kiswahili",
    "Literature", "Mathematics", "Physics",
  ],
  "Grade 12": [
    "Biology", "Business Studies", "Chemistry", "Computer Science",
    "Christian Religious Education", "English", "Fasihi ya Kiswahili",
    "Geography", "History and Citizenship", "Home Science", "Kiswahili",
    "Literature", "Mathematics", "Physics",
  ],
} as const;

export const TEMPLATE_RULES_BY_SUBJECT: Record<string, TemplateRule[]> = {
  Mathematics: mathTemplates,
  English: englishTemplates,
  Kiswahili: kiswahiliTemplates,
  Agriculture: agricultureTemplates,
  "Home Science": homeScienceTemplates,
  "Social Studies": socialStudiesTemplates,
  "Creative Arts": artsTemplates,
  "Computer Science": technologyTemplates,
  Biology: biologyTemplates,
  Chemistry: chemistryTemplates,
  "Integrated Science": integratedScienceTemplates,
  Physics: physicsTemplates,
  "Environmental Activities": environmentalActivitiesTemplates,
  "Hygiene and Nutrition": hygieneAndNutritionTemplates,
  "Christian Religious Education": creTemplates,
  "Fasihi ya Kiswahili": fasihiYaKiswahiliTemplates,
  "History and Citizenship": historyAndCitizenshipTemplates,
  Geography: geographyTemplates,
  "Business Studies": businessStudiesTemplates,
  Literature: literatureTemplates,
  "Pre-Technical Studies": preTechnicalTemplates,
  "Health Education": healthEducationTemplates,
  "Creative Arts and Sports": creativeArtsAndSportsTemplates,
};

export function getTemplateRules(subject: string): TemplateRule[] {
  return TEMPLATE_RULES_BY_SUBJECT[subject] ?? [];
}

export function getTemplateRulesForGrade(subject: string, gradeKey: string): TemplateRule[] {
  const sourceGrade =
    gradeKey.startsWith("cbc-") ? `Grade ${gradeKey.slice(4)}` :
      gradeKey.startsWith("senior-") ? `Grade ${gradeKey.slice(7)}` :
        null;
  const gradeSubjects = sourceGrade
    ? TEMPLATE_SUBJECTS_BY_GRADE[sourceGrade as keyof typeof TEMPLATE_SUBJECTS_BY_GRADE]
    : null;

  if (gradeSubjects && !gradeSubjects.some((allowedSubject) => allowedSubject === subject)) {
    return [];
  }

  return getTemplateRules(subject);
}