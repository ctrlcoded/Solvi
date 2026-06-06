import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    // Delete all progress for this user
    await prisma.userQuestionProgress.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ success: true, message: 'Progress reset successfully' });
  } catch (error: any) {
    console.error('Reset progress error:', error);
    return NextResponse.json({ error: 'Failed to reset progress', details: error?.message || String(error) }, { status: 500 });
  }
}
