import type { SubjectGenerator } from "../types";
import { makeFactBankGenerator, type Fact, type FactBankConfig } from "../factbank";

// ── Agriculture ──────────────────────────────────────────────────────────
const AGRICULTURE: Fact[] = [
  { q: "The soil type generally best for growing most crops is:", a: "loam soil", wrong: ["pure sand", "gravel", "solid clay"], topics: ["Soil & Land Preparation", "Soil & Land Use"] },
  { q: "Soil that drains very quickly and holds little water is:", a: "sandy soil", wrong: ["clay soil", "loam soil", "peat soil"], topics: ["Soil & Land Preparation"] },
  { q: "A practice that helps control soil erosion on a slope is:", a: "terracing", wrong: ["deforestation", "overgrazing", "burning vegetation"], topics: ["Water Management", "Conservation & Water"] },
  { q: "Planting grass strips across a slope to trap soil is:", a: "strip cropping", wrong: ["monocropping", "clean weeding", "flood irrigation"], topics: ["Water Management", "Soil & Land Preparation"] },
  { q: "Decomposed organic matter used to enrich soil is:", a: "compost manure", wrong: ["kerosene", "table salt", "plastic mulch"], topics: ["Plant Nutrients", "Crop Farming"] },
  { q: "A fertiliser that mainly promotes leafy growth supplies:", a: "nitrogen", wrong: ["chlorine", "sodium", "lead"], topics: ["Plant Nutrients", "Crop Farming"] },
  { q: "Weeds should be removed because they:", a: "compete with crops for water and nutrients", wrong: ["feed the crops", "add nitrogen", "attract rain"], topics: ["Crop Farming", "Pests & Diseases"] },
  { q: "Rotating crops on a piece of land from season to season helps to:", a: "maintain soil fertility and break pest cycles", wrong: ["increase erosion", "kill all soil life", "stop rainfall"], topics: ["Crop Farming", "Soil & Land Preparation"] },
  { q: "Supplying water to crops artificially is:", a: "irrigation", wrong: ["drainage", "mulching", "pruning"], topics: ["Water Management", "Irrigation"] },
  { q: "Removing excess water from waterlogged soil is:", a: "drainage", wrong: ["irrigation", "mulching", "harrowing"], topics: ["Water Management"] },
  { q: "Covering the soil surface with dry grass to conserve moisture is:", a: "mulching", wrong: ["ploughing", "weeding", "spraying"], topics: ["Water Management", "Conservation & Water"] },
  { q: "A balanced livestock ration must contain:", a: "all nutrients an animal needs", wrong: ["water only", "salt only", "maize only"], topics: ["Animal Husbandry", "Livestock & Feeds"] },
  { q: "Milk from a dairy cow is obtained through:", a: "milking", wrong: ["shearing", "candling", "culling"], topics: ["Animal Husbandry"] },
  { q: "A safe method of controlling crop pests is to:", a: "use recommended pesticides correctly", wrong: ["burn the whole farm", "ignore the pests", "spread the disease"], topics: ["Pests & Diseases"] },
  { q: "Keeping accurate farm records helps a farmer to:", a: "track activities, costs and profit", wrong: ["avoid planning", "forget expenses", "hide losses"], topics: ["Agribusiness Basics", "Farm records & Planning"] },
  { q: "Grain should be dried before storage to prevent:", a: "mould and spoilage", wrong: ["germination in the field", "sunlight damage", "loss of colour"], topics: ["Harvesting & Storage", "Agribusiness Basics"] },
  { q: "A farmer studies market prices before selling in order to:", a: "make better selling decisions", wrong: ["avoid all buyers", "destroy the produce", "stop farming"], topics: ["Agribusiness Basics", "Agribusiness Marketing"] },
  { q: "A tool commonly used for digging and weeding is a:", a: "hoe (jembe)", wrong: ["rain gauge", "milk churn", "grain drill only"], topics: ["Farm Tools & Equipment", "Soil & Land Preparation"] },
  { q: "Leguminous plants such as beans improve the soil by adding:", a: "nitrogen", wrong: ["phosphates only", "sand", "salt"], topics: ["Plant Nutrients", "Crop Farming"] },
  { q: "Vaccinating livestock is done mainly to:", a: "prevent disease", wrong: ["increase their weight instantly", "change their colour", "reduce milk"], topics: ["Animal Husbandry", "Pests & Diseases"] },
];

