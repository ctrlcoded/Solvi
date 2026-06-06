import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalDays, ratings, apiKey } = body;
    // ratings: { [topic: string]: 'Strong' | 'Average' | 'Weak' }

    if (!apiKey) {
      return NextResponse.json({ error: 'Please provide your Gemini API key to generate a plan' }, { status: 400 });
    }

    // Get all questions from DB
    const questions = await prisma.question.findMany({
      orderBy: { topic: 'asc' },
    });

    // Build question list organized by topic
    const topicMap: Record<string, { title: string; difficulty: string; id: string }[]> = {};
    for (const q of questions) {
      if (!topicMap[q.topic]) topicMap[q.topic] = [];
      topicMap[q.topic].push({ title: q.title, difficulty: q.difficulty, id: q.id });
    }

    // Build the prompt
    const prompt = `You are an expert DSA interview coach. A student wants to complete the NeetCode 150 sheet in ${totalDays} days.

Here are the student's self-assessed skill levels for each topic:
${Object.entries(ratings as Record<string, string>).map(([topic, level]) => `- ${topic}: ${level}`).join('\n')}

Here are all the questions organized by topic:
${Object.entries(topicMap).map(([topic, qs]) => {
  return `## ${topic}\n${qs.map(q => `- ${q.title} (${q.difficulty}) [id:${q.id}]`).join('\n')}`;
}).join('\n\n')}

Generate a day-by-day study plan. Rules:
1. Spread questions across ${totalDays} days evenly (roughly ${Math.ceil(150 / totalDays)} questions per day)
2. Topics the student is "Weak" in should appear EARLIER in the plan and have more time allocated (fewer questions per day for those topics)
3. Topics the student is "Strong" in should appear LATER and can be grouped more densely
4. Topics the student is "Average" in go in the middle
5. Within each topic, order: Easy → Medium → Hard
6. Each day should have a focus topic if possible
7. Keep it realistic — no more than 8 questions per day

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{
  "days": [
    {
      "day": 1,
      "focus": "Topic Name",
      "questions": [
        { "id": "question-uuid", "title": "Question Title", "difficulty": "Easy", "topic": "Topic" }
      ]
    }
  ]
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON response (strip any accidental markdown)
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let plan;
    try {
      plan = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: cleanJson }, { status: 500 });
    }

    // Get user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'No user found. Run seed script.' }, { status: 400 });
    }

    // Save plan to DB
    const savedPlan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        totalDays,
        ratings: JSON.stringify(ratings),
        plan: JSON.stringify(plan),
      },
    });

    return NextResponse.json({ id: savedPlan.id, plan });
  } catch (error: unknown) {
    console.error('Plan generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate plan', details: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(null);
    }

    const latestPlan = await prisma.studyPlan.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestPlan) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: latestPlan.id,
      totalDays: latestPlan.totalDays,
      ratings: JSON.parse(latestPlan.ratings),
      plan: JSON.parse(latestPlan.plan),
      createdAt: latestPlan.createdAt,
    });
  } catch (error: any) {
    console.error('Fetch plan error:', error);
    return NextResponse.json({ error: 'Failed to fetch plan', details: error?.message || String(error) }, { status: 500 });
  }
}
