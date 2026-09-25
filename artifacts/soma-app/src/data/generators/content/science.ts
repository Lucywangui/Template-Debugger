import type { GenContext, Question, SubjectGenerator } from "../types";
import { numericMCQ, pick, randInt, shuffle } from "../helpers";
import { makeFactBankGenerator, resolveFacts, type Fact, type FactBankConfig } from "../factbank";

// ── Environmental Activities (Grades 1–3) ──────────────────────────────────
const ENV: Fact[] = [
  { q: "Which of these is a living thing?", a: "a goat", wrong: ["a stone", "a chair", "a cup"], topics: ["Plants Around Us", "Animals & Habitats"] },
  { q: "Living things grow, feed and:", a: "reproduce", wrong: ["rust", "melt", "stay the same size"], topics: ["Animals & Habitats", "Plants Around Us"] },
  { q: "Plants make their own food using sunlight, water and:", a: "air (carbon dioxide)", wrong: ["soil only", "stones", "plastic"], topics: ["Plants Around Us"] },
  { q: "The part of a plant that takes in water from the soil is the:", a: "root", wrong: ["flower", "leaf", "fruit"], topics: ["Plants Around Us"] },
  { q: "We should wash our hands before eating to:", a: "remove germs", wrong: ["make them wet", "grow taller", "change our fingerprints"], topics: ["Health & Hygiene", "Food & Nutrition"] },
  { q: "Which animal lives in water?", a: "fish", wrong: ["goat", "chicken", "dog"], topics: ["Animals & Habitats"] },
  { q: "A young one of a cow is called a:", a: "calf", wrong: ["chick", "kid", "puppy"], topics: ["Animals & Habitats"] },
  { q: "Birds are covered with:", a: "feathers", wrong: ["scales", "fur", "shells"], topics: ["Animals & Habitats"] },
  { q: "The sun gives us light and:", a: "heat", wrong: ["rain", "wind", "soil"], topics: ["Weather & Seasons"] },
  { q: "During the rainy season the weather is often:", a: "cloudy and wet", wrong: ["hot and dry", "dusty", "very windy only"], topics: ["Weather & Seasons"] },
  { q: "We get clean water for drinking by:", a: "boiling or treating it", wrong: ["leaving it open", "adding soil", "shaking it"], topics: ["Water & Its Uses"] },
  { q: "We use water at home for:", a: "drinking, cooking and washing", wrong: ["making electricity only", "building walls", "lighting rooms"], topics: ["Water & Its Uses"] },
  { q: "A place where many trees grow together is a:", a: "forest", wrong: ["desert", "lake", "road"], topics: ["Soil & Land Use", "Plants Around Us"] },
  { q: "Which is a source of danger at home?", a: "an open fire left alone", wrong: ["a closed book", "a soft pillow", "a plastic cup"], topics: ["Health & Hygiene"] },
  { q: "We keep our environment clean by:", a: "putting litter in a bin", wrong: ["dropping litter", "burning tyres", "pouring oil on soil"], topics: ["Our School & Home", "Soil & Land Use"] },
  { q: "Which helper treats sick people?", a: "a nurse or doctor", wrong: ["a driver", "a farmer", "a tailor"], topics: ["Community Helpers"] },
  { q: "A person who teaches learners at school is a:", a: "teacher", wrong: ["pilot", "cook", "carpenter"], topics: ["Community Helpers", "Our School & Home"] },
  { q: "Roads and vehicles help people to:", a: "travel and move goods", wrong: ["grow crops", "cook food", "make rain"], topics: ["Transport & Roads"] },
  { q: "Before crossing a road we should:", a: "look both ways", wrong: ["run fast without looking", "close our eyes", "crawl"], topics: ["Transport & Roads", "Health & Hygiene"] },
  { q: "A young plant that has just come out of a seed is a:", a: "seedling", wrong: ["branch", "root crop", "flower"], topics: ["Plants Around Us"] },
  { q: "Domestic animals are animals that are:", a: "kept and cared for by people", wrong: ["only found in forests", "never useful", "always wild"], topics: ["Animals & Habitats"] },
  { q: "We protect our teeth by:", a: "brushing them and avoiding too many sweets", wrong: ["eating sweets all day", "never brushing", "chewing stones"], topics: ["Health & Hygiene", "Food & Nutrition"] },
];

