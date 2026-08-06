import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { somaMaterials, somaQuestions } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// ─── Pollinations AI question generator ───────────────────────────────────────

interface GenQuestion {
  text: string;
  options: string[];
  correct: number;
}

async function generateViaAI(
  subject: string,
  gradeKey: string,
  topics: string[],
  seed: number
): Promise<GenQuestion[]> {
  const gradeName = gradeKey
    .replace("cbc-", "CBC Grade ")
    .replace("senior-", "Senior Grade ")
    .replace("844-form", "Form ");

  const topicStr = topics.join(" and ");

  const prompt = [
    `You are an expert Kenyan curriculum teacher. Generate exactly 15 unique multiple-choice questions.`,
    `Subject: ${subject}`,
    `Grade/Level: ${gradeName}`,
    `Topics to cover: ${topicStr}`,
    ``,
    `Rules:`,
    `- Each question must test a DIFFERENT concept within the topics.`,
    `- All questions must be directly relevant to the Kenyan CBC or 8-4-4 curriculum.`,
    `- Each question has exactly 4 options (labelled A-D).`,
    `- Only ONE option is correct per question.`,
    `- Language should be appropriate for the grade level.`,
    `- Do NOT repeat questions from other materials.`,
    ``,
    `Return ONLY valid JSON, no markdown, no explanation:`,
    `{"questions":[{"text":"...","options":["A option","B option","C option","D option"],"correct":0}]}`,
    `"correct" is the 0-based index of the correct answer.`,
  ].join("\n");

  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "openai",
      seed,
      jsonMode: true,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  const text = await res.text();

  // Strip markdown fences if present
  const clean = text.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
  const parsed = JSON.parse(clean) as { questions: GenQuestion[] };
  return (parsed.questions ?? []).slice(0, 15);
}

// ─── Algorithmic fallback (deterministic, no AI needed) ───────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function makeMathQ(rand: () => number): GenQuestion {
  const ops = ["+", "-", "×", "÷"] as const;
  const op = ops[Math.floor(rand() * 4)];
  let a = Math.floor(rand() * 50) + 2;
  let b = Math.floor(rand() * 20) + 2;
  let answer: number;
  let text: string;
  if (op === "+") { answer = a + b; text = `What is ${a} + ${b}?`; }
  else if (op === "-") { if (b > a) [a, b] = [b, a]; answer = a - b; text = `What is ${a} − ${b}?`; }
  else if (op === "×") { b = Math.floor(rand() * 12) + 1; answer = a * b; text = `What is ${a} × ${b}?`; }
  else { b = Math.floor(rand() * 10) + 1; answer = a * b; const q = a * b; a = q; text = `What is ${a} ÷ ${b}?`; answer = b; /* fix */ answer = a / b; }

  const opts = [answer, answer + 1, answer - 1, answer + 2].map(Math.abs).map(String);
  return { text, options: opts as unknown as string[], correct: 0 };
}

type TemplateQ = { text: string; opts: string[]; correct: number };

