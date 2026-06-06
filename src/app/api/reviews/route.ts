import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Post a review outcome and calculate spaced repetition
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, questionId, difficulty } = body; // difficulty: 'Easy', 'Medium', 'Hard'
    
    // Basic SRS Logic
    let confidenceScore = 3;
    let nextReviewDays = 1;
    
    if (difficulty === 'Easy') {
      confidenceScore = 5;
      nextReviewDays = 14;
    } else if (difficulty === 'Medium') {
      confidenceScore = 3;
      nextReviewDays = 3;
    } else {
      confidenceScore = 1;
      nextReviewDays = 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextReviewDays);

    // Record the log
    const log = await prisma.reviewLog.create({
      data: {
        userId,
        questionId,
        confidenceScore,
        reviewDate: new Date()
      }
    });

    // Upsert the schedule
    await prisma.reviewSchedule.create({
      data: {
        userId,
        questionId,
        nextReviewDate: nextDate,
        interval: nextReviewDays,
        easeFactor: 2.5,
        consecutiveCorrect: difficulty === 'Easy' ? 1 : 0
      }
    });
    
    // Update progress
    await prisma.userQuestionProgress.update({
      where: { userId_questionId: { userId, questionId } },
      data: { status: 'Solved' }
    });

    return NextResponse.json({ success: true, nextReviewDate: nextDate });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: {
        progress: {
          some: {
            status: { in: ['Attempted', 'Solved'] }
          }
        }
      },
      include: {
        progress: true,
      },
      take: 10
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews queue' }, { status: 500 });
  }
}
