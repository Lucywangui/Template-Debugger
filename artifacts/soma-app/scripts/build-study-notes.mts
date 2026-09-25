/**
 * build-study-notes — offline content pipeline.
 *
 * For every (subject, topic) in the material catalogue, resolves an article on
 * an OPEN wiki (Wikipedia / Simple English Wikipedia / Wikipedia Kiswahili — all
 * CC BY-SA 4.0), then splits it into an overview + navigable sub-topics (from
 * the article's sections) and writes the bundled module
 * `src/data/notes.generated.ts`. The app never touches the network at runtime.
 *
 *   pnpm --filter @workspace/soma-app run build:notes
 *   pnpm --filter @workspace/soma-app run build:notes -- --only-missing
 *
 * Re-runs are incremental: entries that fetch are refreshed; entries that fail
 * keep their previous content. Derived notes are CC BY-SA 4.0 and each carries
 * its sources, which the notes screen displays.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MATERIALS } from "../src/data/materials.ts";
import type { GeneratedNote, NoteSource, NoteSubtopic } from "../src/data/notesTypes.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../src/data/notes.generated.ts");
const UA = "SomaApp-study-notes/1.0 (offline CBC learning app; contact: maintainer)";
const CONCURRENCY = 1;
const REQ_GAP_MS = 1500;
const CC_BY_SA = "CC BY-SA 4.0";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

function bandFor(gradeKey: string): "lower" | "upper" | "junior" | "senior" {
  const n = gradeKey.startsWith("cbc-") ? +gradeKey.slice(4)
    : gradeKey.startsWith("senior-") ? +gradeKey.slice(7)
    : gradeKey.startsWith("844-form") ? +gradeKey.slice(8) + 8 : 6;
  if (n <= 3) return "lower";
  if (n <= 6) return "upper";
  if (n <= 9) return "junior";
  return "senior";
}

const KISWAHILI_SUBJECTS = new Set(["Kiswahili", "Fasihi ya Kiswahili"]);

const SKIP_SECTIONS = new Set([
  "see also", "references", "further reading", "external links", "notes", "citations",
  "bibliography", "sources", "gallery", "explanatory notes", "works cited", "footnotes",
  "general and cited references", "notes and references", "references and notes", "literature",
]);

// Curated article titles for topics a plain search resolves badly.
// key = "Subject :: Topic".  Prefix "sw:" / "simple:" forces a wiki host.
const SOURCE_OVERRIDES: Record<string, string> = {
  // ── Mathematics ──
  "Mathematics :: Numbers 1–100": "simple:Natural number",
  "Mathematics :: Addition": "simple:Addition",
  "Mathematics :: Subtraction": "simple:Subtraction",
  "Mathematics :: Multiplication Basics": "simple:Multiplication",
  "Mathematics :: Shapes & Geometry": "simple:Shape",
  "Mathematics :: Measurement": "simple:Measurement",
  "Mathematics :: Money (KSh)": "simple:Money",
  "Mathematics :: Time & Calendar": "simple:Calendar",
  "Mathematics :: Patterns & Sequences": "Sequence",
  "Mathematics :: Fractions (½ & ¼)": "simple:Fraction (mathematics)",
  "Mathematics :: Whole Numbers & Place Value": "Positional notation",
  "Mathematics :: Fractions & Decimals": "Decimal",
  "Mathematics :: Percentages & Ratios": "Percentage",
  "Mathematics :: Algebra & Patterns": "Elementary algebra",
  "Mathematics :: Geometry & Angles": "Angle",
  "Mathematics :: Area & Perimeter": "Perimeter",
  "Mathematics :: Data & Statistics": "Descriptive statistics",
  "Mathematics :: Financial Mathematics": "Interest",
  "Mathematics :: Number Theory & Operations": "Number theory",
  "Mathematics :: Algebra & Linear Equations": "Linear equation",
  "Mathematics :: Geometry & Triangles": "Triangle",
  "Mathematics :: Statistics & Probability": "Probability",
  "Mathematics :: Trigonometry Basics": "Trigonometry",
  "Mathematics :: Quadratic Expressions": "Quadratic equation",
  "Mathematics :: Coordinate Geometry": "Analytic geometry",
  "Mathematics :: Algebra & Functions": "Function (mathematics)",
  "Mathematics :: Trigonometry": "Trigonometry",
  "Mathematics :: Differentiation (Calculus)": "Derivative",
  "Mathematics :: Integration (Calculus)": "Integral",
  "Mathematics :: Matrices & Vectors": "Matrix (mathematics)",
  "Mathematics :: Complex Numbers": "Complex number",
  "Mathematics :: Sequences & Series": "Series (mathematics)",
  "Mathematics :: Algebra & Surds": "Nth root",
  "Mathematics :: Trigonometry & Identities": "List of trigonometric identities",
  "Mathematics :: Differentiation": "Derivative",
  "Mathematics :: Integration & Applications": "Integral",
  "Mathematics :: Matrices & Transformations": "Transformation matrix",
  "Mathematics :: Vectors in 3D": "Euclidean vector",
  "Mathematics :: Sequences, Series & Binomial": "Binomial theorem",

  // ── English / Literature ──
  "English :: Reading & Phonics": "simple:Phonics",
  "English :: Spelling & Dictation": "Spelling",
  "English :: Nouns & Verbs": "Part of speech",
  "English :: Vocabulary Building": "Vocabulary",
  "English :: Listening & Speaking": "Listening",
  "English :: Reading Comprehension": "Reading comprehension",
  "English :: Creative Writing": "Creative writing",
  "English :: Composition": "Composition (language)",
  "English :: Oral Storytelling": "Storytelling",
  "English :: Sentence Structure": "Sentence (linguistics)",
  "English :: Parts of Speech": "Part of speech",
  "English :: Essay Writing": "Essay",
  "English :: Vocabulary & Idioms": "Idiom",
  "English :: Oral & Listening Skills": "Listening",
  "English :: Literature: Prose": "Prose",
  "English :: Functional Writing": "Business letter",
  "English :: Comprehension & Summary": "Reading comprehension",
  "English :: Essay & Report Writing": "Essay",
  "English :: Advanced Grammar": "English grammar",
  "English :: Literature: Novel Analysis": "Novel",
  "English :: Poetry Analysis": "Poetry",
  "English :: Drama & Performance": "Drama",
  "English :: Oral Communication": "Public speaking",
  "English :: Functional & Research Writing": "Research",
  "English :: Language Skills & Grammar": "English grammar",
  "English :: Literature: Poetry": "Poetry",
  "English :: Literature: Drama": "Drama",
  "English :: Critical Analysis": "Literary criticism",
  "English :: Language in Context": "Pragmatics",
  "English :: Grammar & Usage": "English grammar",
  "English :: Literature: Set Texts (Prose)": "Prose",
  "English :: Literature: Set Texts (Poetry)": "Poetry",
  "English :: Literature: Set Texts (Drama)": "Drama",
  "English :: Oral & Listening": "Listening",
  "English :: Composition & Essays": "Essay",
  "English :: Language Functions": "Functional linguistics",
  "Literature :: Literary Genres": "Literary genre",
  "Literature :: Poetry Analysis": "Poetry",
  "Literature :: Prose Analysis": "Prose",
  "Literature :: Drama & Performance": "Drama",
  "Literature :: Characterisation": "Characterization",
  "Literature :: Themes & Diction": "Theme (narrative)",
  "Literature :: Setting & Plot": "Plot (narrative)",
  "Literature :: Literary Devices": "Literary device",

  // ── Kiswahili ──
  "Kiswahili :: Kusoma & Silabi": "sw:Silabi",
  "Kiswahili :: Kuandika Sentensi": "sw:Sentensi",
  "Kiswahili :: Nomino & Vitenzi": "sw:Nomino",
  "Kiswahili :: Msamiati Mpya": "sw:Msamiati",
  "Kiswahili :: Mazungumzo": "sw:Mazungumzo",
  "Kiswahili :: Hadithi Fupi": "sw:Hadithi fupi",
  "Kiswahili :: Mashairi & Nyimbo": "sw:Shairi",
  "Kiswahili :: Sarufi ya Msingi": "sw:Sarufi",
  "Kiswahili :: Ubunifu wa Lugha": "sw:Lugha",
  "Kiswahili :: Kusikia & Kuzungumza": "sw:Mazungumzo",
  "Kiswahili :: Ufahamu": "sw:Ufahamu",
  "Kiswahili :: Insha ya Ubunifu": "sw:Insha",
  "Kiswahili :: Sarufi: Vitenzi": "sw:Kitenzi",
  "Kiswahili :: Msamiati & Methali": "sw:Methali",
  "Kiswahili :: Fasihi: Hadithi": "sw:Hadithi",
  "Kiswahili :: Uandishi wa Barua": "sw:Barua",
  "Kiswahili :: Ushairi": "sw:Ushairi",
  "Kiswahili :: Ufahamu wa Kisanaa": "sw:Ufahamu",
  "Kiswahili :: Insha ya Masimulizi": "sw:Insha",
  "Kiswahili :: Sarufi ya Kina": "sw:Sarufi",
  "Kiswahili :: Fasihi: Riwaya": "sw:Riwaya",
  "Kiswahili :: Ushairi wa Kisasa": "sw:Ushairi",
  "Kiswahili :: Michezo ya Kuigiza": "sw:Tamthilia",
  "Kiswahili :: Mazungumzo Rasmi": "sw:Mazungumzo",
  "Kiswahili :: Utafiti wa Lugha": "sw:Isimu",
  "Kiswahili :: Lugha na Sarufi ya Juu": "sw:Sarufi",
  "Kiswahili :: Fasihi: Tamthilia": "sw:Tamthilia",
  "Kiswahili :: Uandishi wa Utafiti": "sw:Utafiti",
  "Kiswahili :: Historia ya Kiswahili": "sw:Kiswahili",
  "Kiswahili :: Fasihi Linganishi": "sw:Fasihi",
  "Kiswahili :: Sarufi ya Lugha": "sw:Sarufi",
  "Kiswahili :: Ufahamu na Muhtasari": "sw:Ufahamu",
  "Kiswahili :: Fasihi ya Kiswahili: Riwaya": "sw:Riwaya",
  "Kiswahili :: Fasihi: Ushairi wa Diwani": "sw:Ushairi",
  "Kiswahili :: Mazungumzo ya Kila Siku": "sw:Mazungumzo",
  "Kiswahili :: Uandishi wa Makala": "sw:Makala",
  "Kiswahili :: Historia ya Fasihi": "sw:Fasihi",
  "Fasihi ya Kiswahili :: Riwaya": "sw:Riwaya",
  "Fasihi ya Kiswahili :: Ushairi": "sw:Ushairi",
  "Fasihi ya Kiswahili :: Tamthilia": "sw:Tamthilia",
  "Fasihi ya Kiswahili :: Hadithi Fupi": "sw:Hadithi fupi",
  "Fasihi ya Kiswahili :: Fasihi Simulizi": "sw:Fasihi simulizi",
  "Fasihi ya Kiswahili :: Wahusika na Mandhari": "sw:Fasihi",
  "Fasihi ya Kiswahili :: Maudhui na Dhamira": "sw:Fasihi",
  "Fasihi ya Kiswahili :: Mbinu za Lugha": "sw:Tamathali za usemi",

  // ── Sciences ──
  "Environmental Activities :: Our School & Home": "simple:Home",
  "Environmental Activities :: Plants Around Us": "simple:Plant",
  "Environmental Activities :: Animals & Habitats": "simple:Habitat",
  "Environmental Activities :: Weather & Seasons": "simple:Weather",
  "Environmental Activities :: Water & Its Uses": "simple:Water",
  "Environmental Activities :: Transport & Roads": "simple:Transport",
  "Environmental Activities :: Health & Hygiene": "simple:Hygiene",
  "Environmental Activities :: Food & Nutrition": "simple:Nutrition",
  "Environmental Activities :: Community Helpers": "simple:Community",
  "Environmental Activities :: Soil & Land Use": "simple:Soil",
  "Integrated Science :: Scientific Method & Safety": "Scientific method",
  "Integrated Science :: Cell Biology": "Cell (biology)",
  "Integrated Science :: Chemistry: Atoms & Matter": "Atom",
  "Integrated Science :: Physics: Motion & Forces": "Force",
  "Integrated Science :: Ecology & Environment": "Ecology",
  "Integrated Science :: Genetics & Reproduction": "Reproduction",
  "Integrated Science :: Energy & Electricity": "Electricity",
  "Integrated Science :: Chemical Reactions": "Chemical reaction",
  "Biology :: Cell Biology & Organelles": "Organelle",
  "Biology :: Genetics & Evolution": "Genetics",
  "Biology :: Ecology & Environment": "Ecology",
  "Biology :: Human Physiology": "Human body",
  "Biology :: Plant Biology & Nutrition": "Plant nutrition",
  "Biology :: Microbiology": "Microbiology",
  "Biology :: Classification of Living Things": "Taxonomy (biology)",
  "Biology :: Biotechnology & Genetics": "Biotechnology",
  "Biology :: Cell Structure & Organisation": "Cell (biology)",
  "Biology :: Nutrition & Digestion": "Digestion",
  "Biology :: Gaseous Exchange & Respiration": "Cellular respiration",
  "Biology :: Transport in Plants & Animals": "Circulatory system",
  "Biology :: Excretion & Homeostasis": "Homeostasis",
  "Biology :: Coordination & Response": "Nervous system",
  "Biology :: Reproduction & Development": "Reproduction",
  "Biology :: Ecology & Evolution": "Evolution",
  "Chemistry :: Atomic Structure": "Atom",
  "Chemistry :: Chemical Bonding": "Chemical bond",
  "Chemistry :: Acids, Bases & Salts": "Acid–base reaction",
  "Chemistry :: Organic Chemistry": "Organic chemistry",
  "Chemistry :: Electrochemistry": "Electrochemistry",
  "Chemistry :: Rates of Reaction": "Reaction rate",
  "Chemistry :: Chemical Equilibrium": "Chemical equilibrium",
  "Chemistry :: Environmental Chemistry": "Environmental chemistry",
  "Chemistry :: Structure of the Atom": "Atom",
  "Chemistry :: Periodic Table & Bonding": "Periodic table",
  "Chemistry :: Volumetric Analysis": "Titration",
  "Chemistry :: Organic Chemistry: Alkanes & Alkenes": "Alkane",
  "Chemistry :: Organic: Alcohols & Acids": "Alcohol (chemistry)",
  "Chemistry :: Electrolysis": "Electrolysis",
  "Chemistry :: Industrial Processes in Kenya": "Industrial processes",
  "Chemistry :: Air, Water & Environmental Chemistry": "Environmental chemistry",
  "Physics :: Mechanics & Motion": "Motion",
  "Physics :: Newton's Laws of Motion": "Newton's laws of motion",
  "Physics :: Waves & Sound": "Sound",
  "Physics :: Light & Optics": "Optics",
  "Physics :: Electricity & Magnetism": "Electromagnetism",
  "Physics :: Thermodynamics": "Thermodynamics",
  "Physics :: Modern Physics": "Modern physics",
  "Physics :: Nuclear Physics": "Nuclear physics",
  "Physics :: Mechanics: Statics & Dynamics": "Classical mechanics",
  "Physics :: Circular & Projectile Motion": "Projectile motion",
  "Physics :: Waves & Optics": "Wave",
  "Physics :: Electricity: Current & Resistance": "Electric current",
  "Physics :: Electromagnetism": "Electromagnetism",
  "Physics :: Thermodynamics & Heat": "Heat",
  "Physics :: Modern Physics: Photoelectric": "Photoelectric effect",
  "Physics :: Radioactivity & Nuclear": "Radioactive decay",

  // ── Humanities ──
  "Social Studies :: Our County & Country": "Counties of Kenya",
  "Social Studies :: Physical Geography of Kenya": "Geography of Kenya",
  "Social Studies :: Kenya's History": "History of Kenya",
  "Social Studies :: Government & Citizenship": "Government of Kenya",
  "Social Studies :: Economic Activities": "Economy of Kenya",
  "Social Studies :: African Countries & Capitals": "List of African countries",
  "Social Studies :: Culture & Traditions": "Culture of Kenya",
  "Social Studies :: Settlement & Population": "Demographics of Kenya",
  "Social Studies :: East African History": "History of East Africa",
  "Social Studies :: African Geography": "Geography of Africa",
  "Social Studies :: Government & Democracy": "Democracy",
  "Social Studies :: Economic Development": "Economic development",
  "Social Studies :: Cultural Heritage": "Cultural heritage",
  "Social Studies :: Environmental Studies": "Environmental science",
  "Social Studies :: Global Relations": "International relations",
  "Social Studies :: Human Rights & Citizenship": "Human rights",
  "Geography :: Physical Geography of Kenya": "Geography of Kenya",
  "Geography :: Human Geography & Population": "Human geography",
  "Geography :: Climate & Weather Systems": "Climate",
  "Geography :: Natural Resources & Environment": "Natural resource",
  "Geography :: Geomorphology & Landforms": "Landform",
  "Geography :: Agriculture & Land Use": "Agriculture",
  "Geography :: Settlement & Urbanisation": "Urbanization",
  "Geography :: Map Work & GIS Tools": "Map",
  "Geography :: Internal Land-Forming Processes": "Plate tectonics",
  "Geography :: External Land-Forming Processes": "Erosion",
  "Geography :: Climate Types of Africa": "Climate of Africa",
  "Geography :: Soils & Vegetation of Kenya": "Soil",
  "Geography :: Water & Drainage in Africa": "Drainage basin",
  "Geography :: Agriculture in Kenya & Africa": "Agriculture in Africa",
  "Geography :: Population & Migration": "Human migration",
  "Geography :: Industry, Trade & Transport": "Trade",
  "History and Citizenship :: Pre-Colonial African History": "History of Africa",
  "History and Citizenship :: Colonial Era in Kenya": "Colonial Kenya",
  "History and Citizenship :: Kenyan Independence Movement": "Mau Mau rebellion",
  "History and Citizenship :: Post-Independence Africa": "History of Africa",
  "History and Citizenship :: World History: 20th Century": "20th century",
  "History and Citizenship :: African Political Systems": "Politics of Africa",
  "History and Citizenship :: Economic History of Africa": "Economic history of Africa",
  "History and Citizenship :: Contemporary African Issues": "Africa",
  "History :: African Societies Before Colonialism": "History of Africa",
  "History :: The Scramble for Africa": "Scramble for Africa",
  "History :: Colonial Administration": "Colonialism",
  "History :: Nationalist Movements in Africa": "African nationalism",
  "History :: Kenya's Path to Independence": "History of Kenya",
  "History :: Post-Independence Governance": "Politics of Kenya",
  "History :: Economic Development Policies": "Economic development",
  "History :: Pan-Africanism & Regional Co-operation": "Pan-Africanism",
  "Business Studies :: Business Environment": "Business",
  "Business Studies :: Entrepreneurship & Innovation": "Entrepreneurship",
  "Business Studies :: Accounting Basics": "Accounting",
  "Business Studies :: Marketing & Commerce": "Marketing",
  "Business Studies :: Office Management": "Office management",
  "Business Studies :: Business Law & Ethics": "Business ethics",
  "Business Studies :: Financial Management": "Financial management",
  "Business Studies :: Business Economics": "Managerial economics",
  "Business Studies :: Nature & Types of Business": "Business",
  "Business Studies :: Trade & Commerce": "Trade",
  "Business Studies :: Business Finance": "Corporate finance",
  "Business Studies :: Accounting: Double Entry": "Double-entry bookkeeping",
  "Business Studies :: Accounts: Final Accounts": "Financial statement",
  "Business Studies :: Marketing Mix": "Marketing mix",
  "Business Studies :: Insurance & Risk Management": "Insurance",
  "Business Studies :: Office Practice & Organisation": "Office administration",
  "Christian Religious Education :: Creation & Thanksgiving": "Genesis creation narrative",
  "Christian Religious Education :: Prayer & Worship": "Christian worship",
  "Christian Religious Education :: Family & Love": "Family",
  "Christian Religious Education :: Sharing & Caring": "Altruism",
  "Christian Religious Education :: Honesty & Truth": "Honesty",
  "Christian Religious Education :: Forgiveness & Peace": "Forgiveness",
  "Christian Religious Education :: Values & Virtues": "Virtue",
  "Christian Religious Education :: Celebrations & Festivals": "Christian holiday",
  "Christian Religious Education :: Biblical Studies": "Biblical studies",
  "Christian Religious Education :: Christian Living": "Christian ethics",
  "Christian Religious Education :: Ethics & Morality": "Morality",
  "Christian Religious Education :: World Religions": "Major religious groups",
  "Christian Religious Education :: Church History": "History of Christianity",
  "Christian Religious Education :: Environmental Ethics": "Environmental ethics",
  "Christian Religious Education :: Justice & Peacemaking": "Peacebuilding",
  "Christian Religious Education :: Faith in Society": "Sociology of religion",
  // Junior School + Upper Primary CRE strands
  "Christian Religious Education :: Creation": "Genesis creation narrative",
  "Christian Religious Education :: Creation & Care for the Environment": "Stewardship (theology)",
  "Christian Religious Education :: The Bible": "Bible",
  "Christian Religious Education :: Life & Teachings of Jesus Christ": "Ministry of Jesus",
  "Christian Religious Education :: The Life of Jesus": "Ministry of Jesus",
  "Christian Religious Education :: Christian Values": "Christian ethics",
  "Christian Religious Education :: The Church": "Christian Church",
  "Christian Religious Education :: Christian Living Today": "Christian ethics",
  "Christian Religious Education :: Living as a Christian": "Christian ethics",
  "Christian Religious Education :: Sin & Salvation": "Salvation in Christianity",
  "Christian Religious Education :: The Holy Spirit": "Holy Spirit in Christianity",
  "Christian Religious Education :: Prayer & Worship": "Christian prayer",
  "Christian Religious Education :: Christian Festivals": "Liturgical year",
  "Agriculture and Nutrition :: Crop Production": "Crop",
  "Agriculture and Nutrition :: Livestock Production": "Livestock",
  "Agriculture and Nutrition :: Soil & Water Conservation": "Soil conservation",
  "Agriculture and Nutrition :: Food & Nutrition": "Nutrition",
  "Agriculture and Nutrition :: Food Preparation & Preservation": "Food preservation",
  "Agriculture and Nutrition :: Consumer Awareness": "Consumer protection",
  "Agriculture and Nutrition :: Home & Kitchen Safety": "Food safety",
  "Agriculture and Nutrition :: Agribusiness & Farm Records": "Agribusiness",

  // ── Practical ──
  "Agriculture :: Soil & Land Preparation": "Tillage",
  "Agriculture :: Crop Farming": "Crop",
  "Agriculture :: Animal Husbandry": "Animal husbandry",
  "Agriculture :: Plant Nutrients": "Plant nutrition",
  "Agriculture :: Pests & Diseases": "Pest control",
  "Agriculture :: Farm Tools & Equipment": "Agricultural machinery",
  "Agriculture :: Water Management": "Water resource management",
  "Agriculture :: Agribusiness Basics": "Agribusiness",
  "Agriculture :: Crop Science": "Agronomy",
  "Agriculture :: Animal Production": "Livestock",
  "Agriculture :: Soil Science": "Soil science",
  "Agriculture :: Farm Management": "Farm",
  "Agriculture :: Agro-Processing": "Food processing",
  "Agriculture :: Horticulture": "Horticulture",
  "Agriculture :: Fish & Poultry Farming": "Aquaculture",
  "Agriculture :: Agricultural Economics": "Agricultural economics",
  "Home Science :: Food & Nutrition": "Nutrition",
  "Home Science :: Cooking Skills": "Cooking",
  "Home Science :: Clothing & Textiles": "Textile",
  "Home Science :: Home Management": "Home economics",
  "Home Science :: Personal Hygiene": "Hygiene",
  "Home Science :: Consumer Education": "Consumer education",
  "Home Science :: Kitchen Safety": "Food safety",
  "Home Science :: Budgeting & Shopping": "Personal budget",
  "Hygiene and Nutrition :: Personal Hygiene": "simple:Hygiene",
  "Hygiene and Nutrition :: Healthy Eating": "simple:Healthy diet",
  "Hygiene and Nutrition :: Food Groups": "simple:Food group",
  "Hygiene and Nutrition :: Balanced Diet": "simple:Healthy diet",
  "Hygiene and Nutrition :: Clean Water": "simple:Drinking water",
  "Hygiene and Nutrition :: Disease Prevention": "simple:Preventive healthcare",
  "Hygiene and Nutrition :: Safety at Home": "simple:Safety",
  "Hygiene and Nutrition :: Exercise & Rest": "simple:Physical exercise",
  "Hygiene and Nutrition :: Food Safety": "simple:Food safety",
  "Hygiene and Nutrition :: First Aid": "simple:First aid",
  "Health Education :: Personal Health": "Health",
  "Health Education :: Human Body & Health": "Human body",
  "Health Education :: Nutrition": "Nutrition",
  "Health Education :: Disease Prevention": "Preventive healthcare",
  "Health Education :: First Aid": "First aid",
  "Health Education :: Safety & Risk Prevention": "Safety",
  "Health Education :: Physical Activity": "Physical activity",
  "Health Education :: Mental & Social Wellbeing": "Mental health",
  "Pre-Technical Studies :: Technical Drawing": "Technical drawing",
  "Pre-Technical Studies :: Woodwork Basics": "Woodworking",
  "Pre-Technical Studies :: Metalwork & Fabrication": "Metalworking",
  "Pre-Technical Studies :: Electrical Wiring": "Electrical wiring",
  "Pre-Technical Studies :: Masonry & Construction": "Masonry",
  "Pre-Technical Studies :: Plumbing Basics": "Plumbing",
  "Pre-Technical Studies :: Electronics Fundamentals": "Electronics",
  "Pre-Technical Studies :: Workshop Safety & Practice": "Occupational safety and health",
  "Computer Science :: Computer Hardware & Systems": "Computer hardware",
  "Computer Science :: Programming Fundamentals": "Computer programming",
  "Computer Science :: Data Structures & Algorithms": "Data structure",
  "Computer Science :: Databases & SQL": "SQL",
  "Computer Science :: Networking & Internet": "Computer network",
  "Computer Science :: Operating Systems": "Operating system",
  "Computer Science :: Cybersecurity Basics": "Computer security",
  "Computer Science :: Software Engineering": "Software engineering",
  "Computer Science :: Hardware: Input, Processing, Output": "Computer hardware",
  "Computer Science :: Software & Operating Systems": "Operating system",
  "Computer Science :: Number Systems": "Binary number",
  "Computer Science :: Programming Concepts": "Computer programming",
  "Computer Science :: Spreadsheets & Databases": "Spreadsheet",
  "Computer Science :: Data Management & Security": "Information security",
  "Computer Science :: Emerging Technologies in Kenya": "Emerging technologies",

  // ── Arts ──
  "Creative Arts :: Drawing & Painting": "simple:Painting",
  "Creative Arts :: Paper Craft": "Papercraft",
  "Creative Arts :: Clay Modelling": "Pottery",
  "Creative Arts :: Music & Singing": "simple:Singing",
  "Creative Arts :: Drama & Role Play": "simple:Drama",
  "Creative Arts :: Dance & Movement": "simple:Dance",
  "Creative Arts :: Weaving & Patterns": "Weaving",
  "Creative Arts :: Printing Techniques": "Printmaking",
  "Creative Arts :: Music Theory & Practice": "Music theory",
  "Creative Arts :: Drama & Theatre": "Theatre",
  "Creative Arts :: Craft & Textile": "Textile arts",
  "Creative Arts :: Digital Art Basics": "Digital art",
  "Creative Arts :: Photography Appreciation": "Photography",
  "Creative Arts :: Architecture & Design": "Architecture",
  "Creative Arts :: Performance Arts": "Performing arts",
  "Creative Arts and Sports :: Visual Arts & Design": "Visual arts",
  "Creative Arts and Sports :: Music Composition": "Musical composition",
  "Creative Arts and Sports :: Drama & Performance": "Theatre",
  "Creative Arts and Sports :: Sports Science": "Sports science",
  "Creative Arts and Sports :: Physical Education": "Physical education",
  "Creative Arts and Sports :: Photography & Film": "Filmmaking",
  "Creative Arts and Sports :: Fashion & Textiles": "Fashion design",
  "Creative Arts and Sports :: Digital Creativity": "Digital art",
};

interface Article { host: string; title: string; extract: string; url: string; }
const cache = new Map<string, Article | null>();

async function fetchJson(url: string): Promise<any> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await sleep(REQ_GAP_MS);
      const res = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
      if (res.status === 429 || res.status >= 500) { await sleep(1200 * (attempt + 1)); continue; }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      await sleep(800 * (attempt + 1));
    }
  }
  return null;
}

async function mwSearch(host: string, query: string): Promise<string | null> {
  const url = `https://${host}/w/api.php?action=query&format=json&list=search&srlimit=1&srprop=&srsearch=${encodeURIComponent(query)}`;
  const j = await fetchJson(url);
  return j?.query?.search?.[0]?.title ?? null;
}

async function mwArticle(host: string, title: string): Promise<Article | null> {
  const key = `${host}|${title}`;
  if (cache.has(key)) return cache.get(key)!;
  const params = new URLSearchParams({
    action: "query", format: "json", prop: "extracts", explaintext: "1",
    exsectionformat: "wiki", redirects: "1", titles: title,
  });
  const j = await fetchJson(`https://${host}/w/api.php?${params}`);
  const pages = j?.query?.pages;
  const page = pages && (Object.values(pages)[0] as any);
  if (!page || page.missing !== undefined || !page.extract) { cache.set(key, null); return null; }
  const canonical = page.title as string;
  const out: Article = {
    host, title: canonical, extract: page.extract,
    url: `https://${host}/wiki/${encodeURIComponent(canonical.replace(/ /g, "_"))}`,
  };
  cache.set(key, out);
  return out;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/\{\\displaystyle[^}]*\}/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[‐-‒–—]/g, "-")
    .replace(/\s*\([^)]*\bIPA\b[^)]*\)/g, "")
    .replace(/\s*\(\s*\/[^)]*\/[^)]*\)/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\([^)]*\blisten\b[^)]*\)/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(text: string, maxParas: number, maxChars: number): string[] {
  const paras = cleanText(text)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => {
      if (p.length < 60) return false;
      if (/^(not to be confused|this article is about|for other uses|for the |see also:)/i.test(p)) return false;
      const alnum = (p.match(/[a-zA-Z0-9]/g) ?? []).length;
      return alnum / p.length > 0.6;
    });
  const out: string[] = [];
  let total = 0;
  for (const p of paras) {
    if (out.length >= maxParas || total > maxChars) break;
    const clipped = p.length > 700 ? (p.slice(0, p.lastIndexOf(". ", 700) + 1) || p.slice(0, 700)).trim() : p;
    out.push(clipped);
    total += clipped.length;
  }
  return out;
}

/** Parse a `exsectionformat=wiki` extract into overview + level-2 sections. */
function parseArticle(extract: string, band: string) {
  const parts = extract.split(/\n(={2,6})\s*(.+?)\s*\1\s*\n/);
  // parts: [pre, "==", "Title", body, "==", "Title", body, ...]
  const overview = splitParagraphs(parts[0] ?? "", 3, band === "senior" ? 1500 : 1200);

  const subtopics: NoteSubtopic[] = [];
  for (let i = 1; i < parts.length; i += 3) {
    const level = parts[i].length;
    const name = (parts[i + 1] ?? "").trim();
    const body = parts[i + 2] ?? "";
    if (level !== 2) {
      // fold deeper subsections into the previous level-2 section
      const last = subtopics[subtopics.length - 1];
      if (last) {
        const more = splitParagraphs(body, 1, 300);
        if (more.length) last.paragraphs.push(...more);
      }
      continue;
    }
    if (SKIP_SECTIONS.has(name.toLowerCase())) continue;
    const paragraphs = splitParagraphs(body, 3, band === "senior" ? 900 : 650);
    if (paragraphs.length === 0) continue;
    subtopics.push({ name, paragraphs });
    if (subtopics.length >= 6) break;
  }
  return { overview, subtopics };
}