// ── Integrated Science (Grades 7–9) ────────────────────────────────────────
export const INTEGRATED: FactBankConfig = {
  byBand: {
    junior: [
      { q: "The basic unit of life is the:", a: "cell", wrong: ["organ", "tissue", "molecule"], topics: ["Cells", "Classification of Living Things"] },
      { q: "Which part of a plant cell is NOT found in an animal cell?", a: "cell wall", wrong: ["nucleus", "cytoplasm", "cell membrane"], topics: ["Cells"] },
      { q: "The part of the cell that controls its activities is the:", a: "nucleus", wrong: ["vacuole", "cell wall", "chloroplast"], topics: ["Cells"] },
      { q: "Living organisms are grouped into kingdoms based on their:", a: "shared characteristics", wrong: ["colour only", "size only", "price"], topics: ["Classification of Living Things"] },
      { q: "A mixture of sand and water can be separated by:", a: "filtration", wrong: ["evaporation", "magnetism", "distillation"], topics: ["Mixtures", "Matter"] },
      { q: "A mixture of salt and water is best separated by:", a: "evaporation", wrong: ["filtration", "sieving", "decanting"], topics: ["Mixtures", "Matter"] },
      { q: "The change of state from gas directly to solid is:", a: "deposition", wrong: ["condensation", "sublimation", "melting"], topics: ["Matter"] },
      { q: "Matter that has a fixed shape and fixed volume is a:", a: "solid", wrong: ["liquid", "gas", "plasma"], topics: ["Matter"] },
      { q: "Which is a renewable source of energy?", a: "wind", wrong: ["coal", "diesel", "natural gas"], topics: ["Energy", "Environment"] },
      { q: "Energy stored in food and fuels is:", a: "chemical energy", wrong: ["sound energy", "kinetic energy", "light energy"], topics: ["Energy"] },
      { q: "The force that opposes motion between two surfaces is:", a: "friction", wrong: ["gravity", "tension", "upthrust"], topics: ["Forces"] },
      { q: "The pull of the earth on objects is called:", a: "gravity", wrong: ["friction", "magnetism", "air resistance"], topics: ["Forces"] },
      { q: "Green plants release which gas during photosynthesis?", a: "oxygen", wrong: ["carbon dioxide", "nitrogen", "hydrogen"], topics: ["Plants", "Environment"] },
      { q: "Plants take in which gas for photosynthesis?", a: "carbon dioxide", wrong: ["oxygen", "nitrogen", "helium"], topics: ["Plants"] },
      { q: "A balanced diet must include proteins for:", a: "body building and repair", wrong: ["energy only", "cooling the body", "eyesight only"], topics: ["Nutrition", "Health"] },
      { q: "A lack of vitamin C in the diet causes:", a: "scurvy", wrong: ["rickets", "night blindness", "goitre"], topics: ["Nutrition", "Health"] },
      { q: "Which disease is spread by the Anopheles mosquito?", a: "malaria", wrong: ["cholera", "typhoid", "tuberculosis"], topics: ["Health", "Disease"] },
      { q: "Cholera and typhoid are commonly spread through:", a: "contaminated water and food", wrong: ["mosquito bites", "touching pets", "cold weather"], topics: ["Health", "Disease"] },
      { q: "An electric circuit must be ___ for current to flow.", a: "complete (closed)", wrong: ["broken", "wet", "hot"], topics: ["Electricity"] },
      { q: "A material that allows electric current to pass through it is a:", a: "conductor", wrong: ["insulator", "resistor only", "magnet"], topics: ["Electricity"] },
      { q: "The pH of a neutral solution is:", a: "7", wrong: ["0", "1", "14"], topics: ["Acids and Bases", "Matter"] },
      { q: "Which gas is used to put out fires and is denser than air?", a: "carbon dioxide", wrong: ["oxygen", "hydrogen", "helium"], topics: ["Matter", "Safety"] },
      { q: "Soil that contains a good mix of sand, silt and clay is:", a: "loam", wrong: ["pure clay", "pure sand", "gravel"], topics: ["Environment", "Soil"] },
      { q: "The process by which water changes to vapour is:", a: "evaporation", wrong: ["condensation", "precipitation", "infiltration"], topics: ["Matter", "Environment"] },
      { q: "Living things are grouped into five large groups called:", a: "kingdoms", wrong: ["families", "colonies", "orders"], topics: ["Classification of Living Things", "Cells"] },
      { q: "The tiny building blocks that make up all matter are:", a: "atoms", wrong: ["cells", "organs", "molecules only"], topics: ["Chemistry: Atoms & Matter", "Matter"] },
      { q: "Speed is calculated as distance divided by:", a: "time", wrong: ["mass", "force", "area"], topics: ["Physics: Motion & Forces", "Forces"] },
      { q: "A push or a pull acting on an object is a:", a: "force", wrong: ["mass", "weight only", "energy"], topics: ["Physics: Motion & Forces", "Forces"] },
      { q: "Energy from moving water used to turn turbines is:", a: "hydroelectric power", wrong: ["solar power", "wind power", "geothermal power"], topics: ["Energy & Electricity", "Energy"] },
      { q: "Steam rising from Ol Karia in Kenya is used to generate:", a: "geothermal electricity", wrong: ["hydroelectric power", "nuclear power", "wind power"], topics: ["Energy & Electricity", "Environment"] },
      { q: "A change that forms a new substance and is hard to reverse is a:", a: "chemical change", wrong: ["physical change", "state change", "size change"], topics: ["Chemical Reactions", "Matter"] },
      { q: "Iron and sulphur can be separated using a:", a: "magnet (iron is magnetic)", wrong: ["sieve", "filter paper", "thermometer"], topics: ["Mixtures", "Chemistry: Atoms & Matter"] },
      { q: "The offspring of living things resemble their parents because of:", a: "genes passed on during reproduction", wrong: ["the food they eat", "the weather", "their habitat only"], topics: ["Genetics & Reproduction", "Cell Biology"] },
      { q: "A group of organs working together to do a job is an:", a: "organ system", wrong: ["a single cell", "a tissue", "an ecosystem"], topics: ["Cell Biology", "Cells"] },
      { q: "The gas released when a metal reacts with an acid is:", a: "hydrogen", wrong: ["oxygen", "carbon dioxide", "nitrogen"], topics: ["Chemical Reactions", "Acids and Bases"] },
      { q: "A first-aid step for a chemical splash on the skin is to:", a: "rinse with plenty of clean water", wrong: ["rub it with a cloth", "cover it and wait", "apply more chemical"], topics: ["Scientific Method & Safety", "Safety"] },
    ],
  },
};

