import { resolveGrade } from "./grade";
import type { QuizResult } from "@/lib/storage";

// ─────────────────────────────────────────────────────────────────────────────
// Kenyan (CBE) assessment model.
//
//   • Grade 6  → KPSEA  → transition to Junior School
//   • Grade 9  → KJSEA  → transition to Senior School (choose a pathway)
//   • Grade 12 → KCSE   → transition to tertiary / KUCCPS placement
//   • Form 4   → KCSE   (8-4-4 legacy)
//
// CBE reports competence as performance levels, not marks. KCSE keeps the
// 12-point A–E scale. School-Based Assessment (SBA) is blended with the
// summative paper for the final KPSEA / KJSEA result. The weightings below are
// indicative of KNEC guidance and can be tuned in one place.
// ─────────────────────────────────────────────────────────────────────────────

export interface NationalExam {
  code: "KPSEA" | "KJSEA" | "KCSE";
  name: string;
  atGrade: number;
  /** What the learner moves on to after this exam. */
  nextStage: string;
  /** Blend of School-Based Assessment vs the summative paper. */
  sbaWeight: number;
  summativeWeight: number;
  /** CBE performance levels vs KCSE letter grades. */
  scale: "performance-level" | "kcse";
}

export function nationalExamFor(gradeKey: string): NationalExam | null {
  const { grade, curriculum } = resolveGrade(gradeKey);
  if (curriculum === "844") {
    if (grade >= 12) return { code: "KCSE", name: "KCSE", atGrade: 12, nextStage: "university / college (KUCCPS placement)", sbaWeight: 0, summativeWeight: 1, scale: "kcse" };
    return null;
  }
  if (grade === 6) return { code: "KPSEA", name: "Kenya Primary School Education Assessment", atGrade: 6, nextStage: "Junior School (Grade 7)", sbaWeight: 0.4, summativeWeight: 0.6, scale: "performance-level" };
  if (grade === 9) return { code: "KJSEA", name: "Kenya Junior School Education Assessment", atGrade: 9, nextStage: "Senior School — you'll choose a pathway", sbaWeight: 0.6, summativeWeight: 0.4, scale: "performance-level" };
  if (grade === 12) return { code: "KCSE", name: "Kenya Certificate of Secondary Education", atGrade: 12, nextStage: "university / college (KUCCPS placement)", sbaWeight: 0.2, summativeWeight: 0.8, scale: "kcse" };
  return null;
}

/** The exam a learner at this grade is working toward (looks ahead within the level). */
export function targetExamFor(gradeKey: string): NationalExam | null {
  const direct = nationalExamFor(gradeKey);
  if (direct) return direct;
  const { grade, curriculum } = resolveGrade(gradeKey);
  if (curriculum === "844") return { code: "KCSE", name: "KCSE", atGrade: 12, nextStage: "tertiary", sbaWeight: 0, summativeWeight: 1, scale: "kcse" };
  if (grade <= 6) return nationalExamFor("cbc-6");
  if (grade <= 9) return nationalExamFor("cbc-9");
  return nationalExamFor("senior-12");
}

// ── CBE performance levels ──────────────────────────────────────────────────
export interface PerformanceLevel {
  band: 1 | 2 | 3 | 4;
  label: string;
  short: string;
  color: string;
}

export function performanceLevel(percent: number): PerformanceLevel {
  if (percent >= 80) return { band: 4, label: "Exceeding Expectation", short: "EE", color: "#27ae60" };
  if (percent >= 55) return { band: 3, label: "Meeting Expectation", short: "ME", color: "#2980b9" };
  if (percent >= 30) return { band: 2, label: "Approaching Expectation", short: "AE", color: "#e67e22" };
  return { band: 1, label: "Below Expectation", short: "BE", color: "#e74c3c" };
}

// ── KCSE 12-point scale ────────────────────────────────────────────────────
export interface KcseGrade {
  grade: string;
  points: number;
}

const KCSE_TABLE: [number, string, number][] = [
  [80, "A", 12], [75, "A-", 11], [70, "B+", 10], [65, "B", 9], [60, "B-", 8],
  [55, "C+", 7], [50, "C", 6], [45, "C-", 5], [40, "D+", 4], [35, "D", 3], [30, "D-", 2],
];

export function kcseGrade(percent: number): KcseGrade {
  for (const [min, grade, points] of KCSE_TABLE) {
    if (percent >= min) return { grade, points };
  }
  return { grade: "E", points: 1 };
}

// ── Projected national result from practice history ────────────────────────
export interface Projection {
  exam: NationalExam;
  sbaPercent: number;      // proxy: average of recent topical quizzes
  summativePercent: number; // proxy: best recent practice exam
  blendedPercent: number;
  level?: PerformanceLevel;
  kcse?: KcseGrade;
  attempts: number;
}

export function projectExam(results: QuizResult[], gradeKey: string): Projection | null {
  const exam = targetExamFor(gradeKey);
  if (!exam) return null;

  const topical = results.filter((r) => r.type === "topical").slice(0, 20);
  const exams = results.filter((r) => r.type === "exam").slice(0, 5);
  if (topical.length + exams.length === 0) return null;

  const sbaPercent = topical.length
    ? Math.round(topical.reduce((s, r) => s + r.percentage, 0) / topical.length)
    : Math.round(exams.reduce((s, r) => s + r.percentage, 0) / exams.length);
  const summativePercent = exams.length
    ? Math.max(...exams.map((r) => r.percentage))
    : sbaPercent;

  const blendedPercent = Math.round(sbaPercent * exam.sbaWeight + summativePercent * exam.summativeWeight);

  return {
    exam,
    sbaPercent,
    summativePercent,
    blendedPercent,
    level: exam.scale === "performance-level" ? performanceLevel(blendedPercent) : undefined,
    kcse: exam.scale === "kcse" ? kcseGrade(blendedPercent) : undefined,
    attempts: topical.length + exams.length,
  };
}
