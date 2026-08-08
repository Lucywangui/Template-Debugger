import { TEMPLATE_SUBJECTS_BY_GRADE } from "@/components/Generators/questionTemplates";

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export type MaterialType = "topical" | "exam";

export interface Material {
  id: string;
  gradeKey: string;
  subject: string;
  title: string;
  type: MaterialType;
  seedIndex: number;
  topics: string[];
}

// ─── Topic definitions per curriculum level ────────────────────────────────────

const TOPICS_LOWER: Record<string, string[]> = {
  "Christian Religious Education": [
    "Creation & Thanksgiving", "Prayer & Worship", "Family & Love",
    "Sharing & Caring", "Honesty & Truth", "Forgiveness & Peace",
    "Values & Virtues", "Celebrations & Festivals",
  ],
  "Creative Arts": [
    "Drawing & Painting", "Paper Craft", "Clay Modelling",
    "Music & Singing", "Drama & Role Play", "Dance & Movement",
    "Weaving & Patterns", "Printing Techniques",
  ],
  "English": [
    "Reading & Phonics", "Spelling & Dictation", "Nouns & Verbs",
    "Vocabulary Building", "Listening & Speaking", "Reading Comprehension",
    "Creative Writing", "Composition", "Oral Storytelling", "Sentence Structure",
  ],
  "Environmental Activities": [
    "Our School & Home", "Plants Around Us", "Animals & Habitats",
    "Weather & Seasons", "Water & Its Uses", "Transport & Roads",
    "Health & Hygiene", "Food & Nutrition", "Community Helpers", "Soil & Land Use",
  ],
  "Hygiene and Nutrition": [
    "Personal Hygiene", "Healthy Eating", "Food Groups",
    "Balanced Diet", "Clean Water", "Disease Prevention",
    "Safety at Home", "Exercise & Rest", "Food Safety", "First Aid",
  ],
  "Kiswahili": [
    "Kusoma & Silabi", "Kuandika Sentensi", "Nomino & Vitenzi",
    "Msamiati Mpya", "Mazungumzo", "Hadithi Fupi",
    "Mashairi & Nyimbo", "Sarufi ya Msingi", "Ubunifu wa Lugha", "Kusikia & Kuzungumza",
  ],
  "Mathematics": [
    "Numbers 1–100", "Addition", "Subtraction",
    "Multiplication Basics", "Shapes & Geometry", "Measurement",
    "Money (KSh)", "Time & Calendar", "Patterns & Sequences", "Fractions (½ & ¼)",
  ],
};

const TOPICS_UPPER: Record<string, string[]> = {
  "Agriculture": [
    "Soil & Land Preparation", "Crop Farming", "Animal Husbandry",
    "Plant Nutrients", "Pests & Diseases", "Farm Tools & Equipment",
    "Water Management", "Agribusiness Basics",
  ],
  "Creative Arts": [
    "Drawing & Painting", "Music Theory & Practice", "Drama & Theatre",
    "Craft & Textile", "Digital Art Basics", "Photography Appreciation",
    "Architecture & Design", "Performance Arts",
  ],
  "English": [
    "Reading Comprehension", "Essay Writing", "Parts of Speech",
    "Vocabulary & Idioms", "Oral & Listening Skills", "Literature: Prose",
    "Creative Writing", "Functional Writing",
  ],
  "Home Science": [
    "Food & Nutrition", "Cooking Skills", "Clothing & Textiles",
    "Home Management", "Personal Hygiene", "Consumer Education",
    "Kitchen Safety", "Budgeting & Shopping",
  ],
  "Kiswahili": [
    "Ufahamu", "Insha ya Ubunifu", "Sarufi: Vitenzi",
    "Msamiati & Methali", "Mazungumzo", "Fasihi: Hadithi",
    "Uandishi wa Barua", "Ushairi",
  ],
  "Mathematics": [
    "Whole Numbers & Place Value", "Fractions & Decimals", "Percentages & Ratios",
    "Algebra & Patterns", "Geometry & Angles", "Area & Perimeter",
    "Data & Statistics", "Financial Mathematics",
  ],
  "Social Studies": [
    "Our County & Country", "Physical Geography of Kenya", "Kenya's History",
    "Government & Citizenship", "Economic Activities", "African Countries & Capitals",
    "Culture & Traditions", "Settlement & Population",
  ],
};

