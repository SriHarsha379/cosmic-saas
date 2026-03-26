import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.user.deleteMany();

  // Create users
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const hashedUserPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cosmic.dev',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      wallet: {
        create: { balance: 5000 },
      },
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedUserPassword,
      firstName: 'John',
      lastName: 'Doe',
      skills: 'React, Node.js, TypeScript',
      wallet: {
        create: { balance: 1000 },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedUserPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      skills: 'Python, Django, PostgreSQL',
      wallet: {
        create: { balance: 1500 },
      },
    },
  });

  console.log('✅ Users created');

  // Create hackathons
  const hackathon1 = await prisma.hackathon.create({
    data: {
      title: 'Web Dev Marathon 2026',
      description: 'Build amazing web applications in 48 hours',
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-04-17'),
      prizePool: '$10,000',
      status: 'UPCOMING',
      createdBy: admin.id,
    },
  });

  const hackathon2 = await prisma.hackathon.create({
    data: {
      title: 'AI & ML Challenge',
      description: 'Create innovative AI solutions',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-03'),
      prizePool: '$15,000',
      status: 'UPCOMING',
      createdBy: admin.id,
    },
  });

  console.log('✅ Hackathons created');

  // Add participants to hackathons
  await prisma.hackathonParticipant.create({
    data: {
      hackathonId: hackathon1.id,
      userId: user1.id,
    },
  });

  await prisma.hackathonParticipant.create({
    data: {
      hackathonId: hackathon2.id,
      userId: user2.id,
    },
  });

  console.log('✅ Hackathon participants added');

  // Create tests
  const test1 = await prisma.test.create({
    data: {
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics',
      difficulty: 'EASY',
      duration: 30,
      totalQuestions: 20,
    },
  });

  const test2 = await prisma.test.create({
    data: {
      title: 'Advanced TypeScript',
      description: 'Master TypeScript advanced concepts',
      difficulty: 'HARD',
      duration: 60,
      totalQuestions: 30,
    },
  });

  const test3 = await prisma.test.create({
    data: {
      title: 'React Patterns',
      description: 'Learn React design patterns and best practices',
      difficulty: 'MEDIUM',
      duration: 45,
      totalQuestions: 25,
    },
  });

  console.log('✅ Tests created');

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior React Developer',
      company: 'Tech Startup Inc',
      description: 'We are looking for an experienced React developer to join our team',
      location: 'San Francisco, CA',
      salary: '$120,000 - $160,000',
      postedBy: admin.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Full Stack Engineer',
      company: 'Innovation Labs',
      description: 'Build scalable web applications with Node.js and React',
      location: 'Remote',
      salary: '$100,000 - $140,000',
      postedBy: admin.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Python Backend Developer',
      company: 'Data Systems Corp',
      description: 'Develop robust backend systems using Python and Django',
      location: 'New York, NY',
      salary: '$110,000 - $150,000',
      postedBy: admin.id,
    },
  });

  console.log('✅ Jobs created');

  // Create test attempts and results
  const testAttempt1 = await prisma.testAttempt.create({
    data: {
      testId: test1.id,
      userId: user1.id,
      status: 'COMPLETED',
      endedAt: new Date(),
    },
  });

  const result1 = await prisma.result.create({
    data: {
      testId: test1.id,
      userId: user1.id,
      score: 85,
      totalScore: 100,
      accuracy: 85.5,
      duration: 28,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  const result2 = await prisma.result.create({
    data: {
      testId: test2.id,
      userId: user2.id,
      score: 72,
      totalScore: 100,
      accuracy: 72.0,
      duration: 55,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  console.log('✅ Test results created');

  // Create certificates
  const cert1 = await prisma.certificate.create({
    data: {
      userId: user1.id,
      title: 'JavaScript Fundamentals Certificate',
      issuedBy: 'Cosmic SaaS Platform',
      certificateUrl: `/certificates/${result1.id}`,
    },
  });

  console.log('✅ Certificates created');

  // Create activities
  await prisma.activity.create({
    data: {
      userId: user1.id,
      type: 'TEST_COMPLETED',
      description: 'Completed JavaScript Fundamentals test with score 85/100',
    },
  });

  await prisma.activity.create({
    data: {
      userId: user1.id,
      type: 'JOINED_HACKATHON',
      description: 'Joined Web Dev Marathon 2026',
    },
  });

  await prisma.activity.create({
    data: {
      userId: user2.id,
      type: 'TEST_COMPLETED',
      description: 'Completed Advanced TypeScript test with score 72/100',
    },
  });

  console.log('✅ Activities created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@cosmic.dev / admin123');
  console.log('User 1: john@example.com / user123');
  console.log('User 2: jane@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
