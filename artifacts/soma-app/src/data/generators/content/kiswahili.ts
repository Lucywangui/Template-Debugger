import type { Question, SubjectGenerator } from "../types";
import { buildMCQ, pick, shuffle } from "../helpers";
import { makeFactBankGenerator, type Fact, type FactBankConfig } from "../factbank";

const VITENZI = ["kula", "soma", "andika", "kimbia", "imba", "lima", "cheza", "pika", "ruka", "ngoja"];
const NOMINO = ["mwalimu", "kitabu", "shule", "mto", "mlima", "soko", "gari", "nyumba", "mti", "maji"];
const VIVUMISHI = ["-zuri", "-baya", "-refu", "-fupi", "-kubwa", "-dogo", "-eupe", "-eusi"];

const WINGI: [string, string][] = [
  ["mtoto", "watoto"], ["kitabu", "vitabu"], ["mti", "miti"], ["jicho", "macho"],
  ["gari", "magari"], ["mwalimu", "walimu"], ["kiti", "viti"], ["jina", "majina"],
  ["ua", "maua"], ["mkono", "mikono"], ["daraja", "madaraja"], ["mgeni", "wageni"],
  ["kisu", "visu"], ["tunda", "matunda"], ["mto", "mito"], ["ziwa", "maziwa"],
  ["mwana", "wana"], ["ndugu", "ndugu"], ["sikio", "masikio"], ["ukuta", "kuta"],
  ["mfuko", "mifuko"], ["chumba", "vyumba"], ["shamba", "mashamba"], ["mkate", "mikate"],
];
const KINYUME: [string, string][] = [
  ["kubwa", "dogo"], ["refu", "fupi"], ["nzuri", "mbaya"], ["juu", "chini"],
  ["giza", "mwanga"], ["furaha", "huzuni"], ["ukweli", "uongo"], ["karibu", "mbali"],
  ["nyingi", "chache"], ["moto", "baridi"], ["haraka", "polepole"], ["tajiri", "maskini"],
  ["safi", "chafu"], ["mpya", "kongwe"], ["asubuhi", "jioni"], ["nzito", "nyepesi"],
  ["ndani", "nje"], ["mbele", "nyuma"], ["kuanza", "kumaliza"], ["kupanda", "kushuka"],
  ["rafiki", "adui"], ["amani", "vita"], ["kweli", "uongo"], ["mwisho", "mwanzo"],
];

function wingiQ(rng: () => number): Question | null {
  const [u, w] = pick(rng, WINGI);
  return buildMCQ(rng, `Wingi wa "${u.trim()}" ni:`, w, WINGI.map((p) => p[1]).filter((x) => x !== w),
    `Umoja "${u.trim()}" hubadilika kuwa wingi "${w}".`);
}
function kinyumeQ(rng: () => number): Question | null {
  const [a, b] = pick(rng, KINYUME);
  return buildMCQ(rng, `Kinyume cha "${a}" ni:`, b,
    KINYUME.map((p) => p[1]).filter((x) => x !== b).concat(KINYUME.map((p) => p[0])),
    `"${b}" ni kinyume cha "${a}".`);
}
const AINA_MAANA: Record<string, string> = { kitenzi: "huonyesha kitendo", nomino: "ni jina la kitu au mtu", kivumishi: "huelezea nomino" };
function ainaQ(rng: () => number): Question | null {
  const kinds: [string, string[]][] = [["kitenzi", VITENZI], ["nomino", NOMINO], ["kivumishi", VIVUMISHI]];
  const [label, pool] = pick(rng, kinds);
  const correct = pick(rng, pool);
  const others = shuffle(rng, [VITENZI, NOMINO, VIVUMISHI].flat().filter((w) => !pool.includes(w)));
  return buildMCQ(rng, `Neno lipi ni ${label}?`, correct, others, `"${correct}" ni ${label} — ${AINA_MAANA[label]}.`);
}