const TOPICS_JUNIOR: Record<string, string[]> = {
  "Agriculture": [
    "Crop Science", "Animal Production", "Soil Science",
    "Farm Management", "Agro-Processing", "Horticulture",
    "Fish & Poultry Farming", "Agricultural Economics",
  ],
  "Computer Science": [
    "Computer Hardware & Systems", "Programming Fundamentals", "Data Structures & Algorithms",
    "Databases & SQL", "Networking & Internet", "Operating Systems",
    "Cybersecurity Basics", "Software Engineering",
  ],
  "Creative Arts and Sports": [
    "Visual Arts & Design", "Music Composition", "Drama & Performance",
    "Sports Science", "Physical Education", "Photography & Film",
    "Fashion & Textiles", "Digital Creativity",
  ],
  "English": [
    "Comprehension & Summary", "Essay & Report Writing", "Advanced Grammar",
    "Literature: Novel Analysis", "Poetry Analysis", "Drama & Performance",
    "Oral Communication", "Functional & Research Writing",
  ],
  "Health Education": [
    "Personal Health", "Human Body & Health", "Nutrition",
    "Disease Prevention", "First Aid", "Safety & Risk Prevention",
    "Physical Activity", "Mental & Social Wellbeing",
  ],
  "Home Science": [
    "Food & Nutrition", "Cooking Skills", "Clothing & Textiles",
    "Home Management", "Personal Hygiene", "Consumer Education",
    "Kitchen Safety", "Budgeting & Shopping",
  ],
  "Integrated Science": [
    "Scientific Method & Safety", "Cell Biology", "Chemistry: Atoms & Matter",
    "Physics: Motion & Forces", "Ecology & Environment", "Genetics & Reproduction",
    "Energy & Electricity", "Chemical Reactions",
  ],
  "Kiswahili": [
    "Ufahamu wa Kisanaa", "Insha ya Masimulizi", "Sarufi ya Kina",
    "Fasihi: Riwaya", "Ushairi wa Kisasa", "Michezo ya Kuigiza",
    "Mazungumzo Rasmi", "Utafiti wa Lugha",
  ],
  "Mathematics": [
    "Number Theory & Operations", "Algebra & Linear Equations", "Geometry & Triangles",
    "Statistics & Probability", "Financial Mathematics", "Trigonometry Basics",
    "Quadratic Expressions", "Coordinate Geometry",
  ],
  "Pre-Technical Studies": [
    "Technical Drawing", "Woodwork Basics", "Metalwork & Fabrication",
    "Electrical Wiring", "Masonry & Construction", "Plumbing Basics",
    "Electronics Fundamentals", "Workshop Safety & Practice",
  ],
  "Social Studies": [
    "East African History", "African Geography", "Government & Democracy",
    "Economic Development", "Cultural Heritage", "Environmental Studies",
    "Global Relations", "Human Rights & Citizenship",
  ],
};

const TOPICS_BY_SOURCE_GRADE: Record<string, Record<string, string[]>> = {
  "Grade 1": TOPICS_LOWER,
  "Grade 2": TOPICS_LOWER,
  "Grade 3": TOPICS_LOWER,
  "Grade 4": TOPICS_UPPER,
  "Grade 5": TOPICS_UPPER,
  "Grade 6": TOPICS_UPPER,
  "Grade 7": TOPICS_JUNIOR,
  "Grade 8": TOPICS_JUNIOR,
  "Grade 9": TOPICS_JUNIOR,
};

