import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        progress: true,
        reviewLogs: {
          orderBy: { reviewDate: 'desc' },
          take: 5
        }
      }
    });
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch question detail' }, { status: 500 });
  }
}