function siteLabel(host: string): string {
  if (host.startsWith("simple.")) return "Simple English Wikipedia";
  if (host.startsWith("sw.")) return "Wikipedia (Kiswahili)";
  return "Wikipedia";
}

async function resolveArticle(subject: string, topic: string, band: string): Promise<Article | null> {
  const key = `${subject} :: ${topic}`;
  const override = SOURCE_OVERRIDES[key];
  const lowerBand = band === "lower" || band === "upper";

  if (override) {
    let host = "en.wikipedia.org", title = override;
    if (override.startsWith("sw:")) { host = "sw.wikipedia.org"; title = override.slice(3); }
    else if (override.startsWith("simple:")) { host = "simple.wikipedia.org"; title = override.slice(7); }
    const primary = await mwArticle(host, title);
    if (primary) return primary;
    // fall back to English if a simple/sw page is missing
    if (host !== "en.wikipedia.org") return mwArticle("en.wikipedia.org", title.replace(/^simple:|^sw:/, ""));
    return null;
  }

  if (KISWAHILI_SUBJECTS.has(subject)) {
    const swTitle = await mwSearch("sw.wikipedia.org", topic);
    if (swTitle) {
      const p = await mwArticle("sw.wikipedia.org", swTitle);
      if (p && p.extract.length > 200) return p;
    }
  }

  const q = `${topic} ${subject}`.replace(/[:&]/g, " ").replace(/\s+/g, " ").trim();
  if (lowerBand) {
    const st = (await mwSearch("simple.wikipedia.org", topic)) ?? (await mwSearch("simple.wikipedia.org", q));
    if (st) {
      const p = await mwArticle("simple.wikipedia.org", st);
      if (p && p.extract.length > 220) return p;
    }
  }
  const enTitle = (await mwSearch("en.wikipedia.org", `intitle:${topic}`)) ?? (await mwSearch("en.wikipedia.org", topic)) ?? (await mwSearch("en.wikipedia.org", q));
  if (!enTitle) return null;
  return mwArticle("en.wikipedia.org", enTitle);
}