// ── Home Science ─────────────────────────────────────────────────────────
const HOME_SCIENCE: Fact[] = [
  { q: "A good source of body-building protein is:", a: "beans", wrong: ["sugar", "cooking oil", "plain water"], topics: ["Food & Nutrition", "Nutrition"] },
  { q: "A balanced diet contains:", a: "different nutrients in the right amounts", wrong: ["only carbohydrates", "only fruit", "only water"], topics: ["Food & Nutrition", "Balanced diet"] },
  { q: "Vitamins and minerals are supplied mainly by:", a: "fruits and vegetables", wrong: ["fats and oils", "sugar", "white bread only"], topics: ["Food & Nutrition", "Nutrition"] },
  { q: "Carbohydrate foods such as ugali and rice mainly provide:", a: "energy", wrong: ["body-building material", "protection from disease only", "no nutrients"], topics: ["Food & Nutrition", "Balanced diet"] },
  { q: "Food should be covered to protect it from:", a: "dust, flies and germs", wrong: ["sunlight only", "becoming cold", "losing weight"], topics: ["Food & Nutrition", "Food safety"] },
  { q: "Perishable foods such as milk are best kept:", a: "in a refrigerator or cool place", wrong: ["in direct sunlight", "near an open drain", "in a warm cupboard"], topics: ["Food & Nutrition", "Food safety"] },
  { q: "Cotton is an example of a:", a: "natural fibre", wrong: ["synthetic fibre", "metal", "mineral"], topics: ["Clothing & Textiles", "Textiles"] },
  { q: "Nylon and polyester are examples of:", a: "synthetic fibres", wrong: ["natural fibres", "animal fibres", "plant fibres"], topics: ["Clothing & Textiles", "Textiles"] },
  { q: "Ironing clothes is done mainly to:", a: "remove creases and give a neat finish", wrong: ["add colour", "make them shrink", "remove all stains"], topics: ["Clothing & Textiles", "Care of clothing"] },
  { q: "A safe kitchen practice is to:", a: "turn pot handles away from the edge", wrong: ["leave knives on the floor", "hold hot pans without a cloth", "spill water near sockets"], topics: ["Kitchen Safety", "Safety"] },
  { q: "A household budget is a plan for:", a: "managing income and expenses", wrong: ["storing food", "washing clothes", "growing plants"], topics: ["Budgeting & Shopping", "Home Management"] },
  { q: "A wise shopper compares goods by looking at:", a: "quality, quantity and price", wrong: ["the colour of the shop", "the shopkeeper's name", "the day of the week"], topics: ["Budgeting & Shopping", "Consumer Education"] },
  { q: "Drying or salting food helps preserve it by reducing:", a: "moisture that spoilage organisms need", wrong: ["flavour", "colour", "weight only"], topics: ["Home Management", "Food preservation"] },
  { q: "Boiling water for drinking helps to:", a: "kill disease-causing organisms", wrong: ["add minerals", "make it sweet", "remove its colour"], topics: ["Personal Hygiene", "Food safety"] },
  { q: "Brushing teeth after meals helps prevent:", a: "tooth decay", wrong: ["good eyesight", "strong bones", "hair loss"], topics: ["Personal Hygiene", "Home Management"] },
  { q: "A first-aid step for a minor burn is to:", a: "cool it under clean running water", wrong: ["apply cooking oil", "cover it with soil", "burst any blisters"], topics: ["Kitchen Safety", "Home Management"] },
  { q: "Sorting clothes before washing means separating:", a: "white and coloured items", wrong: ["big and small buttons", "cotton and cotton", "clean and clean"], topics: ["Clothing & Textiles", "Care of clothing"] },
  { q: "Sharing household chores among family members shows:", a: "co-operation", wrong: ["carelessness", "waste", "dishonesty"], topics: ["Home Management", "Family"] },
  { q: "Fats and oils in the diet mainly provide:", a: "concentrated energy", wrong: ["body-building material", "vitamins only", "roughage"], topics: ["Food & Nutrition", "Nutrition"] },
  { q: "Roughage (fibre) from vegetables and whole grains helps:", a: "digestion and prevents constipation", wrong: ["build muscle", "form bones", "warm the body"], topics: ["Food & Nutrition", "Balanced diet"] },
  { q: "Cooking food by placing it in hot fat is:", a: "frying", wrong: ["boiling", "steaming", "grilling"], topics: ["Cooking Skills", "Food & Nutrition"] },
  { q: "Cooking food in the steam from boiling water is:", a: "steaming", wrong: ["roasting", "frying", "stewing"], topics: ["Cooking Skills"] },
  { q: "Overcooking green vegetables mainly destroys their:", a: "vitamin C", wrong: ["fibre", "minerals", "protein"], topics: ["Cooking Skills", "Food & Nutrition"] },
  { q: "Wool and silk are examples of:", a: "animal fibres", wrong: ["plant fibres", "synthetic fibres", "minerals"], topics: ["Clothing & Textiles", "Textiles"] },
  { q: "A stitch used to neaten a raw edge and stop fraying is the:", a: "hemming stitch", wrong: ["tacking stitch", "chain stitch only", "cross stitch only"], topics: ["Clothing & Textiles", "Care of clothing"] },
  { q: "Reading the care label on a garment before washing helps you to:", a: "choose the right water temperature and method", wrong: ["find the price", "know the designer", "check the colour only"], topics: ["Clothing & Textiles", "Care of clothing"] },
  { q: "Storing raw meat above ready-to-eat food in a fridge risks:", a: "cross-contamination with germs", wrong: ["faster cooling", "better flavour", "longer shelf life"], topics: ["Kitchen Safety", "Food safety"] },
  { q: "The 'use-by' date on food tells you:", a: "the last day it is safe to eat", wrong: ["the day it was made", "the best price day", "the delivery day"], topics: ["Consumer Education", "Food safety"] },
  { q: "A receipt kept after shopping is useful for:", a: "checking change and returning faulty goods", wrong: ["lighting a fire", "wrapping food", "nothing"], topics: ["Budgeting & Shopping", "Consumer Education"] },
  { q: "Saving part of your income regularly is important because it:", a: "prepares you for future needs and emergencies", wrong: ["reduces your wants", "raises prices", "is required by law"], topics: ["Budgeting & Shopping", "Home Management"] },
  { q: "A well-ventilated kitchen helps to:", a: "remove smoke, steam and cooking smells", wrong: ["keep food frozen", "save water", "sharpen knives"], topics: ["Kitchen Safety", "Home Management"] },
  { q: "Left-over cooked food should be:", a: "cooled quickly, covered and refrigerated", wrong: ["left on the table overnight", "kept warm all day", "mixed with raw food"], topics: ["Food safety", "Home Management"] },
  { q: "Keeping the home clean and tidy helps to:", a: "prevent pests and disease", wrong: ["increase dust", "attract flies", "waste time only"], topics: ["Home Management", "Personal Hygiene"] },
  { q: "A first-aid box in the home should contain:", a: "plasters, bandages, antiseptic and cotton wool", wrong: ["only painkillers", "food and water only", "matches and candles"], topics: ["Kitchen Safety", "Home Management"] },
  { q: "Mending a small tear in clothing promptly:", a: "stops it getting bigger and makes clothes last longer", wrong: ["weakens the cloth", "changes the colour", "is a waste of thread"], topics: ["Clothing & Textiles", "Care of clothing"] },
];