const LOWER: Fact[] = [
  { q: "Salamu ya asubuhi ni:", a: "Habari za asubuhi", wrong: ["Usiku mwema", "Kwaheri", "Lala salama"], topics: ["Mazungumzo", "Kusikia & Kuzungumza"] },
  { q: "Jibu la \"Asante\" ni:", a: "Karibu", wrong: ["Kwaheri", "Pole", "Ndiyo"], topics: ["Mazungumzo"] },
  { q: "Tunasema nini tunapoagana?", a: "Kwaheri", wrong: ["Habari", "Asante", "Samahani"], topics: ["Mazungumzo", "Kusikia & Kuzungumza"] },
  { q: "Neno lenye silabi mbili ni:", a: "baba", wrong: ["m", "shuleni", "mwalimu"], topics: ["Kusoma & Silabi"] },
  { q: "Herufi ya kwanza ya alfabeti ya Kiswahili ni:", a: "A", wrong: ["B", "E", "M"], topics: ["Kusoma & Silabi", "Kuandika Sentensi"] },
  { q: "Sentensi sahihi ni:", a: "Mtoto anakula chakula.", wrong: ["Chakula anakula mtoto.", "Anakula mtoto chakula.", "Mtoto chakula anakula."], topics: ["Kuandika Sentensi", "Sarufi ya Msingi"] },
  { q: "Alama ya kuuliza swali ni:", a: "?", wrong: [".", ",", "!"], topics: ["Kuandika Sentensi"] },
  { q: "Sentensi ya taarifa humalizwa kwa:", a: "nukta (.)", wrong: ["alama ya kuuliza", "mkato", "alama ya mshangao"], topics: ["Kuandika Sentensi"] },
  { q: "Wingi wa \"mtoto\" ni:", a: "watoto", wrong: ["mitoto", "vitoto", "matoto"], topics: ["Nomino & Vitenzi", "Sarufi ya Msingi"] },
  { q: "Kinyume cha \"kubwa\" ni:", a: "dogo", wrong: ["refu", "pana", "zito"], topics: ["Msamiati Mpya"] },
  { q: "Neno \"anakimbia\" ni aina gani ya neno?", a: "kitenzi", wrong: ["nomino", "kivumishi", "kielezi"], topics: ["Nomino & Vitenzi"] },
  { q: "Rangi tatu za msingi ni:", a: "nyekundu, njano na buluu", wrong: ["kijani, chungwa na zambarau", "nyeupe, nyeusi na kijivu", "pinki, kahawia na dhahabu"], topics: ["Msamiati Mpya", "Ubunifu wa Lugha"] },
  { q: "Siku za wiki ni ngapi?", a: "saba", wrong: ["tano", "sita", "nane"], topics: ["Msamiati Mpya"] },
  { q: "Neno \"shule\" kwa Kiingereza ni:", a: "school", wrong: ["shop", "church", "house"], topics: ["Msamiati Mpya"] },
];
const UPPER: Fact[] = [
  { q: "Neno linalochukua nafasi ya nomino ni:", a: "kiwakilishi", wrong: ["kitenzi", "kielezi", "kiunganishi"], topics: ["Nomino & Vitenzi", "Sarufi ya Msingi"] },
  { q: "Neno linaloeleza jinsi kitendo kilivyofanyika ni:", a: "kielezi", wrong: ["kivumishi", "kiwakilishi", "kiunganishi"], topics: ["Nomino & Vitenzi", "Sarufi ya Msingi"] },
  { q: "Ufahamu wa maandishi unalenga:", a: "kuelewa maana ya maandishi", wrong: ["kukariri maneno yote", "kuandika upya", "kuhesabu mistari"], topics: ["Ufahamu", "Kusoma & Silabi"] },
  { q: "Methali \"Haraka haraka haina baraka\" inafundisha:", a: "kutofanya mambo kwa pupa", wrong: ["kukimbia sana", "kutolala", "kufanya kazi usiku"], topics: ["Hadithi Fupi", "Ubunifu wa Lugha"] },
  { q: "Methali \"Umoja ni nguvu, utengano ni udhaifu\" inasisitiza:", a: "kushirikiana", wrong: ["kugombana", "kukaa peke yako", "kunyamaza"], topics: ["Hadithi Fupi", "Ubunifu wa Lugha"] },
  { q: "Tashbihi hutumia maneno kama:", a: "\"kama\" au \"mfano wa\"", wrong: ["\"lakini\"", "\"ingawa\"", "\"kwa sababu\""], topics: ["Mashairi & Nyimbo", "Ubunifu wa Lugha"] },
  { q: "Barua rasmi huanza kwa:", a: "anuani na salamu ya heshima", wrong: ["utani", "jina la rafiki tu", "alama ya mshangao"], topics: ["Kuandika Sentensi", "Ubunifu wa Lugha"] },
  { q: "Wakati uliopita wa \"ninakula\" ni:", a: "nilikula", wrong: ["nitakula", "nimekula", "ninakula"], topics: ["Sarufi ya Msingi", "Nomino & Vitenzi"] },
  { q: "Wakati ujao wa \"anasoma\" ni:", a: "atasoma", wrong: ["alisoma", "amesoma", "anasoma"], topics: ["Sarufi ya Msingi"] },
  { q: "Kiambishi cha ukanushi katika \"hakuja\" ni:", a: "ha-", wrong: ["-ku-", "-ja", "a-"], topics: ["Sarufi ya Msingi"] },
  { q: "Neno \"mzee\" lina wingi gani?", a: "wazee", wrong: ["mizee", "vizee", "mazee"], topics: ["Nomino & Vitenzi"] },
  { q: "Mstari mmoja wa shairi huitwa:", a: "mshororo", wrong: ["ubeti", "kibwagizo", "diwani"], topics: ["Mashairi & Nyimbo"] },
  { q: "Kisawe cha \"furaha\" ni:", a: "raha", wrong: ["huzuni", "hasira", "hofu"], topics: ["Msamiati Mpya"] },
  { q: "Kinyume cha \"asubuhi\" ni:", a: "jioni", wrong: ["mchana", "usiku wa manane", "alfajiri"], topics: ["Msamiati Mpya"] },
];
const SENIOR: Fact[] = [
  { q: "Utanzu wa fasihi simulizi unaohusisha hadithi za mdomo ni:", a: "ngano", wrong: ["riwaya", "tamthilia", "insha"], topics: ["Fasihi Simulizi", "Historia ya Fasihi"] },
  { q: "Mstari mmoja wa shairi huitwa:", a: "mshororo", wrong: ["ubeti", "kibwagizo", "diwani"], topics: ["Ushairi", "Fasihi: Ushairi wa Diwani"] },
  { q: "Sehemu ya shairi yenye mishororo kadhaa huitwa:", a: "ubeti", wrong: ["mshororo", "kina", "mizani"], topics: ["Ushairi", "Fasihi: Ushairi wa Diwani"] },
  { q: "Sitiari ni tamathali inayolinganisha:", a: "bila kutumia \"kama\"", wrong: ["kwa kutumia \"kama\"", "kwa kutumia nambari", "kwa kutumia maswali"], topics: ["Mbinu za Lugha", "Ushairi"] },
  { q: "Tashhisi (uhaishaji) ni kuipa vitu visivyo na uhai:", a: "sifa za binadamu", wrong: ["rangi mpya", "ukubwa zaidi", "sauti kubwa"], topics: ["Mbinu za Lugha", "Ushairi"] },
  { q: "Hadithi ndefu ya kubuni yenye wahusika wengi ni:", a: "riwaya", wrong: ["methali", "kitendawili", "wimbo"], topics: ["Riwaya", "Fasihi ya Kiswahili: Riwaya"] },
  { q: "Mazungumzo baina ya wahusika katika tamthilia huitwa:", a: "dayalojia", wrong: ["monolojia", "maelezo ya jukwaa", "utangulizi"], topics: ["Tamthilia", "Fasihi: Tamthilia"] },
  { q: "Dhamira kuu ya kazi ya fasihi ni:", a: "ujumbe mkuu unaowasilishwa", wrong: ["idadi ya kurasa", "jina la mchapishaji", "bei ya kitabu"], topics: ["Maudhui na Dhamira", "Wahusika na Mandhari"] },
  { q: "Mahali na wakati ambapo matukio ya hadithi hutokea ni:", a: "mandhari", wrong: ["muhtasari", "wahusika", "kichwa"], topics: ["Wahusika na Mandhari", "Riwaya"] },
  { q: "Mhusika mkuu katika kazi ya fasihi huitwa pia:", a: "mhusika mkuu (protagonisti)", wrong: ["msimulizi", "mhariri", "mchapishaji"], topics: ["Wahusika na Mandhari"] },
  { q: "Muhtasari ni:", a: "kufupisha hoja kuu za kifungu", wrong: ["kunakili kila neno", "kuongeza mawazo mapya", "kubadilisha mada"], topics: ["Ufahamu na Muhtasari"] },
  { q: "Semi fupi za hekima kama \"Mtaka cha mvunguni sharti ainame\" ni:", a: "methali", wrong: ["vitendawili", "nyimbo", "hadithi"], topics: ["Fasihi Simulizi", "Historia ya Fasihi"] },
  { q: "Aina ya uandishi inayotoa hoja na kushawishi msomaji ni insha ya:", a: "hoja/mjadala", wrong: ["masimulizi", "maelezo", "wasifu"], topics: ["Uandishi wa Makala"] },
  { q: "Nyakati tatu kuu za kitenzi cha Kiswahili ni uliopita, uliopo na:", a: "ujao", wrong: ["timilifu pekee", "mazoea pekee", "amri"], topics: ["Sarufi ya Lugha"] },
  { q: "Kirai ni:", a: "fungu la maneno lisilo na kiima na kiarifu kamili", wrong: ["sentensi kamili", "aya nzima", "shairi zima"], topics: ["Sarufi ya Lugha"] },
  { q: "Kinaya (dhihaka) hutokea pale:", a: "maneno yanapopingana na maana halisi iliyokusudiwa", wrong: ["maneno yanaporudiwa", "maneno yanapopangwa vizuri", "sauti zinapofanana"], topics: ["Mbinu za Lugha", "Maudhui na Dhamira"] },
  { q: "Tabaini ni tamathali inayotumia:", a: "ukanushi kuonyesha ukweli au ukubwa wa jambo", wrong: ["ulinganishi wa \"kama\"", "sauti zinazofanana", "maswali ya balagha"], topics: ["Mbinu za Lugha", "Ushairi"] },
  { q: "Chuku (mubalagha) ni:", a: "kutia jambo chumvi kupita kiasi", wrong: ["kupunguza jambo", "kusema ukweli mtupu", "kurudia neno"], topics: ["Mbinu za Lugha"] },
  { q: "Takriri ni mbinu ya kurudia:", a: "neno au kifungu kwa lengo la kusisitiza", wrong: ["kubadilisha mpangilio wa maneno", "kutumia lugha ya kigeni", "kuuliza maswali"], topics: ["Mbinu za Lugha", "Ushairi"] },
  { q: "Wimbo wa taifa na nyimbo za dini ni mifano ya:", a: "ushairi", wrong: ["riwaya", "tamthilia", "insha ya maelezo"], topics: ["Ushairi", "Fasihi Simulizi"] },
  { q: "Ngoja, subiri na tulia ni vitenzi katika kauli ya:", a: "amri", wrong: ["taarifa", "swali", "masharti"], topics: ["Sarufi ya Lugha"] },
  { q: "Kishazi tegemezi ni kishazi ambacho:", a: "hakiwezi kusimama peke yake kama sentensi kamili", wrong: ["kinasimama peke yake", "hakina kitenzi", "ni neno moja tu"], topics: ["Sarufi ya Lugha"] },
  { q: "Sentensi \"Mwalimu anayefundisha Kiswahili amefika\" ina kishazi:", a: "tegemezi \"anayefundisha Kiswahili\"", wrong: ["huru pekee", "cha amri", "cha swali"], topics: ["Sarufi ya Lugha"] },
  { q: "Msuko wa hadithi (ploti) unahusu:", a: "mpangilio wa matukio kuanzia mwanzo hadi mwisho", wrong: ["idadi ya wahusika", "urefu wa vitabu", "jina la mwandishi"], topics: ["Riwaya", "Wahusika na Mandhari"] },
  { q: "Mgogoro katika kazi ya fasihi ni:", a: "mvutano baina ya nguvu au wahusika wanaopingana", wrong: ["maelezo ya mandhari", "orodha ya sura", "shukrani za mwandishi"], topics: ["Maudhui na Dhamira", "Wahusika na Mandhari"] },
  { q: "Fasihi andishi hutofautiana na fasihi simulizi kwa kuwa:", a: "huhifadhiwa kwa maandishi", wrong: ["haina wahusika", "haina maudhui", "ni ya kubuni tu"], topics: ["Historia ya Fasihi", "Fasihi Simulizi"] },
  { q: "Diwani ni:", a: "mkusanyiko wa mashairi katika kitabu kimoja", wrong: ["riwaya ndefu", "tamthilia moja", "hadithi fupi moja"], topics: ["Ushairi", "Fasihi: Ushairi wa Diwani"] },
  { q: "Vina katika ushairi wa kimapokeo ni:", a: "silabi za mwisho zinazofanana katika mishororo", wrong: ["idadi ya maneno", "jina la mtunzi", "urefu wa ubeti"], topics: ["Ushairi", "Fasihi: Ushairi wa Diwani"] },
  { q: "Mizani ni:", a: "idadi ya silabi katika mshororo wa shairi", wrong: ["idadi ya beti", "kina cha kati", "jumla ya mistari"], topics: ["Ushairi"] },
];

