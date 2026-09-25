import type { GenContext, Question, SubjectGenerator } from "../types";
import { buildMCQ, pick, shuffle } from "../helpers";
import { makeFactBankGenerator, type Fact, type FactBankConfig } from "../factbank";

// ── Parametric word-skill builders (primary & junior) ──────────────────────
const NOUNS = ["teacher", "river", "school", "courage", "mountain", "honesty", "market", "doctor", "garden", "freedom", "village", "bridge"];
const VERBS = ["run", "write", "sing", "climb", "build", "whisper", "gather", "explain", "protect", "measure"];
const ADJECTIVES = ["bright", "gentle", "narrow", "ancient", "curious", "fragile", "generous", "slippery"];
const ADVERBS = ["quickly", "silently", "carefully", "rarely", "eagerly", "boldly"];

const POS_HINT: Record<string, string> = {
  noun: "names a person, place, thing or idea",
  verb: "shows an action or state of being",
  adjective: "describes a noun",
  adverb: "describes a verb, adjective or another adverb (often ends in -ly)",
};
function partOfSpeechQ(rng: () => number): Question | null {
  const kinds: [string, string[]][] = [["noun", NOUNS], ["verb", VERBS], ["adjective", ADJECTIVES], ["adverb", ADVERBS]];
  const [label, pool] = pick(rng, kinds);
  const correct = pick(rng, pool);
  const others = shuffle(rng, [NOUNS, VERBS, ADJECTIVES, ADVERBS].flat().filter((w) => !pool.includes(w)));
  return buildMCQ(rng, `Which word is a ${label}?`, correct, others, `"${correct}" is a ${label} — it ${POS_HINT[label]}.`);
}

const ANTONYMS: [string, string][] = [
  ["ancient", "modern"], ["expand", "shrink"], ["generous", "stingy"], ["victory", "defeat"],
  ["increase", "decrease"], ["praise", "criticise"], ["arrival", "departure"], ["artificial", "natural"],
  ["temporary", "permanent"], ["accept", "reject"], ["humble", "proud"], ["scarce", "plentiful"],
];
const SYNONYMS: [string, string][] = [
  ["begin", "commence"], ["brave", "courageous"], ["happy", "delighted"], ["quick", "rapid"],
  ["difficult", "challenging"], ["famous", "renowned"], ["angry", "furious"], ["strange", "peculiar"],
  ["huge", "enormous"], ["important", "crucial"], ["quiet", "silent"], ["rich", "wealthy"],
];

function antonymQ(rng: () => number): Question | null {
  const [w, opp] = pick(rng, ANTONYMS);
  return buildMCQ(rng, `What is the opposite of "${w}"?`, opp,
    shuffle(rng, ANTONYMS.map((p) => p[1]).filter((x) => x !== opp)).concat(ANTONYMS.map((p) => p[0])),
    `"${opp}" is the antonym (opposite) of "${w}".`);
}
function synonymQ(rng: () => number): Question | null {
  const [w, syn] = pick(rng, SYNONYMS);
  return buildMCQ(rng, `Which word means the same as "${w}"?`, syn,
    SYNONYMS.map((p) => p[1]).filter((x) => x !== syn),
    `"${syn}" is a synonym of "${w}" — they carry the same meaning.`);
}

function paramPool(ctx: GenContext): Question[] {
  const out: Question[] = [];
  const builders = [partOfSpeechQ, antonymQ, synonymQ];
  // Fewer parametric items at senior — the knowledge bank leads there — but
  // enough to keep the three practice papers from becoming near-identical.
  const cap = ctx.grade > 9 ? 10 : 30;
  for (let i = 0; i < 120 && out.length < cap; i++) {
    const q = builders[i % builders.length](ctx.rng);
    if (q) out.push(q);
  }
  return out;
}