// ── Senior sciences: fact banks + parametric numeric problems ──────────────
export const BIOLOGY: FactBankConfig = {
  byBand: {
    senior: [
      { q: "The process by which plants lose water vapour through stomata is:", a: "transpiration", wrong: ["respiration", "translocation", "guttation"], topics: ["Transport in Plants & Animals", "Nutrition & Digestion"] },
      { q: "Enzymes are biological catalysts made of:", a: "protein", wrong: ["carbohydrate", "lipid", "nucleic acid"], topics: ["Nutrition & Digestion", "Cell Structure & Organisation"] },
      { q: "An enzyme works fastest at its:", a: "optimum temperature", wrong: ["freezing point", "boiling point", "lowest pH always"], topics: ["Nutrition & Digestion"] },
      { q: "The site of aerobic respiration in a cell is the:", a: "mitochondrion", wrong: ["ribosome", "nucleus", "chloroplast"], topics: ["Gaseous Exchange & Respiration", "Cell Structure & Organisation"] },
      { q: "Photosynthesis takes place in the:", a: "chloroplast", wrong: ["mitochondrion", "vacuole", "nucleus"], topics: ["Cell Structure & Organisation", "Nutrition & Digestion"] },
      { q: "In humans, deoxygenated blood is carried from the heart to the lungs by the:", a: "pulmonary artery", wrong: ["pulmonary vein", "aorta", "vena cava"], topics: ["Transport in Plants & Animals"] },
      { q: "The liquid part of blood that transports dissolved substances is:", a: "plasma", wrong: ["platelets", "haemoglobin", "lymph nodes"], topics: ["Transport in Plants & Animals"] },
      { q: "Red blood cells transport oxygen using the pigment:", a: "haemoglobin", wrong: ["melanin", "chlorophyll", "keratin"], topics: ["Transport in Plants & Animals", "Gaseous Exchange & Respiration"] },
      { q: "The kidney tubule where selective reabsorption mainly occurs is the:", a: "proximal convoluted tubule", wrong: ["glomerulus", "collecting duct", "ureter"], topics: ["Excretion & Homeostasis"] },
      { q: "The removal of metabolic waste from the body is:", a: "excretion", wrong: ["egestion", "secretion", "digestion"], topics: ["Excretion & Homeostasis"] },
      { q: "A cross between two heterozygotes (Aa × Aa) gives a phenotypic ratio of:", a: "3:1", wrong: ["1:1", "9:3:3:1", "1:2:1"], topics: ["Biotechnology & Genetics", "Reproduction & Development"] },
      { q: "The molecule that carries genetic information is:", a: "DNA", wrong: ["ATP", "glucose", "cellulose"], topics: ["Biotechnology & Genetics"] },
      { q: "An organism with two different alleles for a trait is:", a: "heterozygous", wrong: ["homozygous", "haploid", "recessive"], topics: ["Biotechnology & Genetics"] },
      { q: "Organisms that break down dead matter and return nutrients to the soil are:", a: "decomposers", wrong: ["producers", "primary consumers", "predators"], topics: ["Ecology & Evolution"] },
      { q: "In a food chain, green plants are the:", a: "producers", wrong: ["consumers", "decomposers", "scavengers"], topics: ["Ecology & Evolution"] },
      { q: "The hormone that lowers blood glucose is:", a: "insulin", wrong: ["glucagon", "adrenaline", "thyroxine"], topics: ["Coordination & Response", "Excretion & Homeostasis"] },
      { q: "The gas produced by respiration and breathed out is:", a: "carbon dioxide", wrong: ["oxygen", "nitrogen", "methane"], topics: ["Gaseous Exchange & Respiration"] },
      { q: "Structures in plants that allow gas exchange in leaves are the:", a: "stomata", wrong: ["xylem vessels", "root hairs", "lenticels only"], topics: ["Gaseous Exchange & Respiration", "Transport in Plants & Animals"] },
      { q: "Natural selection was proposed by:", a: "Charles Darwin", wrong: ["Gregor Mendel", "Louis Pasteur", "Robert Hooke"], topics: ["Ecology & Evolution"] },
      { q: "Support and shape in a plant cell are provided by the:", a: "cell wall", wrong: ["cell membrane", "cytoplasm", "nucleus"], topics: ["Cell Structure & Organisation"] },
      { q: "The pigment that traps light energy for photosynthesis is:", a: "chlorophyll", wrong: ["haemoglobin", "melanin", "keratin"], topics: ["Nutrition & Digestion", "Plant Biology & Nutrition"] },
      { q: "The end products of photosynthesis are glucose and:", a: "oxygen", wrong: ["carbon dioxide", "water only", "nitrogen"], topics: ["Nutrition & Digestion", "Plant Biology & Nutrition"] },
      { q: "In humans, digestion of starch begins in the:", a: "mouth", wrong: ["stomach", "small intestine", "large intestine"], topics: ["Nutrition & Digestion", "Human Physiology"] },
      { q: "The enzyme in the stomach that begins protein digestion is:", a: "pepsin", wrong: ["amylase", "lipase", "catalase"], topics: ["Nutrition & Digestion"] },
      { q: "Absorption of digested food into the blood happens mainly in the:", a: "small intestine", wrong: ["stomach", "oesophagus", "rectum"], topics: ["Nutrition & Digestion", "Human Physiology"] },
      { q: "The chambers of the human heart number:", a: "four", wrong: ["two", "three", "one"], topics: ["Transport in Plants & Animals", "Human Physiology"] },
      { q: "Valves in the heart and veins prevent:", a: "backflow of blood", wrong: ["clotting", "oxygen loss", "heartbeat"], topics: ["Transport in Plants & Animals"] },
      { q: "Water and mineral salts move up a plant through the:", a: "xylem", wrong: ["phloem", "cambium", "cortex"], topics: ["Transport in Plants & Animals", "Plant Biology & Nutrition"] },
      { q: "The main nitrogenous waste removed by the human kidney is:", a: "urea", wrong: ["glucose", "protein", "bile"], topics: ["Excretion & Homeostasis", "Human Physiology"] },
      { q: "Body temperature in humans is kept steady at about:", a: "37 °C", wrong: ["25 °C", "42 °C", "30 °C"], topics: ["Excretion & Homeostasis", "Coordination & Response"] },
      { q: "A reflex action is:", a: "a fast, automatic response to a stimulus", wrong: ["a slow, learned skill", "a conscious decision", "a hormone release only"], topics: ["Coordination & Response", "Human Physiology"] },
      { q: "Pollination is the transfer of pollen from the anther to the:", a: "stigma", wrong: ["ovule", "sepal", "root"], topics: ["Reproduction & Development", "Plant Biology & Nutrition"] },
      { q: "Bacteria are classified as:", a: "prokaryotes (no true nucleus)", wrong: ["fungi", "protozoa", "viruses"], topics: ["Classification of Living Things", "Microbiology"] },
      { q: "A food web differs from a food chain because it shows:", a: "many interconnected feeding relationships", wrong: ["only one predator", "only plants", "energy going in a circle"], topics: ["Ecology & Environment", "Ecology & Evolution"] },
      { q: "The process by which nitrogen gas is made available to plants by soil bacteria is:", a: "nitrogen fixation", wrong: ["photosynthesis", "transpiration", "respiration"], topics: ["Ecology & Environment", "Plant Biology & Nutrition"] },
    ],
  },
};
export const CHEMISTRY: FactBankConfig = {
  byBand: {
    senior: [
      { q: "The number of protons in an atom is its:", a: "atomic number", wrong: ["mass number", "valency", "isotope number"], topics: ["Structure of the Atom", "Periodic Table & Bonding"] },
      { q: "Atoms of the same element with different numbers of neutrons are:", a: "isotopes", wrong: ["ions", "allotropes", "molecules"], topics: ["Structure of the Atom"] },
      { q: "A bond formed by transfer of electrons between a metal and a non-metal is:", a: "ionic", wrong: ["covalent", "metallic", "hydrogen"], topics: ["Periodic Table & Bonding"] },
      { q: "A bond formed by sharing electrons between non-metals is:", a: "covalent", wrong: ["ionic", "metallic", "dative only"], topics: ["Periodic Table & Bonding"] },
      { q: "Elements in the same group of the periodic table have the same number of:", a: "outer-shell electrons", wrong: ["neutrons", "protons", "energy levels"], topics: ["Periodic Table & Bonding"] },
      { q: "During electrolysis, positive ions (cations) move to the:", a: "cathode", wrong: ["anode", "electrolyte", "salt bridge"], topics: ["Electrolysis"] },
      { q: "During electrolysis, oxidation occurs at the:", a: "anode", wrong: ["cathode", "electrolyte", "voltmeter"], topics: ["Electrolysis"] },
      { q: "The general formula of alkanes is:", a: "CnH2n+2", wrong: ["CnH2n", "CnH2n-2", "CnHn"], topics: ["Organic Chemistry: Alkanes & Alkenes"] },
      { q: "Alkenes are described as unsaturated because they contain a:", a: "carbon–carbon double bond", wrong: ["single bond only", "triple bond only", "ionic bond"], topics: ["Organic Chemistry: Alkanes & Alkenes"] },
      { q: "The functional group of alcohols is:", a: "–OH (hydroxyl)", wrong: ["–COOH", "–CHO", "–NH2"], topics: ["Organic: Alcohols & Acids"] },
      { q: "Adding an acid to a base produces a salt and:", a: "water", wrong: ["hydrogen", "oxygen", "carbon dioxide"], topics: ["Volumetric Analysis"] },
      { q: "An acid added to a carbonate produces a salt, water and:", a: "carbon dioxide", wrong: ["hydrogen", "oxygen", "ammonia"], topics: ["Volumetric Analysis"] },
      { q: "Which gas turns limewater milky?", a: "carbon dioxide", wrong: ["oxygen", "hydrogen", "ammonia"], topics: ["Air, Water & Environmental Chemistry"] },
      { q: "Which gas relights a glowing splint?", a: "oxygen", wrong: ["carbon dioxide", "hydrogen", "nitrogen"], topics: ["Air, Water & Environmental Chemistry"] },
      { q: "Hydrogen gas burns with a characteristic:", a: "pop sound", wrong: ["milky colour", "green flame", "loud bang and smoke"], topics: ["Air, Water & Environmental Chemistry"] },
      { q: "The catalyst used in the Haber process is:", a: "iron", wrong: ["platinum", "nickel", "manganese(IV) oxide"], topics: ["Industrial Processes in Kenya"] },
      { q: "The Contact process is used to manufacture:", a: "sulphuric acid", wrong: ["nitric acid", "ammonia", "sodium hydroxide"], topics: ["Industrial Processes in Kenya"] },
      { q: "An oxidising agent is a substance that:", a: "gains electrons", wrong: ["loses electrons", "loses protons", "gains protons"], topics: ["Electrolysis", "Volumetric Analysis"] },
      { q: "A substance that speeds up a reaction without being used up is a:", a: "catalyst", wrong: ["reactant", "product", "solvent"], topics: ["Industrial Processes in Kenya"] },
      { q: "The pH of a strongly acidic solution is closest to:", a: "1", wrong: ["7", "10", "14"], topics: ["Volumetric Analysis", "Structure of the Atom"] },
      { q: "The particles in the nucleus of an atom are:", a: "protons and neutrons", wrong: ["protons and electrons", "electrons only", "neutrons only"], topics: ["Structure of the Atom"] },
      { q: "Group 1 elements of the periodic table are known as the:", a: "alkali metals", wrong: ["halogens", "noble gases", "transition metals"], topics: ["Periodic Table & Bonding"] },
      { q: "Group 7 elements are known as the:", a: "halogens", wrong: ["alkali metals", "noble gases", "alkaline earth metals"], topics: ["Periodic Table & Bonding"] },
      { q: "Group 8 (0) elements are unreactive because they have:", a: "a full outer electron shell", wrong: ["no electrons", "one outer electron", "no protons"], topics: ["Periodic Table & Bonding", "Structure of the Atom"] },
      { q: "Metals conduct electricity because they have:", a: "free (delocalised) electrons", wrong: ["free protons", "no electrons", "large atoms only"], topics: ["Periodic Table & Bonding"] },
      { q: "A concentrated solution has, compared with a dilute one:", a: "more solute per unit of solvent", wrong: ["less solute", "no solute", "a lower temperature"], topics: ["Volumetric Analysis"] },
      { q: "A blue litmus paper turns red in:", a: "an acid", wrong: ["a base", "pure water", "a salt solution"], topics: ["Acids, Bases & Salts", "Volumetric Analysis"] },
      { q: "Rusting of iron needs both oxygen and:", a: "water", wrong: ["carbon dioxide", "nitrogen", "sunlight"], topics: ["Air, Water & Environmental Chemistry"] },
      { q: "The gas that makes up about 78% of the air is:", a: "nitrogen", wrong: ["oxygen", "carbon dioxide", "argon"], topics: ["Air, Water & Environmental Chemistry"] },
      { q: "Fractional distillation of crude oil separates it using differences in:", a: "boiling point", wrong: ["colour", "density only", "smell"], topics: ["Organic Chemistry: Alkanes & Alkenes", "Industrial Processes in Kenya"] },
      { q: "Ethene (an alkene) can be turned into the plastic:", a: "polythene", wrong: ["nylon", "rubber", "glass"], topics: ["Organic Chemistry: Alkanes & Alkenes"] },
      { q: "A physical change, unlike a chemical change, is usually:", a: "easily reversible with no new substance formed", wrong: ["always permanent", "always exothermic", "impossible to reverse"], topics: ["Structure of the Atom", "Acids, Bases & Salts"] },
    ],
  },
};
export const PHYSICS: FactBankConfig = {
  byBand: {
    senior: [
      { q: "The SI unit of force is the:", a: "newton", wrong: ["joule", "watt", "pascal"], topics: ["Mechanics: Statics & Dynamics"] },
      { q: "The SI unit of energy and work is the:", a: "joule", wrong: ["newton", "watt", "volt"], topics: ["Mechanics: Statics & Dynamics", "Thermodynamics & Heat"] },
      { q: "Power is the rate of doing work, measured in:", a: "watts", wrong: ["joules", "newtons", "amperes"], topics: ["Mechanics: Statics & Dynamics"] },
      { q: "Which quantity is a vector?", a: "velocity", wrong: ["speed", "mass", "temperature"], topics: ["Circular & Projectile Motion", "Mechanics: Statics & Dynamics"] },
      { q: "Which quantity is a scalar?", a: "distance", wrong: ["displacement", "acceleration", "momentum"], topics: ["Mechanics: Statics & Dynamics"] },
      { q: "Acceleration due to gravity near the Earth's surface is about:", a: "10 m/s²", wrong: ["1 m/s²", "100 m/s²", "0 m/s²"], topics: ["Circular & Projectile Motion", "Mechanics: Statics & Dynamics"] },
      { q: "The bending of light as it passes from one medium to another is:", a: "refraction", wrong: ["reflection", "diffraction", "dispersion"], topics: ["Waves & Optics"] },
      { q: "The splitting of white light into its colours is:", a: "dispersion", wrong: ["refraction", "reflection", "polarisation"], topics: ["Waves & Optics"] },
      { q: "Sound waves are:", a: "longitudinal", wrong: ["transverse", "electromagnetic", "stationary only"], topics: ["Waves & Optics"] },
      { q: "In a transformer, the voltage ratio Vp/Vs equals:", a: "Np/Ns", wrong: ["Ns/Np", "Ip/Is", "Pp/Ps"], topics: ["Electromagnetism"] },
      { q: "Ohm's law states that V equals:", a: "I × R", wrong: ["I ÷ R", "R ÷ I", "I + R"], topics: ["Electricity: Current & Resistance"] },
      { q: "Components connected in series share the same:", a: "current", wrong: ["voltage", "resistance", "power"], topics: ["Electricity: Current & Resistance"] },
      { q: "The minimum frequency of light needed to eject electrons from a metal is the:", a: "threshold frequency", wrong: ["resonant frequency", "critical angle", "fundamental frequency"], topics: ["Modern Physics: Photoelectric"] },
      { q: "In the photoelectric effect, light behaves as:", a: "packets called photons", wrong: ["a continuous wave only", "a stream of protons", "sound"], topics: ["Modern Physics: Photoelectric"] },
      { q: "Half-life is the time taken for half the ___ to decay.", a: "radioactive nuclei", wrong: ["electrons", "photons", "atoms of a stable element"], topics: ["Radioactivity & Nuclear"] },
      { q: "Which radiation is stopped by a sheet of paper?", a: "alpha", wrong: ["beta", "gamma", "X-rays"], topics: ["Radioactivity & Nuclear"] },
      { q: "Heat transfer through a vacuum occurs by:", a: "radiation", wrong: ["conduction", "convection", "evaporation"], topics: ["Thermodynamics & Heat"] },
      { q: "Heat transfer through a solid metal bar occurs mainly by:", a: "conduction", wrong: ["convection", "radiation", "advection"], topics: ["Thermodynamics & Heat"] },
      { q: "The turning effect of a force about a pivot is called:", a: "moment", wrong: ["momentum", "impulse", "inertia"], topics: ["Mechanics: Statics & Dynamics"] },
      { q: "Momentum is the product of mass and:", a: "velocity", wrong: ["acceleration", "force", "time"], topics: ["Circular & Projectile Motion", "Mechanics: Statics & Dynamics"] },
      { q: "Newton's first law says an object stays at rest or moves at constant velocity unless acted on by a:", a: "resultant (net) force", wrong: ["balanced force", "gravitational field only", "magnetic field only"], topics: ["Mechanics: Statics & Dynamics", "Newton's Laws of Motion"] },
      { q: "Newton's third law says every action has an equal and opposite:", a: "reaction", wrong: ["acceleration", "friction", "weight"], topics: ["Mechanics: Statics & Dynamics", "Newton's Laws of Motion"] },
      { q: "The weight of an object is the force of gravity on its:", a: "mass", wrong: ["volume", "density", "surface area"], topics: ["Mechanics: Statics & Dynamics"] },
      { q: "Density is calculated as mass divided by:", a: "volume", wrong: ["area", "time", "weight"], topics: ["Mechanics: Statics & Dynamics", "Thermodynamics & Heat"] },
      { q: "Pressure is force divided by the:", a: "area it acts on", wrong: ["time it acts for", "distance moved", "mass"], topics: ["Mechanics: Statics & Dynamics"] },
      { q: "The angle of incidence equals the angle of reflection for a:", a: "plane mirror", wrong: ["converging lens", "prism", "diffraction grating"], topics: ["Waves & Optics", "Light & Optics"] },
      { q: "The number of complete waves passing a point each second is the:", a: "frequency", wrong: ["wavelength", "amplitude", "speed"], topics: ["Waves & Optics", "Waves & Sound"] },
      { q: "Like charges ___ and unlike charges ___ .", a: "repel; attract", wrong: ["attract; repel", "repel; repel", "attract; attract"], topics: ["Electricity: Current & Resistance", "Electricity & Magnetism"] },
      { q: "A device that changes electrical energy into kinetic energy is an:", a: "electric motor", wrong: ["generator", "transformer", "resistor"], topics: ["Electromagnetism", "Electricity & Magnetism"] },
      { q: "In a parallel circuit, each branch has the same:", a: "voltage across it", wrong: ["current through it", "resistance", "power"], topics: ["Electricity: Current & Resistance"] },
      { q: "Adding heat to a solid until it becomes a liquid is:", a: "melting", wrong: ["boiling", "condensation", "sublimation"], topics: ["Thermodynamics & Heat"] },
      { q: "A gamma ray, compared with an alpha particle, is:", a: "far more penetrating", wrong: ["heavier", "positively charged", "stopped by paper"], topics: ["Radioactivity & Nuclear", "Nuclear Physics"] },
    ],
  },
};