// ── Hygiene and Nutrition (Grades 1–3) ──────────────────────────────────
const HYGIENE: Fact[] = [
  { q: "We should brush our teeth at least:", a: "twice a day", wrong: ["once a week", "once a month", "only when they hurt"], topics: ["Personal Hygiene", "Disease Prevention"] },
  { q: "Before handling food we should always:", a: "wash our hands with soap and clean water", wrong: ["rub them on our clothes", "blow on them", "shake them dry only"], topics: ["Food Safety", "Personal Hygiene"] },
  { q: "Which food group gives us energy?", a: "carbohydrates like ugali and rice", wrong: ["clean water", "table salt", "vitamins only"], topics: ["Food Groups", "Healthy Eating"] },
  { q: "Fruits and vegetables mainly give the body:", a: "vitamins and minerals", wrong: ["only fat", "only water", "no nutrients"], topics: ["Balanced Diet", "Food Groups"] },
  { q: "Foods that help the body grow and repair itself are:", a: "protein foods like beans, eggs and fish", wrong: ["sweets and sugar", "cooking fat only", "plain water"], topics: ["Food Groups", "Balanced Diet"] },
  { q: "To make water safe for drinking at home we can:", a: "boil it", wrong: ["add soil", "leave it uncovered", "shake it well"], topics: ["Clean Water", "Disease Prevention"] },
  { q: "Covering the nose and mouth when sneezing helps to:", a: "stop germs from spreading", wrong: ["make us sneeze more", "clean the air", "cure a cold"], topics: ["Disease Prevention", "Personal Hygiene"] },
  { q: "A simple first-aid step for a small cut is to:", a: "clean it and cover it with a plaster", wrong: ["rub soil on it", "ignore the bleeding", "pour hot oil on it"], topics: ["First Aid", "Safety at Home"] },
  { q: "We should bathe and wear clean clothes to:", a: "stay healthy and prevent skin disease", wrong: ["become taller", "run faster", "change our voice"], topics: ["Personal Hygiene", "Disease Prevention"] },
  { q: "Cutting fingernails short and keeping them clean helps to:", a: "keep germs away from food", wrong: ["make writing harder", "grow hair", "stop hunger"], topics: ["Personal Hygiene", "Food Safety"] },
  { q: "Rubbish at home should be:", a: "put in a covered bin and disposed of properly", wrong: ["left on the floor", "kept under the bed", "poured into drinking water"], topics: ["Safety at Home", "Disease Prevention"] },
  { q: "Getting enough sleep and play each day helps a child to:", a: "grow well and stay alert", wrong: ["forget everything", "become unwell", "stop eating"], topics: ["Exercise & Rest", "Healthy Eating"] },
  { q: "A balanced meal on a plate should include foods from:", a: "several different food groups", wrong: ["one food group only", "sweets only", "drinks only"], topics: ["Balanced Diet", "Food Groups"] },
  { q: "Milk is a good food because it provides:", a: "protein and calcium for strong bones and teeth", wrong: ["only sugar", "only water", "no useful nutrients"], topics: ["Food Groups", "Balanced Diet"] },
  { q: "We should wash fruits before eating them to:", a: "remove dirt and germs", wrong: ["make them bigger", "change their taste", "add vitamins"], topics: ["Food Safety", "Personal Hygiene"] },
  { q: "Using a clean latrine or toilet helps to prevent:", a: "diseases such as diarrhoea", wrong: ["strong teeth", "good eyesight", "tall growth"], topics: ["Disease Prevention", "Clean Water"] },
];