async function buildNote(subject: string, topic: string, band: string): Promise<GeneratedNote | null> {
  const article = await resolveArticle(subject, topic, band);
  if (!article) return null;
  const { overview, subtopics } = parseArticle(article.extract, band);
  if (overview.length === 0 && subtopics.length === 0) return null;

  const sources: NoteSource[] = [
    { title: article.title, url: article.url, site: siteLabel(article.host), license: CC_BY_SA },
  ];
  return { overview, subtopics, sources };
}

async function loadExisting(): Promise<Record<string, GeneratedNote>> {
  try {
    const mod = await import(OUT + "?t=" + Date.now());
    return (mod.GENERATED_NOTES ?? {}) as Record<string, GeneratedNote>;
  } catch {
    return {};
  }
}

function serialise(notes: Record<string, GeneratedNote>): string {
  const keys = Object.keys(notes).sort();
  const withSub = keys.filter((k) => notes[k].subtopics.length > 0).length;
  const body = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(notes[k])},`).join("\n");
  return `// GENERATED FILE — do not edit by hand.
// Regenerate with:  pnpm --filter @workspace/soma-app run build:notes
//
// Study-note content derived from Wikipedia, Simple English Wikipedia and
// Wikipedia (Kiswahili). Source text is CC BY-SA 4.0; these derived notes are
// therefore also CC BY-SA 4.0. Each entry lists its source, shown in the app.
//
// Entries: ${keys.length} (${withSub} with sub-topics)   Generated: ${new Date().toISOString().slice(0, 10)}

