import { pgTable, text, serial, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const somaMaterials = pgTable("soma_materials", {
  id: text("id").primaryKey(),
  gradeKey: text("grade_key").notNull(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  topics: text("topics").array().notNull(),
  seedIndex: integer("seed_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("soma_materials_grade_idx").on(t.gradeKey),
]);

export const somaQuestions = pgTable("soma_questions", {
  id: serial("id").primaryKey(),
  materialId: text("material_id").notNull().references(() => somaMaterials.id),
  questionText: text("question_text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  index("soma_questions_material_idx").on(t.materialId),
]);

export type SomaMaterial = typeof somaMaterials.$inferSelect;
export type SomaQuestion = typeof somaQuestions.$inferSelect;