// ── Health Education (Grades 7+) ────────────────────────────────────────
const HEALTH: Fact[] = [
  { q: "Immunisation protects the body by:", a: "helping it build resistance to a disease", wrong: ["curing all infections instantly", "replacing food", "cleaning the blood"], topics: ["Personal Hygiene", "Disease Prevention"] },
  { q: "Regular physical exercise helps to:", a: "strengthen the heart and muscles", wrong: ["weaken the bones", "reduce lung capacity", "raise disease risk"], topics: ["Exercise & Rest", "Healthy Eating"] },
  { q: "A deficiency of iron in the diet can cause:", a: "anaemia", wrong: ["rickets", "goitre", "scurvy"], topics: ["Food Groups", "Balanced Diet"] },
  { q: "A deficiency of iodine in the diet can cause:", a: "goitre", wrong: ["anaemia", "scurvy", "kwashiorkor"], topics: ["Food Groups", "Balanced Diet"] },
  { q: "Kwashiorkor in young children is caused by a lack of:", a: "protein", wrong: ["water", "sunlight", "fibre"], topics: ["Balanced Diet", "Food Groups"] },
  { q: "Non-communicable diseases such as diabetes are best prevented by:", a: "a healthy diet and active lifestyle", wrong: ["antibiotics", "mosquito nets", "isolation"], topics: ["Disease Prevention", "Healthy Eating"] },
  { q: "Clean, safe disposal of human waste helps prevent:", a: "cholera and typhoid", wrong: ["malaria", "asthma", "diabetes"], topics: ["Clean Water", "Disease Prevention"] },
  { q: "Sleeping under a treated mosquito net helps prevent:", a: "malaria", wrong: ["tuberculosis", "cholera", "measles"], topics: ["Disease Prevention"] },
  { q: "A communicable disease is one that:", a: "can spread from one person to another", wrong: ["is inherited only", "cannot be treated", "affects only animals"], topics: ["Disease Prevention"] },
  { q: "The best drink for rehydrating a person with diarrhoea at home is:", a: "oral rehydration solution (ORS)", wrong: ["strong coffee", "soda", "cooking oil"], topics: ["Disease Prevention", "First Aid"] },
  { q: "Tobacco smoking is a major risk factor for:", a: "lung disease and cancer", wrong: ["improved fitness", "better eyesight", "stronger bones"], topics: ["Healthy Eating", "Disease Prevention"] },
  { q: "Personal protective steps against airborne infections include:", a: "covering the mouth when coughing and good ventilation", wrong: ["sharing cups", "closing all windows permanently", "skipping meals"], topics: ["Personal Hygiene", "Disease Prevention"] },
  { q: "A healthy plate should have the largest portion made up of:", a: "vegetables and whole grains", wrong: ["sugary drinks", "fried snacks", "sweets"], topics: ["Healthy Eating", "Balanced Diet"] },
  { q: "Mental wellbeing is supported by:", a: "rest, exercise and talking about problems", wrong: ["isolation and no sleep", "skipping all meals", "avoiding all people"], topics: ["Exercise & Rest"] },
  { q: "A deficiency of vitamin A can cause:", a: "night blindness", wrong: ["scurvy", "rickets", "beriberi"], topics: ["Nutrition", "Balanced Diet"] },
  { q: "A deficiency of vitamin D (or too little sunlight) can cause:", a: "rickets", wrong: ["goitre", "anaemia", "night blindness"], topics: ["Nutrition", "Balanced Diet"] },
  { q: "The body system that defends against disease-causing germs is the:", a: "immune system", wrong: ["digestive system", "skeletal system", "respiratory system"], topics: ["Human Body & Health", "Disease Prevention"] },
  { q: "HIV is mainly spread through:", a: "unprotected sex and infected blood", wrong: ["sharing meals", "mosquito bites", "shaking hands"], topics: ["Disease Prevention", "Personal Health"] },
  { q: "Tuberculosis (TB) mainly affects the:", a: "lungs", wrong: ["kidneys", "skin", "eyes"], topics: ["Disease Prevention"] },
  { q: "Regular hand-washing with soap is one of the cheapest ways to prevent:", a: "diarrhoeal diseases", wrong: ["diabetes", "asthma", "arthritis"], topics: ["Personal Hygiene", "Disease Prevention"] },
  { q: "The recommended amount of sleep for a school-age child is about:", a: "9–11 hours a night", wrong: ["3–4 hours", "as little as possible", "14–16 hours"], topics: ["Exercise & Rest", "Personal Health"] },
  { q: "Peer pressure is best resisted by:", a: "being assertive and choosing friends who respect your values", wrong: ["always agreeing", "avoiding all friends", "hiding your feelings"], topics: ["Mental & Social Wellbeing", "Personal Health"] },
  { q: "First aid for a nosebleed is to:", a: "sit up, lean forward and pinch the soft part of the nose", wrong: ["lie flat and tilt the head back", "run around", "blow the nose hard"], topics: ["First Aid", "Safety & Risk Prevention"] },
  { q: "The 'recovery position' is used for a casualty who is:", a: "unconscious but breathing", wrong: ["fully awake", "not breathing at all", "bleeding heavily only"], topics: ["First Aid", "Safety & Risk Prevention"] },
  { q: "Drinking plenty of clean water each day helps the body to:", a: "regulate temperature and remove waste", wrong: ["store fat", "build bone only", "stop breathing"], topics: ["Personal Health", "Nutrition"] },
  { q: "Too much sugar and fatty food, with little exercise, raises the risk of:", a: "obesity and type-2 diabetes", wrong: ["measles", "malaria", "cholera"], topics: ["Healthy Eating", "Disease Prevention"] },
  { q: "Stress can be managed by:", a: "planning, exercise, rest and talking to someone you trust", wrong: ["bottling it up", "skipping sleep", "isolating yourself"], topics: ["Mental & Social Wellbeing"] },
  { q: "A balanced fitness programme includes aerobic activity, strength work and:", a: "flexibility (stretching)", wrong: ["only sitting", "only heavy lifting", "only sleeping"], topics: ["Physical Activity", "Exercise & Rest"] },
];

