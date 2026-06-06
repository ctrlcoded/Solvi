import { z } from 'zod';

// Zod Schemas
export const UserProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  questionId: z.string(),
  status: z.string(),
  totalAttempts: z.number(),
  bestSolveTimeMs: z.number().nullable(),
});

export const ReviewLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  questionId: z.string(),
  confidenceScore: z.number(),
  reviewDate: z.string().transform(str => new Date(str)),
});

export const QuestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  difficulty: z.string(),
  url: z.string(),
  progress: z.array(UserProgressSchema).optional(),
  reviewLogs: z.array(ReviewLogSchema).optional(),
});

export const JournalEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.string().transform(str => new Date(str)),
  updatedAt: z.string().transform(str => new Date(str)),
});

// Types exported from Zod
export type Question = z.infer<typeof QuestionSchema>;
export type ReviewLog = z.infer<typeof ReviewLogSchema>;
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;

export type StudyPlanDay = {
  day: number;
  focus: string;
  questions: { id: string; title: string; difficulty: string; topic: string }[];
};

export type StudyPlanResponse = {
  id: string;
  totalDays: number;
  ratings: Record<string, string>;
  plan: { days: StudyPlanDay[] };
  createdAt: string;
} | null;

const API_BASE = '/api';

// API Fetchers
export async function getQuestions(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  const data = await res.json();
  return z.array(QuestionSchema).parse(data);
}

export async function getQuestion(id: string): Promise<Question> {
  const res = await fetch(`${API_BASE}/questions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch question detail');
  const data = await res.json();
  return QuestionSchema.parse(data);
}

export async function getTodayReviews(): Promise<Question[]> {
  const res = await fetch(`${API_BASE}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch today reviews');
  const data = await res.json();
  return z.array(QuestionSchema).parse(data);
}

export async function submitReview(payload: { userId: string; questionId: string; difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return await res.json();
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const res = await fetch(`${API_BASE}/journal`);
  if (!res.ok) throw new Error('Failed to fetch journal entries');
  const data = await res.json();
  return z.array(JournalEntrySchema).parse(data);
}

export async function saveJournalEntry(payload: { userId: string; content: string }): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/journal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save journal entry');
  const data = await res.json();
  return JournalEntrySchema.parse(data);
}

// Study Plan
export async function generateStudyPlan(payload: { totalDays: number; ratings: Record<string, string>; apiKey: string }): Promise<{ id: string; plan: { days: StudyPlanDay[] } }> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.details ? `${err.error}: ${err.details}` : err.error || 'Failed to generate plan');
  }
  return await res.json();
}

export async function getStudyPlan(): Promise<StudyPlanResponse> {
  const res = await fetch(`${API_BASE}/plan`);
  if (!res.ok) throw new Error('Failed to fetch study plan');
  return await res.json();
}