const TOPICS_SENIOR: Record<string, string[]> = {
  "Mathematics": [
    "Algebra & Functions", "Trigonometry", "Differentiation (Calculus)",
    "Integration (Calculus)", "Statistics & Probability", "Matrices & Vectors",
    "Complex Numbers", "Sequences & Series",
  ],
  "English": [
    "Language Skills & Grammar", "Literature: Prose", "Literature: Poetry",
    "Literature: Drama", "Oral Communication", "Essay & Report Writing",
    "Critical Analysis", "Language in Context",
  ],
  "Kiswahili": [
    "Lugha na Sarufi ya Juu", "Fasihi: Riwaya", "Ushairi wa Kisasa",
    "Fasihi: Tamthilia", "Mazungumzo Rasmi", "Uandishi wa Utafiti",
    "Historia ya Kiswahili", "Fasihi Linganishi",
  ],
  "Physics": [
    "Mechanics & Motion", "Newton's Laws of Motion", "Waves & Sound",
    "Light & Optics", "Electricity & Magnetism", "Thermodynamics",
    "Modern Physics", "Nuclear Physics",
  ],
  "Chemistry": [
    "Atomic Structure", "Chemical Bonding", "Acids, Bases & Salts",
    "Organic Chemistry", "Electrochemistry", "Rates of Reaction",
    "Chemical Equilibrium", "Environmental Chemistry",
  ],
  "Biology": [
    "Cell Biology & Organelles", "Genetics & Evolution", "Ecology & Environment",
    "Human Physiology", "Plant Biology & Nutrition", "Microbiology",
    "Classification of Living Things", "Biotechnology & Genetics",
  ],
  "History and Citizenship": [
    "Pre-Colonial African History", "Colonial Era in Kenya", "Kenyan Independence Movement",
    "Post-Independence Africa", "World History: 20th Century", "African Political Systems",
    "Economic History of Africa", "Contemporary African Issues",
  ],
  "Geography": [
    "Physical Geography of Kenya", "Human Geography & Population", "Climate & Weather Systems",
    "Natural Resources & Environment", "Geomorphology & Landforms", "Agriculture & Land Use",
    "Settlement & Urbanisation", "Map Work & GIS Tools",
  ],
  "Business Studies": [
    "Business Environment", "Entrepreneurship & Innovation", "Accounting Basics",
    "Marketing & Commerce", "Office Management", "Business Law & Ethics",
    "Financial Management", "Business Economics",
  ],
  "Computer Science": [
    "Computer Hardware & Systems", "Programming Fundamentals", "Data Structures & Algorithms",
    "Databases & SQL", "Networking & Internet", "Operating Systems",
    "Cybersecurity Basics", "Software Engineering",
  ],
  "Christian Religious Education": [
    "Biblical Studies", "Christian Living", "Ethics & Morality",
    "World Religions", "Church History", "Environmental Ethics",
    "Justice & Peacemaking", "Faith in Society",
  ],
  "Fasihi ya Kiswahili": [
    "Riwaya", "Ushairi", "Tamthilia", "Hadithi Fupi",
    "Fasihi Simulizi", "Wahusika na Mandhari", "Maudhui na Dhamira", "Mbinu za Lugha",
  ],
  "Home Science": [
    "Food & Nutrition", "Cooking Skills", "Clothing & Textiles",
    "Home Management", "Personal Hygiene", "Consumer Education",
    "Kitchen Safety", "Budgeting & Shopping",
  ],
  "Literature": [
    "Literary Genres", "Poetry Analysis", "Prose Analysis",
    "Drama & Performance", "Characterisation", "Themes & Diction",
    "Setting & Plot", "Literary Devices",
  ],
};

TOPICS_BY_SOURCE_GRADE["Grade 10"] = TOPICS_SENIOR;
TOPICS_BY_SOURCE_GRADE["Grade 11"] = TOPICS_SENIOR;
TOPICS_BY_SOURCE_GRADE["Grade 12"] = TOPICS_SENIOR;

// 8-4-4 topics (same subjects, slightly different framing)
const TOPICS_844: Record<string, string[]> = {
  "Mathematics": [
    "Algebra & Surds", "Trigonometry & Identities", "Differentiation",
    "Integration & Applications", "Statistics & Probability", "Matrices & Transformations",
    "Vectors in 3D", "Sequences, Series & Binomial",
  ],
  "English": [
    "Grammar & Usage", "Comprehension & Summary", "Literature: Set Texts (Prose)",
    "Literature: Set Texts (Poetry)", "Literature: Set Texts (Drama)", "Oral & Listening",
    "Composition & Essays", "Language Functions",
  ],
  "Kiswahili": [
    "Sarufi ya Lugha", "Ufahamu na Muhtasari", "Fasihi ya Kiswahili: Riwaya",
    "Fasihi: Ushairi wa Diwani", "Fasihi: Tamthilia", "Mazungumzo ya Kila Siku",
    "Uandishi wa Makala", "Historia ya Fasihi",
  ],
  "Physics": [
    "Mechanics: Statics & Dynamics", "Circular & Projectile Motion", "Waves & Optics",
    "Electricity: Current & Resistance", "Electromagnetism", "Thermodynamics & Heat",
    "Modern Physics: Photoelectric", "Radioactivity & Nuclear",
  ],
  "Chemistry": [
    "Structure of the Atom", "Periodic Table & Bonding", "Volumetric Analysis",
    "Organic Chemistry: Alkanes & Alkenes", "Organic: Alcohols & Acids", "Electrolysis",
    "Industrial Processes in Kenya", "Air, Water & Environmental Chemistry",
  ],
  "Biology": [
    "Cell Structure & Organisation", "Nutrition & Digestion", "Gaseous Exchange & Respiration",
    "Transport in Plants & Animals", "Excretion & Homeostasis", "Coordination & Response",
    "Reproduction & Development", "Ecology & Evolution",
  ],
  "History": [
    "African Societies Before Colonialism", "The Scramble for Africa", "Colonial Administration",
    "Nationalist Movements in Africa", "Kenya's Path to Independence", "Post-Independence Governance",
    "Economic Development Policies", "Pan-Africanism & Regional Co-operation",
  ],
  "Geography": [
    "Internal Land-Forming Processes", "External Land-Forming Processes", "Climate Types of Africa",
    "Soils & Vegetation of Kenya", "Water & Drainage in Africa", "Agriculture in Kenya & Africa",
    "Population & Migration", "Industry, Trade & Transport",
  ],
  "Business Studies": [
    "Nature & Types of Business", "Trade & Commerce", "Business Finance",
    "Accounting: Double Entry", "Accounts: Final Accounts", "Marketing Mix",
    "Insurance & Risk Management", "Office Practice & Organisation",
  ],
  "Computer Science": [
    "Hardware: Input, Processing, Output", "Software & Operating Systems", "Number Systems",
    "Programming Concepts", "Spreadsheets & Databases", "Networking & Internet",
    "Data Management & Security", "Emerging Technologies in Kenya",
  ],
};