function physicsNumeric(ctx: GenContext): Question[] {
  const rng = ctx.rng;
  const out: Question[] = [];
  for (let i = 0; i < 40 && out.length < 16; i++) {
    const kind = i % 4;
    if (kind === 0) {
      const d = randInt(rng, 20, 200), t = randInt(rng, 2, 20);
      const q = numericMCQ(rng, `A car travels ${d} m in ${t} s. What is its average speed?`, Math.round((d / t) * 100) / 100, { unit: "m/s", allowNegative: false });
      if (q) out.push(q);
    } else if (kind === 1) {
      const m = randInt(rng, 2, 50), a = randInt(rng, 1, 10);
      const q = numericMCQ(rng, `Find the force needed to accelerate a ${m} kg mass at ${a} m/s².`, m * a, { unit: "N", allowNegative: false });
      if (q) out.push(q);
    } else if (kind === 2) {
      const f = randInt(rng, 5, 60), s = randInt(rng, 2, 15);
      const q = numericMCQ(rng, `Calculate the work done when a force of ${f} N moves an object ${s} m in its direction.`, f * s, { unit: "J", allowNegative: false });
      if (q) out.push(q);
    } else {
      const m = randInt(rng, 1, 20), h = randInt(rng, 2, 30);
      const q = numericMCQ(rng, `Find the potential energy of a ${m} kg object ${h} m above the ground. (g = 10 N/kg)`, m * h * 10, { unit: "J", allowNegative: false });
      if (q) out.push(q);
    }
  }
  return out;
}