export const KISWAHILI_FACTS: FactBankConfig = {
  byBand: { lower: LOWER, upper: UPPER, junior: [...UPPER, ...SENIOR.slice(0, 6)], senior: SENIOR },
};
const facts = makeFactBankGenerator(KISWAHILI_FACTS);

export const kiswahiliGenerator: SubjectGenerator = (ctx) => {
  const param: Question[] = [];
  const builders = [wingiQ, kinyumeQ, ainaQ];
  const cap = ctx.grade > 9 ? 12 : 22;
  for (let i = 0; i < 90 && param.length < cap; i++) {
    const q = builders[i % builders.length](ctx.rng);
    if (q) param.push(q);
  }
  return shuffle(ctx.rng, [...param, ...facts(ctx)]);
};

export const FASIHI_FACTS: FactBankConfig = {
  byBand: { senior: SENIOR, junior: [...SENIOR, ...UPPER.slice(0, 4)] },
  common: [
    { q: "Kitendawili ni utanzu wa fasihi simulizi wenye:", a: "kauli fumbo inayohitaji jibu", wrong: ["hadithi ndefu", "wimbo wa taifa", "insha ya hoja"], topics: ["Fasihi Simulizi", "Hadithi Fupi"] },
    { q: "Wahusika wakuu katika hadithi ni wale:", a: "wanaojitokeza mara kwa mara katika matukio makuu", wrong: ["wanaotajwa mara moja", "walioko jaladani", "wasiokuwa na majina"], topics: ["Wahusika na Mandhari"] },
    { q: "Ushairi wa kimapokeo huzingatia:", a: "vina na mizani", wrong: ["urefu wa ukurasa", "rangi ya wino", "idadi ya wahusika"], topics: ["Ushairi", "Fasihi: Ushairi wa Diwani"] },
  ],
};
export const fasihiKiswahiliGenerator: SubjectGenerator = makeFactBankGenerator(FASIHI_FACTS);