// ─── Grade definitions ─────────────────────────────────────────────────────────

const GRADES = [
  "cbc-1", "cbc-2", "cbc-3",
  "cbc-4", "cbc-5", "cbc-6",
  "cbc-7", "cbc-8", "cbc-9",
  "senior-10", "senior-11", "senior-12",
  "844-form1", "844-form2", "844-form3", "844-form4",
];

function getTopicsForGrade(gradeKey: string): Record<string, string[]> {
  const sourceGrade = gradeKey.startsWith("cbc-")
    ? `Grade ${gradeKey.slice(4)}`
    : gradeKey.startsWith("senior-")
      ? `Grade ${gradeKey.slice(7)}`
      : null;
  if (sourceGrade) {
    const subjects = TEMPLATE_SUBJECTS_BY_GRADE[sourceGrade as keyof typeof TEMPLATE_SUBJECTS_BY_GRADE];
    const sourceTopics = TOPICS_BY_SOURCE_GRADE[sourceGrade];
    const topics: Record<string, string[]> = {};
    for (const subject of subjects ?? []) {
      const subjectTopics = sourceTopics?.[subject];
      if (subjectTopics) topics[subject] = subjectTopics;
    }
    return topics;
  }
  return TOPICS_844;
}

export function getSubjectsForGrade(gradeKey: string): string[] {
  return Object.keys(getTopicsForGrade(gradeKey));
}

// ─── Material title builder ────────────────────────────────────────────────────

function topicPair(topics: string[], topicalIndex: number): string[] {
  const n = topics.length;
  // cycle in pairs; every 3rd topical uses 3 topics
  const base = (topicalIndex * 2) % n;
  const t1 = topics[base % n];
  const t2 = topics[(base + 1) % n];
  if (topicalIndex % 3 === 2) {
    const t3 = topics[(base + 2) % n];
    return [t1, t2, t3];
  }
  return [t1, t2];
}

function topicTitle(subject: string, topics: string[]): string {
  if (topics.length === 3) return `${subject}: ${topics[0]}, ${topics[1]} & ${topics[2]}`;
  return `${subject}: ${topics[0]} & ${topics[1]}`;
}

// ─── Generator ────────────────────────────────────────────────────────────────

function materialsPerSubject(gradeKey: string): number {
  if (["cbc-1","cbc-2","cbc-3"].includes(gradeKey)) return 34; // 6 × 34 = 204
  if (["cbc-4","cbc-5","cbc-6"].includes(gradeKey)) return 23; // 9 × 23 = 207
  if (["cbc-7","cbc-8","cbc-9"].includes(gradeKey)) return 23; // 9 × 23 = 207
  return 21; // 10 × 21 = 210 for Senior & 8-4-4
}

function generateMaterials(): Material[] {
  const all: Material[] = [];
  let seed = 1000;

  for (const grade of GRADES) {
    const topicsMap = getTopicsForGrade(grade);
    const subjects = Object.keys(topicsMap);
    const count = materialsPerSubject(grade);

    for (const subject of subjects) {
      const topics = topicsMap[subject];
      let topicalIdx = 0;

      for (let i = 1; i <= count; i++) {
        const isExam = i % 5 === 0;
        const type: MaterialType = isExam ? "exam" : "topical";
        const slug = subject.toLowerCase().replace(/[\s&,()/:]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const id = `${grade}-${slug}-${type}-${i}`;

        let title: string;
        let mTopics: string[];

        if (isExam) {
          title = `${subject} – End-of-Term Examination`;
          mTopics = topics.slice(); // all topics
        } else {
          mTopics = topicPair(topics, topicalIdx++);
          title = topicTitle(subject, mTopics);
        }

        all.push({ id, gradeKey: grade, subject, title, type, seedIndex: seed++, topics: mTopics });
      }
    }
  }

  return all;
}

export const MATERIALS = generateMaterials();
export const SUBJECTS_BY_GRADE = (gradeKey: string) => getSubjectsForGrade(gradeKey);