// ── Pre-Technical Studies / Computer Science ────────────────────────────
const TECH: Fact[] = [
  { q: "Which of these is an input device?", a: "keyboard", wrong: ["monitor", "printer", "speaker"], topics: ["Computer Hardware & Systems", "Hardware: Input, Processing, Output"] },
  { q: "Which of these is an output device?", a: "printer", wrong: ["mouse", "scanner", "microphone"], topics: ["Computer Hardware & Systems", "Hardware: Input, Processing, Output"] },
  { q: "A step-by-step set of instructions to solve a problem is an:", a: "algorithm", wrong: ["operating system", "spreadsheet", "database"], topics: ["Programming Fundamentals", "Programming Concepts"] },
  { q: "A diagram that shows the steps of a process using symbols is a:", a: "flowchart", wrong: ["spreadsheet", "database", "pie chart"], topics: ["Technology & Design", "Programming Concepts"] },
  { q: "Finding and fixing errors in a program is called:", a: "debugging", wrong: ["compiling", "formatting", "encrypting"], topics: ["Software Engineering", "Programming Concepts"] },
  { q: "A strong password should:", a: "mix letters, numbers and symbols", wrong: ["be your name", "be a single letter", "be shared with friends"], topics: ["Cybersecurity Basics", "Data Management & Security"] },
  { q: "Personal information shared online should be:", a: "kept private and shared carefully", wrong: ["posted everywhere", "given to strangers", "written on public walls"], topics: ["Digital Citizenship", "Cybersecurity Basics"] },
  { q: "In computing, RAM is best described as:", a: "temporary working memory", wrong: ["permanent storage", "an input device", "a network cable"], topics: ["Computer Hardware & Systems", "Operating Systems"] },
  { q: "A device used to store files permanently is a:", a: "hard disk or flash drive", wrong: ["monitor", "keyboard", "speaker"], topics: ["Computer Hardware & Systems", "Storage"] },
  { q: "The binary number system uses only the digits:", a: "0 and 1", wrong: ["0 to 9", "1 to 10", "A to F only"], topics: ["Number Systems", "Data Structures & Algorithms"] },
  { q: "Software that manages a computer's hardware and other programs is the:", a: "operating system", wrong: ["web browser", "spreadsheet", "antivirus only"], topics: ["Software & Operating Systems", "Operating Systems"] },
  { q: "A program used to visit and view websites is a:", a: "web browser", wrong: ["word processor", "compiler", "printer driver"], topics: ["Networking & Internet", "Software & Operating Systems"] },
  { q: "A tool used to turn screws when assembling a product is a:", a: "screwdriver", wrong: ["chisel", "plane", "trowel"], topics: ["Technology & Design", "Structures"] },
  { q: "A tool used to check that a surface is exactly horizontal is a:", a: "spirit level", wrong: ["try square", "mallet", "tape measure"], topics: ["Technology & Design", "Structures"] },
  { q: "Protective gear is worn in a workshop to:", a: "reduce the risk of injury", wrong: ["look smart", "work faster", "save electricity"], topics: ["Safety", "Structures"] },
  { q: "A stable structure usually has a:", a: "wide, firm base", wrong: ["narrow top-heavy shape", "no support", "loose joints"], topics: ["Structures", "Technology & Design"] },
  { q: "Repeatedly doing a set of steps in a program is called:", a: "a loop (iteration)", wrong: ["a variable", "a comment", "an error"], topics: ["Programming Concepts", "Programming Fundamentals"] },
  { q: "Data that has been processed into a meaningful form is called:", a: "information", wrong: ["hardware", "a cable", "a pixel"], topics: ["Data", "Data Management & Security"] },
  { q: "The 'brain' of the computer that carries out instructions is the:", a: "CPU (processor)", wrong: ["monitor", "hard disk", "keyboard"], topics: ["Computer Hardware & Systems", "Hardware: Input, Processing, Output"] },
  { q: "A mouse and a touchpad are both:", a: "pointing input devices", wrong: ["output devices", "storage devices", "processing devices"], topics: ["Computer Hardware & Systems", "Hardware: Input, Processing, Output"] },
  { q: "Software you use to type and format documents is a:", a: "word processor", wrong: ["spreadsheet", "database", "operating system"], topics: ["Software & Operating Systems", "Spreadsheets & Databases"] },
  { q: "Software best suited to calculations, tables and charts is a:", a: "spreadsheet", wrong: ["web browser", "media player", "paint program"], topics: ["Spreadsheets & Databases", "Software & Operating Systems"] },
  { q: "An organised collection of related data stored for easy retrieval is a:", a: "database", wrong: ["flowchart", "screenshot", "shortcut"], topics: ["Spreadsheets & Databases", "Data Management & Security"] },
  { q: "In binary, the number 2 is written as:", a: "10", wrong: ["2", "11", "02"], topics: ["Number Systems", "Data Structures & Algorithms"] },
  { q: "Backing up files means:", a: "keeping an extra copy in a safe, separate place", wrong: ["deleting old files", "renaming files", "printing files"], topics: ["Data Management & Security", "Cybersecurity Basics"] },
  { q: "A malicious program that copies itself and harms a computer is a:", a: "virus", wrong: ["firewall", "browser", "driver"], topics: ["Cybersecurity Basics", "Data Management & Security"] },
  { q: "Software that helps block unwanted network access to a computer is a:", a: "firewall", wrong: ["scanner", "spreadsheet", "modem"], topics: ["Networking & Internet", "Cybersecurity Basics"] },
  { q: "A decision point in a flowchart is usually drawn as a:", a: "diamond", wrong: ["rectangle", "circle", "arrow"], topics: ["Programming Concepts", "Programming Fundamentals"] },
  { q: "A named store that holds a value that can change while a program runs is a:", a: "variable", wrong: ["constant", "comment", "keyword"], topics: ["Programming Concepts", "Programming Fundamentals"] },
  { q: "Choosing between two paths in a program based on a condition is:", a: "selection (if…then…else)", wrong: ["iteration", "sequence", "declaration"], topics: ["Programming Concepts", "Data Structures & Algorithms"] },
  { q: "A joint used to fix two pieces of wood at a right angle is the:", a: "corner (butt) joint", wrong: ["weld", "rivet", "solder joint"], topics: ["Technology & Design", "Structures"] },
  { q: "Before drilling or cutting, a workpiece should be:", a: "held firmly in a vice or clamp", wrong: ["held loosely by hand", "balanced on the edge", "left to move freely"], topics: ["Safety", "Technology & Design"] },
  { q: "Measuring twice before cutting once helps to:", a: "avoid waste and mistakes", wrong: ["make the tool sharper", "speed up drying", "hide errors"], topics: ["Technology & Design", "Structures"] },
  { q: "A triangle is used a lot in structures because it is a:", a: "rigid, stable shape", wrong: ["shape that folds easily", "curved shape", "shape with no corners"], topics: ["Structures", "Technology & Design"] },
];

