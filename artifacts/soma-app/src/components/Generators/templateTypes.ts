export interface GeneratedTemplateQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface TemplateRule {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  subtopic: string;
  maxUses: number;
  usageCount: number;
  minWords: number;
  generate: () => GeneratedTemplateQuestion;
}