// ── Grade-tiered knowledge facts ───────────────────────────────────────────
const LOWER: Fact[] = [
  { q: "Which word rhymes with 'cat'?", a: "hat", wrong: ["dog", "cup", "sun"], topics: ["Reading & Phonics", "Listening & Speaking"] },
  { q: "Which word begins with the same sound as 'ball'?", a: "boat", wrong: ["car", "table", "apple"], topics: ["Reading & Phonics"] },
  { q: "A naming word (person, place or thing) is called a:", a: "noun", wrong: ["verb", "adjective", "adverb"], topics: ["Nouns & Verbs", "Sentence Structure"] },
  { q: "An action word is called a:", a: "verb", wrong: ["noun", "pronoun", "article"], topics: ["Nouns & Verbs"] },
  { q: "Every sentence must begin with a:", a: "capital letter", wrong: ["full stop", "comma", "question mark"], topics: ["Sentence Structure", "Composition"] },
  { q: "A telling sentence ends with a:", a: "full stop", wrong: ["question mark", "comma", "capital letter"], topics: ["Sentence Structure"] },
  { q: "A sentence that asks something ends with a:", a: "question mark", wrong: ["full stop", "comma", "capital letter"], topics: ["Sentence Structure"] },
  { q: "The plural of 'child' is:", a: "children", wrong: ["childs", "childes", "childrens"], topics: ["Nouns & Verbs"] },
  { q: "The plural of 'box' is:", a: "boxes", wrong: ["boxs", "box", "boxies"], topics: ["Nouns & Verbs"] },
  { q: "Choose the correct spelling:", a: "friend", wrong: ["frend", "freind", "frind"], topics: ["Spelling & Dictation"] },
  { q: "Choose the correct spelling:", a: "school", wrong: ["skool", "schul", "scool"], topics: ["Spelling & Dictation"] },
  { q: "Which sentence is written correctly?", a: "I like mangoes.", wrong: ["i like mangoes", "I like Mangoes", "i Like mangoes."], topics: ["Composition", "Sentence Structure"] },
  { q: "'The dog ___ loudly.' Which word fits?", a: "barks", wrong: ["bark", "barking", "to bark"], topics: ["Nouns & Verbs"] },
  { q: "Which word is a joining word?", a: "and", wrong: ["quickly", "table", "happy"], topics: ["Sentence Structure", "Nouns & Verbs"] },
  { q: "The opposite of 'big' is:", a: "small", wrong: ["tall", "wide", "long"], topics: ["Vocabulary Building"] },
  { q: "A word that means 'happy' is:", a: "glad", wrong: ["sad", "angry", "tired"], topics: ["Vocabulary Building"] },
];
const UPPER: Fact[] = [
  { q: "A group of words with a subject and a verb that makes complete sense is a:", a: "sentence", wrong: ["phrase", "syllable", "paragraph"], topics: ["Sentence Structure", "Parts of Speech"] },
  { q: "A word that replaces a noun is a:", a: "pronoun", wrong: ["adjective", "conjunction", "preposition"], topics: ["Parts of Speech"] },
  { q: "'She sang beautifully.' The word 'beautifully' is a/an:", a: "adverb", wrong: ["adjective", "noun", "verb"], topics: ["Parts of Speech"] },
  { q: "A word that shows position, such as 'under' or 'between', is a:", a: "preposition", wrong: ["conjunction", "pronoun", "interjection"], topics: ["Parts of Speech"] },
  { q: "The main idea of a paragraph is usually found in the:", a: "topic sentence", wrong: ["last word", "title only", "longest sentence"], topics: ["Reading Comprehension"] },
  { q: "A comparison using 'like' or 'as' is a:", a: "simile", wrong: ["metaphor", "proverb", "rhyme"], topics: ["Vocabulary & Idioms", "Literature: Prose"] },
  { q: "The idiom 'to let the cat out of the bag' means to:", a: "reveal a secret", wrong: ["buy a pet", "lose something", "run away"], topics: ["Vocabulary & Idioms"] },
  { q: "In reported speech, \"I am tired\" becomes: He said that he ___ tired.", a: "was", wrong: ["is", "will be", "has been"], topics: ["Parts of Speech", "Functional Writing"] },
  { q: "A formal letter should use language that is:", a: "polite and clear", wrong: ["full of slang", "very casual", "written in capitals"], topics: ["Functional Writing", "Essay Writing"] },
  { q: "Which sentence is in the passive voice?", a: "The window was broken by the boy.", wrong: ["The boy broke the window.", "The boy is breaking the window.", "Break the window."], topics: ["Parts of Speech"] },
  { q: "A short wise saying such as 'Look before you leap' is a:", a: "proverb", wrong: ["simile", "syllable", "clause"], topics: ["Oral & Listening Skills", "Vocabulary & Idioms"] },
  { q: "The past tense of 'begin' is:", a: "began", wrong: ["begun", "beginned", "beginning"], topics: ["Parts of Speech"] },
  { q: "Which word is spelt correctly?", a: "necessary", wrong: ["neccessary", "necesary", "neccesary"], topics: ["Essay Writing", "Reading Comprehension"] },
  { q: "A paragraph should mainly develop:", a: "one main idea", wrong: ["many unrelated ideas", "only a title", "a list of names"], topics: ["Essay Writing", "Creative Writing"] },
  { q: "'Their', 'there' and 'they're' are examples of:", a: "homophones", wrong: ["synonyms", "antonyms", "prefixes"], topics: ["Vocabulary & Idioms"] },
  { q: "The prefix 're-' in 'rewrite' means:", a: "again", wrong: ["not", "before", "wrongly"], topics: ["Vocabulary & Idioms"] },
];
const JUNIOR: Fact[] = [
  { q: "A sentence with one independent and at least one dependent clause is:", a: "a complex sentence", wrong: ["a simple sentence", "a compound sentence", "a phrase"], topics: ["Parts of Speech", "Essay Writing"] },
  { q: "Words like 'although', 'because' and 'while' are:", a: "subordinating conjunctions", wrong: ["prepositions", "coordinating conjunctions", "interjections"], topics: ["Parts of Speech"] },
  { q: "The attitude a writer takes toward a subject is called:", a: "tone", wrong: ["plot", "setting", "rhyme scheme"], topics: ["Literature: Prose", "Reading Comprehension"] },
  { q: "Giving human qualities to non-human things is:", a: "personification", wrong: ["hyperbole", "alliteration", "onomatopoeia"], topics: ["Vocabulary & Idioms", "Creative Writing"] },
  { q: "Deliberate exaggeration for effect is:", a: "hyperbole", wrong: ["understatement", "simile", "irony"], topics: ["Creative Writing"] },
  { q: "The repetition of initial consonant sounds is:", a: "alliteration", wrong: ["assonance", "rhyme", "metaphor"], topics: ["Creative Writing"] },
  { q: "Words that imitate sounds, such as 'buzz' and 'crash', show:", a: "onomatopoeia", wrong: ["personification", "simile", "irony"], topics: ["Creative Writing", "Vocabulary & Idioms"] },
  { q: "Skimming a text means reading:", a: "quickly for the general idea", wrong: ["every word slowly", "only the last line", "backwards"], topics: ["Reading Comprehension", "Oral & Listening Skills"] },
  { q: "Scanning a text means reading to:", a: "find specific information quickly", wrong: ["memorise every word", "enjoy the style", "check the spelling"], topics: ["Reading Comprehension"] },
  { q: "An essay's thesis statement:", a: "states the main argument", wrong: ["gives only background", "is always a question", "must be the last sentence"], topics: ["Essay Writing"] },
  { q: "A CV (curriculum vitae) is used mainly when:", a: "applying for a job", wrong: ["writing a story", "sending greetings", "keeping a diary"], topics: ["Functional Writing"] },
  { q: "'Hardly had she arrived ___ the rain started.' Which word fits?", a: "when", wrong: ["than", "then", "that"], topics: ["Parts of Speech"] },
  { q: "A compound sentence joins two independent clauses with a:", a: "coordinating conjunction", wrong: ["relative pronoun", "subordinating conjunction", "preposition"], topics: ["Parts of Speech", "Essay Writing"] },
  { q: "The verb must agree with the subject: 'The list of items ___ on the table.' Which fits?", a: "is", wrong: ["are", "were", "have"], topics: ["Parts of Speech"] },
  { q: "A brief retelling of the main points of a text is a:", a: "summary", wrong: ["quotation", "preface", "footnote"], topics: ["Reading Comprehension", "Essay Writing"] },
  { q: "Direct speech is shown by using:", a: "quotation marks", wrong: ["brackets", "a colon only", "italics only"], topics: ["Parts of Speech", "Functional Writing"] },
];
const SENIOR: Fact[] = [
  { q: "A long speech by a character alone on stage, revealing inner thoughts, is a:", a: "soliloquy", wrong: ["dialogue", "prologue", "stage direction"], topics: ["Literature: Set Texts (Drama)", "Literary Genres"] },
  { q: "When the audience knows something a character does not, this is:", a: "dramatic irony", wrong: ["situational irony", "verbal irony", "satire"], topics: ["Drama & Performance", "Literature: Set Texts (Drama)"] },
  { q: "The final resolution of a plot after the climax is the:", a: "denouement", wrong: ["exposition", "rising action", "flashback"], topics: ["Setting & Plot", "Prose Analysis"] },
  { q: "A 14-line poem with a set rhyme scheme is a:", a: "sonnet", wrong: ["haiku", "ballad", "limerick"], topics: ["Poetry Analysis", "Literary Genres"] },
  { q: "A three-line Japanese poem with a 5-7-5 syllable pattern is a:", a: "haiku", wrong: ["sonnet", "ode", "elegy"], topics: ["Poetry Analysis", "Literary Genres"] },
  { q: "A verb form ending in '-ing' used as a noun is a:", a: "gerund", wrong: ["participle", "infinitive", "modal"], topics: ["Grammar & Usage", "Language Functions"] },
  { q: "The base form of a verb preceded by 'to' (e.g. 'to run') is the:", a: "infinitive", wrong: ["gerund", "past participle", "imperative"], topics: ["Grammar & Usage"] },
  { q: "The subjunctive mood is used to express:", a: "wishes or hypothetical situations", wrong: ["completed past actions", "simple facts", "direct commands only"], topics: ["Grammar & Usage"] },
  { q: "A character who contrasts with the protagonist to highlight qualities is a:", a: "foil", wrong: ["narrator", "antagonist's ally", "chorus"], topics: ["Characterisation", "Prose Analysis"] },
  { q: "Substituting a mild expression for a blunt one (e.g. 'passed away') is a:", a: "euphemism", wrong: ["hyperbole", "pun", "oxymoron"], topics: ["Grammar & Usage", "Themes & Diction"] },
  { q: "A figure of speech combining contradictory terms, such as 'deafening silence', is an:", a: "oxymoron", wrong: ["euphemism", "hyperbole", "allusion"], topics: ["Themes & Diction", "Poetry Analysis"] },
  { q: "In an argumentative essay, acknowledging then refuting the opposing view is the:", a: "counter-argument", wrong: ["thesis", "hook", "summary"], topics: ["Composition & Essays", "Comprehension & Summary"] },
  { q: "The arrangement of words to form phrases and sentences is:", a: "syntax", wrong: ["semantics", "phonology", "morphology"], topics: ["Grammar & Usage", "Language Functions"] },
  { q: "The study of meaning in language is:", a: "semantics", wrong: ["syntax", "phonetics", "graphology"], topics: ["Language Functions", "Grammar & Usage"] },
  { q: "'The pen is mightier than the sword' uses the pen and sword as:", a: "symbols (metonymy)", wrong: ["similes", "puns", "rhymes"], topics: ["Themes & Diction", "Prose Analysis"] },
  { q: "A recurring idea or subject that runs through a literary work is its:", a: "theme", wrong: ["plot", "setting", "diction"], topics: ["Themes & Diction", "Literary Genres"] },
  { q: "Reported/indirect speech of \"I will come tomorrow\" said yesterday: He said he would come:", a: "the next day", wrong: ["tomorrow", "today", "yesterday"], topics: ["Grammar & Usage", "Language Functions"] },
  { q: "A passage that gives the writer's viewpoint and tries to persuade is:", a: "argumentative writing", wrong: ["narrative writing", "descriptive writing", "expository note-making"], topics: ["Composition & Essays"] },
  { q: "Formal register is most appropriate for:", a: "an official report", wrong: ["a text to a close friend", "a personal diary", "playground banter"], topics: ["Language Functions", "Composition & Essays"] },
  { q: "An indirect reference to a well-known person, event or text is an:", a: "allusion", wrong: ["illusion", "analogy", "idiom"], topics: ["Themes & Diction", "Prose Analysis"] },
];