function chemistryNumeric(ctx: GenContext): Question[] {
  const rng = ctx.rng;
  const out: Question[] = [];
  const rmm: [string, number][] = [["H₂O", 18], ["CO₂", 44], ["NaCl", 58.5], ["CaCO₃", 100], ["O₂", 32], ["NH₃", 17]];
  for (let i = 0; i < 30 && out.length < 12; i++) {
    if (i % 2 === 0) {
      const [name, mass] = pick(rng, rmm);
      const moles = pick(rng, [0.5, 1, 2, 2.5, 3]);
      const q = numericMCQ(rng, `Find the mass of ${moles} moles of ${name} (RMM = ${mass}).`, Math.round(moles * mass * 100) / 100, { unit: "g", allowNegative: false });
      if (q) out.push(q);
    } else {
      const [name, mass] = pick(rng, rmm);
      const grams = mass * pick(rng, [1, 2, 3]);
      const q = numericMCQ(rng, `How many moles are in ${grams} g of ${name} (RMM = ${mass})?`, Math.round((grams / mass) * 100) / 100, { unit: "mol", allowNegative: false, spread: 1 });
      if (q) out.push(q);
    }
  }
  return out;
}

// ── Exported generators ────────────────────────────────────────────────────
export const ENV_FACTS: FactBankConfig = { byBand: { lower: ENV } };
export const environmentalActivitiesGenerator: SubjectGenerator = makeFactBankGenerator(ENV_FACTS);
export const integratedScienceGenerator: SubjectGenerator = makeFactBankGenerator(INTEGRATED);

const bioFacts = makeFactBankGenerator(BIOLOGY);
const chemFacts = makeFactBankGenerator(CHEMISTRY);
const physFacts = makeFactBankGenerator(PHYSICS);

export const biologyGenerator: SubjectGenerator = (ctx) => {
  const base = bioFacts(ctx);
  // 8-4-4 Biology (junior band) falls back to the integrated-science pool.
  return base.length >= 15 || resolveFacts(BIOLOGY, ctx).length ? base : shuffle(ctx.rng, [...base, ...integratedScienceGenerator(ctx)]);
};
export const chemistryGenerator: SubjectGenerator = (ctx) => shuffle(ctx.rng, [...chemFacts(ctx), ...chemistryNumeric(ctx)]);
export const physicsGenerator: SubjectGenerator = (ctx) => shuffle(ctx.rng, [...physFacts(ctx), ...physicsNumeric(ctx)]);
