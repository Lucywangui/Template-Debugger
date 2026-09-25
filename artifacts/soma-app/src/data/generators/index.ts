import type { Material } from "@/data/materials";
import { resolveGrade } from "@/data/grade";
import type { GenContext, Question, SubjectGenerator } from "./types";
import { hashString, makeRng, questionKey, shuffle, shuffleOptions } from "./helpers";

import { mathematicsGenerator } from "./mathematics";
import { englishGenerator, literatureGenerator } from "./content/english";
import {
  biologyGenerator, chemistryGenerator, environmentalActivitiesGenerator,
  integratedScienceGenerator, physicsGenerator,
} from "./content/science";
import { fasihiKiswahiliGenerator, kiswahiliGenerator } from "./content/kiswahili";
import {
  businessStudiesGenerator, creGenerator, geographyGenerator,
  historyCitizenshipGenerator, socialStudiesGenerator,
} from "./content/humanities";
import {
  agricultureGenerator, agricultureNutritionGenerator, computerScienceGenerator,
  healthEducationGenerator, homeScienceGenerator, hygieneNutritionGenerator, preTechnicalGenerator,
} from "./content/practical";
import { creativeArtsAndSportsGenerator, creativeArtsGenerator } from "./content/arts";

export type { Question } from "./types";

// Exact subject-name → generator. Names must match materials.ts catalogue.
export const SUBJECT_GENERATORS: Record<string, SubjectGenerator> = {
  Mathematics: mathematicsGenerator,
  English: englishGenerator,
  Literature: literatureGenerator,
  Kiswahili: kiswahiliGenerator,
  "Fasihi ya Kiswahili": fasihiKiswahiliGenerator,
  Biology: biologyGenerator,
  Chemistry: chemistryGenerator,
  Physics: physicsGenerator,
  "Integrated Science": integratedScienceGenerator,
  "Environmental Activities": environmentalActivitiesGenerator,
  "Social Studies": socialStudiesGenerator,
  Geography: geographyGenerator,
  "History and Citizenship": historyCitizenshipGenerator,
  History: historyCitizenshipGenerator, // 8-4-4 catalogue uses the short name
  "Business Studies": businessStudiesGenerator,
  "Christian Religious Education": creGenerator,
  Agriculture: agricultureGenerator,
  "Agriculture and Nutrition": agricultureNutritionGenerator,
  "Home Science": homeScienceGenerator,
  "Hygiene and Nutrition": hygieneNutritionGenerator,
  "Health Education": healthEducationGenerator,
  "Pre-Technical Studies": preTechnicalGenerator,
  "Computer Science": computerScienceGenerator,
  "Creative Arts": creativeArtsGenerator,
  "Creative Arts and Sports": creativeArtsAndSportsGenerator,
};

export function hasGeneratorFor(subject: string): boolean {
  return subject in SUBJECT_GENERATORS;
}

/**
 * Build a fresh quiz for a material.
 *
 * - Deterministic for a given (material, attempt) pair via the seeded PRNG.
 * - Never repeats a question within the quiz (deduped by normalised text).
 * - Question order and answer-option order are shuffled every call.
 *
 * Pass a changing `attemptSeed` (e.g. Date.now()) to get a different set on a
 * retake; pass a stable one (or omit) to reproduce the same quiz — used when
 * resuming an in-progress quiz.
 */
export function generateQuiz(material: Material, count: number, attemptSeed = 0): Question[] {
  const want = Math.max(1, Math.floor(count));
  const gen = SUBJECT_GENERATORS[material.subject];
  if (!gen) return [];

  const resolved = resolveGrade(material.gradeKey);
  const baseSeed = hashString(`${material.id}|${material.seedIndex}|${attemptSeed}`);

  const seen = new Set<string>();
  const collected: Question[] = [];

  // Draw from the generator up to a few times with evolving seeds until we have
  // enough distinct questions (pools are large, so one pass is usually plenty).
  for (let pass = 0; pass < 6 && collected.length < want; pass++) {
    const rng = makeRng(baseSeed + pass * 7919);
    const ctx: GenContext = {
      subject: material.subject,
      gradeKey: material.gradeKey,
      grade: resolved.grade,
      band: resolved.band,
      topics: material.topics,
      rng,
    };
    for (const q of gen(ctx)) {
      const key = questionKey(q);
      if (seen.has(key)) continue;
      seen.add(key);
      collected.push(q);
      if (collected.length >= want * 3) break;
    }
  }

  const finalRng = makeRng(baseSeed ^ 0x9e3779b9);
  return shuffle(finalRng, collected)
    .slice(0, want)
    .map((q) => shuffleOptions(finalRng, q));
}
