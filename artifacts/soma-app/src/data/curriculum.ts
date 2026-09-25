import { resolveGrade } from "./grade";

// ─────────────────────────────────────────────────────────────────────────────
// Senior School pathways (CBE). A pathway is a RECOMMENDATION, not a gate:
// its subjects are surfaced first, but every subject in the grade stays
// available.
// ─────────────────────────────────────────────────────────────────────────────

export type Pathway = "stem" | "social-sciences" | "arts-sports";

export const PATHWAYS: { id: Pathway; title: string; emoji: string; blurb: string; subjects: string[] }[] = [
  {
    id: "stem",
    title: "STEM",
    emoji: "🔬",
    blurb: "Science, Technology, Engineering & Mathematics",
    subjects: ["Mathematics", "Biology", "Chemistry", "Physics", "Computer Science", "Home Science"],
  },
  {
    id: "social-sciences",
    title: "Social Sciences",
    emoji: "🌍",
    blurb: "Humanities, business and languages",
    subjects: [
      "History and Citizenship", "Geography", "Business Studies",
      "Christian Religious Education", "Literature", "Fasihi ya Kiswahili",
    ],
  },
  {
    id: "arts-sports",
    title: "Arts & Sports Science",
    emoji: "🎨",
    blurb: "Performing arts, fine art and sports science",
    subjects: ["Literature", "Fasihi ya Kiswahili", "Business Studies", "Home Science"],
  },
];

/** Subjects every Senior School learner takes regardless of pathway. */
export const SENIOR_CORE = ["English", "Kiswahili", "Mathematics"];

export function pathwayById(id: Pathway | null | undefined) {
  return PATHWAYS.find((p) => p.id === id) ?? null;
}

/** The subjects highlighted as recommended for a grade + pathway (Senior only). */
export function recommendedSubjects(gradeKey: string, pathway: Pathway | null): Set<string> {
  if (resolveGrade(gradeKey).band !== "senior" || !pathway) return new Set();
  return new Set([...SENIOR_CORE, ...(pathwayById(pathway)?.subjects ?? [])]);
}

/**
 * All subjects for the grade, with the recommended ones first (then the rest,
 * still fully accessible). Nothing is removed.
 */
export function orderedSubjects(gradeKey: string, allSubjects: string[], pathway: Pathway | null): string[] {
  const rec = recommendedSubjects(gradeKey, pathway);
  if (rec.size === 0) return [...allSubjects].sort();
  const first = allSubjects.filter((s) => rec.has(s)).sort();
  const rest = allSubjects.filter((s) => !rec.has(s)).sort();
  return [...first, ...rest];
}
