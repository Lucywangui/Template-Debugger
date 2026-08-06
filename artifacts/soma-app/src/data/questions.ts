import { Material } from "./materials";
import { getTemplateRules } from "@/components/Generators/questionTemplates";

export interface Question {
  text: string;
  options: [string, string, string, string];
  correct: number; // 0-3
}

// ── Seeded utilities ──────────────────────────────────────────────────────────
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rand = seededRandom(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type GradeLevel = "lower" | "upper" | "junior" | "senior" | "844";

function gradeLevel(gradeKey: string): GradeLevel {
  if (["cbc-1", "cbc-2", "cbc-3"].includes(gradeKey)) return "lower";
  if (["cbc-4", "cbc-5", "cbc-6"].includes(gradeKey)) return "upper";
  if (["cbc-7", "cbc-8", "cbc-9"].includes(gradeKey)) return "junior";
  if (gradeKey.startsWith("senior-")) return "senior";
  return "844";
}

// ── Grade-stratified Math generator ──────────────────────────────────────────
function makeMathQ(rand: () => number, level: GradeLevel): Question {
  const typeMax = level === "lower" ? 7 : level === "upper" ? 12 : level === "junior" ? 16 : 18;
  const type = Math.floor(rand() * typeMax);
  let text = "", answer = 0, w1 = 0, w2 = 0, w3 = 0;

  if (type === 0) {
    const max = level === "lower" ? 20 : level === "upper" ? 90 : 200;
    const a = Math.floor(rand() * max) + 5, b = Math.floor(rand() * max) + 5;
    text = `What is ${a} + ${b}?`; answer = a + b; w1 = answer + 1; w2 = answer - 1; w3 = answer + 2;
  } else if (type === 1) {
    const max = level === "lower" ? 15 : level === "upper" ? 60 : 120;
    const b = Math.floor(rand() * max) + 2, a = b + Math.floor(rand() * max) + 2;
    text = `What is ${a} − ${b}?`; answer = a - b; w1 = answer + 1; w2 = answer - 1; w3 = a + b;
  } else if (type === 2) {
    const max = level === "lower" ? 5 : level === "upper" ? 12 : 20;
    const a = Math.floor(rand() * max) + 2, b = Math.floor(rand() * max) + 2;
    text = `What is ${a} × ${b}?`; answer = a * b; w1 = answer + a; w2 = answer - b; w3 = (a + 1) * b;
  } else if (type === 3) {
    const b = Math.floor(rand() * (level === "lower" ? 5 : 11)) + 2;
    const q = Math.floor(rand() * (level === "lower" ? 5 : 12)) + 2;
    text = `What is ${b * q} ÷ ${b}?`; answer = q; w1 = answer + 1; w2 = answer - 1; w3 = answer + 2;
  } else if (type === 4) {
    const bases = [20, 40, 60, 80, 100, 120, 200, 50];
    const percs = [10, 20, 25, 50, 5, 15, 30, 75];
    const p = percs[Math.floor(rand() * percs.length)];
    const base = bases[Math.floor(rand() * bases.length)];
    text = `What is ${p}% of ${base}?`; answer = (p * base) / 100;
    w1 = answer + p; w2 = Math.abs(answer - 5); w3 = base - answer;
  } else if (type === 5) {
    const a = Math.floor(rand() * 8) + 2, b = Math.floor(rand() * 6) + 2;
    const useSquare = rand() > 0.5;
    if (useSquare) { text = `Area of square with side ${a} cm?`; answer = a * a; w1 = 4 * a; w2 = a * b; w3 = 2 * a; }
    else { text = `Perimeter of rectangle ${a} cm × ${b} cm?`; answer = 2 * (a + b); w1 = a * b; w2 = a + b; w3 = 2 * a; }
  } else if (type === 6) {
    const items = ["oranges","books","pencils","eggs","bananas","chairs","apples","mangoes"];
    const item = items[Math.floor(rand() * items.length)];
    const total = Math.floor(rand() * (level === "lower" ? 20 : 80)) + 10;
    const spent = Math.floor(rand() * (total - 2)) + 1;
    text = `Had ${total} ${item}, sold ${spent}. Remaining?`; answer = total - spent; w1 = total + spent; w2 = spent; w3 = total;
  } else if (type === 7 && level !== "lower") {
    const step = Math.floor(rand() * 5) + 2, start = Math.floor(rand() * 10) + 1;
    const s = [start, start+step, start+2*step, start+3*step, start+4*step];
    text = `Next: ${s[0]}, ${s[1]}, ${s[2]}, ${s[3]}, ___?`; answer = s[4]; w1 = answer + 1; w2 = answer - step; w3 = answer + step;
  } else if (type === 8 && level !== "lower") {
    const a = Math.floor(rand() * 5) + 1, b = Math.floor(rand() * 8) + 1, c = Math.floor(rand() * 12) + 1;
    text = `Solve: ${a}x + ${b} = ${a * c + b}. x = ?`; answer = c; w1 = c + 1; w2 = c - 1; w3 = a * c;
  } else if (type === 9 && (level === "junior" || level === "senior" || level === "844")) {
    const r = Math.floor(rand() * 5) + 2;
    text = `Circumference of circle radius ${r} cm (π≈3.14)?`; answer = Math.round(2 * 3.14 * r); w1 = Math.round(3.14 * r * r); w2 = 4 * r; w3 = answer + 1;
  } else if (type >= 10 && (level === "senior" || level === "844")) {
    const angles: Record<string, string> = {"0°":"0","30°":"0.5","45°":"0.707","60°":"0.866","90°":"1"};
    const ks = Object.keys(angles);
    const k = ks[Math.floor(rand() * ks.length)];
    const correct = angles[k];
    const others = Object.values(angles).filter(v => v !== correct);
    return { text: `sin(${k}) = ?`, options: [correct, others[0], others[1], others[2]] as [string,string,string,string], correct: 0 };
  } else {
    const a = Math.floor(rand() * 9) + 1, b = Math.floor(rand() * 9) + 1;
    text = `Count: ${a} groups of ${b} objects. Total?`; answer = a * b; w1 = a + b; w2 = a * b + 1; w3 = Math.abs(a * b - b);
  }

  const pos = Math.floor(rand() * 4);
  const opts: [string, string, string, string] = ["", "", "", ""] as unknown as [string, string, string, string];
  const ans = String(Math.round(answer * 100) / 100);
  opts[pos] = ans;
  const used = new Set([ans]);
  const wrongs = [w1, w2, w3];
  let wi = 0;
  for (let i = 0; i < 4; i++) {
    if (i === pos) continue;
    let w = String(Math.abs(Math.round((wrongs[wi++] ?? answer + wi * 3) * 100) / 100));
    if (used.has(w) || w === ans) w = String(Math.abs(Math.round(answer + (wi + 1) * 7)));
    used.add(w); opts[i] = w;
  }
  return { text, options: opts, correct: pos };
}

function generateMathQs(seed: number, count: number, level: GradeLevel): Question[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, () => makeMathQ(rand, level));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH LOWER — Grade 1–3 KICD Strands 1–5 (target: 530+ questions)
// Strand 1: Listening & Speaking | Strand 2: Reading | Strand 3: Writing
// Strand 4: Grammar | Strand 5: Vocabulary
// ═══════════════════════════════════════════════════════════════════════════════

// ─ Strand 4: Grammar — nouns ─────────────────────────────────────────────────
const NOUNS_50 = ["dog","cat","school","river","country","happiness","love","teacher",
  "mountain","ocean","truth","courage","family","city","garden","bridge","doctor","music",
  "language","freedom","justice","faith","knowledge","nature","friendship","science",
  "history","culture","tradition","education","government","community","environment",
  "technology","democracy","creativity","literature","economy","health","wisdom",
  "library","hospital","market","forest","island","valley","flower","stone","book","table"];
const NOT_NOUNS_50 = ["beautiful","quickly","run","swim","happy","jump","carefully","bright",
  "slowly","angry","loudly","write","eat","gently","tall","sadly","think","hard","bravely",
  "lazy","fast","strongly","thin","kindly","bold","shout","deeply","clean","freely","wisely",
  "suddenly","cleverly","calmly","proudly","greedily","read","speak","dance","sing","climb",
  "breathe","smile","cry","hide","play","sleep","laugh","whisper","hurry","sketch"];
const NOUN_PROMPTS = ["Which of these is a noun?","Choose the naming word:",
  "Identify the noun:","Which word is a noun?","Select the noun:",
  "A naming word is a noun. Which is a noun?","Pick out the noun:"];
function makeNounQs(): Question[] {
  return NOUNS_50.map((noun, i) => {
    const d = [NOT_NOUNS_50[i%50], NOT_NOUNS_50[(i+17)%50], NOT_NOUNS_50[(i+33)%50]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, noun);
    return { text: NOUN_PROMPTS[i%7], options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 4: Grammar — verbs ─────────────────────────────────────────────────
const VERBS_45 = ["run","swim","eat","write","jump","read","climb","dance","sing","speak",
  "breathe","smile","cry","think","play","sleep","laugh","whisper","shout","hurry",
  "cook","draw","fly","grow","help","learn","listen","move","open","pray",
  "push","pull","save","teach","travel","wash","watch","work","build","plant",
  "carry","catch","chase","dig","drive"];
const NOT_VERBS_45 = ["beautiful","dog","quickly","mountain","slowly","table","river","bright",
  "happiness","tall","wisdom","strongly","school","thin","kindly","bravely","teacher","book",
  "market","freedom","city","health","garden","culture","gently","sadly","greedily","proudly",
  "hospital","forest","justice","island","boldly","lovingly","community","nature","tradition",
  "calmly","stone","flower","teacher","paper","desk","chair","window"];
const VERB_PROMPTS = ["Which is a verb (action word)?","Choose the action word:",
  "Identify the verb:","Which word shows an action?","Pick the verb:",
  "A verb shows action. Which is a verb?"];
function makeVerbQs(): Question[] {
  return VERBS_45.map((verb, i) => {
    const d = [NOT_VERBS_45[i%45], NOT_VERBS_45[(i+15)%45], NOT_VERBS_45[(i+30)%45]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, verb);
    return { text: VERB_PROMPTS[i%6], options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 4: Grammar — adjectives ───────────────────────────────────────────
const ADJS_35 = ["beautiful","tall","happy","bright","angry","fast","thin","bold",
  "lazy","kind","clever","brave","clean","proud","greedy","calm","strong","wide",
  "deep","sharp","soft","hard","fresh","cold","hot","young","old","rich","poor",
  "safe","smooth","rough","heavy","light","noisy"];
const NOT_ADJS_35 = ["dog","run","quickly","school","swim","mountain","slowly","eat","teacher",
  "jump","library","breathe","hospital","shout","river","play","city","climb","market",
  "laugh","forest","speak","book","dance","flower","read","stone","table","island","valley",
  "pencil","paper","desk","chair","window"];
const ADJ_PROMPTS = ["Which word is an adjective (describing word)?","Choose the describing word:",
  "Identify the adjective:","Which word describes a noun?","Select the adjective:"];
function makeAdjQs(): Question[] {
  return ADJS_35.map((adj, i) => {
    const d = [NOT_ADJS_35[i%35], NOT_ADJS_35[(i+11)%35], NOT_ADJS_35[(i+22)%35]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, adj);
    return { text: ADJ_PROMPTS[i%5], options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 5: Vocabulary — antonyms (60 pairs) ────────────────────────────────
const ANT60: [string, string][] = [
  ["hot","cold"],["big","small"],["happy","sad"],["fast","slow"],["tall","short"],
  ["light","dark"],["good","bad"],["love","hate"],["day","night"],["up","down"],
  ["young","old"],["beautiful","ugly"],["strong","weak"],["rich","poor"],["noisy","quiet"],
  ["clean","dirty"],["brave","cowardly"],["hard","soft"],["fresh","stale"],["early","late"],
  ["cheap","expensive"],["safe","dangerous"],["empty","full"],["polite","rude"],["open","closed"],
  ["far","near"],["wide","narrow"],["heavy","light"],["wet","dry"],["rough","smooth"],
  ["thick","thin"],["kind","cruel"],["lazy","hardworking"],["true","false"],["alive","dead"],
  ["buy","sell"],["start","stop"],["smile","frown"],["friend","enemy"],["inside","outside"],
  ["sick","healthy"],["add","subtract"],["push","pull"],["remember","forget"],["asleep","awake"],
  ["found","lost"],["new","old"],["left","right"],["question","answer"],["arrive","depart"],
  ["attack","defend"],["borrow","lend"],["build","destroy"],["come","go"],["expand","shrink"],
  ["freeze","melt"],["increase","decrease"],["pass","fail"],["reward","punish"],["tame","wild"],
];
function makeAntonymQs(): Question[] {
  return ANT60.map(([word, opp], i) => {
    const n = ANT60.length;
    const d = [ANT60[(i+1)%n][1], ANT60[(i+2)%n][1], ANT60[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, opp);
    return { text: `What is the opposite of '${word}'?`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 5: Vocabulary — synonyms (55 pairs) ────────────────────────────────
const SYN55: [string, string][] = [
  ["happy","joyful"],["big","large"],["fast","quick"],["talk","speak"],["beautiful","lovely"],
  ["brave","bold"],["smart","clever"],["start","begin"],["help","assist"],["angry","furious"],
  ["ill","sick"],["buy","purchase"],["choose","select"],["cry","weep"],["complete","finish"],
  ["small","tiny"],["cold","chilly"],["sad","unhappy"],["kind","gentle"],["laugh","chuckle"],
  ["walk","stroll"],["run","sprint"],["tired","weary"],["clean","tidy"],["old","aged"],
  ["new","fresh"],["shout","yell"],["hide","conceal"],["jump","leap"],["look","observe"],
  ["tell","inform"],["show","display"],["fight","battle"],["fix","repair"],["near","close"],
  ["far","distant"],["rich","wealthy"],["hurt","injure"],["sleep","slumber"],["afraid","scared"],
  ["dark","dim"],["bright","shiny"],["loud","noisy"],["calm","peaceful"],["thin","slender"],
  ["strong","powerful"],["weak","feeble"],["easy","simple"],["difficult","hard"],["real","genuine"],
  ["false","untrue"],["high","tall"],["low","short"],["wide","broad"],["narrow","slim"],
];
function makeSynonymQs(): Question[] {
  return SYN55.map(([word, syn], i) => {
    const n = SYN55.length;
    const d = [SYN55[(i+1)%n][1], SYN55[(i+2)%n][1], SYN55[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, syn);
    return { text: `A word meaning the same as '${word}' is:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 2: Reading — word families / phonics (KICD Strand 2.1) ─────────────
const WORD_FAMILIES: [string, string[]][] = [
  ["-at", ["bat","cat","fat","hat","mat","pat","rat","sat"]],
  ["-an", ["ban","can","fan","man","pan","ran","tan","van"]],
  ["-in", ["bin","fin","kin","pin","tin","win","thin","spin"]],
  ["-op", ["cop","hop","mop","pop","top","drop","crop","stop"]],
  ["-en", ["den","hen","men","pen","ten","when","then","wren"]],
  ["-un", ["bun","fun","gun","run","sun","stun","spun","shun"]],
  ["-ig", ["big","dig","fig","jig","pig","wig","twig","gig"]],
  ["-et", ["bet","get","jet","met","net","pet","set","wet"]],
  ["-ug", ["bug","dug","hug","jug","mug","rug","tug","slug"]],
  ["-ot", ["cot","dot","got","hot","lot","pot","rot","knot"]],
];
function makeWordFamilyQs(): Question[] {
  const qs: Question[] = [];
  WORD_FAMILIES.forEach(([family, words], fi) => {
    words.forEach((word, wi) => {
      const d = [
        WORD_FAMILIES[(fi+1)%10][1][wi % WORD_FAMILIES[(fi+1)%10][1].length],
        WORD_FAMILIES[(fi+2)%10][1][(wi+1) % WORD_FAMILIES[(fi+2)%10][1].length],
        WORD_FAMILIES[(fi+4)%10][1][(wi+2) % WORD_FAMILIES[(fi+4)%10][1].length],
      ];
      const pos = (fi + wi) % 4;
      const opts = [...d]; opts.splice(pos, 0, word);
      qs.push({ text: `Which word belongs to the '${family}' word family?`,
        options: opts.slice(0,4) as [string,string,string,string], correct: pos });
    });
  });
  return qs;
}

// ─ Strand 1: Listening & Speaking — rhyming words ───────────────────────────
const RHYME_SETS: [string, string[]][] = [
  ["cat",["bat","mat","rat","hat"]], ["dog",["fog","log","hog","frog"]],
  ["cake",["lake","rake","take","make"]], ["sun",["bun","fun","run","gun"]],
  ["tree",["bee","see","free","knee"]], ["book",["cook","look","hook","took"]],
  ["rain",["train","main","pain","gain"]], ["night",["light","right","sight","fight"]],
  ["house",["mouse","louse","grouse","blouse"]], ["play",["day","say","way","hay"]],
  ["sing",["ring","king","wing","thing"]], ["girl",["curl","pearl","swirl","twirl"]],
  ["down",["town","crown","gown","brown"]], ["fly",["sky","high","try","dry"]],
  ["cold",["bold","gold","told","fold"]], ["jump",["bump","dump","hump","pump"]],
  ["bread",["head","dead","red","said"]], ["best",["rest","nest","test","west"]],
  ["love",["dove","above","shove","glove"]], ["fire",["tire","wire","hire","admire"]],
];
function makeRhymingQs(): Question[] {
  const qs: Question[] = [];
  RHYME_SETS.forEach(([word, rhymes], ri) => {
    rhymes.forEach((rhyme, i) => {
      const nonRhymes = [
        RHYME_SETS[(ri+3)%20][0],
        RHYME_SETS[(ri+7)%20][0],
        RHYME_SETS[(ri+11)%20][0],
      ];
      const pos = (ri + i) % 4;
      const opts = [...nonRhymes]; opts.splice(pos, 0, rhyme);
      qs.push({ text: `Which word rhymes with '${word}'?`,
        options: opts.slice(0,4) as [string,string,string,string], correct: pos });
    });
  });
  return qs;
}

// ─ Strand 4: Grammar — plurals (40 irregular nouns) ─────────────────────────
const PLURAL_PAIRS: [string, string][] = [
  ["tooth","teeth"],["child","children"],["mouse","mice"],["leaf","leaves"],
  ["ox","oxen"],["knife","knives"],["wolf","wolves"],["life","lives"],
  ["wife","wives"],["foot","feet"],["goose","geese"],["louse","lice"],
  ["man","men"],["woman","women"],["sheep","sheep"],["fish","fish"],
  ["deer","deer"],["series","series"],["species","species"],["cactus","cacti"],
  ["alumnus","alumni"],["crisis","crises"],["analysis","analyses"],["basis","bases"],
  ["criterion","criteria"],["phenomenon","phenomena"],["index","indices"],["matrix","matrices"],
  ["syllabus","syllabi"],["radius","radii"],["datum","data"],["medium","media"],
  ["stratum","strata"],["forum","fora"],["fungus","fungi"],["nucleus","nuclei"],
  ["stimulus","stimuli"],["vertebra","vertebrae"],["larva","larvae"],["antenna","antennae"],
];
function makePluralQs(): Question[] {
  return PLURAL_PAIRS.map(([sing, plural], i) => {
    const n = PLURAL_PAIRS.length;
    const d = [PLURAL_PAIRS[(i+1)%n][1], PLURAL_PAIRS[(i+2)%n][1], PLURAL_PAIRS[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, plural);
    return { text: `The plural of '${sing}' is:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 4: Grammar — articles (a/an) ──────────────────────────────────────
const AN_NOUNS = ["apple","egg","umbrella","elephant","ant","orange","island","hour",
  "uncle","ocean","idea","oven","honest man","army","eagle","unusual","open door"];
const A_NOUNS = ["book","cat","dog","school","table","pen","flower","house",
  "river","teacher","window","mango","garden","bridge","hospital","market","stone",
  "boy","girl","chair","computer","phone","farm","road","village"];
function makeArticleQs(): Question[] {
  const qs: Question[] = [];
  AN_NOUNS.forEach((noun, i) => {
    const pos = i % 4;
    const opts = ["a","an","the","some"]; // correct is 'an' at pos
    const correct_word = "an";
    const reordered: string[] = opts.filter(o => o !== correct_word);
    reordered.splice(pos, 0, correct_word);
    qs.push({ text: `Choose the correct article: '___ ${noun}'`,
      options: reordered.slice(0,4) as [string,string,string,string], correct: pos });
  });
  A_NOUNS.forEach((noun, i) => {
    const pos = i % 4;
    const correct_word = "a";
    const opts_list = ["an","the","some"];
    opts_list.splice(pos, 0, correct_word);
    qs.push({ text: `Choose the correct article: '___ ${noun}'`,
      options: opts_list.slice(0,4) as [string,string,string,string], correct: pos });
  });
  return qs;
}

// ─ Strand 4: Grammar — tense (past tense of irregular verbs) ────────────────
const TENSE_PAIRS: [string, string][] = [
  ["run","ran"],["eat","ate"],["write","wrote"],["sing","sang"],["come","came"],
  ["go","went"],["see","saw"],["take","took"],["give","gave"],["find","found"],
  ["make","made"],["know","knew"],["get","got"],["grow","grew"],["drink","drank"],
  ["swim","swam"],["ride","rode"],["drive","drove"],["fly","flew"],["blow","blew"],
  ["throw","threw"],["draw","drew"],["break","broke"],["speak","spoke"],["choose","chose"],
  ["begin","began"],["freeze","froze"],["hide","hid"],["hold","held"],["stand","stood"],
  ["understand","understood"],["fall","fell"],["sit","sat"],["build","built"],["buy","bought"],
  ["catch","caught"],["teach","taught"],["think","thought"],["bring","brought"],["fight","fought"],
];
function makeTenseQs(): Question[] {
  return TENSE_PAIRS.map(([verb, past], i) => {
    const n = TENSE_PAIRS.length;
    const d = [TENSE_PAIRS[(i+1)%n][1], TENSE_PAIRS[(i+2)%n][1], TENSE_PAIRS[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, past);
    return { text: `Past tense of '${verb}' is:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 5: Vocabulary — collective nouns ───────────────────────────────────
const COLLECTIVE: [string, string][] = [
  ["lions","pride"],["fish","school"],["birds","flock"],["cattle","herd"],
  ["bees","swarm"],["wolves","pack"],["ants","colony"],["elephants","herd"],
  ["geese","gaggle"],["crows","murder"],["dolphins","pod"],["monkeys","troop"],
  ["trees","forest"],["flowers","bunch/bouquet"],["grapes","bunch"],["stars","galaxy"],
  ["students","class"],["soldiers","army"],["musicians","orchestra"],["players","team"],
];
function makeCollectiveQs(): Question[] {
  return COLLECTIVE.map(([animal, coll], i) => {
    const n = COLLECTIVE.length;
    const d = [COLLECTIVE[(i+1)%n][1], COLLECTIVE[(i+2)%n][1], COLLECTIVE[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, coll);
    return { text: `The collective noun for ${animal} is a:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// ─ Strand 4: Grammar — prepositions / conjunctions ───────────────────────────
const PREPOSITION_QS: Question[] = [
  { text: "The cat sat ___ the mat.", options: ["on","in","from","through"], correct: 0 },
  { text: "The bird flew ___ the tree.", options: ["beside","over","from","since"], correct: 1 },
  { text: "She hid ___ the door.", options: ["above","across","behind","through"], correct: 2 },
  { text: "The ball rolled ___ the hill.", options: ["at","on","through","down"], correct: 3 },
  { text: "He lives ___ Nairobi.", options: ["on","in","at","over"], correct: 1 },
  { text: "They arrived ___ 8 o'clock.", options: ["in","on","at","by"], correct: 2 },
  { text: "She walks to school ___ her friends.", options: ["beside","above","under","from"], correct: 0 },
  { text: "The fish swam ___ the river.", options: ["on","above","in","over"], correct: 2 },
  { text: "'We were tired ___ we kept going.' The conjunction is:", options: ["tired","were","but","going"], correct: 2 },
  { text: "'I like cats ___ dogs.' Choose the conjunction:", options: ["I","and","like","cats"], correct: 1 },
  { text: "'She will come ___ she finishes.' Choose the conjunction:", options: ["come","will","when","finishes"], correct: 2 },
  { text: "'He is poor ___ happy.' Choose the conjunction:", options: ["poor","but","he","happy"], correct: 1 },
  { text: "Identify the preposition: 'The book is under the table.'", options: ["book","is","under","table"], correct: 2 },
  { text: "Identify the preposition: 'He jumped over the fence.'", options: ["He","jumped","over","fence"], correct: 2 },
  { text: "Identify the preposition: 'She sat between her parents.'", options: ["sat","between","her","parents"], correct: 1 },
];

// ─ Strand 3: Writing — punctuation & sentence structure ──────────────────────
const PUNCTUATION_QS: Question[] = [
  { text: "A sentence must start with a:", options: ["comma","full stop","capital letter","question mark"], correct: 2 },
  { text: "A question ends with a:", options: [".","!","?",","], correct: 2 },
  { text: "An exclamation ends with:", options: [".","!","?",","], correct: 1 },
  { text: "A full stop is used at the:", options: ["beginning","middle","end of a statement","anywhere"], correct: 2 },
  { text: "A comma is used to:", options: ["end a sentence","show surprise","separate items in a list or pause","ask a question"], correct: 2 },
  { text: "Quotation marks are used for:", options: ["lists","direct speech","questions","commands"], correct: 1 },
  { text: "Which sentence is correct?", options: ["i am happy.","I am happy.","I am happy","i am Happy."], correct: 1 },
  { text: "Which sentence needs a question mark?", options: ["I am going home","What is your name","Come here","Help me"], correct: 1 },
  { text: "How many sentences are in: 'I run. She swims.'", options: ["1","2","3","4"], correct: 1 },
  { text: "'Wow, that was amazing!' This is:", options: ["a statement","a question","an exclamation","a command"], correct: 2 },
  { text: "'Sit down.' This is:", options: ["a statement","a question","an exclamation","a command"], correct: 3 },
  { text: "A proper noun is always written with:", options: ["small letters","a capital letter","italics","brackets"], correct: 1 },
  { text: "Which is a proper noun?", options: ["city","river","Nairobi","teacher"], correct: 2 },
  { text: "Which is an abstract noun?", options: ["table","dog","love","pen"], correct: 2 },
  { text: "Which is a concrete noun (physical object)?", options: ["truth","justice","wisdom","book"], correct: 3 },
];

// ─ Strand 2: Reading — spelling & phonics ───────────────────────────────────
const SPELLING_QS: Question[] = [
  { text: "Correct spelling:", options: ["recieve","receive","recive","receeve"], correct: 1 },
  { text: "Correct spelling:", options: ["frend","freind","friend","frind"], correct: 2 },
  { text: "Correct spelling:", options: ["elefant","elephant","eliphant","elephent"], correct: 1 },
  { text: "Correct spelling:", options: ["calender","calander","calendar","callendar"], correct: 2 },
  { text: "Correct spelling:", options: ["beutiful","beuatiful","beautifull","beautiful"], correct: 3 },
  { text: "Correct spelling:", options: ["wierd","weird","wierd","weerd"], correct: 1 },
  { text: "Correct spelling:", options: ["belive","believe","beleive","beleeve"], correct: 1 },
  { text: "Correct spelling:", options: ["achive","achieve","acheive","acheeve"], correct: 1 },
  { text: "Correct spelling:", options: ["necesary","neccessary","necessary","neccesary"], correct: 2 },
  { text: "Correct spelling:", options: ["ocurrence","occurance","occurence","occurrence"], correct: 3 },
  { text: "Correct spelling:", options: ["seperarate","seperate","separate","separrate"], correct: 2 },
  { text: "Correct spelling:", options: ["priviledge","privelege","privilege","privilige"], correct: 2 },
  { text: "Correct spelling:", options: ["definately","definitely","defenitely","definitly"], correct: 1 },
  { text: "Correct spelling:", options: ["accomodate","accommodate","acommodate","acomodate"], correct: 1 },
  { text: "Correct spelling:", options: ["embarass","embarras","embarrass","embarrasment"], correct: 2 },
  { text: "Which word has a silent letter?", options: ["cat","know","bat","sit"], correct: 1 },
  { text: "Which word has a silent letter?", options: ["man","write","ten","hot"], correct: 1 },
  { text: "Which word has a silent letter?", options: ["run","jump","lamb","sing"], correct: 2 },
  { text: "Which word has a silent letter?", options: ["top","knot","pet","lid"], correct: 1 },
  { text: "What sound does 'ph' make?", options: ["/b/","/p/","/f/","/v/"], correct: 2 },
  { text: "What sound does 'ch' make?", options: ["/sh/","/k/ or /ch/","/gh/","/z/"], correct: 1 },
  { text: "What sound does 'th' make (in 'the')?", options: ["/t/","/d/","voiced /ð/","/f/"], correct: 2 },
  { text: "How many syllables in 'butterfly'?", options: ["2","3","4","1"], correct: 1 },
  { text: "How many syllables in 'teacher'?", options: ["1","2","3","4"], correct: 1 },
  { text: "How many syllables in 'elephant'?", options: ["2","3","4","1"], correct: 1 },
  { text: "How many syllables in 'community'?", options: ["3","4","5","2"], correct: 1 },
  { text: "How many vowels in 'ORANGE'?", options: ["2","3","4","1"], correct: 1 },
  { text: "How many vowels in 'SCHOOL'?", options: ["1","2","3","4"], correct: 1 },
  { text: "Which is a vowel?", options: ["b","c","d","e"], correct: 3 },
  { text: "Which is NOT a vowel?", options: ["a","e","f","i"], correct: 2 },
];

// ─ Strand 4: Grammar — suffixes & prefixes ───────────────────────────────────
const AFFIX_QS: Question[] = [
  { text: "Suffix '-ful' means:", options: ["without","full of","able to","again"], correct: 1 },
  { text: "Suffix '-less' means:", options: ["full of","having more","without","again"], correct: 2 },
  { text: "Suffix '-er' in 'teacher' means:", options: ["one who does","quality of","without","full of"], correct: 0 },
  { text: "Suffix '-ness' forms:", options: ["a verb","an adjective","a noun","an adverb"], correct: 2 },
  { text: "Suffix '-ly' forms:", options: ["a noun","an adverb","a verb","an adjective"], correct: 1 },
  { text: "Suffix '-ment' forms:", options: ["a verb","an adjective","an adverb","a noun"], correct: 3 },
  { text: "Prefix 'un-' means:", options: ["before","again","not/opposite","after"], correct: 2 },
  { text: "Prefix 'pre-' means:", options: ["after","before","against","with"], correct: 1 },
  { text: "Prefix 'mis-' means:", options: ["again","before","wrongly","without"], correct: 2 },
  { text: "Prefix 're-' means:", options: ["before","against","wrongly","again"], correct: 3 },
  { text: "Prefix 'dis-' means:", options: ["with","again","before","not/reversal"], correct: 3 },
  { text: "Prefix 'over-' means:", options: ["under","too much/excessive","before","again"], correct: 1 },
  { text: "Prefix 'under-' means:", options: ["above","too much","below/less than","again"], correct: 2 },
  { text: "'Un' + 'happy' = ?", options: ["nonhappy","inhappy","unhappy","dishappy"], correct: 2 },
  { text: "'Joy' + 'ful' = ?", options: ["joyless","joyfull","joyfulness","joyful"], correct: 3 },
  { text: "'Care' + 'less' = ?", options: ["careful","careless","caring","carefulness"], correct: 1 },
  { text: "'Quick' + 'ly' = ?", options: ["quicken","quickness","quickly","quickish"], correct: 2 },
  { text: "'Re' + 'write' = ?", options: ["unwrite","prewrite","rewrite","miswrite"], correct: 2 },
  { text: "What does 'nocturnal' mean?", options: ["active by day","active at night","always asleep","very fast"], correct: 1 },
  { text: "'Omnivore' means an animal that eats:", options: ["only plants","only meat","both plants and animals","only insects"], correct: 2 },
];

function buildEnglishLower(): Question[] {
  return [
    ...makeNounQs(),          // 50
    ...makeVerbQs(),           // 45
    ...makeAdjQs(),            // 35
    ...makeAntonymQs(),        // 60
    ...makeSynonymQs(),        // 55
    ...makeWordFamilyQs(),     // 80
    ...makeRhymingQs(),        // 80
    ...makePluralQs(),         // 40
    ...makeArticleQs(),        // 42
    ...makeTenseQs(),          // 40
    ...makeCollectiveQs(),     // 20
    ...PREPOSITION_QS,         // 15
    ...PUNCTUATION_QS,         // 15
    ...SPELLING_QS,            // 30
    ...AFFIX_QS,               // 20
  ];
  // Total ≈ 627 questions → 41 unique windows → ALL 34 CBC Lower materials unique
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH UPPER — Grade 4–6 (~180 questions)
// ═══════════════════════════════════════════════════════════════════════════════
const ENGLISH_UPPER: Question[] = [
  ...makeAntonymQs().slice(20, 60),
  ...makeSynonymQs().slice(15, 55),
  ...makePluralQs().slice(20, 40),
  ...makeTenseQs().slice(0, 20),
  { text: "A metaphor compares without 'like' or 'as'. Which is a metaphor?", options: ["She runs like wind","He is a lion in battle","The house is large","She sings beautifully"], correct: 1 },
  { text: "A simile uses:", options: ["metaphors","'like' or 'as'","alliteration","rhyme"], correct: 1 },
  { text: "Alliteration is repetition of:", options: ["vowel sounds","ending rhymes","initial consonant sounds","syllables"], correct: 2 },
  { text: "The protagonist is the:", options: ["villain","narrator","main character","setting"], correct: 2 },
  { text: "The setting of a story describes:", options: ["the plot","when and where it takes place","the theme","the characters"], correct: 1 },
  { text: "A proverb is a short:", options: ["poem","story","wise saying","command"], correct: 2 },
  { text: "'Actions speak louder than words' is a:", options: ["simile","metaphor","proverb","alliteration"], correct: 2 },
  { text: "An autobiography is written by:", options: ["a journalist","the subject about themselves","a narrator","a historian"], correct: 1 },
  { text: "A biography is written:", options: ["by the subject","about someone by another person","as fiction only","as poetry only"], correct: 1 },
  { text: "A 'topic sentence' appears:", options: ["in the middle","at the end","at the start of a paragraph","anywhere"], correct: 2 },
  { text: "Summarising means:", options: ["copying the text","adding more details","restating main points briefly","changing the topic"], correct: 2 },
  { text: "Which is a complex sentence?", options: ["I ran.","I ran and she jumped.","Although tired, I ran.","Run fast!"], correct: 2 },
  { text: "A compound sentence joins two clauses using:", options: ["a subordinating conjunction","a coordinating conjunction","a preposition","a pronoun"], correct: 1 },
  { text: "'Close the door!' is a/an:", options: ["Declarative","Interrogative","Imperative","Exclamatory"], correct: 2 },
  { text: "'What a beautiful day!' is a/an:", options: ["Declarative","Interrogative","Imperative","Exclamatory"], correct: 3 },
  { text: "An adverb modifies:", options: ["only nouns","only pronouns","verbs, adjectives or adverbs","only sentences"], correct: 2 },
  { text: "Direct speech uses:", options: ["brackets","quotation marks","colons only","dashes"], correct: 1 },
  { text: "In reported speech, 'I am happy' becomes:", options: ["He said he is happy","He said he was happy","He says he am happy","He told he was happy"], correct: 1 },
  { text: "'Elaborate' means:", options: ["simple","short","detailed and complex","quick"], correct: 2 },
  { text: "'Diligent' means:", options: ["lazy","hardworking and careful","slow","careless"], correct: 1 },
  { text: "'Transparent' means:", options: ["opaque","clear/see-through","dark","heavy"], correct: 1 },
  { text: "'Reluctant' means:", options: ["eager","willing","unwilling/hesitant","quick"], correct: 2 },
  { text: "An idiom is:", options: ["a grammar rule","a phrase whose meaning differs from literal words","a type of verb","poetry"], correct: 1 },
  { text: "'Beat about the bush' means:", options: ["gardening","avoiding the main subject","running fast","looking for animals"], correct: 1 },
  { text: "Skimming means:", options: ["reading every word","reading quickly for main idea","reading backwards","reading aloud only"], correct: 1 },
  { text: "Scanning means:", options: ["reading slowly","searching for specific info quickly","guessing","reading aloud"], correct: 1 },
  { text: "To 'infer' means to:", options: ["copy directly","make conclusions from clues","memorise","rewrite"], correct: 1 },
  { text: "Future perfect tense uses:", options: ["will + verb","will have + past participle","have + past participle","was + -ing"], correct: 1 },
  { text: "Active voice: 'The dog bit the man.' Passive voice:", options: ["The dog bited the man","The man was bitten by the dog","The man bit the dog","A dog bites men"], correct: 1 },
  { text: "A clause with subject and verb that stands alone is:", options: ["subordinate","dependent","independent","relative"], correct: 2 },
  { text: "A relative clause begins with:", options: ["because","although","which/who/that","therefore"], correct: 2 },
  { text: "A haiku has how many lines?", options: ["2","3","4","5"], correct: 1 },
  { text: "Syllable pattern of haiku (3 lines):", options: ["5-5-5","7-5-7","5-7-5","5-7-7"], correct: 2 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENGLISH JUNIOR/SENIOR — Grade 7+ (~120 questions)
// ═══════════════════════════════════════════════════════════════════════════════
const ENGLISH_JUNIOR_SENIOR: Question[] = [
  ...ENGLISH_UPPER.slice(20, 50),
  { text: "A 'foil' character:", options: ["is the villain","contrasts with protagonist to highlight their qualities","is the narrator","is always a sidekick"], correct: 1 },
  { text: "Dramatic irony means:", options: ["author doesn't know the end","audience knows more than characters","characters know all","no one knows what happens"], correct: 1 },
  { text: "A soliloquy is:", options: ["dialogue between two","a speech revealing inner thoughts (alone on stage)","a stage direction","a type of poem"], correct: 1 },
  { text: "Hamartia is the protagonist's:", options: ["strongest quality","fatal flaw","supernatural power","comic sidekick"], correct: 1 },
  { text: "The denouement is:", options: ["the climax","the opening","final resolution after climax","a type of villain"], correct: 2 },
  { text: "Free verse poetry:", options: ["follows strict rhyme","has no fixed metre or rhyme","always rhymes","must have 14 lines"], correct: 1 },
  { text: "A sonnet has how many lines?", options: ["10","12","14","16"], correct: 2 },
  { text: "The tone of a literary piece is:", options: ["the plot","author's attitude toward the subject","the setting","the characters"], correct: 1 },
  { text: "Personification gives ___ human qualities.", options: ["animals only","inanimate objects/abstract ideas","other humans","supernatural beings"], correct: 1 },
  { text: "Hyperbole is:", options: ["understatement","extreme exaggeration for effect","a comparison","a simile"], correct: 1 },
  { text: "Onomatopoeia: words that:", options: ["describe colour","imitate the sound they represent","rhyme","have silent letters"], correct: 1 },
  { text: "An ellipsis (...) indicates:", options: ["a question","excitement","omission or trailing thought","new paragraph"], correct: 2 },
  { text: "A thesis statement:", options: ["gives background only","is only a question","states the main argument of an essay","is always last"], correct: 2 },
  { text: "Cohesion in writing refers to:", options: ["punctuation only","how sentences and paragraphs connect logically","vocabulary choice","the topic"], correct: 1 },
  { text: "The subjunctive mood expresses:", options: ["past actions","wishes, doubts, or hypothetical situations","present facts","commands only"], correct: 1 },
  { text: "A gerund is:", options: ["verb used as a noun (-ing form)","adjective form","past participle","modal verb"], correct: 0 },
  { text: "An infinitive is:", options: ["verb-ing form","to + base verb","past participle","verb + -ed"], correct: 1 },
  { text: "Syntax refers to:", options: ["word meaning","arrangement of words in a sentence","punctuation rules","vocabulary size"], correct: 1 },
  { text: "Semantics studies:", options: ["sentence structure","word and phrase meaning","spelling rules","pronunciation"], correct: 1 },
  { text: "A euphemism substitutes:", options: ["harsh language","a mild expression for a harsh one","exaggeration","a rhetorical question"], correct: 1 },
  { text: "Parallelism in writing uses:", options: ["contrasting ideas","same grammatical structure for balance","parallel lines","repeated metaphors"], correct: 1 },
  { text: "Counter-argument in an essay:", options: ["repeats the thesis","adds more evidence for thesis","acknowledges then refutes opposing views","introduces new topics"], correct: 2 },
  { text: "Hubris means:", options: ["great wisdom","excessive pride","deep sadness","great loyalty"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// KISWAHILI LOWER — Grade 1–3 KICD (target: 520+ questions)
// Strand 1: Kusikiliza & Kuzungumza | Strand 2: Kusoma | Strand 3: Kuandika | Strand 4: Sarufi
// ═══════════════════════════════════════════════════════════════════════════════

// Antonyms in Kiswahili (50 pairs)
const KISW_ANT50: [string, string][] = [
  ["kubwa","ndogo"],["nzuri","mbaya"],["haraka","polepole"],["juu","chini"],["safi","chafu"],
  ["refu","fupi"],["mzito","mwepesi"],["moto","baridi"],["giza","mwanga"],["nguvu","dhaifu"],
  ["asubuhi","jioni"],["mpya","kongwe"],["karibu","mbali"],["ndani","nje"],["leo","jana"],
  ["furaha","huzuni"],["amani","vita"],["ukweli","uongo"],["tajiri","maskini"],["afya","ugonjwa"],
  ["mkubwa","mdogo"],["mrefu","mfupi"],["mzuri","mbaya"],["mwema","mbaya"],["sawa","tofauti"],
  ["kuja","kwenda"],["kupenda","kuchukia"],["kuanza","kumaliza"],["kupata","kupoteza"],["kuamka","kulala"],
  ["kesho","jana"],["mchana","usiku"],["joto","baridi"],["mvua","jua"],["kazi","starehe"],
  ["ujuzi","ujinga"],["umoja","mgawanyiko"],["uhuru","utumwa"],["urafiki","uadui"],["upole","ukali"],
  ["matumaini","kukata tamaa"],["furaha","huzuni"],["nguvu","udhaifu"],["akili","upuuzi"],["heshima","dharau"],
  ["amani","ghasia"],["upendo","chuki"],["imani","shaka"],["uzuri","ubaya"],["faida","hasara"],
];
function makeKiswAntonymQs(): Question[] {
  return KISW_ANT50.map(([word, opp], i) => {
    const n = KISW_ANT50.length;
    const d = [KISW_ANT50[(i+1)%n][1], KISW_ANT50[(i+2)%n][1], KISW_ANT50[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, opp);
    return { text: `Kinyume cha '${word}' ni:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// Kiswahili vocabulary translations (55 pairs)
const KISW_VOCAB: [string, string][] = [
  ["mwalimu","teacher"],["mwanafunzi","student"],["shule","school"],["nyumba","house"],
  ["chakula","food"],["maji","water"],["moto","fire"],["udongo","soil"],["mvua","rain"],
  ["jua","sun"],["ndege","bird"],["samaki","fish"],["ng'ombe","cow"],["mbwa","dog"],
  ["paka","cat"],["simba","lion"],["tembo","elephant"],["nyoka","snake"],["nchi","country"],
  ["mji","city/town"],["barabara","road"],["duka","shop"],["hospitali","hospital"],
  ["kanisa","church"],["msikiti","mosque"],["bustani","garden"],["mto","river"],
  ["mlima","mountain"],["bahari","ocean/sea"],["msitu","forest"],["shamba","farm"],
  ["soko","market"],["gari","car/vehicle"],["ndege","aeroplane"],["mashua","boat"],
  ["rangi","colour"],["nyekundu","red"],["buluu","blue"],["kijani","green"],["njano","yellow"],
  ["nyeupe","white"],["nyeusi","black"],["mlango","door"],["dirisha","window"],["ukuta","wall"],
  ["meza","table"],["kiti","chair"],["kitanda","bed"],["sahani","plate"],["kikombe","cup"],
  ["kisu","knife"],["uma","fork"],["kijiko","spoon"],["kitabu","book"],["kalamu","pen"],
];
function makeKiswVocabQs(): Question[] {
  return KISW_VOCAB.map(([kisw, eng], i) => {
    const n = KISW_VOCAB.length;
    const d = [KISW_VOCAB[(i+1)%n][1], KISW_VOCAB[(i+2)%n][1], KISW_VOCAB[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, eng);
    return { text: `Neno '${kisw}' kwa Kiingereza ni:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// Kiswahili wingi (plurals – 45 pairs)
const KISW_WINGI: [string, string][] = [
  ["mtoto","watoto"],["mwanafunzi","wanafunzi"],["mwalimu","walimu"],["mtu","watu"],
  ["mtoto","watoto"],["mgeni","wageni"],["mzazi","wazazi"],["mgonjwa","wagonjwa"],
  ["mkulima","wakulima"],["mchezaji","wachezaji"],["msimamizi","wasimamizi"],["msaidizi","wasaidizi"],
  ["kitabu","vitabu"],["kiti","viti"],["kikombe","vikombe"],["kisu","visu"],
  ["kikapu","vikapu"],["kijiji","vijiji"],["kilima","vilima"],["kioo","vioo"],
  ["gari","magari"],["jicho","macho"],["tunda","matunda"],["jina","majina"],
  ["darasa","madarasa"],["baba","mababa/baba"],["mama","mamama/mama"],["jibu","majibu"],
  ["swali","maswali"],["tatizo","matatizo"],["daktari","madaktari"],["polisi","mapolisi"],
  ["mti","miti"],["mvua","mvua"],["ndege","ndege"],["samaki","samaki"],
  ["ng'ombe","ng'ombe"],["kondoo","kondoo"],["paka","paka"],["mbwa","mbwa"],
  ["nyumba","nyumba"],["shule","shule"],["hospitali","hospitali"],["barabara","barabara"],["soko","masoko"],
];
function makeKiswWingiQs(): Question[] {
  return KISW_WINGI.map(([umoja, wingi], i) => {
    const n = KISW_WINGI.length;
    const d = [KISW_WINGI[(i+1)%n][1], KISW_WINGI[(i+2)%n][1], KISW_WINGI[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, wingi);
    return { text: `Wingi wa '${umoja}' ni:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

// Kiswahili numbers (nambari) – 30 questions
const KISW_NAMBARI: [string, string][] = [
  ["mbili","2"],["tatu","3"],["nne","4"],["tano","5"],["sita","6"],
  ["saba","7"],["nane","8"],["tisa","9"],["kumi","10"],["kumi na moja","11"],
  ["kumi na mbili","12"],["kumi na tano","15"],["ishirini","20"],["thelathini","30"],
  ["arobaini","40"],["hamsini","50"],["sitini","60"],["sabini","70"],["themanini","80"],
  ["tisini","90"],["mia moja","100"],["mia mbili","200"],["elfu moja","1000"],
  ["nusu","half"],["robo","quarter"],["tatu ya tatu","one-third"],
  ["asilimia kumi","10%"],["mara mbili","double"],["sifuri","0"],["moja","1"],
];
function makeKiswNambariQs(): Question[] {
  return KISW_NAMBARI.map(([neno, value], i) => {
    const n = KISW_NAMBARI.length;
    const d = [KISW_NAMBARI[(i+1)%n][1], KISW_NAMBARI[(i+2)%n][1], KISW_NAMBARI[(i+3)%n][1]];
    const pos = i % 4; const opts = [...d]; opts.splice(pos, 0, value);
    return { text: `'${neno}' ni nambari:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos };
  });
}

function buildKiswahiliLower(): Question[] {
  return [
    ...makeKiswAntonymQs(),    // 50
    ...makeKiswVocabQs(),      // 55
    ...makeKiswWingiQs(),      // 45
    ...makeKiswNambariQs(),    // 30
    // Static grammar, greetings, methali
    { text: "Habari yako? Jibu sahihi:", options: ["Kwaheri","Nzuri","Asante","Karibu"], correct: 1 },
    { text: "Unasema nini asubuhi?", options: ["Usiku mwema","Habari za jioni","Habari za asubuhi","Kwaheri"], correct: 2 },
    { text: "Jibu la 'Asante' ni:", options: ["Karibu","Nzuri","Sawa","Habari"], correct: 0 },
    { text: "Unasema kuaga watu:", options: ["Habari","Asante","Kwaheri","Karibu"], correct: 2 },
    { text: "Jibu la 'Habari za jioni?':", options: ["Nzuri","Asante","Sawa","Karibu"], correct: 0 },
    { text: "Rangi za msingi ni:", options: ["kijani, njano, buluu","nyekundu, njano, buluu","nyeupe, nyeusi, kijivu","pink, zambarau, chungwa"], correct: 1 },
    { text: "Sentensi sahihi:", options: ["Mtoto chakula anakula","Anakula chakula mtoto","Mtoto anakula chakula","Chakula mtoto anakula"], correct: 2 },
    { text: "Kitenzi katika 'Mwanafunzi anasoma':", options: ["Mwanafunzi","anasoma","an-","-soma"], correct: 1 },
    { text: "Wakati uliopita wa 'ninakula':", options: ["nilikuwa nikula","nilikula","nitakula","nimekula"], correct: 1 },
    { text: "Wakati ujao wa 'anakimbia':", options: ["alikimbia","amekimbia","atakimbia","akimbie"], correct: 2 },
    { text: "Kiambishi cha ukanushi ni:", options: ["a-","si-","ta-","me-"], correct: 1 },
    { text: "Wakati timilifu 'amekula' ni:", options: ["atakula","alikula","amekula (timilifu)","anakula"], correct: 2 },
    { text: "Methali: 'Haraka haraka haina baraka' inamaanisha:", options: ["Fanya haraka","Polepole ni bora kuliko haraka isiyo na tija","Baraka ni muhimu","Fanya polepole tu"], correct: 1 },
    { text: "Methali: 'Umoja ni nguvu' inamaanisha:", options: ["Nguvu za kimwili","Kukaa pamoja kunaongeza nguvu","Mtu mmoja ni bora","Nguvu ya peke yako"], correct: 1 },
    { text: "Methali: 'Mtu ni watu' inamaanisha:", options: ["Watu wengi ni tatizo","Mtu anahitaji wengine","Kila mtu ni peke yake","Watu wote ni sawa"], correct: 1 },
    { text: "Methali: 'Usipoziba ufa utajenga ukuta' inamaanisha:", options: ["Jenga ukuta mkubwa","Zuia tatizo kabla halijaua kubwa","Fanya kazi kubwa kwanza","Ukuta ni muhimu"], correct: 1 },
    { text: "Methali: 'Asiyesikia la mkuu huvunjika guu' inamaanisha:", options: ["Kila mtu ana mkuu","Kutosikia ushauri husababisha matatizo","Vunjika mguu ni hali mbaya","Sikiliza muziki"], correct: 1 },
    { text: "Neno 'elimu' lina silabi ngapi?", options: ["2","3","4","5"], correct: 1 },
    { text: "Neno gani ni kivumishi?", options: ["mwanafunzi","anakimbia","mzuri","shule"], correct: 2 },
    { text: "Neno gani ni kielezi?", options: ["mwanafunzi","anakimbia","haraka","mpira"], correct: 2 },
    { text: "Kiunganishi 'lakini' kwa Kiingereza:", options: ["and","because","but","although"], correct: 2 },
    { text: "Kiunganishi 'na' kwa Kiingereza:", options: ["but","or","and","because"], correct: 2 },
    { text: "Neno 'upendo' ni nomino ya aina:", options: ["dhahiri","pekee","dhana","mahali"], correct: 2 },
    { text: "Herufi ya kwanza ya alfabeti ya Kiswahili:", options: ["E","B","A","C"], correct: 2 },
    { text: "Herufi ngapi ziko katika 'MAMA'?", options: ["3","4","5","2"], correct: 1 },
    { text: "Sentensi 'Mvua itanyesha' iko katika wakati:", options: ["uliopita","wa sasa","ujao","wa kawaida"], correct: 2 },
    { text: "Neno la kinyume cha 'mchana' ni:", options: ["alfajiri","asubuhi","usiku","jioni"], correct: 2 },
    { text: "Neno 'daktari' kwa Kiingereza:", options: ["teacher","nurse","doctor","driver"], correct: 2 },
    { text: "Neno 'polisi' kwa Kiingereza:", options: ["soldier","guard","police officer","firefighter"], correct: 2 },
    { text: "Neno 'mkulima' kwa Kiingereza:", options: ["teacher","farmer","trader","builder"], correct: 1 },
    { text: "Neno 'mvulana' ni:", options: ["msichana","mzee","mvulana (boy)","mtu"], correct: 2 },
    { text: "Neno 'msichana' kwa Kiingereza:", options: ["boy","man","woman","girl"], correct: 3 },
    { text: "Siku za wiki ni ngapi?", options: ["5","6","7","8"], correct: 2 },
    { text: "Siku ya kwanza ya wiki (Kenya):", options: ["Jumapili","Jumatatu","Jumanne","Alhamisi"], correct: 1 },
    { text: "Siku ya mwisho ya wiki:", options: ["Ijumaa","Alhamisi","Jumamosi","Jumapili"], correct: 3 },
    { text: "Miezi ya mwaka ni ngapi?", options: ["10","11","12","13"], correct: 2 },
    { text: "Mwezi wa kwanza wa mwaka:", options: ["Februari","Januari","Machi","Aprili"], correct: 1 },
    { text: "Mwezi wa mwisho wa mwaka:", options: ["Novemba","Oktoba","Desemba","Januari"], correct: 2 },
    { text: "Misimu ya hali ya hewa ni:", options: ["joto na baridi peke yake","masika, vuli, kiangazi (Kenya)","masika tu","mvua na jua tu"], correct: 1 },
    { text: "Rangi ya 'zambarau' ni:", options: ["blue","green","purple","orange"], correct: 2 },
    { text: "Rangi ya 'chungwa' ni:", options: ["orange","yellow","red","pink"], correct: 0 },
    { text: "Rangi ya 'kahawia' ni:", options: ["black","brown","grey","cream"], correct: 1 },
  ];
  // Total ≈ 50+55+45+30+42 = 222 questions
}

// ═══════════════════════════════════════════════════════════════════════════════
// KISWAHILI UPPER/JUNIOR/SENIOR
// ═══════════════════════════════════════════════════════════════════════════════
const KISWAHILI_UPPER: Question[] = [
  ...makeKiswAntonymQs().slice(0, 25),
  { text: "Ufahamu wa maandishi unalenga:", options: ["kukariri maneno","kuelewa maana ya maandishi","kuandika maneno mapya","kusahau maandishi"], correct: 1 },
  { text: "Insha ya ubunifu ni:", options: ["kuelezea habari za kweli","kuandika kwa ubunifu","kuandika ripoti","kutoa maelekezo tu"], correct: 1 },
  { text: "Tashbihi hutumia neno:", options: ["'na'","'kama' au 'mfano'","'lakini'","'ingawa'"], correct: 1 },
  { text: "Sitiari ni ulinganishaji:", options: ["wa moja kwa moja bila 'kama'","unaotumia 'kama'","methali","maneno ya ucheshi"], correct: 0 },
  { text: "Dhamira ya hadithi ni:", options: ["mhusika mkuu","ujumbe mkuu wa hadithi","mandhari","mwandishi"], correct: 1 },
  { text: "Tamthilia inachezwa:", options: ["kwenye ukurasa tu","jukwaa mbele ya hadhira","redio tu","vitabu tu"], correct: 1 },
  { text: "Kiwakilishi kinachukua nafasi ya:", options: ["kitenzi","nomino","kielezi","kivumishi"], correct: 1 },
  { text: "Kielezi kinakieleza:", options: ["nomino tu","kitenzi, kivumishi, au kielezi kingine","kiunganishi","kiwakilishi tu"], correct: 1 },
  { text: "Wakati timilifu unaonyesha:", options: ["kitendo kinachoendelea","kitendo kilichokamilika","kitendo cha wakati ujao","shaka"], correct: 1 },
  { text: "Barua rasmi inahitaji:", options: ["anuani na tarehe tu","anwani, tarehe, mwanzo rasmi, mwili, na mwisho rasmi","swahiba tu","jina tu"], correct: 1 },
  { text: "'Asiyesikia la mkuu huvunjika guu' inamaanisha:", options: ["Sikiliza muziki","Kutosikia ushauri husababisha matatizo","Vunjika mguu ni hali mbaya","Mkuu ana nguvu"], correct: 1 },
  { text: "Msimulizi wa hadithi ni:", options: ["mhusika mkuu","mwandishi","mtu anayesimulia","msomaji"], correct: 2 },
  { text: "Mandhari ya hadithi ni:", options: ["wahusika","mambo yanayotokea","mahali na wakati","mwandishi"], correct: 2 },
  { text: "Mashairi yana sifa gani?", options: ["ni mafupi tu","mdundo na mistari","maneno magumu tu","picha tu"], correct: 1 },
  { text: "Hadithi ya kubuni inaitwa:", options: ["historia","habari","ngano au riwaya","ripoti"], correct: 2 },
  { text: "Riwaya ni:", options: ["mashairi","hadithi ndefu ya kubuni","methali","tamthilia"], correct: 1 },
  { text: "Mshororo katika ushairi ni:", options: ["ubeti","mstari mmoja wa shairi","diwani","kiitikio"], correct: 1 },
  { text: "Ubeti katika ushairi ni:", options: ["mstari mmoja","sehemu ya shairi inayoundwa na mishororo kadhaa","diwani yote","kiitikio"], correct: 1 },
  { text: "'Usiku wa manane' maana yake:", options: ["mapema usiku","usiku wa kati (saa 6 usiku)","alfajiri","jioni"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENTAL ACTIVITIES — Grade 1–3 KICD Strands 1–4 (target: 420+ questions)
// Strand 1: Our Environment | Strand 2: Living Things | Strand 3: Non-Living Things | Strand 4: Relationships
// ═══════════════════════════════════════════════════════════════════════════════

// Animal fact generator (60 animals × 4 question types)
const ANIMAL_FACTS: [string, string, string, string, string][] = [
  // [animal, sound, legs, food, group]
  ["cow","moos","4","grass","herd"],["sheep","bleats","4","grass","flock"],
  ["dog","barks","4","meat/bones","pack"],["cat","meows","4","fish/meat","clowder"],
  ["hen","clucks","2","grain/worms","flock"],["duck","quacks","2","plants/worms","flock"],
  ["pig","oinks","4","vegetables/grain","sounder"],["goat","bleats","4","leaves/grass","herd"],
  ["horse","neighs","4","grass/hay","herd"],["donkey","brays","4","grass/hay","herd"],
  ["lion","roars","4","meat","pride"],["elephant","trumpets","4","plants","herd"],
  ["monkey","chatters","4","fruits","troop"],["eagle","screams","2","small animals",""],
  ["snake","hisses","0","small animals",""],["frog","croaks","4","insects","army"],
  ["fish","—","0","algae/smaller fish","school"],["butterfly","—","6","nectar",""],
  ["bee","—","6","nectar","swarm"],["ant","—","6","plants/insects","colony"],
  ["spider","—","8","insects",""],["crab","—","10","plants/fish",""],
  ["giraffe","—","4","leaves (acacia)","tower"],["zebra","—","4","grass","herd"],
  ["hippo","—","4","grass","bloat"],["crocodile","—","4","fish/meat",""],
  ["ostrich","—","2","plants/insects",""],["penguin","—","2","fish","colony"],
  ["parrot","squawks","2","seeds/fruit","flock"],["rabbit","—","4","vegetables/grass","colony"],
];

function makeAnimalQs(): Question[] {
  const qs: Question[] = [];
  ANIMAL_FACTS.forEach(([animal, sound, legs, food, group], i) => {
    const n = ANIMAL_FACTS.length;
    if (sound && sound !== "—") {
      const d = [ANIMAL_FACTS[(i+1)%n][1], ANIMAL_FACTS[(i+2)%n][1], ANIMAL_FACTS[(i+3)%n][1]];
      const dFiltered = d.filter(s => s !== "—" && s !== sound);
      if (dFiltered.length >= 3) {
        const pos = i % 4; const opts = [...dFiltered.slice(0,3)]; opts.splice(pos, 0, sound);
        qs.push({ text: `What sound does a ${animal} make?`, options: opts.slice(0,4) as [string,string,string,string], correct: pos });
      }
    }
    if (legs !== "—") {
      const legOptions: [string,string,string,string] = ["0","2","4","6"];
      const correctIdx = legOptions.indexOf(legs);
      if (correctIdx >= 0) {
        qs.push({ text: `How many legs does a ${animal} have?`, options: legOptions, correct: correctIdx });
      }
    }
    if (food && food !== "—") {
      const otherFoods = [ANIMAL_FACTS[(i+3)%n][3], ANIMAL_FACTS[(i+7)%n][3], ANIMAL_FACTS[(i+11)%n][3]];
      const d = otherFoods.filter(f => f !== food && f !== "—");
      if (d.length >= 3) {
        const pos = i % 4; const opts = [...d.slice(0,3)]; opts.splice(pos, 0, food);
        qs.push({ text: `What does a ${animal} mainly eat?`, options: opts.slice(0,4) as [string,string,string,string], correct: pos });
      }
    }
    if (group && group !== "") {
      const otherGroups = [ANIMAL_FACTS[(i+4)%n][4], ANIMAL_FACTS[(i+9)%n][4], ANIMAL_FACTS[(i+14)%n][4]];
      const d = otherGroups.filter(g => g !== "" && g !== group);
      if (d.length >= 3) {
        const pos = i % 4; const opts = [...d.slice(0,3)]; opts.splice(pos, 0, group);
        qs.push({ text: `A group of ${animal}s is called a:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos });
      }
    }
  });
  return qs;
}

// Plant facts (30 plants)
const PLANT_FACTS: [string, string, string][] = [
  ["mango","fruit tree","tropical fruit"],["banana","herb/plant","starchy fruit"],
  ["maize","cereal crop","food grain"],["bean","legume","protein"],
  ["spinach","vegetable","iron-rich"],["tomato","fruit/vegetable","vitamins"],
  ["cactus","succulent","stores water"],["rose","flower","ornament"],
  ["mango","tree","shade"],["baobab","tree","stores water in trunk"],
  ["fern","non-flowering","spores"],["moss","non-flowering","spores"],
  ["sugarcane","grass","sugar source"],["wheat","cereal","flour"],
  ["rice","cereal","staple food"],["tea","shrub","beverage"],
  ["coffee","shrub","beverage"],["aloe vera","succulent","medicine"],
  ["avocado","fruit tree","fats and vitamins"],["orange","citrus tree","Vitamin C"],
  ["lemon","citrus tree","Vitamin C and acid"],["pineapple","bromeliad","tropical fruit"],
  ["watermelon","vine","90% water"],["pumpkin","vine","vitamins"],
  ["arrow root","root crop","starchy"],["cassava","root crop","carbohydrate"],
  ["sweet potato","root crop","carbohydrate"],["potato","root crop","carbohydrate"],
  ["carrot","root vegetable","Vitamin A"],["sunflower","flower","seeds and oil"],
];
function makePlantQs(): Question[] {
  const qs: Question[] = [];
  PLANT_FACTS.forEach(([plant, type, use], i) => {
    const n = PLANT_FACTS.length;
    const otherTypes = [PLANT_FACTS[(i+2)%n][1], PLANT_FACTS[(i+5)%n][1], PLANT_FACTS[(i+8)%n][1]];
    const d1 = otherTypes.filter(t => t !== type);
    if (d1.length >= 3) {
      const pos = i % 4; const opts = [...d1.slice(0,3)]; opts.splice(pos, 0, type);
      qs.push({ text: `A ${plant} is classified as a:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos });
    }
    const otherUses = [PLANT_FACTS[(i+3)%n][2], PLANT_FACTS[(i+7)%n][2], PLANT_FACTS[(i+12)%n][2]];
    const d2 = otherUses.filter(u => u !== use);
    if (d2.length >= 3) {
      const pos = (i+1) % 4; const opts = [...d2.slice(0,3)]; opts.splice(pos, 0, use);
      qs.push({ text: `${plant} is known for being a source of:`, options: opts.slice(0,4) as [string,string,string,string], correct: pos });
    }
  });
  return qs;
}

const ENV_STATIC: Question[] = [
  // Our School & Home
  { text: "The person in charge of a school is called:", options: ["a teacher","a driver","a headteacher/principal","a cleaner"], correct: 2 },
  { text: "What do we use to sweep the floor?", options: ["a bucket","a broom","a cup","a pencil"], correct: 1 },
  { text: "A room where we keep books for reading is a:", options: ["kitchen","classroom","library","bathroom"], correct: 2 },
  // Plants
  { text: "Plants make food through:", options: ["respiration","digestion","photosynthesis","evaporation"], correct: 2 },
  { text: "The green pigment in plant leaves is called:", options: ["glucose","chlorophyll","starch","cellulose"], correct: 1 },
  { text: "Plants give out ___ during photosynthesis:", options: ["carbon dioxide","nitrogen","oxygen","hydrogen"], correct: 2 },
  { text: "Roots of a plant:", options: ["make food","anchor the plant and absorb water/minerals","produce seeds","carry out photosynthesis"], correct: 1 },
  { text: "The stem of a plant:", options: ["absorbs water from soil","supports the plant and transports water and food","makes seeds","produces flowers only"], correct: 1 },
  { text: "Flowers help a plant:", options: ["breathe","drink water","reproduce/make seeds","walk"], correct: 2 },
  { text: "Seeds grow into:", options: ["eggs","stones","new plants","water"], correct: 2 },
  { text: "A plant that produces cones instead of flowers is:", options: ["a rose bush","a pine/conifer tree","a mango tree","a banana plant"], correct: 1 },
  // Animals
  { text: "Animals that eat only plants are:", options: ["carnivores","omnivores","herbivores","decomposers"], correct: 2 },
  { text: "Animals that eat only other animals are:", options: ["herbivores","omnivores","carnivores","producers"], correct: 2 },
  { text: "Animals that eat both plants and animals are:", options: ["herbivores","carnivores","omnivores","decomposers"], correct: 2 },
  { text: "A caterpillar grows into a:", options: ["frog","butterfly","fish","worm"], correct: 1 },
  { text: "A tadpole grows into a:", options: ["fish","butterfly","frog","lizard"], correct: 2 },
  { text: "Metamorphosis means an animal:", options: ["grows bigger","changes form completely during development","moves to a new home","sleeps in winter"], correct: 1 },
  { text: "Birds are warm-blooded and have:", options: ["scales","gills","feathers and beaks","fur"], correct: 2 },
  { text: "Fish breathe using:", options: ["lungs","gills","skin","nostrils"], correct: 1 },
  { text: "Reptiles are covered in:", options: ["feathers","fur","scales","smooth skin"], correct: 2 },
  { text: "Mammals feed their young with:", options: ["seeds","milk","insects","grass only"], correct: 1 },
  { text: "Insects have ___ legs:", options: ["4","6","8","10"], correct: 1 },
  { text: "Spiders have ___ legs:", options: ["6","4","10","8"], correct: 3 },
  // Weather
  { text: "Water evaporates when it is:", options: ["frozen","heated (gains enough energy)","mixed with salt","kept in shade"], correct: 1 },
  { text: "Condensation happens when water vapour:", options: ["heats up","cools down and turns to liquid","freezes","evaporates"], correct: 1 },
  { text: "Rain is formed when water vapour in clouds:", options: ["heats up","cools and condenses then falls","blows away","freezes completely"], correct: 1 },
  { text: "The water cycle involves:", options: ["only rain","evaporation, condensation, and precipitation","only evaporation","only underground water"], correct: 1 },
  { text: "We use a thermometer to measure:", options: ["rainfall","wind speed","temperature","air pressure"], correct: 2 },
  { text: "A barometer measures:", options: ["rainfall","temperature","humidity","atmospheric pressure"], correct: 3 },
  { text: "A rain gauge measures:", options: ["wind speed","temperature","amount of rainfall","air pressure"], correct: 2 },
  // Water
  { text: "Water is found in ___ states:", options: ["1","2","3","4"], correct: 2 },
  { text: "Water turns to ice at:", options: ["-10°C","0°C","10°C","100°C"], correct: 1 },
  { text: "Water boils and turns to steam at:", options: ["50°C","80°C","90°C","100°C"], correct: 3 },
  { text: "Clean water for drinking should be:", options: ["any colour","colourless, odourless and tasteless","slightly yellow","slightly salty"], correct: 1 },
  { text: "Water can be purified by:", options: ["adding salt","boiling, filtering or chlorinating","cooling it","adding sugar"], correct: 1 },
  // Transport
  { text: "An aeroplane travels through:", options: ["water","soil","air","underground"], correct: 2 },
  { text: "Traffic lights: red means:", options: ["go","slow down","stop","caution"], correct: 2 },
  { text: "Traffic lights: green means:", options: ["stop","caution","slow down","go"], correct: 3 },
  { text: "A pedestrian crossing is used by:", options: ["cars only","pedestrians (people on foot)","cyclists only","animals only"], correct: 1 },
  // Health
  { text: "We should wash our hands:", options: ["only before sleeping","before eating and after toilet","only after playing","only on Mondays"], correct: 1 },
  { text: "A balanced diet contains:", options: ["only proteins","carbohydrates only","all food groups in right proportions","vitamins only"], correct: 2 },
  { text: "Proteins help our bodies:", options: ["provide energy only","build and repair tissues","keep us warm only","only fight diseases"], correct: 1 },
  { text: "Carbohydrates provide us with:", options: ["vitamins","minerals","energy","proteins"], correct: 2 },
  { text: "Vitamin C is found in:", options: ["meat and eggs","citrus fruits and vegetables","milk and dairy","cereals only"], correct: 1 },
  { text: "Vitamin D is produced when our skin is exposed to:", options: ["rain","moon light","sunlight","wind"], correct: 2 },
  { text: "Calcium builds strong:", options: ["blood only","bones and teeth","muscles only","nerves only"], correct: 1 },
  // Soil
  { text: "The top layer of soil good for farming is:", options: ["subsoil","bedrock","topsoil","gravel"], correct: 2 },
  { text: "Soil erosion is caused by:", options: ["planting trees","heavy rain and wind on bare land","adding compost","crop rotation"], correct: 1 },
  { text: "We plant trees to:", options: ["reduce shade","prevent soil erosion and produce oxygen","reduce rainfall","block the sun only"], correct: 1 },
  { text: "Which type of soil holds water best?", options: ["sandy","loam","clay","rocky"], correct: 2 },
  { text: "Sandy soil is best for:", options: ["growing all crops","drainage — lets water through quickly","retaining water","root crops only"], correct: 1 },
  { text: "Compost is made from:", options: ["chemicals","decayed plant and food waste","river sand","factory products"], correct: 1 },
  // Living vs non-living
  { text: "A sign that something is living:", options: ["it is shiny","it moves, grows, and reproduces","it is heavy","it is colourful"], correct: 1 },
  { text: "Which is non-living?", options: ["a mushroom","an earthworm","a chair","bacteria"], correct: 2 },
  { text: "Which is living?", options: ["a rock","a cloud","a bacterium","water"], correct: 2 },
  { text: "A virus is considered:", options: ["fully alive","fully non-living","at the boundary between living and non-living","an animal"], correct: 2 },
  // Energy & matter
  { text: "Fire needs ___ to burn:", options: ["water","oxygen/air","soil","metal"], correct: 1 },
  { text: "Day and night are caused by:", options: ["clouds moving","Earth rotating on its axis","moon blocking the sun","seasons"], correct: 1 },
  { text: "The sun is the main source of energy for:", options: ["machines only","all living things on Earth","rivers only","stones only"], correct: 1 },
  { text: "Recycling helps because it:", options: ["creates more waste","wastes energy","conserves resources and reduces waste","pollutes more"], correct: 2 },
  { text: "We should protect the environment by:", options: ["cutting all trees","throwing rubbish everywhere","recycling and planting trees","burning rubbish openly"], correct: 2 },
  { text: "Air is a mixture of gases, mainly:", options: ["only oxygen","oxygen and nitrogen (mostly)","carbon dioxide and oxygen","only nitrogen"], correct: 1 },
];

function buildEnvActivities(): Question[] {
  return [
    ...makeAnimalQs(),   // ~90 questions
    ...makePlantQs(),    // ~60 questions
    ...ENV_STATIC,       // ~65 questions
  ];
  // Total ≈ 215 questions → 14 unique windows for 34 materials
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATIVE ACTIVITIES — Grade 1–3 KICD Strand 1 (Visual Arts) + Strand 2 (Performing Arts)
// ═══════════════════════════════════════════════════════════════════════════════
const CREATIVE_ACTIVITIES: Question[] = [
  { text: "The three primary colours are:", options: ["green, orange, purple","red, yellow, blue","black, white, grey","pink, brown, beige"], correct: 1 },
  { text: "Mixing red and blue gives:", options: ["green","orange","purple/violet","brown"], correct: 2 },
  { text: "Mixing red and yellow gives:", options: ["purple","orange","green","brown"], correct: 1 },
  { text: "Mixing blue and yellow gives:", options: ["orange","purple","green","red"], correct: 2 },
  { text: "White + black gives:", options: ["brown","purple","grey","pink"], correct: 2 },
  { text: "Secondary colours are made by mixing:", options: ["secondary colours","primary colours","black and white","only dark colours"], correct: 1 },
  { text: "Green is made by mixing:", options: ["red + yellow","red + blue","blue + yellow","black + white"], correct: 2 },
  { text: "Orange is made by mixing:", options: ["blue + yellow","red + blue","red + yellow","green + blue"], correct: 2 },
  { text: "A warm colour in art:", options: ["blue","green","red or orange","purple"], correct: 2 },
  { text: "A cool colour in art:", options: ["red","orange","yellow","blue or green"], correct: 3 },
  { text: "We use a ruler to:", options: ["colour pictures","draw straight lines","erase mistakes","cut paper"], correct: 1 },
  { text: "We use an eraser to:", options: ["cut paper","measure length","erase pencil marks","paint"], correct: 2 },
  { text: "A paintbrush is used to apply:", options: ["glue only","paint","pencil marks","water only"], correct: 1 },
  { text: "Clay is used to make:", options: ["flat paintings","3D models and sculptures","music","only drawings"], correct: 1 },
  { text: "Paper folding art is called:", options: ["painting","sculpture","origami","mosaic"], correct: 2 },
  { text: "Collage is art made by:", options: ["painting only","sticking different materials on a surface","dancing","singing"], correct: 1 },
  { text: "Watercolour paint is mixed with:", options: ["oil","milk","water","sand"], correct: 2 },
  { text: "Scissors are used to:", options: ["draw shapes","paint surfaces","cut materials","mix colours"], correct: 2 },
  { text: "A mosaic is art made with:", options: ["paint only","small pieces of tile or stone","clay only","pencils only"], correct: 1 },
  { text: "Printing in art makes:", options: ["written words","repeated impressions using a stamp","freehand drawings","large painted surfaces"], correct: 1 },
  { text: "Weaving interlaces strips of material:", options: ["diagonally only","over and under alternately","only horizontally","only vertically"], correct: 1 },
  { text: "Symmetry means both halves:", options: ["are different","are mirror images of each other","use different colours","have no pattern"], correct: 1 },
  { text: "A still life painting shows:", options: ["landscapes only","moving objects","objects at rest (fruit, vases)","people in action"], correct: 2 },
  { text: "A landscape painting shows:", options: ["a single object","natural outdoor scenery","a portrait","abstract shapes only"], correct: 1 },
  { text: "A portrait is a painting or drawing of:", options: ["a tree","natural scenery","a person's face or figure","an animal group"], correct: 2 },
  { text: "Line in art can be:", options: ["only straight","only curved","straight, curved, thick or thin","only horizontal"], correct: 2 },
  { text: "Texture in art refers to:", options: ["colour only","the surface quality (rough, smooth, bumpy)","size of artwork","the artist's name"], correct: 1 },
  { text: "Space in art refers to:", options: ["the canvas size only","the area around, between, above and below objects","only negative areas","only positive areas"], correct: 1 },
  { text: "Form in art means:", options: ["colour only","a 3D shape with depth","a flat 2D shape","a type of paint"], correct: 1 },
  { text: "Pattern in art is created by:", options: ["random colours","repeating elements","only one colour","removing shapes"], correct: 1 },
  // Performing Arts — Music
  { text: "A group of people singing together is called a:", options: ["band","choir","orchestra","duo"], correct: 1 },
  { text: "Drums produce:", options: ["light","rhythm and sound through percussion","colour","heat"], correct: 1 },
  { text: "Tempo in music means:", options: ["how loud it is","the speed of the music","the pitch of notes","the instrument used"], correct: 1 },
  { text: "A lullaby is a song sung to:", options: ["celebrate a wedding","put a baby to sleep","welcome visitors","call for rain"], correct: 1 },
  { text: "Pitch in music is:", options: ["how fast the music goes","how high or low a note is","how loud the music is","the type of instrument"], correct: 1 },
  { text: "Rhythm in music is:", options: ["the melody","the pattern of long and short sounds","the pitch","the instrument"], correct: 1 },
  { text: "A flute is a ___ instrument:", options: ["percussion","string","wind/woodwind","keyboard"], correct: 2 },
  { text: "A drum is a ___ instrument:", options: ["string","wind","keyboard","percussion"], correct: 3 },
  { text: "A guitar is a ___ instrument:", options: ["percussion","string","wind","keyboard"], correct: 1 },
  { text: "A piano is a ___ instrument:", options: ["string only","wind only","percussion only","keyboard (also string)"], correct: 3 },
  { text: "A violin is a ___ instrument:", options: ["percussion","string","wind","keyboard"], correct: 1 },
  { text: "Dynamics in music is:", options: ["speed","pitch","loudness or softness","melody"], correct: 2 },
  // Drama & Dance
  { text: "Drama involves:", options: ["painting only","acting out stories and characters","only singing","only drawing"], correct: 1 },
  { text: "A puppet is controlled by:", options: ["electricity","wind","a person manipulating it","gravity only"], correct: 2 },
  { text: "Role play means:", options: ["playing a sport","pretending to be a character","drawing a map","writing a poem"], correct: 1 },
  { text: "A mask in drama is worn on the:", options: ["feet","hands","face","back"], correct: 2 },
  { text: "A folk song comes from:", options: ["only modern composers","community cultural tradition","factories","only one person"], correct: 1 },
  { text: "National anthem represents:", options: ["a school","a religion","a country","a sports club"], correct: 2 },
  { text: "Dance is the art of:", options: ["making visual art","moving the body rhythmically","writing stories","playing instruments only"], correct: 1 },
  { text: "A choreographer designs:", options: ["stage sets","dance movements and sequences","music compositions","costumes only"], correct: 1 },
  { text: "A monologue in drama is:", options: ["dialogue between characters","a long speech by one character","a stage direction","a costume"], correct: 1 },
  { text: "Improvisation in performance means:", options: ["following a strict script","creating spontaneously without full preparation","memorising lines exactly","always the same movements"], correct: 1 },
  { text: "Traditional Kenyan dances are part of:", options: ["foreign culture","Kenyan cultural heritage","only school activities","religious practice only"], correct: 1 },
  { text: "We use glue to:", options: ["cut paper","paint surfaces","stick materials together","mix colours"], correct: 2 },
  { text: "We use a compass to draw:", options: ["straight lines","squares","circles","triangles"], correct: 2 },
  { text: "A sketch is:", options: ["a finished painting","a rough, quick drawing","a type of music","a dance style"], correct: 1 },
  { text: "Shading in art creates:", options: ["flat appearance","colour only","depth and form by varying tone","patterns only"], correct: 2 },
  { text: "A stencil is used to:", options: ["cut shapes","create repeated shapes or patterns easily","paint large areas","write words"], correct: 1 },
  { text: "Primary colours mixed equally give:", options: ["white","black (approximately/brown)","grey","gold"], correct: 1 },
  { text: "An artist mixes colours on a:", options: ["canvas","palette","easel","sketchbook"], correct: 1 },
  { text: "An easel holds:", options: ["paints","brushes","the canvas/painting upright","water"], correct: 2 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// RELIGIOUS EDUCATION LOWER — Grade 1–3 KICD (target: 200+ questions)
// Strand 1: Creation | Strand 2: Prayer & Worship | Strand 3: Bible Stories | Strand 4: Values
// ═══════════════════════════════════════════════════════════════════════════════
const RE_LOWER: Question[] = [
  // Strand 1: Creation
  { text: "Who created the world?", options: ["scientists","people","God","animals"], correct: 2 },
  { text: "God created the world in how many days?", options: ["5","6","7","8"], correct: 2 },
  { text: "The first man created by God was:", options: ["Noah","Abraham","Adam","Moses"], correct: 2 },
  { text: "The first woman created by God was:", options: ["Mary","Eve","Sarah","Ruth"], correct: 1 },
  { text: "God rested on the ___ day:", options: ["5th","6th","7th","8th"], correct: 2 },
  { text: "God made light on the ___ day:", options: ["1st","2nd","3rd","4th"], correct: 0 },
  { text: "God made sea and dry land on the ___ day:", options: ["1st","2nd","3rd","4th"], correct: 2 },
  { text: "God made the sun, moon and stars on the ___ day:", options: ["2nd","3rd","4th","5th"], correct: 2 },
  { text: "God made fish and birds on the ___ day:", options: ["3rd","4th","5th","6th"], correct: 2 },
  { text: "God made land animals and humans on the ___ day:", options: ["4th","5th","6th","7th"], correct: 2 },
  { text: "God placed Adam and Eve in the Garden of:", options: ["Israel","Eden","Gethsemane","Galilee"], correct: 1 },
  // Strand 2: Prayer & Worship
  { text: "We talk to God through:", options: ["television","prayer","books only","music only"], correct: 1 },
  { text: "The Lord's Prayer begins with:", options: ["Blessed are the poor","Our Father who art in heaven","Hear O Israel","In the beginning"], correct: 1 },
  { text: "A church is a place where Christians:", options: ["buy food","play games","worship God","study maths"], correct: 2 },
  { text: "Prayer can be:", options: ["only speaking","only silent","spoken, sung, silent or written","only in church"], correct: 2 },
  { text: "We worship God to:", options: ["show we are important","thank and honour Him","make others jealous","prove we are good"], correct: 1 },
  // Strand 3: Bible Stories
  { text: "The Bible is divided into:", options: ["chapters only","Old Testament and New Testament","only stories","only Gospels"], correct: 1 },
  { text: "The first book of the Bible is:", options: ["Exodus","Psalms","Matthew","Genesis"], correct: 3 },
  { text: "Noah built an ark because:", options: ["he liked boats","God told him a great flood was coming","he wanted to fish","he was bored"], correct: 1 },
  { text: "Moses led the Israelites out of:", options: ["Babylon","Egypt","Rome","Persia"], correct: 1 },
  { text: "David killed Goliath with:", options: ["a sword","a spear","a sling and stone","an arrow"], correct: 2 },
  { text: "Jesus was born in:", options: ["Nazareth","Jerusalem","Bethlehem","Jericho"], correct: 2 },
  { text: "Jesus's mother was:", options: ["Ruth","Eve","Sarah","Mary"], correct: 3 },
  { text: "Jesus was baptised in the:", options: ["Sea of Galilee","Jordan River","Dead Sea","Red Sea"], correct: 1 },
  { text: "How many disciples did Jesus choose?", options: ["10","12","7","15"], correct: 1 },
  { text: "Jesus rose from the dead on:", options: ["Friday","Saturday","Sunday","Monday"], correct: 2 },
  { text: "The Good Samaritan parable teaches:", options: ["pray daily","love your neighbour","give to the church","fast regularly"], correct: 1 },
  { text: "The Parable of the Prodigal Son teaches about:", options: ["hard work","forgiveness and love","prayer","fasting"], correct: 1 },
  { text: "Abraham was told to leave:", options: ["Egypt","Ur of the Chaldeans","Jerusalem","Babylon"], correct: 1 },
  { text: "Joseph was sold into slavery by:", options: ["his parents","his brothers","strangers","Egyptians"], correct: 1 },
  { text: "The Ten Commandments were given to:", options: ["Abraham","David","Moses","Solomon"], correct: 2 },
  { text: "The Ten Commandments were given at Mount:", options: ["Olive","Sinai","Zion","Carmel"], correct: 1 },
  { text: "Solomon was known for his:", options: ["military strength","great wisdom","farming skills","painting"], correct: 1 },
  { text: "Jonah was swallowed by:", options: ["a whale/large fish","a crocodile","a serpent","a shark"], correct: 0 },
  { text: "The angel Gabriel visited Mary to tell her:", options: ["she won a prize","she would carry Jesus (God's Son)","she should leave","about her health"], correct: 1 },
  { text: "Jesus fed 5000 people with:", options: ["10 loaves and 5 fish","5 loaves and 2 fish","2 loaves and 5 fish","20 loaves and 10 fish"], correct: 1 },
  { text: "Jesus walked on:", options: ["fire","sand","water","clouds"], correct: 2 },
  { text: "The first miracle of Jesus was at:", options: ["Jerusalem","Bethlehem","Cana (turning water to wine)","Nazareth"], correct: 2 },
  // Strand 4: Values
  { text: "Honesty means:", options: ["telling lies","always telling the truth","taking others' things","being angry"], correct: 1 },
  { text: "Forgiveness means:", options: ["punishing others","hurting others back","letting go of hurt and anger","ignoring others"], correct: 2 },
  { text: "Kindness means:", options: ["being rude","being gentle and caring toward others","taking what you want","ignoring people in need"], correct: 1 },
  { text: "Obedience means:", options: ["doing whatever you want","following rules and good instructions","ignoring elders","arguing always"], correct: 1 },
  { text: "Sharing what we have shows:", options: ["selfishness","greediness","love and generosity","weakness"], correct: 2 },
  { text: "The Golden Rule teaches:", options: ["run fast","treat others as you want to be treated","care only for yourself","hate enemies"], correct: 1 },
  { text: "We should respect our parents because:", options: ["they are only our friends","they care for us and help us grow","we fear them","the law says only"], correct: 1 },
  { text: "Jesus taught us to love:", options: ["only our friends","only family","our neighbours and even our enemies","only those who love us back"], correct: 2 },
  { text: "Thankfulness means:", options: ["being greedy","showing gratitude for what we have","complaining always","taking more than you need"], correct: 1 },
  { text: "Fruit of the Holy Spirit includes:", options: ["power, wealth, fame","love, joy, peace, patience, kindness","money, health, success","speed, intelligence, strength"], correct: 1 },
  { text: "Humility means:", options: ["thinking you are the best","being proud","being modest and respectful, not boastful","always winning"], correct: 2 },
  { text: "Courage means:", options: ["doing dangerous things carelessly","facing fears and doing what is right","never being afraid","only physical strength"], correct: 1 },
  { text: "Integrity means:", options: ["being wealthy","being honest with strong moral principles","being popular","only following rules externally"], correct: 1 },
  { text: "Peace means:", options: ["always fighting","living in harmony without conflict","being very noisy","racing others"], correct: 1 },
  { text: "In Islam, the holy book is:", options: ["Torah","Bible","Quran","Vedas"], correct: 2 },
  { text: "Muslims pray how many times a day?", options: ["3","4","5","7"], correct: 2 },
  { text: "The month of fasting for Muslims is:", options: ["Hajj","Ramadan","Eid","Muharram"], correct: 1 },
  { text: "Eid al-Fitr celebrates:", options: ["Hajj","the end of Ramadan","a birth","a marriage"], correct: 1 },
  { text: "A mosque is a place of worship for:", options: ["Christians","Hindus","Muslims","Buddhists"], correct: 2 },
  { text: "A Hindu worships in a:", options: ["mosque","church","temple","synagogue"], correct: 2 },
  { text: "The Torah is the holy scripture of:", options: ["Christians","Muslims","Jews","Buddhists"], correct: 2 },
  { text: "Diwali is celebrated by:", options: ["Christians","Muslims","Hindus","Buddhists"], correct: 2 },
  { text: "Christmas celebrates:", options: ["Jesus's resurrection","Jesus's birth","the Holy Spirit coming","Jesus's baptism"], correct: 1 },
  { text: "Easter celebrates:", options: ["Jesus's birth","the Holy Spirit coming","Jesus's resurrection","Christmas"], correct: 2 },
  { text: "Pentecost celebrates:", options: ["Jesus's birth","Jesus's resurrection","the coming of the Holy Spirit","Christmas"], correct: 2 },
  { text: "Good Friday marks:", options: ["Christmas","Jesus's baptism","the crucifixion of Jesus","Pentecost"], correct: 2 },
  { text: "We show love to God by:", options: ["praying, obeying and serving others","only praying","only going to church","only singing"], correct: 0 },
  { text: "Stewardship means:", options: ["owning as much as possible","responsible care of God's creation and gifts","giving to church only","taking from others"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// RE UPPER — Grade 4–6
// ═══════════════════════════════════════════════════════════════════════════════
const RE_UPPER: Question[] = [
  ...RE_LOWER.slice(30, 70),
  { text: "Abraham was promised to become father of a great:", options: ["army","nation","church","school"], correct: 1 },
  { text: "Prophet Elijah challenged the prophets of:", options: ["Baal","Israel","Egypt","Babylon"], correct: 0 },
  { text: "The Sermon on the Mount contains:", options: ["the Ten Commandments","the Beatitudes","only the Lord's Prayer","the Psalms"], correct: 1 },
  { text: "The Great Commission commands Christians to:", options: ["build churches","make disciples of all nations","pray only","give to the poor only"], correct: 1 },
  { text: "Pentecost is the coming of:", options: ["Jesus on earth","the Holy Spirit to the disciples","angels to Mary","Moses to the people"], correct: 1 },
  { text: "Social justice means:", options: ["judging others harshly","fair treatment and equal rights for all","only helping the rich","following strict law only"], correct: 1 },
  { text: "Environmental ethics teaches us to:", options: ["use resources wastefully","destroy forests","care for and protect God's creation","ignore nature"], correct: 2 },
  { text: "The Church's mission includes:", options: ["collecting money only","proclaiming the Gospel and serving humanity","only maintaining buildings","only singing hymns"], correct: 1 },
  { text: "Agape love means:", options: ["romantic love","family love only","unconditional, self-giving love","friendship only"], correct: 2 },
  { text: "Faith means:", options: ["doubting everything","trusting in God even without seeing","only praying once","not believing"], correct: 1 },
  { text: "Hajj is the Muslim pilgrimage to:", options: ["Jerusalem","Medina","Mecca","Cairo"], correct: 2 },
  { text: "The Five Pillars of Islam include Shahadah, which is:", options: ["prayer","fasting","declaration of faith in Allah and Muhammad","charity"], correct: 2 },
  { text: "Zakat (one of the Five Pillars) involves:", options: ["fasting","prayer","giving charity to the poor","pilgrimage"], correct: 2 },
  { text: "The Sabbath in Judaism is:", options: ["Sunday","Friday","Saturday","Thursday"], correct: 2 },
  { text: "Diwali is the Festival of:", options: ["Harvest","Lights","Water","Flowers"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// RE JUNIOR — Grade 7–9
// ═══════════════════════════════════════════════════════════════════════════════
const RE_JUNIOR: Question[] = [
  ...RE_UPPER,
  { text: "Liberation theology focuses on:", options: ["only personal salvation","God's concern for the poor and oppressed","only church buildings","only individual prayer"], correct: 1 },
  { text: "'Ubuntu' in African philosophy means:", options: ["individual success only","I am because we are — human interconnectedness","competition above all","financial wealth"], correct: 1 },
  { text: "Ecumenism is:", options: ["conflict between religions","cooperation among Christian denominations","rejecting other faiths","converting everyone"], correct: 1 },
  { text: "Martyrdom in religious history means:", options: ["abandoning faith","dying for one's faith or beliefs","converting others forcefully","long fasting"], correct: 1 },
  { text: "The Reformation (16th century):", options: ["started Christianity","questioned Catholic practices, led to Protestant churches","ended Islam","began the Crusades"], correct: 1 },
  { text: "Karma in Hinduism/Buddhism means:", options: ["a prayer","actions and their consequences affecting future lives","a festival","a holy text"], correct: 1 },
  { text: "Nirvana in Buddhism is:", options: ["heaven for warriors","liberation from suffering and cycle of rebirth","a type of prayer","a Buddhist temple"], correct: 1 },
  { text: "The Golden Rule is found in:", options: ["only Christianity","many world religions","only Islam","only Judaism"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SCIENCE AND TECHNOLOGY — Grade 4–6 (~150 questions)
// ═══════════════════════════════════════════════════════════════════════════════
const SCI_TECH_UPPER: Question[] = [
  { text: "Plants make food through:", options: ["respiration","digestion","photosynthesis","evaporation"], correct: 2 },
  { text: "The green pigment in leaves is:", options: ["glucose","chlorophyll","starch","cellulose"], correct: 1 },
  { text: "Plants take in CO₂ through:", options: ["roots","stem","stomata","flowers"], correct: 2 },
  { text: "Plants release ___ during photosynthesis:", options: ["CO₂","nitrogen","oxygen","hydrogen"], correct: 2 },
  { text: "A caterpillar → butterfly is called:", options: ["reproduction","metamorphosis","respiration","digestion"], correct: 1 },
  { text: "A camel is adapted by:", options: ["having short legs","storing water/fat in hump","breathing underwater","having webbed feet"], correct: 1 },
  { text: "A fish breathes using:", options: ["lungs","skin","gills","nostrils"], correct: 2 },
  { text: "States of matter:", options: ["hot, warm, cold","solid, liquid, gas","light, dark, dim","big, small, tiny"], correct: 1 },
  { text: "Water freezes at:", options: ["-10°C","0°C","10°C","100°C"], correct: 1 },
  { text: "Water boils at:", options: ["90°C","80°C","100°C","70°C"], correct: 2 },
  { text: "Evaporation: liquid changes to:", options: ["solid","gas","another liquid","light"], correct: 1 },
  { text: "Condensation: gas changes to:", options: ["solid","gas","liquid","plasma"], correct: 2 },
  { text: "Gravity pulls objects toward:", options: ["the sky","Earth's centre","the moon","other objects always equally"], correct: 1 },
  { text: "Friction:", options: ["speeds up motion only","opposes motion between two surfaces","creates motion","attracts metals"], correct: 1 },
  { text: "A magnet attracts:", options: ["all metals","iron, steel, nickel and cobalt","wood and plastic","copper and gold"], correct: 1 },
  { text: "Like poles of magnets:", options: ["attract","repel","stick permanently","have no effect"], correct: 1 },
  { text: "Unlike poles of magnets:", options: ["repel","attract","cancel out","no effect"], correct: 1 },
  { text: "Good conductor of electricity:", options: ["rubber","plastic","copper","wood"], correct: 2 },
  { text: "Good insulator of electricity:", options: ["copper","aluminium","iron","rubber"], correct: 3 },
  { text: "A simple circuit needs:", options: ["only a battery","battery, wire and load","only wires","only a bulb"], correct: 1 },
  { text: "Solar energy comes from:", options: ["wind","the moon","the sun","water"], correct: 2 },
  { text: "Sound is produced by:", options: ["light","vibration","electricity only","heat only"], correct: 1 },
  { text: "Light travels in:", options: ["curved lines","zigzag lines","straight lines","only vertical waves"], correct: 2 },
  { text: "Digestion starts in the:", options: ["stomach","small intestine","mouth","large intestine"], correct: 2 },
  { text: "The heart:", options: ["produces blood","filters blood","pumps blood around the body","digests food"], correct: 2 },
  { text: "Lungs:", options: ["pump blood","filter blood","exchange gases (O₂ and CO₂)","digest food"], correct: 2 },
  { text: "The skeleton:", options: ["only stores calcium","provides support, protection and movement","only produces blood","only gives shape"], correct: 1 },
  { text: "Vitamin D prevents:", options: ["scurvy","rickets","anaemia","goitre"], correct: 1 },
  { text: "Vitamin C prevents:", options: ["rickets","anaemia","scurvy","goitre"], correct: 2 },
  { text: "Malaria is spread by:", options: ["drinking dirty water","eating bad food","female Anopheles mosquito","touching infected people"], correct: 2 },
  { text: "A food chain shows:", options: ["where animals live","energy flow through feeding relationships","how weather changes","how plants grow"], correct: 1 },
  { text: "A producer in a food chain is a:", options: ["carnivore","decomposer","herbivore","green plant"], correct: 3 },
  { text: "Decomposers break down:", options: ["living plants","dead organic matter","rocks","air"], correct: 1 },
  { text: "An ecosystem includes:", options: ["only animals","only plants","all organisms and their non-living environment","only humans"], correct: 2 },
  { text: "Deforestation means:", options: ["planting more trees","cutting down forests","growing crops","conserving wildlife"], correct: 1 },
  { text: "Recycling:", options: ["creates more waste","conserves resources and reduces waste","uses more energy","pollutes more"], correct: 1 },
  { text: "Internet connects computers:", options: ["only in schools","only in governments","worldwide for sharing info","only in banks"], correct: 2 },
  { text: "A thermometer measures:", options: ["pressure","time","temperature","mass"], correct: 2 },
  { text: "The unit of force is:", options: ["Joule","Watt","Newton","Pascal"], correct: 2 },
  { text: "The unit of energy is:", options: ["Newton","Watt","Pascal","Joule"], correct: 3 },
  { text: "Refraction: light bends when it:", options: ["reflects off mirrors","enters a different medium","diffracts around edges","travels in vacuum"], correct: 1 },
  { text: "A lens converges or diverges:", options: ["sound","electricity","light rays","magnets"], correct: 2 },
  { text: "Density = Mass ÷:", options: ["Weight","Time","Volume","Surface area"], correct: 2 },
  { text: "Objects float if their density is ___ the fluid:", options: ["equal to","greater than","less than","unrelated to"], correct: 2 },
  { text: "The water cycle's main stages:", options: ["only rain","evaporation, condensation, precipitation","only evaporation","only precipitation"], correct: 1 },
  { text: "Photosynthesis stores energy as:", options: ["proteins","fats","glucose/carbohydrates","minerals"], correct: 2 },
  { text: "Respiration (aerobic) produces:", options: ["only CO₂","only water","CO₂ + water + ATP energy","only ATP"], correct: 2 },
  { text: "A herbivore example:", options: ["lion","eagle","cow","crocodile"], correct: 2 },
  { text: "A carnivore example:", options: ["sheep","cow","rabbit","eagle"], correct: 3 },
  { text: "An omnivore example:", options: ["cow","goat","rabbit","human"], correct: 3 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// AGRICULTURE — Grade 4–6
// ═══════════════════════════════════════════════════════════════════════════════
const AGRICULTURE_UPPER: Question[] = [
  { text: "Top layer of soil used for farming:", options: ["subsoil","bedrock","topsoil","clay pan"], correct: 2 },
  { text: "Soil erosion is mainly caused by:", options: ["planting trees","wind and water on bare land","adding manure","crop rotation"], correct: 1 },
  { text: "Crop rotation maintains:", options: ["pests","soil fertility","rainfall","weeds"], correct: 1 },
  { text: "Legumes improve soil by:", options: ["adding phosphorus","fixing nitrogen from the air","removing water","loosening clay only"], correct: 1 },
  { text: "An example of a legume:", options: ["maize","millet","beans","wheat"], correct: 2 },
  { text: "A cereal crop example:", options: ["beans","maize","potatoes","peas"], correct: 1 },
  { text: "Drip irrigation saves:", options: ["seeds","water — delivers directly to roots","fertiliser","labour only"], correct: 1 },
  { text: "Terracing reduces:", options: ["crop yield","soil erosion on slopes","rainfall","weeds"], correct: 1 },
  { text: "Mulching helps soil:", options: ["dry faster","retain moisture and control weeds","become harder","lose nutrients"], correct: 1 },
  { text: "Composting creates:", options: ["chemical fertiliser","natural organic manure","topsoil only","rocks"], correct: 1 },
  { text: "NPK stands for:", options: ["harmful chemicals","Nitrogen, Phosphorus, Potassium","water pollutants","types of soil"], correct: 1 },
  { text: "Pesticides control:", options: ["soil fertility","pests and harmful insects","plant growth","water use"], correct: 1 },
  { text: "A herbicide controls:", options: ["insects","fungi","weeds","rodents"], correct: 2 },
  { text: "Removing unwanted plants is called:", options: ["pruning","weeding","mulching","thinning"], correct: 1 },
  { text: "A root crop example:", options: ["wheat","cassava","beans","millet"], correct: 1 },
  { text: "Kenya's main cash crop:", options: ["maize","millet","tea","cassava"], correct: 2 },
  { text: "Kenya's main food crop:", options: ["tea","coffee","maize","wheat"], correct: 2 },
  { text: "Poultry farming involves:", options: ["cattle and goats","chickens, ducks, turkeys","fish only","bees"], correct: 1 },
  { text: "A layer hen is mainly for:", options: ["meat","eggs","leather","feathers"], correct: 1 },
  { text: "A broiler chicken is mainly for:", options: ["eggs","meat","feathers","sport"], correct: 1 },
  { text: "Dairy farming focuses on:", options: ["beef","wool","milk production","poultry"], correct: 2 },
  { text: "Newcastle disease affects:", options: ["cattle","fish","poultry (birds)","pigs"], correct: 2 },
  { text: "Afforestation means:", options: ["cutting all trees","planting trees on bare/deforested land","burning forests","removing stumps"], correct: 1 },
  { text: "Irrigation is:", options: ["natural rainfall only","artificially watering crops","draining swamps","storing grain"], correct: 1 },
  { text: "A neutral pH is:", options: ["2","5","7","10"], correct: 2 },
  { text: "Most crops grow best at pH:", options: ["2–4","5.5–7.5","9–14","0–2"], correct: 1 },
  { text: "Organic fertiliser comes from:", options: ["factories","natural sources like compost and manure","chemicals only","water"], correct: 1 },
  { text: "Cover crops:", options: ["shade main crop","protect soil and add nutrients","increase pests","reduce rainfall"], correct: 1 },
  { text: "Pruning means:", options: ["adding fertiliser","removing dead/excess plant parts","harvesting","planting seeds"], correct: 1 },
  { text: "A nursery is used for:", options: ["selling crops","raising young seedlings before transplanting","storing harvested crops","keeping livestock"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCIENCE — Grade 4–6
// ═══════════════════════════════════════════════════════════════════════════════
const HOME_SCIENCE: Question[] = [
  { text: "Proteins help to:", options: ["provide energy only","build and repair body tissues","keep us warm only","fight diseases only"], correct: 1 },
  { text: "Carbohydrates are the main source of:", options: ["vitamins","minerals","energy","proteins"], correct: 2 },
  { text: "Vitamin A prevents:", options: ["rickets","scurvy","night blindness","goitre"], correct: 2 },
  { text: "Iron deficiency causes:", options: ["rickets","scurvy","anaemia","goitre"], correct: 2 },
  { text: "Iodine deficiency causes:", options: ["rickets","anaemia","scurvy","goitre"], correct: 3 },
  { text: "Calcium builds strong:", options: ["blood only","bones and teeth","muscles only","nerves only"], correct: 1 },
  { text: "A balanced diet contains:", options: ["only proteins","carbs only","all food groups in right proportions","vitamins only"], correct: 2 },
  { text: "Pasteurisation:", options: ["freezes milk","heats milk briefly to kill bacteria","adds preservatives","dries food"], correct: 1 },
  { text: "Natural fibres include:", options: ["nylon and polyester","cotton (plant) and wool/silk (animal)","only nylon","only polyester"], correct: 1 },
  { text: "Synthetic fibres include:", options: ["cotton and wool","silk and linen","nylon and polyester","cotton and nylon"], correct: 2 },
  { text: "Cotton is from:", options: ["animals","trees","the cotton plant","synthetic sources"], correct: 2 },
  { text: "Wool is from:", options: ["cotton plant","sheep","polyester","chemical"], correct: 1 },
  { text: "Silk is produced by:", options: ["spiders","silkworms","sheep","cotton plants"], correct: 1 },
  { text: "Linen comes from:", options: ["cotton plant","sheep","flax plant","synthetic chemicals"], correct: 2 },
  { text: "Refrigeration preserves food by:", options: ["heating it","slowing microbial growth at low temp","adding salt","drying it"], correct: 1 },
  { text: "Dehydration (drying) removes:", options: ["vitamins","moisture bacteria need to grow","salt","flavour only"], correct: 1 },
  { text: "Kitchen safety includes:", options: ["running in kitchen","careless use of sharp knives","using pot holders and inward-turned handles","leaving hot pans unattended"], correct: 2 },
  { text: "Consumer education helps to:", options: ["buy everything","make informed purchasing decisions","waste money","ignore labels"], correct: 1 },
  { text: "Food spoilage is caused by:", options: ["clean storage","bacteria, fungi and enzymes","proper refrigeration","airtight containers"], correct: 1 },
  { text: "First Aid for burns:", options: ["apply butter","run cold water for 10+ minutes","apply cooking oil","cover with dry cloth immediately"], correct: 1 },
  { text: "BMI measures:", options: ["blood sugar","height only","weight only","body weight relative to height"], correct: 3 },
  { text: "Steaming food:", options: ["loses more nutrients than boiling","preserves more nutrients than boiling","destroys all vitamins","only heats food"], correct: 1 },
  { text: "Dietary fibre helps:", options: ["build muscles","healthy digestion and preventing constipation","produce vitamins","store energy"], correct: 1 },
  { text: "Kwashiorkor is caused by deficiency of:", options: ["carbohydrates","proteins","vitamin C","vitamin D"], correct: 1 },
  { text: "Marasmus is caused by:", options: ["only protein deficiency","only vitamin deficiency","severe caloric and nutrient deficiency","only iron deficiency"], correct: 2 },
  { text: "Washing clothes removes:", options: ["colour","shape","dirt, stains and micro-organisms","size"], correct: 2 },
  { text: "Iron (clothes iron) temperature for cotton:", options: ["very low","medium","high","no heat"], correct: 2 },
  { text: "Disinfectants are used to:", options: ["cook food","kill micro-organisms on surfaces","wash clothes","remove stains"], correct: 1 },
  { text: "Cross-contamination in cooking means:", options: ["mixing spices","transferring bacteria from raw to cooked food","cooking on low heat","using wrong utensils"], correct: 1 },
  { text: "Food labelling helps consumers know:", options: ["the cook's name","ingredients, nutrition and expiry date","the shop location","the price only"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL STUDIES (reuse from existing, now deduplicated)
// ═══════════════════════════════════════════════════════════════════════════════
const SOCIAL_STUDIES_UPPER: Question[] = [
  { text: "Capital city of Kenya:", options: ["Mombasa","Kisumu","Nairobi","Eldoret"], correct: 2 },
  { text: "Highest mountain in Kenya:", options: ["Mt. Elgon","Aberdare Range","Mt. Kenya","Kilimanjaro"], correct: 2 },
  { text: "Lake Victoria is shared by:", options: ["Ethiopia and Somalia","Uganda, Kenya and Tanzania","Sudan and Uganda","Tanzania and Mozambique"], correct: 1 },
  { text: "Largest lake in Africa:", options: ["Lake Tanganyika","Lake Malawi","Lake Victoria","Lake Chad"], correct: 2 },
  { text: "Kenya gained independence in:", options: ["1960","1961","1962","1963"], correct: 3 },
  { text: "First President of Kenya:", options: ["Moi","Tom Mboya","Jomo Kenyatta","Oginga Odinga"], correct: 2 },
  { text: "Kenya is located in:", options: ["West Africa","Southern Africa","East Africa","Central Africa"], correct: 2 },
  { text: "Kenya's currency:", options: ["Shilling","Pound","Dollar","Euro"], correct: 0 },
  { text: "Kenya has ___ counties:", options: ["42","47","52","36"], correct: 1 },
  { text: "Maasai Mara is famous for:", options: ["deep sea fishing","Great Wildebeest Migration","diamond mining","wheat farming"], correct: 1 },
  { text: "Africa has ___ countries:", options: ["52","54","56","58"], correct: 1 },
  { text: "Longest river in Africa:", options: ["Congo","Zambezi","Niger","Nile"], correct: 3 },
  { text: "Highest mountain in Africa:", options: ["Mt. Kenya","Mt. Elgon","Mt. Kilimanjaro","Drakensberg"], correct: 2 },
  { text: "Largest desert in the world:", options: ["Kalahari","Sahara","Namib","Arabian"], correct: 1 },
  { text: "Ethiopia's capital:", options: ["Mogadishu","Nairobi","Addis Ababa","Kampala"], correct: 2 },
  { text: "Uganda's capital:", options: ["Kampala","Entebbe","Jinja","Gulu"], correct: 0 },
  { text: "Tanzania's government capital:", options: ["Dar es Salaam","Dodoma","Zanzibar","Arusha"], correct: 1 },
  { text: "The Mau Mau fought for:", options: ["independence from Germany","independence from Britain","regional autonomy","economic rights only"], correct: 1 },
  { text: "Kenya's national anthem begins:", options: ["Nchi yetu Kenya","Ee Mungu nguvu yetu","Kenya land of beauty","Stand and sing"], correct: 1 },
  { text: "Uhuru Day in Kenya:", options: ["1st June","12th December","1st January","20th October"], correct: 1 },
  { text: "Madaraka Day:", options: ["12th December","20th October","1st June","1st January"], correct: 2 },
  { text: "Kenya is a:", options: ["monarchy","republic","colony","federation"], correct: 1 },
  { text: "Kenyan Parliament consists of:", options: ["Senate only","National Assembly only","National Assembly and Senate","Cabinet only"], correct: 2 },
  { text: "Kenya's constitution promulgated:", options: ["2004","2006","2010","2013"], correct: 2 },
  { text: "County government is headed by:", options: ["MP","Senator","Governor","MCA"], correct: 2 },
  { text: "Harambee means:", options: ["work alone","pulling together/self-help","national holiday","cultural dance"], correct: 1 },
  { text: "The equator divides Earth into:", options: ["east and west hemispheres","north and south hemispheres","time zones","continents"], correct: 1 },
  { text: "Prime Meridian (0° longitude) passes through:", options: ["Kenya","Egypt","Greenwich, UK","France"], correct: 2 },
  { text: "A map key (legend) explains:", options: ["direction of north","scale of map","symbols used on map","year made"], correct: 2 },
  { text: "Scale on a map helps calculate:", options: ["direction","colour meaning","real distances from map distances","country names"], correct: 2 },
  { text: "A contour line shows:", options: ["rivers","roads","points of equal altitude","political boundaries"], correct: 2 },
  { text: "Population density is:", options: ["total population","number of people per unit area","population growth rate","migration patterns"], correct: 1 },
  { text: "Urbanisation means:", options: ["moving to rural areas","growth of towns as people migrate there","only building houses","agricultural expansion"], correct: 1 },
  { text: "COMESA stands for:", options: ["Common Market for Eastern and Southern Africa","Community of Middle Eastern States","Central Organisation of Markets and Economic Support","Commonwealth of Eastern and Southern African Markets"], correct: 0 },
  { text: "The Indian Ocean lies to the ___ of Kenya:", options: ["north","south","west","east"], correct: 3 },
  { text: "Kenya's longest river:", options: ["River Tana","River Athi","River Mara","River Nzoia"], correct: 0 },
  { text: "The largest country in Africa by area:", options: ["Sudan","Congo","Algeria","Libya"], correct: 2 },
  { text: "The most populous African country:", options: ["Kenya","South Africa","Ethiopia","Nigeria"], correct: 3 },
  { text: "The Great Rift Valley was formed by:", options: ["volcanic eruption only","earthquake only","tectonic plate movement","erosion by rivers"], correct: 2 },
  { text: "Physical geography studies:", options: ["human activities only","natural features like mountains, rivers, climate","historical events","political systems"], correct: 1 },
  { text: "The right to education in Kenya is:", options: ["only for wealthy families","a fundamental right for all children","only for city children","only at secondary level"], correct: 1 },
  { text: "The Maasai community is mainly found in:", options: ["coastal Kenya","the highlands","semi-arid Rift Valley","western Kenya"], correct: 2 },
  { text: "The Luo community is mainly in:", options: ["Central Kenya","Nyanza/western Kenya","Rift Valley","Coast"], correct: 1 },
  { text: "The Kikuyu community is mainly in:", options: ["Nyanza","Central Kenya","Coast","Northern Kenya"], correct: 1 },
  { text: "Tourism earns Kenya:", options: ["very little","significant foreign exchange","only local money","no economic benefit"], correct: 1 },
  { text: "The EAC promotes:", options: ["conflict between states","regional integration and cooperation in East Africa","military alliance only","language uniformity only"], correct: 1 },
  { text: "A member of the EAC is:", options: ["Ethiopia","Somalia","Tanzania","Sudan"], correct: 2 },
  { text: "Kenya's main export to Europe:", options: ["maize","fish","tea","coffee (tea is #1)"], correct: 2 },
  { text: "Nairobi is sometimes called:", options: ["The Safari Capital","Green City in the Sun","City by the Lake","The White City"], correct: 1 },
  { text: "The Kenyan coast is famous for:", options: ["cold weather","beaches, tourism and old Swahili towns","gold mines","heavy industry"], correct: 1 },
];

const SOCIAL_STUDIES_JUNIOR: Question[] = [
  ...SOCIAL_STUDIES_UPPER.slice(0, 25),
  { text: "The Berlin Conference (1884–85) divided:", options: ["Europe among African powers","Africa among European powers","Asia among European powers","the Americas among Europeans"], correct: 1 },
  { text: "Colonialism means:", options: ["trading between countries","one country taking control of another territory","independence for all","cultural exchange only"], correct: 1 },
  { text: "Pan-Africanism is:", options: ["Africa becoming one country","idea that African people share a common destiny and should unite","Africa isolating itself","a religion"], correct: 1 },
  { text: "The OAU was founded in:", options: ["1955","1963","1975","1994"], correct: 1 },
  { text: "The AU replaced the OAU in:", options: ["1999","2001","2002","2005"], correct: 2 },
  { text: "UN was founded after:", options: ["World War I","World War II","The Cold War","The Korean War"], correct: 1 },
  { text: "Democracy means government by:", options: ["one leader","the military","the people through elected representatives","religious leaders"], correct: 2 },
  { text: "A constitution is:", options: ["a school rule book","the supreme law of the land","a government budget","a treaty"], correct: 1 },
  { text: "Checks and balances prevent:", options: ["efficient governance","abuse of power by any one branch","democratic elections","international trade"], correct: 1 },
  { text: "GDP stands for:", options: ["General Development Plan","Gross Domestic Product","Global Development Programme","Government Development Policy"], correct: 1 },
  { text: "Inflation means:", options: ["a fall in prices","a general rise in prices over time","economic growth","reduced unemployment"], correct: 1 },
  { text: "Subsistence farming is for:", options: ["profit and export","feeding the farming family (little surplus)","large-scale sale","only cash crops"], correct: 1 },
  { text: "Climate change is mainly caused by:", options: ["natural cycles only","human greenhouse gas emissions","volcanic eruptions only","ocean currents only"], correct: 1 },
  { text: "Sustainable development:", options: ["uses all resources now","meets present needs without harming future generations","only economic growth","only environmental protection"], correct: 1 },
  { text: "Push factors for migration include:", options: ["better jobs elsewhere","drought, war and poverty","good climate at current location","family where you are"], correct: 1 },
  { text: "Pull factors for migration include:", options: ["war and drought","better opportunities at destination","poor services at destination","high crime at destination"], correct: 1 },
  { text: "The slave trade was abolished in the British Empire in:", options: ["1776","1807","1833","1900"], correct: 1 },
  { text: "Kenya became a British Protectorate in:", options: ["1885","1895","1905","1915"], correct: 1 },
  { text: "Kwame Nkrumah led ___ to independence first in sub-Saharan Africa:", options: ["Kenya","Nigeria","Ghana","Tanzania"], correct: 2 },
  { text: "Apartheid ended in South Africa in:", options: ["1980","1990","1994","2000"], correct: 2 },
  { text: "The Cold War was between:", options: ["China and India","USA and USSR","Europe and Africa","NATO and AU"], correct: 1 },
  { text: "The UN's Universal Declaration of Human Rights was adopted in:", options: ["1945","1948","1960","1975"], correct: 1 },
  { text: "The legislative branch makes/passes:", options: ["court decisions","laws","army commands","taxes only"], correct: 1 },
  { text: "Global warming causes:", options: ["cooler temperatures","more ice growth","rising sea levels and extreme weather","less rainfall everywhere"], correct: 2 },
  { text: "Ecotourism promotes:", options: ["mass tourism only","responsible travel that conserves nature and benefits local people","only luxury travel","hunting tourism"], correct: 1 },
];

const CREATIVE_ARTS_UPPER: Question[] = [...CREATIVE_ACTIVITIES.slice(0, 45)];
const CREATIVE_ARTS_SPORTS: Question[] = [...CREATIVE_ACTIVITIES.slice(20, 60)];

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATED SCIENCE, PRE-TECHNICAL, AGRI-NUTRITION, PHYSICS, CHEMISTRY,
// BIOLOGY, HISTORY, GEOGRAPHY, BUSINESS, COMPUTER SCIENCE
// (kept concise — these upper/junior/senior subjects have fewer materials: 21–23)
// ═══════════════════════════════════════════════════════════════════════════════

const INTEGRATED_SCIENCE: Question[] = [
  { text: "The cell is the basic unit of:", options: ["geology","all living organisms","chemical elements","physics"], correct: 1 },
  { text: "The nucleus contains:", options: ["energy for cell","chromosomes and DNA","chlorophyll","cell sap"], correct: 1 },
  { text: "Mitochondria produce energy through:", options: ["photosynthesis","protein synthesis","cellular respiration","cell division"], correct: 2 },
  { text: "Chloroplasts in plant cells do:", options: ["cellular respiration","photosynthesis","protein synthesis","cell division"], correct: 1 },
  { text: "The cell wall is found in:", options: ["animal cells only","plant cells and bacteria","only bacteria","only fungi"], correct: 1 },
  { text: "Diffusion moves substances:", options: ["against concentration gradient using energy","from high to low concentration (passive)","only in liquids","only in gases"], correct: 1 },
  { text: "Osmosis moves:", options: ["all molecules across any membrane","water across semi-permeable membrane from low to high solute","proteins across membrane","fats through water"], correct: 1 },
  { text: "Active transport moves substances:", options: ["high to low concentration","from low to high concentration requiring ATP","only water","without energy"], correct: 1 },
  { text: "DNA stores:", options: ["energy","genetic information","food reserves","oxygen"], correct: 1 },
  { text: "Protein synthesis occurs at:", options: ["nucleus","ribosomes","cell membrane","mitochondria"], correct: 1 },
  { text: "Mitosis produces:", options: ["4 genetically different cells","2 genetically identical daughter cells","sex cells only","cells with half chromosomes"], correct: 1 },
  { text: "Meiosis produces:", options: ["2 identical cells","4 cells with half chromosome number (gametes)","body cells","genetically identical cells"], correct: 1 },
  { text: "Atomic number equals:", options: ["protons + neutrons","neutrons only","protons","electrons in outer shell only"], correct: 2 },
  { text: "Isotopes are atoms with same protons but different:", options: ["electrons","proton number","neutrons","energy levels"], correct: 2 },
  { text: "Ionic bond: electron ___ between metal and non-metal:", options: ["sharing","transfer","absorption","radiation"], correct: 1 },
  { text: "Covalent bond: electron ___ between non-metals:", options: ["transfer","sharing","absorption","radiation"], correct: 1 },
  { text: "pH scale runs:", options: ["0–7 only","0–14","1–10","−7 to +7"], correct: 1 },
  { text: "Strong acids have pH:", options: ["above 7","equal to 7","close to 0","above 10"], correct: 2 },
  { text: "Neutralisation: acid + base →", options: ["two acids","salt + water","two bases","gas only"], correct: 1 },
  { text: "Newton's 1st Law: an object stays at rest unless:", options: ["it wants to move","acted on by a net force","gravity acts","in space"], correct: 1 },
  { text: "Newton's 2nd Law: F = :", options: ["m + a","m − a","m × a","m ÷ a"], correct: 2 },
  { text: "Newton's 3rd Law: every action has:", options: ["double reaction","equal and opposite reaction","half reaction","no reaction"], correct: 1 },
  { text: "Work done = Force ×:", options: ["Time","Mass","Distance","Speed"], correct: 2 },
  { text: "Unit of work:", options: ["Newton","Watt","Joule","Pascal"], correct: 2 },
  { text: "Unit of power:", options: ["Joule","Newton","Pascal","Watt"], correct: 3 },
  { text: "Greenhouse gases include:", options: ["only oxygen","CO₂, methane, water vapour","only nitrogen","only ozone"], correct: 1 },
  { text: "A food web shows:", options: ["one food chain","multiple interconnected food chains","only predators","only producers"], correct: 1 },
  { text: "Genetic variation arises from:", options: ["identical reproduction","mutations and sexual reproduction","asexual reproduction only","environment only"], correct: 1 },
  { text: "Evolution occurs through:", options: ["individual change during lifetime","natural selection on genetic variation over generations","random chance alone","Lamarckian inheritance"], correct: 1 },
  { text: "Biodiversity importance:", options: ["looks nice","ensures ecosystem stability and resilience","increases pollution","reduces rainfall"], correct: 1 },
  { text: "Ecosystem services include:", options: ["only food","clean air, water, food, climate regulation","only timber","only medicine"], correct: 1 },
  { text: "Photosynthesis equation: CO₂ + H₂O + sunlight →", options: ["glucose + oxygen","only glucose","only oxygen","only CO₂"], correct: 0 },
  { text: "Aerobic respiration: glucose + O₂ →", options: ["lactic acid","CO₂ + H₂O + ATP","only CO₂","only water"], correct: 1 },
  { text: "Anaerobic respiration in yeast produces:", options: ["lactic acid + CO₂","ethanol + CO₂","only water","only ATP"], correct: 1 },
  { text: "Acid rain is caused by:", options: ["too much oxygen","SO₂ and NOₓ reacting with water in atmosphere","CO₂ only","ozone depletion"], correct: 1 },
];

const PRE_TECHNICAL: Question[] = [
  { text: "Safety in workshop means:", options: ["running inside","wearing PPE and following rules","touching all tools","ignoring signs"], correct: 1 },
  { text: "PPE stands for:", options: ["Personal Protective Equipment","Professional Practice Equipment","Personal Practice Exercises","Public Protective Exercises"], correct: 0 },
  { text: "Hardwood comes from:", options: ["bamboo only","slow-growing deciduous trees (oak, mahogany)","any tree","coniferous trees"], correct: 1 },
  { text: "Softwood comes from:", options: ["oak and mahogany","coniferous/evergreen trees (pine, fir)","bamboo","hardwood trees"], correct: 1 },
  { text: "A saw is used to:", options: ["drill holes","smooth surfaces","cut materials","join materials with bolts"], correct: 2 },
  { text: "A chisel is for:", options: ["measuring","cutting and shaping wood/metal","smoothing with a machine","welding"], correct: 1 },
  { text: "A file is for:", options: ["sawing wood","drilling holes","smoothing rough metal edges","painting surfaces"], correct: 2 },
  { text: "Welding joins metals by:", options: ["glue","using heat to melt and fuse metals","bolts only","nails only"], correct: 1 },
  { text: "Masonry works with:", options: ["wood only","metal only","bricks, stone and concrete","plastic"], correct: 2 },
  { text: "Plumbing deals with:", options: ["electrical systems","water pipes and drainage","structural walls","carpentry"], correct: 1 },
  { text: "An ohmmeter measures:", options: ["voltage","current","resistance","power"], correct: 2 },
  { text: "A voltmeter measures:", options: ["current","resistance","power","voltage"], correct: 3 },
  { text: "An ammeter measures:", options: ["voltage","current","resistance","power"], correct: 1 },
  { text: "Series circuit: components share the same:", options: ["voltage","current","power","resistance"], correct: 1 },
  { text: "Parallel circuit: components share the same:", options: ["current","resistance","voltage","power"], correct: 2 },
  { text: "A fuse protects by:", options: ["increasing voltage","breaking if current is too high","storing electricity","measuring current"], correct: 1 },
  { text: "Orthographic projection shows:", options: ["one view only","top, front and side views","angled view below","inside only"], correct: 1 },
  { text: "Isometric drawing shows:", options: ["flat top view only","3D view with equal angles (30°)","only front view","cross sections only"], correct: 1 },
  { text: "Scale 1:100 means drawing is ___ actual size:", options: ["100× bigger","100× smaller","same size","10× smaller"], correct: 1 },
  { text: "A hacksaw cuts:", options: ["wood only","metal and plastic (thin)","stone only","glass only"], correct: 1 },
  { text: "A coping saw cuts:", options: ["metal only","curves in thin wood/plastic","straight lines in thick wood","stone"], correct: 1 },
  { text: "Soldering joins electrical components using:", options: ["high-heat welding","low-melting solder alloy","glue","nails"], correct: 1 },
  { text: "Corrosion is prevented by:", options: ["exposing to moisture","painting, galvanising or oiling","heating repeatedly","no protective coating"], correct: 1 },
  { text: "A spirit level checks:", options: ["temperature","that a surface is horizontal","depth of a hole","straightness of a cut"], correct: 1 },
  { text: "Sandpaper is used for:", options: ["cutting wood","measuring wood","smoothing surfaces by abrasion","joining wood pieces"], correct: 2 },
  { text: "A plier grips and bends:", options: ["wood only","soft materials like wire and metal strips","stone","concrete"], correct: 1 },
  { text: "A screwdriver drives:", options: ["nails","bolts","screws","rivets"], correct: 2 },
  { text: "A hammer drives:", options: ["screws","bolts","nails","rivets"], correct: 2 },
  { text: "Technical drawings use standardised:", options: ["colours","line types and symbols for clarity","materials","textures"], correct: 1 },
  { text: "Workshop safety rule: goggles protect:", options: ["hands","feet","eyes from flying debris","hearing"], correct: 2 },
];

const AGRI_NUTRITION: Question[] = [
  ...AGRICULTURE_UPPER.slice(0, 20),
  { text: "Soil horizons are layers from:", options: ["right to left","only surface","surface downward (O, A, B, C)","bottom to top only"], correct: 2 },
  { text: "A horizon (topsoil) is richest in:", options: ["bedrock","organic matter and nutrients","clay only","sand only"], correct: 1 },
  { text: "Loam soil is best because:", options: ["very sandy","good balance of sand, silt and clay","pure clay","very rocky"], correct: 1 },
  { text: "Horticulture grows:", options: ["only grains","fruits, vegetables and ornamental plants","only animals","only trees"], correct: 1 },
  { text: "Aquaculture farms:", options: ["crops","aquatic organisms (fish, shrimps)","poultry","flowers only"], correct: 1 },
  { text: "Agroforestry combines:", options: ["only crop farming","farming with trees for multiple benefits","only animal rearing","only trees"], correct: 1 },
  { text: "Food security means:", options: ["having money for food","all people having access to sufficient, safe, nutritious food","only growing enough","having food banks"], correct: 1 },
  { text: "Malnutrition means:", options: ["eating too much only","not getting enough or wrong nutrients","only being overweight","not drinking enough water"], correct: 1 },
  { text: "Amylase breaks down:", options: ["proteins","fats","carbohydrates/starch","fibre"], correct: 2 },
  { text: "Protease breaks down:", options: ["carbohydrates","proteins","fats","vitamins"], correct: 1 },
  { text: "Lipase breaks down:", options: ["proteins","carbohydrates","fats/lipids","minerals"], correct: 2 },
  { text: "Bile emulsifies:", options: ["proteins","carbohydrates","fats","starch"], correct: 2 },
  { text: "Dietary fibre aids:", options: ["energy production only","healthy digestion and preventing constipation","building muscles","producing vitamins"], correct: 1 },
  { text: "Kwashiorkor: deficiency of:", options: ["carbohydrates","proteins","vitamin C","vitamin D"], correct: 1 },
  { text: "Night blindness: deficiency of:", options: ["Vitamin C","Vitamin D","Vitamin A","Iron"], correct: 2 },
  { text: "Anaemia commonly caused by deficiency of:", options: ["Vitamin A","Vitamin B12 or Iron","Vitamin D","Calcium"], correct: 1 },
  { text: "Goitre caused by deficiency of:", options: ["Iron","Calcium","Iodine","Zinc"], correct: 2 },
  { text: "Fish farming is called:", options: ["apiculture","pisciculture/aquaculture","horticulture","silviculture"], correct: 1 },
  { text: "Apiculture is the keeping of:", options: ["fish","bees","poultry","goats"], correct: 1 },
  { text: "Silviculture is the cultivation of:", options: ["flowers","trees/forests","fish","bees"], correct: 1 },
];

const PHYSICS_BANK: Question[] = [
  { text: "Newton's 1st Law: object at rest stays at rest unless:", options: ["it wants to move","acted on by net force","gravity acts","in space"], correct: 1 },
  { text: "Newton's 2nd Law: F = ma. 'm' is:", options: ["momentum","mass","motion","magnitude"], correct: 1 },
  { text: "Newton's 3rd Law:", options: ["F=ma","every action has equal and opposite reaction","gravity formula","Ohm's Law"], correct: 1 },
  { text: "Velocity is:", options: ["speed only","speed with direction (vector)","distance/time only","acceleration × time"], correct: 1 },
  { text: "Acceleration due to gravity ≈:", options: ["5 m/s²","9.8 m/s²","15 m/s²","20 m/s²"], correct: 1 },
  { text: "Work unit:", options: ["Newton","Watt","Joule","Pascal"], correct: 2 },
  { text: "Power unit:", options: ["Joule","Newton","Watt","Ampere"], correct: 2 },
  { text: "Conservation of Energy:", options: ["energy can be created","energy can be destroyed","energy is neither created nor destroyed","energy always decreases"], correct: 2 },
  { text: "Ohm's Law: V = IR. 'R' is:", options: ["voltage","resistance","current","power"], correct: 1 },
  { text: "Resistors in series: total R = :", options: ["sum of all resistances","reciprocal sum","product","smallest one"], correct: 0 },
  { text: "Resistors in parallel: total R is ___ any single:", options: ["greater than","equal to","less than","unrelated to"], correct: 2 },
  { text: "Faraday's Law: EMF ∝ rate of change of:", options: ["current","magnetic flux","voltage applied","circuit resistance"], correct: 1 },
  { text: "Transformer: voltage increases when:", options: ["primary turns > secondary","secondary turns > primary","AC is not used","secondary turns decrease"], correct: 1 },
  { text: "Wave equation: v = :", options: ["fλ","f + λ","f/λ","λ/f"], correct: 0 },
  { text: "EM waves travel through:", options: ["medium only","vacuum (no medium needed)","water only","air only"], correct: 1 },
  { text: "Refraction: wave bends due to:", options: ["reflection off surface","change in wave speed at boundary","diffraction","interference"], correct: 1 },
  { text: "Snell's Law: n₁ sin θ₁ = n₂ sin θ₂ relates:", options: ["speed and direction","incidence/refraction angles to refractive indices","frequency and wavelength","reflection angles"], correct: 1 },
  { text: "Total internal reflection: angle of incidence exceeds:", options: ["45°","90°","critical angle","0°"], correct: 2 },
  { text: "Doppler Effect: change in ___ due to relative motion:", options: ["amplitude","light speed","observed frequency","energy"], correct: 2 },
  { text: "Half-life: time for ___ of sample to decay:", options: ["all","75%","25%","50%"], correct: 3 },
  { text: "Alpha particles are:", options: ["fast electrons","helium-4 nuclei (2p+2n)","high-energy photons","neutrons only"], correct: 1 },
  { text: "Beta (β⁻) particles are:", options: ["helium nuclei","high-energy photons","fast electrons","protons"], correct: 2 },
  { text: "Gamma rays are:", options: ["particles","electrons","high-energy EM radiation","protons"], correct: 2 },
  { text: "Nuclear fission releases energy by:", options: ["combining small nuclei","splitting heavy nucleus into smaller ones","chemical reaction","electron movement"], correct: 1 },
  { text: "The unit of pressure is:", options: ["Newton","Joule","Watt","Pascal"], correct: 3 },
];

const CHEMISTRY_BANK: Question[] = [
  { text: "Periodic table organises elements by:", options: ["alphabetical order","increasing atomic number","increasing mass only","colour"], correct: 1 },
  { text: "Atomic number equals number of:", options: ["neutrons only","protons (= electrons in neutral atom)","protons + neutrons","electrons only"], correct: 1 },
  { text: "Electronegativity increases toward the ___ of periodic table:", options: ["bottom-left","top-right (except noble gases)","middle","bottom-right"], correct: 1 },
  { text: "Ionic bond: electrons are:", options: ["shared","transferred from metal to non-metal","absorbed","radiated"], correct: 1 },
  { text: "Covalent bond: electrons are:", options: ["transferred","shared between non-metals","absorbed","radiated"], correct: 1 },
  { text: "Metallic bonding: a sea of:", options: ["ionic bonds","delocalised electrons","covalent bonds","shared pairs"], correct: 1 },
  { text: "Oxidation is ___ of electrons:", options: ["gain","sharing","loss","absorption"], correct: 2 },
  { text: "Reduction is ___ of electrons:", options: ["loss","gain","sharing","transfer"], correct: 1 },
  { text: "A catalyst:", options: ["is consumed in reaction","lowers activation energy without being consumed","raises temperature","increases reactant"], correct: 1 },
  { text: "Haber Process produces:", options: ["sulphuric acid","ammonia","chlorine","nitric acid"], correct: 1 },
  { text: "Contact Process makes:", options: ["ammonia","hydrochloric acid","sulphuric acid (via SO₃)","nitric acid"], correct: 2 },
  { text: "Fractional distillation separates crude oil by:", options: ["colour","different boiling points","different densities","different masses"], correct: 1 },
  { text: "Alkanes formula: CₙH___:", options: ["2n","2n−2","2n+2","n"], correct: 2 },
  { text: "Alkenes formula: CₙH___ (with double bond):", options: ["2n+2","2n−2","2n","2n−6"], correct: 2 },
  { text: "Ester formed by: acid + :", options: ["another acid","alkane","alcohol (esterification)","base only"], correct: 2 },
  { text: "Saponification makes soap by:", options: ["polymerisation","reacting fats/oils with NaOH or KOH","electrolysis","neutralisation"], correct: 1 },
  { text: "At cathode during electrolysis:", options: ["oxidation","combustion","reduction (gain of electrons)","neutralisation"], correct: 2 },
  { text: "Avogadro's number (6.02×10²³) is particles in:", options: ["1g of hydrogen","any gas","one mole of substance","12g of carbon"], correct: 2 },
  { text: "Exothermic reaction:", options: ["absorbs heat (endothermic)","releases heat to surroundings (ΔH negative)","only uses light","no energy change"], correct: 1 },
  { text: "Endothermic reaction:", options: ["releases heat","absorbs heat from surroundings (ΔH positive)","always makes gas","no temperature change"], correct: 1 },
  { text: "Le Chatelier's Principle: equilibrium shifts to:", options: ["stop reacting","oppose any change imposed","explode","always make more product"], correct: 1 },
  { text: "Buffer solutions resist changes in:", options: ["temperature","volume","reactant concentration","pH on small acid/base addition"], correct: 3 },
  { text: "Rate of reaction is increased by:", options: ["decreasing temperature","increasing particle size","adding catalyst or increasing temperature/concentration","decreasing pressure"], correct: 2 },
  { text: "Molecular formula shows:", options: ["arrangement of atoms","actual number of each atom in a molecule","simplest ratio only","3D structure"], correct: 1 },
  { text: "Empirical formula shows:", options: ["actual number of atoms","simplest whole-number ratio of atoms","3D structure","molecular mass"], correct: 1 },
];

const BIOLOGY_BANK: Question[] = [
  { text: "Digestion begins in the:", options: ["stomach","small intestine","mouth","large intestine"], correct: 2 },
  { text: "Stomach produces ___ to denature proteins:", options: ["amylase","bile","lipase","HCl and protease"], correct: 3 },
  { text: "Most nutrient absorption: in the:", options: ["stomach","large intestine","small intestine","mouth"], correct: 2 },
  { text: "Large intestine mainly absorbs:", options: ["proteins","fats","water and salts","carbohydrates"], correct: 2 },
  { text: "Aerobic respiration: glucose + O₂ →", options: ["CO₂ + H₂O + ATP","only CO₂","lactic acid + energy","only CO₂ and water"], correct: 0 },
  { text: "Anaerobic respiration in animals produces:", options: ["ethanol + CO₂","only CO₂","lactic acid + less ATP","water + ATP only"], correct: 2 },
  { text: "Gas exchange in lungs occurs at:", options: ["bronchi walls","trachea lining","alveoli (thin, moist, large surface area)","diaphragm"], correct: 2 },
  { text: "Haemoglobin carries:", options: ["nutrients only","oxygen from lungs to tissues","CO₂ only","hormones only"], correct: 1 },
  { text: "Left ventricle pumps blood to:", options: ["lungs","right side only","entire body (systemic circulation)","liver only"], correct: 2 },
  { text: "Right ventricle pumps blood to:", options: ["the body","lungs (pulmonary circulation)","liver","kidneys only"], correct: 1 },
  { text: "Xylem transports:", options: ["sugars downward","water and minerals from roots upward","hormones","oxygen in plants"], correct: 1 },
  { text: "Phloem transports:", options: ["water upward","dissolved sugars/photosynthates","oxygen downward","water downward only"], correct: 1 },
  { text: "Transpiration increases with:", options: ["higher humidity","lower temperature","increased light, temperature and wind","still humid conditions"], correct: 2 },
  { text: "Kidney main function:", options: ["producing blood","digesting food","filtering blood and producing urine","storing minerals only"], correct: 2 },
  { text: "Insulin produced by ___ cells of pancreas:", options: ["alpha","delta","beta","duct"], correct: 2 },
  { text: "Insulin ___ blood glucose:", options: ["raises","maintains unchanged","lowers","eliminates"], correct: 2 },
  { text: "Glucagon ___ blood glucose:", options: ["lowers","maintains","raises","eliminates"], correct: 2 },
  { text: "CNS comprises:", options: ["only brain","only spinal cord","brain and spinal cord","all nerves in body"], correct: 2 },
  { text: "Reflex arc: receptor → sensory neurone → ___ → motor neurone → effector:", options: ["dendrite","motor neurone","relay neurone","axon"], correct: 2 },
  { text: "Dominant allele is expressed when:", options: ["in two copies only","in one or two copies","recessive absent only","never expressed"], correct: 1 },
  { text: "Codominance: both alleles are expressed:", options: ["one masks another","both equally in phenotype","one is always dominant","only in males"], correct: 1 },
  { text: "Sex-linked traits on:", options: ["autosomes only","sex chromosomes (X or Y)","all chromosomes","only Y chromosome"], correct: 1 },
  { text: "Transpiration rate affected by:", options: ["only rainfall","humidity, temperature, light and wind speed","only temperature","only wind"], correct: 1 },
  { text: "Osmoregulation maintains:", options: ["blood temperature","blood sugar (homeostasis)","water and salt balance","oxygen levels only"], correct: 2 },
  { text: "Photosynthesis produces:", options: ["only oxygen","only glucose","glucose and oxygen","only CO₂"], correct: 2 },
];

const HISTORY_BANK: Question[] = [
  { text: "Scramble for Africa occurred mainly in the:", options: ["1760s–1780s","1880s–1900s","1920s–1940s","1950s–1960s"], correct: 1 },
  { text: "Berlin Conference (1884–85) purpose:", options: ["end WWI","divide Africa among European powers","unite Africa","start slave trade"], correct: 1 },
  { text: "Kenya became British Protectorate in:", options: ["1885","1895","1905","1915"], correct: 1 },
  { text: "Mau Mau uprising began:", options: ["1942","1952","1963","1945"], correct: 1 },
  { text: "Jomo Kenyatta imprisoned at:", options: ["Nairobi Prison","Mombasa","Kapenguria","Eldoret"], correct: 2 },
  { text: "Kenya's Independence Day:", options: ["1st June 1963","12th December 1963","20th October 1964","1st January 1964"], correct: 1 },
  { text: "First PM of independent Kenya:", options: ["Moi","Tom Mboya","Jomo Kenyatta","Oginga Odinga"], correct: 2 },
  { text: "Daniel arap Moi became President:", options: ["1963","1970","1978","1982"], correct: 2 },
  { text: "Multiparty democracy introduced in Kenya:", options: ["1978","1988","1991","2002"], correct: 2 },
  { text: "Lancaster House Conferences held in:", options: ["Nairobi","London","Geneva","New York"], correct: 1 },
  { text: "Transatlantic slave trade lasted:", options: ["10th–12th century","15th–19th century","12th–14th century","19th–20th century"], correct: 1 },
  { text: "British Empire abolished slave trade:", options: ["1776","1807","1833","1900"], correct: 1 },
  { text: "Pan-Africanism championed by:", options: ["Churchill","Marcus Garvey and Kwame Nkrumah","Queen Victoria","Cecil Rhodes"], correct: 1 },
  { text: "OAU founded in:", options: ["1955","1963 Addis Ababa","1945","1960"], correct: 1 },
  { text: "Ghana gained independence (first sub-Saharan Africa):", options: ["1957","1960","1963","1965"], correct: 0 },
  { text: "Kwame Nkrumah led:", options: ["Kenya","Nigeria","Ghana","Tanzania"], correct: 2 },
  { text: "Apartheid ended in South Africa:", options: ["1980","1990","1994","2000"], correct: 2 },
  { text: "Nelson Mandela imprisoned for ___ years:", options: ["17","27","37","47"], correct: 1 },
  { text: "Cold War between:", options: ["China and India","USA and USSR","Europe and Africa","NATO and AU"], correct: 1 },
  { text: "WWI lasted:", options: ["1914–1918","1939–1945","1900–1910","1920–1925"], correct: 0 },
  { text: "WWII lasted:", options: ["1914–1918","1939–1945","1929–1933","1941–1946"], correct: 1 },
  { text: "UN established in:", options: ["1919","1939","1945","1948"], correct: 2 },
  { text: "Indian Ocean Trade connected:", options: ["only African ports","East Africa, Arabia, India and SE Asia","only Europe","only Indian ports"], correct: 1 },
  { text: "Swahili culture developed from:", options: ["Bantu and European","Bantu African and Arab/Islamic","Asian and European","Arab and European only"], correct: 1 },
  { text: "Uganda Railway (1896–1901) opened:", options: ["interior to colonial exploitation","lake Tana connection","only passenger travel","built voluntarily by Africans"], correct: 0 },
];

const GEOGRAPHY_BANK: Question[] = [
  { text: "Plate tectonics explains:", options: ["weather patterns","movement of lithospheric plates","ocean currents only","climate change only"], correct: 1 },
  { text: "Fold mountains formed by:", options: ["volcanic activity only","convergent plates compressing rocks","divergent plates","glacial erosion"], correct: 1 },
  { text: "Himalayas are an example of:", options: ["Rift Valley","Fold mountains","block mountains","volcanic mountains only"], correct: 1 },
  { text: "Weathering is:", options: ["transport of rocks","deposition","in-situ breakdown of rocks","formation of rocks"], correct: 2 },
  { text: "Erosion is:", options: ["breakdown of rocks","in-situ decomposition","transport away by agents","deposition"], correct: 2 },
  { text: "A meander is:", options: ["straight channel","U-shaped valley","wide river bend","waterfall"], correct: 2 },
  { text: "A delta forms at a river's:", options: ["source","middle course","mouth","waterfall"], correct: 2 },
  { text: "A moraine is material deposited by:", options: ["rivers","wind","glaciers","waves"], correct: 2 },
  { text: "Equatorial climate: ___ and ___:", options: ["cold and dry","hot and dry","hot and wet","Mediterranean"], correct: 2 },
  { text: "Mediterranean climate: hot dry summers and:", options: ["cold dry winters","cool wet winters","very wet summers","cold wet year-round"], correct: 1 },
  { text: "The Sahara is a ___ climate:", options: ["equatorial","Mediterranean","hot desert","temperate"], correct: 2 },
  { text: "Latitude affects climate by:", options: ["changing rainfall only","determining sun angle/temperature","winds only","humidity only"], correct: 1 },
  { text: "Altitude: temperature ___ with height:", options: ["increases","stays same","decreases","fluctuates only seasonally"], correct: 2 },
  { text: "Rain shadow causes ___ on leeward side:", options: ["more rainfall","equal rainfall","dry conditions","cooler temps only"], correct: 2 },
  { text: "ITCZ causes heavy rainfall where:", options: ["cold fronts meet","air masses meet near equator","winds blow offshore","sea breeze occurs"], correct: 1 },
  { text: "El Niño caused by warming of:", options: ["Atlantic Ocean","Indian Ocean","eastern Pacific Ocean waters","Arctic Ocean"], correct: 2 },
  { text: "Suez Canal connects:", options: ["Atlantic and Pacific","Red Sea and Mediterranean Sea","Indian and Atlantic","Arabian and Indian"], correct: 1 },
  { text: "Panama Canal connects:", options: ["Atlantic and Indian","Atlantic and Pacific Oceans","Caribbean and Gulf only","Pacific and Arctic"], correct: 1 },
  { text: "Renewable resources are:", options: ["never replenished","naturally replenished (solar, wind, water)","only replenished by technology","infinite without management"], correct: 1 },
  { text: "Non-renewable resources:", options: ["replenished quickly","take millions of years (coal, oil, gas)","infinite","always at surface"], correct: 1 },
  { text: "Soil erosion highest when:", options: ["land covered with vegetation","slope gentle","steep bare slopes","clay-rich soil only"], correct: 2 },
  { text: "Sustainable land use:", options: ["clearing all forests","using land without degrading it for future generations","only urban development","only intensive farming"], correct: 1 },
  { text: "Population density is:", options: ["total population","people per unit area","growth rate","movement of people"], correct: 1 },
  { text: "Urbanisation is driven by:", options: ["only war","rural push and urban pull factors","only climate change","only government policy"], correct: 1 },
  { text: "A primate city is:", options: ["any large city","disproportionately large city compared to others in country","only a capital","a planned city"], correct: 1 },
];

const BUSINESS_BANK: Question[] = [
  { text: "An entrepreneur:", options: ["only saves money","starts and manages a business taking risks","works for government only","studies business only"], correct: 1 },
  { text: "Profit = Revenue −:", options: ["taxes only","assets","total expenses/costs","liabilities"], correct: 2 },
  { text: "A sole proprietorship is owned by:", options: ["two partners","government","one person","shareholders"], correct: 2 },
  { text: "A public company raises capital through:", options: ["family loans only","government grants","selling shares to the public","bank loans only"], correct: 2 },
  { text: "Shares represent ___ in a company:", options: ["debts","ownership stakes","employee salaries","expenses"], correct: 1 },
  { text: "A budget is a:", options: ["type of tax","financial plan for income and expenditure","bank account","business contract"], correct: 1 },
  { text: "An invoice requests:", options: ["tax payment","payment for goods or services supplied","company ownership proof","employee records"], correct: 1 },
  { text: "Retail trade sells:", options: ["large quantities to wholesalers","directly to consumers in small quantities","only to factories","only abroad"], correct: 1 },
  { text: "Insurance provides:", options: ["guaranteed profit","financial protection against losses and risks","free goods","tax exemption"], correct: 1 },
  { text: "Break-even point: total costs ___ total revenue:", options: ["exceed","equal (no profit or loss)","are less than","are double"], correct: 1 },
  { text: "Marketing mix (4Ps):", options: ["People, Purpose, Plans, Procedures","Product, Price, Place, Promotion","Profit, Personnel, Policy, Process","Performance, Pricing, Packaging, Planning"], correct: 1 },
  { text: "Supply increases when:", options: ["price falls","price rises (producers earn more)","demand falls","cost of production rises"], correct: 1 },
  { text: "Demand increases when:", options: ["price rises","income falls","price falls (Law of Demand)","goods are inferior only"], correct: 2 },
  { text: "Double Entry: every transaction has:", options: ["one entry","debit and credit of equal amounts","only credit","three entries"], correct: 1 },
  { text: "Trial Balance checks:", options: ["profit or loss","debit totals equal credit totals","cash in hand","asset values only"], correct: 1 },
  { text: "Gross Profit = Net Sales −:", options: ["total expenses","Cost of Goods Sold","tax paid","overheads only"], correct: 1 },
  { text: "Net Profit = Gross Profit −:", options: ["cost of goods sold","selling price","overhead/operating expenses","tax only"], correct: 2 },
  { text: "Depreciation is:", options: ["increase in asset value","decrease in asset value over time","tax on profits","payment to suppliers"], correct: 1 },
  { text: "Working capital = Current Assets −:", options: ["fixed assets","long-term liabilities","current liabilities","equity"], correct: 2 },
  { text: "M-Pesa is:", options: ["a bank branch","mobile money transfer technology","a credit card","a government bank"], correct: 1 },
  { text: "A debenture is:", options: ["a company share","long-term fixed-interest loan issued by company","type of insurance","government bond only"], correct: 1 },
  { text: "Law of Demand: as price increases, demand:", options: ["increases","stays same","decreases","doubles"], correct: 2 },
  { text: "A credit sale means:", options: ["cash at time of purchase","payment now for future delivery","goods received now, paid later","barter trade"], correct: 2 },
  { text: "A debtor is someone who:", options: ["is owed money","owes money to the business","manages accounts","audits books"], correct: 1 },
  { text: "A creditor is someone who:", options: ["owes money","is owed money by the business","manages sales","handles imports"], correct: 1 },
];

const COMPUTER_BANK: Question[] = [
  { text: "CPU is called brain because it:", options: ["stores all data","displays output","processes instructions and controls units","provides power"], correct: 2 },
  { text: "RAM is volatile: data ___ when power off:", options: ["is retained","is backed up","is lost","is compressed"], correct: 2 },
  { text: "ROM is non-volatile: data ___ without power:", options: ["is lost","is erased daily","is retained","runs only when connected"], correct: 2 },
  { text: "1 Gigabyte = :", options: ["1,000 MB","1,024 MB (binary)","1,000,000 KB","1,024 KB"], correct: 1 },
  { text: "Operating system manages:", options: ["only documents","hardware resources and software processes","only internet","only display"], correct: 1 },
  { text: "Open-source OS example:", options: ["Windows 11","macOS","Ubuntu Linux","iOS"], correct: 2 },
  { text: "HTML is used to:", options: ["style web pages","create structure and content of web pages","query databases","write backend logic"], correct: 1 },
  { text: "CSS is used to:", options: ["create web structure","style and layout web pages","query databases","write algorithms"], correct: 1 },
  { text: "SQL is for:", options: ["designing graphics","writing operating systems","querying and managing relational databases","creating web pages"], correct: 2 },
  { text: "Binary uses digits:", options: ["0–9","0 and 1 only","A–F","1–8"], correct: 1 },
  { text: "Binary 1010 in decimal:", options: ["8","10","12","14"], correct: 1 },
  { text: "Hexadecimal uses:", options: ["only 0 and 1","digits 0–9 and letters A–F (base 16)","only letters A–Z","digits 0–7 only"], correct: 1 },
  { text: "A LAN covers:", options: ["worldwide","a single building or campus","a city","a country"], correct: 1 },
  { text: "A firewall:", options: ["speeds up internet","monitors and controls network traffic based on rules","stores data","provides Wi-Fi"], correct: 1 },
  { text: "Encryption converts data to:", options: ["plain text","larger files","code unreadable without key","smaller files"], correct: 2 },
  { text: "Phishing:", options: ["slows computers","damages hardware physically","tricks users into revealing sensitive info","increases internet speed"], correct: 2 },
  { text: "Ransomware:", options: ["speeds performance","encrypts files and demands payment for decryption","improves security","removes viruses"], correct: 1 },
  { text: "Cloud computing:", options: ["only local storage","accessing computing resources over internet on demand","only large companies","only government"], correct: 1 },
  { text: "Machine learning enables computers to:", options: ["only follow fixed rules","learn from data and improve without explicit programming","only play games","only search internet"], correct: 1 },
  { text: "A primary key:", options: ["can be null","uniquely identifies each record in a table","can be duplicated","is optional"], correct: 1 },
  { text: "A foreign key:", options: ["is the main key","uniquely identifies records","links to primary key in another table","is always numeric"], correct: 2 },
  { text: "Version control (e.g. Git):", options: ["designs graphics","tracks and manages changes to code over time","tests software only","deploys only"], correct: 1 },
  { text: "Agile development emphasises:", options: ["long planning before coding","rigid fixed requirements","iterative development and customer collaboration","only documentation first"], correct: 2 },
  { text: "Algorithm is:", options: ["a type of computer","a program only","step-by-step instructions to solve a problem","a network device"], correct: 2 },
  { text: "Binary 11111111 in decimal:", options: ["127","255","128","256"], correct: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Consecutive window selection — truly unique questions per material
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Selects `count` questions for a material using a consecutive window.
 * materialIndex N gets questions at positions [N*count, N*count+count) mod bankLen.
 * Adjacent materials NEVER share questions (as long as bankLen ≥ 2*count).
 * Two materials share only if they're bankLen/count apart.
 */
function windowSelect(bank: Question[], materialIndex: number, count: number, seed: number): Question[] {
  const canonical = seededShuffle(bank, 42); // fixed canonical ordering
  const n = canonical.length;
  const start = (materialIndex * count) % n;
  const selected: Question[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(canonical[(start + i) % n]);
  }
  // Shuffle order within these count questions so answer positions vary
  return seededShuffle(selected, seed);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Bank selector — EXACT subject name matching (no regex, no includes)
// Prevents Creative Arts/Activities from getting CRE questions
// ═══════════════════════════════════════════════════════════════════════════════
function getBankForMaterial(material: Material): Question[] {
  const subj = material.subject; // exact string comparison
  const level = gradeLevel(material.gradeKey);

  if (subj === "English") {
    if (level === "lower") return buildEnglishLower();
    if (level === "upper") return ENGLISH_UPPER;
    return ENGLISH_JUNIOR_SENIOR;
  }
  if (subj === "Kiswahili") {
    if (level === "lower") return buildKiswahiliLower();
    if (level === "upper" || level === "junior") return KISWAHILI_UPPER;
    return KISWAHILI_UPPER;
  }
  if (subj === "Mathematics") return []; // handled by math generator
  if (subj === "Environmental Activities") return buildEnvActivities();
  if (subj === "Creative Activities") return CREATIVE_ACTIVITIES;   // NOT religion
  if (subj === "Religious Education") {
    if (level === "lower") return RE_LOWER;
    if (level === "upper") return RE_UPPER;
    return RE_JUNIOR;
  }
  if (subj === "Science and Technology") return SCI_TECH_UPPER;
  if (subj === "Agriculture") return AGRICULTURE_UPPER;
  if (subj === "Agriculture and Nutrition") return AGRI_NUTRITION;
  if (subj === "Home Science") return HOME_SCIENCE;
  if (subj === "Social Studies") {
    return (level === "upper") ? SOCIAL_STUDIES_UPPER : SOCIAL_STUDIES_JUNIOR;
  }
  if (subj === "Creative Arts") return CREATIVE_ARTS_UPPER;        // NOT religion
  if (subj === "Creative Arts and Sports") return CREATIVE_ARTS_SPORTS; // NOT religion
  if (subj === "Integrated Science") return INTEGRATED_SCIENCE;
  if (subj === "Pre-Technical Studies") return PRE_TECHNICAL;
  if (subj === "Physics") return PHYSICS_BANK;
  if (subj === "Chemistry") return CHEMISTRY_BANK;
  if (subj === "Biology") return BIOLOGY_BANK;
  if (subj === "History") return HISTORY_BANK;
  if (subj === "Geography") return GEOGRAPHY_BANK;
  if (subj === "Business Studies") return BUSINESS_BANK;
  if (subj === "Computer Science") return COMPUTER_BANK;
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main exported getter — 100% offline, instant, grade-stratified
// ═══════════════════════════════════════════════════════════════════════════════
export function getQuestionsForMaterial(material: Material, count: number): Question[] {
  const rules = getTemplateRules(material.subject);
  const requestedCount = Math.max(0, Math.floor(count));
  if (requestedCount === 0 || rules.length === 0) return [];

  // Each material gets a different starting point, while the option order and
  // question order are randomized when the material is opened.
  const start = Math.abs(material.seedIndex) % rules.length;
  const shuffledRules = rules
    .map((rule, index) => ({ rule, rank: (index - start + rules.length) % rules.length }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, Math.min(requestedCount, rules.length))
    .map(({ rule }) => rule);

  const questions = shuffledRules.map((rule) => {
    const generated = rule.generate();
    const options = generated.options.slice(0, 4);
    const correctValue = generated.correctAnswer;
    const correct = options.indexOf(correctValue);
    return {
      text: generated.text,
      options: options as [string, string, string, string],
      correct: correct >= 0 ? correct : 0,
    };
  });

  // Shuffle both the selected questions and their answer choices without
  // changing which answer is correct.
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  for (const question of questions) {
    const correctValue = question.options[question.correct];
    for (let i = question.options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [question.options[i], question.options[j]] = [question.options[j], question.options[i]];
    }
    question.correct = question.options.indexOf(correctValue);
  }

  return questions;
}

/** @deprecated No longer needed — fully offline */
export async function getExtraQuestionsFromAPI(_m: Material, _n: number): Promise<Question[]> {
  return [];
}