import type { GeneratedNote } from "./notesTypes";

export const GENERATED_NOTES: Record<string, GeneratedNote> = {
${body}
};
`;
}

async function main() {
  const onlyMissing = process.argv.includes("--only-missing");

  const wanted = new Map<string, { subject: string; topic: string; band: string }>();
  const bandRank = { lower: 0, upper: 1, junior: 2, senior: 3 } as const;
  for (const m of MATERIALS) {
    const band = bandFor(m.gradeKey);
    for (const topic of m.topics) {
      const key = `${m.subject} :: ${topic}`;
      const cur = wanted.get(key);
      if (!cur || bandRank[band as keyof typeof bandRank] < bandRank[cur.band as keyof typeof bandRank]) {
        wanted.set(key, { subject: m.subject, topic, band });
      }
    }
  }

  const result = await loadExisting();
  let keys = [...wanted.keys()].sort();
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  if (limitArg) keys = keys.slice(0, Number(limitArg.split("=")[1]) || keys.length);
  // --refetch=<substr>  → force re-fetch of matching keys (comma-separated ok)
  const refetchArg = process.argv.find((a) => a.startsWith("--refetch="));
  const refetch = refetchArg ? refetchArg.split("=")[1].split(",").map((s) => s.toLowerCase()) : [];
  const forced = (key: string) => refetch.some((s) => key.toLowerCase().includes(s));

  let ok = 0, kept = 0, failed = 0, done = 0;
  await mapPool(keys, CONCURRENCY, async (key) => {
    const { subject, topic, band } = wanted.get(key)!;
    done++;
    if (onlyMissing && result[key] && !forced(key)) { kept++; return; }
    try {
      const note = await buildNote(subject, topic, band);
      if (note) { result[key] = note; ok++; console.log(`[${done}/${keys.length}] ${key} — ok (${note.overview.length} para, ${note.subtopics.length} sub)`); }
      else if (result[key]) { kept++; console.log(`[${done}/${keys.length}] ${key} — no fetch, kept`); }
      else { failed++; console.log(`[${done}/${keys.length}] ${key} — NO CONTENT`); }
    } catch (err) {
      if (result[key]) { kept++; console.log(`[${done}/${keys.length}] ${key} — error, kept`); }
      else { failed++; console.log(`[${done}/${keys.length}] ${key} — error: ${(err as Error).message}`); }
    }
  });

  for (const key of Object.keys(result)) if (!wanted.has(key)) delete result[key];

  writeFileSync(OUT, serialise(result));
  console.log(`\nDone. ${ok} fetched, ${kept} kept, ${failed} without content. ${Object.keys(result).length} entries → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