export const AGRICULTURE_FACTS: FactBankConfig = { byBand: { upper: AGRICULTURE, junior: AGRICULTURE, senior: AGRICULTURE } };
export const HOME_SCIENCE_FACTS: FactBankConfig = { byBand: { upper: HOME_SCIENCE, junior: HOME_SCIENCE, senior: HOME_SCIENCE } };
// Junior School merges Agriculture + Home Science into "Agriculture and Nutrition".
const AGRI_NUT = [...AGRICULTURE, ...HOME_SCIENCE];
export const AGRICULTURE_NUTRITION_FACTS: FactBankConfig = { byBand: { upper: AGRI_NUT, junior: AGRI_NUT, senior: AGRI_NUT } };
export const HYGIENE_FACTS: FactBankConfig = { byBand: { lower: HYGIENE } };
export const HEALTH_FACTS: FactBankConfig = { byBand: { junior: [...HEALTH, ...HYGIENE.slice(0, 6)], senior: HEALTH } };
export const TECH_FACTS: FactBankConfig = { byBand: { junior: TECH, senior: TECH } };

export const agricultureGenerator: SubjectGenerator = makeFactBankGenerator(AGRICULTURE_FACTS);
export const homeScienceGenerator: SubjectGenerator = makeFactBankGenerator(HOME_SCIENCE_FACTS);
export const agricultureNutritionGenerator: SubjectGenerator = makeFactBankGenerator(AGRICULTURE_NUTRITION_FACTS);
export const hygieneNutritionGenerator: SubjectGenerator = makeFactBankGenerator(HYGIENE_FACTS);
export const healthEducationGenerator: SubjectGenerator = makeFactBankGenerator(HEALTH_FACTS);
export const preTechnicalGenerator: SubjectGenerator = makeFactBankGenerator(TECH_FACTS);
export const computerScienceGenerator: SubjectGenerator = makeFactBankGenerator(TECH_FACTS);
