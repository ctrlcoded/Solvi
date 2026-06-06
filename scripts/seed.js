const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'neetcode150.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const topicsData = JSON.parse(rawData);

const neetcodeQuestions = [];
for (const [topic, questionsMap] of Object.entries(topicsData)) {
  for (const [title, meta] of Object.entries(questionsMap)) {
    neetcodeQuestions.push({
      title,
      topic,
      difficulty: meta.difficulty,
      url: meta.url,
    });
  }
}

async function main() {
  console.log('Clearing database...');
  await prisma.reviewLog.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.userQuestionProgress.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding User...');
  const user = await prisma.user.create({
    data: {
      email: 'alex.chen@example.com',
      name: 'Alex Chen',
    },
  });

  console.log('Seeding Questions...');
  const questionRecords = [];
  for (const q of neetcodeQuestions) {
    const record = await prisma.question.create({ data: q });
    questionRecords.push(record);
  }

  console.log('Seeding Progress and Logs...');
  // Find "Trapping Rain Water"
  const trapping = questionRecords.find((q) => q.title === 'Trapping Rain Water');
  if (trapping) {
    await prisma.userQuestionProgress.create({
      data: {
        userId: user.id,
        questionId: trapping.id,
        status: 'Solved',
        totalAttempts: 14,
        bestSolveTimeMs: 8 * 60 * 1000 + 42 * 1000, // 08:42
      },
    });

    const now = new Date();
    await prisma.reviewLog.create({
      data: {
        userId: user.id,
        questionId: trapping.id,
        confidenceScore: 5,
        reviewDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    });
  }

  // Find "Longest Palindromic Substring"
  const lps = questionRecords.find((q) => q.title === 'Longest Palindromic Substring');
  if (lps) {
    await prisma.userQuestionProgress.create({
      data: {
        userId: user.id,
        questionId: lps.id,
        status: 'Attempted',
        totalAttempts: 8,
      },
    });
  }

  // Find "Valid Anagram"
  const validAnagram = questionRecords.find((q) => q.title === 'Valid Anagram');
  if (validAnagram) {
    await prisma.userQuestionProgress.create({
      data: {
        userId: user.id,
        questionId: validAnagram.id,
        status: 'Solved',
        totalAttempts: 1,
      },
    });
  }

  console.log('Seeding Journal...');
  await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content: 'Noticed I constantly struggle with bottom-up DP state transitions. Need to practice grid-based pathfinding.\n\n## Key Insights from today\n1. Always establish the base cases first (usually index 0 or row/col 0).\n2. The state transition formula needs to be derived by looking at the immediate previous sub-problems.\n3. Don\'t rush to optimize space to O(1) immediately. Get the O(N^2) 2D array working first to ensure the mental model is correct.\n\nI\'ll revisit "Unique Paths II" tomorrow.',
    },
  });

  console.log('Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
