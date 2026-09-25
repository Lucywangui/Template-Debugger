import type { QuizResult } from "./storage";

// ── Levels ──────────────────────────────────────────────────────────────────
// Level n starts at 25·(n-1)² XP, so each level costs a bit more than the last.
export interface LevelInfo {
  level: number;
  xp: number;
  into: number;   // XP earned into the current level
  span: number;   // XP needed to clear the current level
  toNext: number; // XP remaining to the next level
}

export function levelForXp(xp: number): LevelInfo {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 25)) + 1;
  const base = 25 * (level - 1) ** 2;
  const next = 25 * level ** 2;
  return { level, xp, into: xp - base, span: next - base, toNext: next - xp };
}

// ── Per-topic mastery ───────────────────────────────────────────────────────
export interface TopicMastery {
  key: string;      // "Subject :: Topic"
  subject: string;
  topic: string;
  attempts: number;
  avgPercent: number;
  bestPercent: number;
  lastPracticed: string;
  /** 0–100. Blends average score with a confidence factor from attempts. */
  mastery: number;
}

export function getTopicMastery(results: QuizResult[]): TopicMastery[] {
  const map = new Map<string, { subject: string; topic: string; attempts: number; sum: number; best: number; last: string }>();
  for (const r of results) {
    for (const topic of r.topics ?? []) {
      const key = `${r.subject} :: ${topic}`;
      const m = map.get(key) ?? { subject: r.subject, topic, attempts: 0, sum: 0, best: 0, last: r.date };
      m.attempts += 1;
      m.sum += r.percentage;
      m.best = Math.max(m.best, r.percentage);
      if (r.date > m.last) m.last = r.date;
      map.set(key, m);
    }
  }
  return [...map.entries()].map(([key, m]) => {
    const avg = m.sum / m.attempts;
    const confidence = Math.min(1, m.attempts / 3);
    return {
      key,
      subject: m.subject,
      topic: m.topic,
      attempts: m.attempts,
      avgPercent: Math.round(avg),
      bestPercent: Math.round(m.best),
      lastPracticed: m.last,
      mastery: Math.round(avg * (0.55 + 0.45 * confidence)),
    };
  });
}

export function masteryBand(m: number): { label: string; color: string } {
  if (m >= 85) return { label: "Mastered", color: "#27ae60" };
  if (m >= 65) return { label: "Strong", color: "#2980b9" };
  if (m >= 40) return { label: "Getting there", color: "#e67e22" };
  return { label: "Needs work", color: "#e74c3c" };
}

// ── Daily activity ──────────────────────────────────────────────────────────
export function localDay(iso: string): string {
  return iso.slice(0, 10);
}

export function quizzesOn(results: QuizResult[], day: string): number {
  return results.filter((r) => localDay(r.date) === day).length;
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Minutes-ish of study estimate — used for a soft "time today" figure. */
export function activityStreakDays(results: QuizResult[]): number {
  const days = new Set(results.map((r) => localDay(r.date)));
  let streak = 0;
  const d = new Date();
  // count back from today while each day has activity
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else if (streak === 0 && key === todayString()) {
      // today not done yet — keep checking from yesterday
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
