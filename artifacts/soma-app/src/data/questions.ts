import type { Material } from "./materials";
import { generateQuiz, type Question } from "./generators";

export type { Question };

/**
 * Build the questions for a material.
 *
 * Fully offline and procedurally generated: content is tuned to the material's
 * exact grade, never repeats within a quiz, and is reshuffled on every call.
 *
 * @param attemptSeed  pass a fresh value (e.g. Date.now()) for a new attempt so
 *                     a retake gets a different set; omit to keep it stable.
 */
export function getQuestionsForMaterial(
  material: Material,
  count: number,
  attemptSeed = 0,
): Question[] {
  return generateQuiz(material, count, attemptSeed);
}
