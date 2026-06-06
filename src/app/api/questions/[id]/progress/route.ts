import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mark a question as Attempted or Solved
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // 'Attempted' | 'Solved'

    // Get the first user (single-user app for now)
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'No user found. Run seed script first.' }, { status: 400 });
    }

    const progress = await prisma.userQuestionProgress.upsert({
      where: { userId_questionId: { userId: user.id, questionId: id } },
      create: {
        userId: user.id,
        questionId: id,
        status: status || 'Attempted',
        totalAttempts: 1,
      },
      update: {
        status: status || 'Attempted',
        totalAttempts: { increment: 1 },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Failed to update progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