export const ENGLISH_FACTS: FactBankConfig = {
  byBand: { lower: LOWER, upper: UPPER, junior: JUNIOR, senior: SENIOR },
};
const facts = makeFactBankGenerator(ENGLISH_FACTS);

export const englishGenerator: SubjectGenerator = (ctx) => {
  return shuffle(ctx.rng, [...paramPool(ctx), ...facts(ctx)]);
};

// Literature — literary content across junior/senior plus universal terms.
export const LITERATURE_FACTS: FactBankConfig = {
  byBand: {
    junior: [...JUNIOR, ...SENIOR],
    senior: SENIOR,
    upper: [...UPPER.filter((f) => f.topics?.some((t) => t.includes("Literature") || t.includes("Prose"))), ...JUNIOR],
  },
  common: [
    { q: "The time and place in which a story happens is the:", a: "setting", wrong: ["theme", "plot", "narrator"], topics: ["Setting & Plot", "Prose Analysis"] },
    { q: "The central message or insight of a literary work is its:", a: "theme", wrong: ["setting", "diction", "rhyme"], topics: ["Themes & Diction", "Literary Genres"] },
    { q: "A struggle between opposing forces in a story is:", a: "conflict", wrong: ["climax", "mood", "imagery"], topics: ["Setting & Plot"] },
    { q: "Oral literature includes:", a: "proverbs, riddles and songs", wrong: ["novels only", "newspapers", "textbooks"], topics: ["Literary Genres", "Literary Devices"] },
    { q: "The person who tells the story is the:", a: "narrator", wrong: ["playwright", "editor", "publisher"], topics: ["Prose Analysis", "Characterisation"] },
    { q: "Descriptive language that appeals to the senses is called:", a: "imagery", wrong: ["dialogue", "exposition", "syntax"], topics: ["Literary Devices", "Poetry Analysis"] },
  ],
};
export const literatureGenerator: SubjectGenerator = makeFactBankGenerator(LITERATURE_FACTS);