const SCIENCE_BANK: TemplateQ[] = [
  { text: "Which planet is closest to the Sun?", opts: ["Earth", "Mercury", "Venus", "Mars"], correct: 1 },
  { text: "What gas do plants absorb during photosynthesis?", opts: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
  { text: "What is the boiling point of water?", opts: ["90°C", "80°C", "100°C", "110°C"], correct: 2 },
  { text: "Which organ pumps blood around the body?", opts: ["Lungs", "Kidney", "Liver", "Heart"], correct: 3 },
  { text: "What is the chemical symbol for water?", opts: ["WA", "HO", "H2O", "H2"], correct: 2 },
  { text: "Which of these is a mammal?", opts: ["Crocodile", "Eagle", "Whale", "Salmon"], correct: 2 },
  { text: "What force pulls objects toward Earth?", opts: ["Friction", "Gravity", "Magnetism", "Tension"], correct: 1 },
  { text: "How many bones are in the adult human body?", opts: ["200", "206", "210", "196"], correct: 1 },
];

const ENGLISH_BANK: TemplateQ[] = [
  { text: "Which sentence is grammatically correct?", opts: ["She go to school", "She goes to school", "She going school", "She goed to school"], correct: 1 },
  { text: "The opposite of 'ancient' is:", opts: ["Old", "Modern", "Historical", "Classic"], correct: 1 },
  { text: "Which word is a noun?", opts: ["Run", "Beautiful", "Happiness", "Quickly"], correct: 2 },
  { text: "'The cat sat on the mat.' — 'sat' is a:", opts: ["Noun", "Adjective", "Verb", "Adverb"], correct: 2 },
  { text: "Choose the correct plural of 'child':", opts: ["Childs", "Childes", "Children", "Childrens"], correct: 2 },
  { text: "Which punctuation ends a question?", opts: [".", "!", "?", ","], correct: 2 },
];

function algorithmicFallback(subject: string, seed: number, count: number): GenQuestion[] {
  const rand = seededRand(seed);
  const s = subject.toLowerCase();
  if (s.includes("math")) {
    return Array.from({ length: count }, () => makeMathQ(rand));
  }
  const bank = s.includes("science") || s.includes("biology") || s.includes("physics") || s.includes("chemistry")
    ? SCIENCE_BANK : ENGLISH_BANK;
  const pool = [...bank, ...bank]; // repeat to fill
  return pool.slice(0, count).map(q => ({ text: q.text, options: q.opts, correct: q.correct }));
}

// ─── GET /api/questions/generate?materialId=...&subject=...&gradeKey=...&topics=...&seed=... ─

router.get("/generate", async (req, res) => {
  const materialId = String(req.query["materialId"] ?? "").trim();
  if (!materialId) {
    res.status(400).json({ error: "materialId is required" });
    return;
  }

  try {
    // 1. Check DB cache first
    const existing = await db
      .select()
      .from(somaQuestions)
      .where(eq(somaQuestions.materialId, materialId))
      .limit(15);

    if (existing.length >= 15) {
      res.json({
        questions: existing.map((q) => ({
          text: q.questionText,
          options: q.options,
          correct: q.correctIndex,
        })),
        source: "cache",
      });
      return;
    }

    // 2. Look up or auto-create material record
    let [material] = await db
      .select()
      .from(somaMaterials)
      .where(eq(somaMaterials.id, materialId))
      .limit(1);

    if (!material) {
      // Accept inline material details from query params
      const subject = String(req.query["subject"] ?? "").trim();
      const gradeKey = String(req.query["gradeKey"] ?? "").trim();
      const topicsRaw = String(req.query["topics"] ?? "").trim();
      const seedIndex = parseInt(String(req.query["seed"] ?? "1"), 10) || 1;
      const title = String(req.query["title"] ?? subject).trim();
      const type = String(req.query["type"] ?? "topical").trim();

      if (!subject || !gradeKey) {
        res.status(404).json({ error: "Material not found and subject/gradeKey not provided." });
        return;
      }

      const topics = topicsRaw ? topicsRaw.split("|") : [subject];
      await db.insert(somaMaterials).values({ id: materialId, gradeKey, subject, title, type, topics, seedIndex });
      const rows = await db.select().from(somaMaterials).where(eq(somaMaterials.id, materialId)).limit(1);
      material = rows[0];
    }

    // 3. Generate via Pollinations AI
    let questions: GenQuestion[];
    try {
      questions = await generateViaAI(
        material.subject,
        material.gradeKey,
        material.topics,
        material.seedIndex
      );
      if (questions.length < 15) throw new Error("Too few questions from AI");
    } catch (aiErr) {
      // Fallback to algorithmic generator
      questions = algorithmicFallback(material.subject, material.seedIndex, 15);
    }

    // Ensure exactly 15
    questions = questions.slice(0, 15);

    // 4. Delete any partial cache
    if (existing.length > 0) {
      await db.delete(somaQuestions).where(eq(somaQuestions.materialId, materialId));
    }

    // 5. Persist to DB (prevents regeneration and guarantees no duplicates)
    await db.insert(somaQuestions).values(
      questions.map((q) => ({
        materialId,
        questionText: q.text,
        options: q.options,
        correctIndex: q.correct,
      }))
    );

    res.json({ questions, source: "generated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Question generation failed", detail: msg });
  }
});

// ─── POST /api/materials/seed  (bulk-insert materials if not exist) ────────────
// Called by frontend on first load per grade so materialIds are in DB

router.post("/seed", async (req, res) => {
  const body = req.body as {
    materials: Array<{
      id: string;
      gradeKey: string;
      subject: string;
      title: string;
      type: string;
      topics: string[];
      seedIndex: number;
    }>;
  };

  if (!Array.isArray(body?.materials)) {
    res.status(400).json({ error: "materials array required" });
    return;
  }

  try {
    // Only insert materials that don't already exist
    const existingIds = new Set(
      (await db.select({ id: somaMaterials.id }).from(somaMaterials)).map((r) => r.id)
    );

    const toInsert = body.materials.filter((m) => !existingIds.has(m.id));

    if (toInsert.length > 0) {
      await db.insert(somaMaterials).values(toInsert);
    }

    res.json({ inserted: toInsert.length, skipped: body.materials.length - toInsert.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Seed failed", detail: msg });
  }
});

export default router;
