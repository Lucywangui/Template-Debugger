// ─────────────────────────────────────────────────────────────────────────────
// Grade model — turns a stored gradeKey ("cbc-7", "senior-11", "844-form2")
// into an exact numeric grade plus a band, so question generators and study
// notes can be tuned per class rather than per broad curriculum level.
// ─────────────────────────────────────────────────────────────────────────────

export type GradeBand = "lower" | "upper" | "junior" | "senior";
/** "cbc" is the CBE ladder (Grade 1–12); "844" is the legacy 8-4-4 track. */
export type Curriculum = "cbc" | "844";

/** CBE school levels in the 2-6-3-3-3 structure. */
export const LEVEL_NAME: Record<GradeBand, string> = {
  lower: "Lower Primary",
  upper: "Upper Primary",
  junior: "Junior School",
  senior: "Senior School",
};

export interface ResolvedGrade {
  /** Original storage key, e.g. "cbc-7". */
  key: string;
  /** Exact grade 1–12. 8-4-4 Form N maps to Grade N + 8 (Form 1 → 9 … Form 4 → 12). */
  grade: number;
  curriculum: Curriculum;
  band: GradeBand;
  /** CBE level name, e.g. "Junior School". */
  levelName: string;
  /** Human label, e.g. "Grade 7" or "Form 2". */
  label: string;
}

function bandForGrade(grade: number): GradeBand {
  if (grade <= 3) return "lower";
  if (grade <= 6) return "upper";
  if (grade <= 9) return "junior";
  return "senior";
}

export function resolveGrade(gradeKey: string | null | undefined): ResolvedGrade {
  const key = gradeKey || "cbc-4";
  const mk = (grade: number, curriculum: Curriculum, label: string): ResolvedGrade => {
    const band = bandForGrade(grade);
    return { key, grade, curriculum, band, levelName: LEVEL_NAME[band], label };
  };
  gradeKey = key;
  if (gradeKey.startsWith("cbc-")) return mk(parseInt(gradeKey.slice(4), 10) || 1, "cbc", `Grade ${parseInt(gradeKey.slice(4), 10) || 1}`);
  if (gradeKey.startsWith("senior-")) return mk(parseInt(gradeKey.slice(7), 10) || 10, "cbc", `Grade ${parseInt(gradeKey.slice(7), 10) || 10}`);
  if (gradeKey.startsWith("844-form")) {
    const form = parseInt(gradeKey.slice(8), 10) || 1;
    return mk(form + 8, "844", `Form ${form}`);
  }
  return mk(6, "cbc", gradeKey);
}

/** Full name, e.g. "Grade 7 · Junior School", "Form 2 · 8-4-4 (legacy)". */
export function gradeDisplayName(gradeKey: string): string {
  const g = resolveGrade(gradeKey);
  if (g.curriculum === "844") return `${g.label} · 8-4-4 (legacy)`;
  return `${g.label} · ${g.levelName}`;
}

/** Short name, e.g. "Grade 7" / "Form 2". */
export function gradeShortName(gradeKey: string): string {
  return resolveGrade(gradeKey).label;
}

// The two curriculum ladders, in order, for remediation ("go down a class") and
// stretch ("try the next class up").
export const CBC_LADDER = [
  "cbc-1", "cbc-2", "cbc-3", "cbc-4", "cbc-5", "cbc-6",
  "cbc-7", "cbc-8", "cbc-9", "senior-10", "senior-11", "senior-12",
];
export const F844_LADDER = ["844-form1", "844-form2", "844-form3", "844-form4"];

export function gradeLadder(gradeKey: string | null | undefined): string[] {
  return gradeKey?.startsWith("844-") ? F844_LADDER : CBC_LADDER;
}

/** Up to 2 classes below and 2 above, on the same curriculum ladder. */
export function adjacentGrades(gradeKey: string | null | undefined): { below: string[]; above: string[] } {
  const ladder = gradeLadder(gradeKey);
  if (!gradeKey) return { below: [], above: [] };
  const i = ladder.indexOf(gradeKey);
  if (i === -1) return { below: [], above: [] };
  return {
    below: ladder.slice(Math.max(0, i - 2), i),
    above: ladder.slice(i + 1, i + 3),
  };
}

export const INTENT_LABELS: Record<string, { title: string; blurb: string; emoji: string }> = {
  exam: { title: "Revising for an exam", blurb: "Timed papers, mocks and weak-spot practice", emoji: "🎯" },
  "keep-up": { title: "Keeping up with class", blurb: "Practise what you're learning right now", emoji: "📚" },
  "catch-up": { title: "Catching up", blurb: "Fill gaps from earlier classes", emoji: "🪜" },
  "get-ahead": { title: "Getting ahead", blurb: "Preview what's coming next", emoji: "🚀" },
};
