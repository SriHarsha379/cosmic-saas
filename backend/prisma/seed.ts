import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosmic.dev' },
    update: {},
    create: {
      email: 'admin@cosmic.dev',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isPro: true,
      profile: {
        create: {
          bio: 'Platform administrator',
          skills: ['management', 'operations'],
          profileCompletion: 80,
        },
      },
      wallet: { create: { balance: 1000 } },
      progress: { create: {} },
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: userPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      isPro: true,
      profile: {
        create: {
          bio: 'Full-stack developer passionate about open source',
          phone: '+1-555-0101',
          skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
          education: [{ degree: 'B.Sc Computer Science', institution: 'MIT', year: 2020 }],
          projects: [{ name: 'CosmicApp', description: 'A SaaS platform', url: 'https://github.com/alice/cosmicapp' }],
          profileCompletion: 90,
        },
      },
      wallet: { create: { balance: 250 } },
      progress: { create: { totalTests: 5, testsPassed: 4, totalScore: 420, averageScore: 84 } },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: userPassword,
      firstName: 'Bob',
      lastName: 'Smith',
      profile: {
        create: {
          bio: 'Backend engineer specializing in distributed systems',
          skills: ['Go', 'Rust', 'Kubernetes', 'gRPC'],
          education: [{ degree: 'M.Sc Software Engineering', institution: 'Stanford', year: 2021 }],
          profileCompletion: 70,
        },
      },
      wallet: { create: { balance: 50 } },
      progress: { create: { totalTests: 3, testsPassed: 2, totalScore: 240, averageScore: 80 } },
    },
  });

  console.log('✅ Users created');

  const now = new Date();
  await Promise.all([
    prisma.hackathon.upsert({
      where: { id: 'hack-001' },
      update: {},
      create: {
        id: 'hack-001',
        title: 'AI Innovation Challenge 2024',
        description: 'Build the next generation AI-powered applications',
        status: 'ACTIVE',
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        maxParticipants: 200,
        prizePool: '$50,000',
        image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
      },
    }),
    prisma.hackathon.upsert({
      where: { id: 'hack-002' },
      update: {},
      create: {
        id: 'hack-002',
        title: 'Web3 DeFi Hackathon',
        description: 'Create decentralized finance solutions on blockchain',
        status: 'ACTIVE',
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        maxParticipants: 150,
        prizePool: '$30,000',
      },
    }),
    prisma.hackathon.upsert({
      where: { id: 'hack-003' },
      update: {},
      create: {
        id: 'hack-003',
        title: 'Climate Tech Sprint',
        description: 'Technology solutions for climate change',
        status: 'UPCOMING',
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 44 * 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        prizePool: '$20,000',
      },
    }),
    prisma.hackathon.upsert({
      where: { id: 'hack-004' },
      update: {},
      create: {
        id: 'hack-004',
        title: 'Health Tech Innovation',
        description: 'Digital health solutions for tomorrow',
        status: 'UPCOMING',
        startDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 67 * 24 * 60 * 60 * 1000),
        maxParticipants: 80,
        prizePool: '$15,000',
      },
    }),
    prisma.hackathon.upsert({
      where: { id: 'hack-005' },
      update: {},
      create: {
        id: 'hack-005',
        title: 'Open Source Fest 2023',
        description: 'Contributing to the open source ecosystem',
        status: 'COMPLETED',
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 83 * 24 * 60 * 60 * 1000),
        maxParticipants: 300,
        prizePool: '$10,000',
      },
    }),
  ]);

  console.log('✅ Hackathons created');

  await prisma.team.upsert({
    where: { id: 'team-001' },
    update: {},
    create: {
      id: 'team-001',
      name: 'Neural Ninjas',
      description: 'AI/ML enthusiasts building the future',
      hackathonId: 'hack-001',
      createdBy: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'LEADER' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
    },
  });

  await prisma.team.upsert({
    where: { id: 'team-002' },
    update: {},
    create: {
      id: 'team-002',
      name: 'DeFi Dragons',
      description: 'Web3 developers conquering blockchain',
      hackathonId: 'hack-002',
      createdBy: bob.id,
      members: {
        create: [{ userId: bob.id, role: 'LEADER' }],
      },
    },
  });

  await prisma.team.upsert({
    where: { id: 'team-003' },
    update: {},
    create: {
      id: 'team-003',
      name: 'Code Crusaders',
      description: 'General purpose development team',
      createdBy: alice.id,
      members: {
        create: [{ userId: alice.id, role: 'LEADER' }],
      },
    },
  });

  console.log('✅ Teams created');

  await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Full-Stack Engineer',
        company: 'TechCorp Inc.',
        description: 'Join our team to build scalable web applications using React and Node.js.',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        location: 'San Francisco, CA',
        experienceLevel: 'Senior',
        salaryMin: 150000,
        salaryMax: 200000,
        isRemote: true,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Machine Learning Engineer',
        company: 'AI Dynamics',
        description: 'Design and implement ML pipelines for production systems.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes'],
        location: 'New York, NY',
        experienceLevel: 'Mid',
        salaryMin: 120000,
        salaryMax: 160000,
        isRemote: false,
        expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.job.create({
      data: {
        title: 'Backend Engineer - Go',
        company: 'CloudBase',
        description: 'Build high-performance microservices in Go.',
        skills: ['Go', 'gRPC', 'Kubernetes', 'AWS'],
        location: 'Remote',
        experienceLevel: 'Mid',
        salaryMin: 110000,
        salaryMax: 140000,
        isRemote: true,
      },
    }),
    prisma.job.create({
      data: {
        title: 'DevOps Engineer',
        company: 'InfraStack',
        description: 'Manage and improve our CI/CD infrastructure.',
        skills: ['Terraform', 'Ansible', 'Docker', 'Jenkins'],
        location: 'Austin, TX',
        experienceLevel: 'Senior',
        salaryMin: 130000,
        salaryMax: 170000,
        isRemote: true,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Frontend Developer',
        company: 'DesignFlow',
        description: 'Create beautiful user interfaces with React and Tailwind.',
        skills: ['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
        location: 'Seattle, WA',
        experienceLevel: 'Junior',
        salaryMin: 80000,
        salaryMax: 110000,
        isRemote: false,
      },
    }),
  ]);

  console.log('✅ Jobs created');

  const test1 = await prisma.test.create({
    data: {
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of core JavaScript concepts',
      totalScore: 50,
      duration: 30,
      difficulty: 'EASY',
      createdBy: admin.id,
      questions: {
        create: [
          { question: 'What is the output of typeof null?', type: 'MCQ', options: ['null', 'undefined', 'object', 'string'], correctAnswer: 'object', score: 10, order: 0 },
          { question: 'Which method removes the last element from an array?', type: 'MCQ', options: ['shift()', 'unshift()', 'pop()', 'push()'], correctAnswer: 'pop()', score: 10, order: 1 },
          { question: 'Is JavaScript single-threaded?', type: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 'True', score: 10, order: 2 },
          { question: 'Write a function to reverse a string.', type: 'CODING', options: [], score: 10, order: 3 },
          { question: 'What does the spread operator (...) do?', type: 'MCQ', options: ['Spreads array elements', 'Creates promises', 'Declares variables', 'Loops arrays'], correctAnswer: 'Spreads array elements', score: 10, order: 4 },
        ],
      },
    },
  });

  const test2 = await prisma.test.create({
    data: {
      title: 'Data Structures & Algorithms',
      description: 'Evaluate your DSA skills',
      totalScore: 100,
      duration: 60,
      difficulty: 'HARD',
      createdBy: admin.id,
      questions: {
        create: [
          { question: 'What is the time complexity of binary search?', type: 'MCQ', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', score: 20, order: 0 },
          { question: 'Which data structure uses LIFO principle?', type: 'MCQ', options: ['Queue', 'Stack', 'Tree', 'Graph'], correctAnswer: 'Stack', score: 20, order: 1 },
          { question: 'Implement a function to check if a binary tree is balanced.', type: 'CODING', options: [], score: 20, order: 2 },
          { question: 'A hash table lookup is O(1) on average.', type: 'TRUE_FALSE', options: ['True', 'False'], correctAnswer: 'True', score: 20, order: 3 },
          { question: 'What traversal visits root, left, right?', type: 'MCQ', options: ['Inorder', 'Postorder', 'Preorder', 'Level order'], correctAnswer: 'Preorder', score: 20, order: 4 },
        ],
      },
    },
  });

  console.log('✅ Tests created');

  await prisma.transaction.createMany({
    data: [
      { userId: alice.id, type: 'CREDIT', amount: 500, description: 'Hackathon prize: AI Innovation Challenge', balanceBefore: 0, balanceAfter: 500 },
      { userId: alice.id, type: 'DEBIT', amount: 250, description: 'Pro subscription upgrade', balanceBefore: 500, balanceAfter: 250 },
      { userId: bob.id, type: 'CREDIT', amount: 150, description: 'Test completion bonus', balanceBefore: 0, balanceAfter: 150 },
      { userId: bob.id, type: 'DEBIT', amount: 100, description: 'Course enrollment', balanceBefore: 150, balanceAfter: 50 },
    ],
  });

  console.log('✅ Transactions created');

  await prisma.certificate.createMany({
    data: [
      { userId: alice.id, title: 'JavaScript Fundamentals Certificate', issuedBy: 'Cosmic SaaS Platform', certificateUrl: '/certificates/cert-alice-js' },
      { userId: alice.id, title: 'React Development Certificate', issuedBy: 'Cosmic SaaS Platform', certificateUrl: '/certificates/cert-alice-react' },
      { userId: bob.id, title: 'Data Structures & Algorithms Certificate', issuedBy: 'Cosmic SaaS Platform', certificateUrl: '/certificates/cert-bob-dsa' },
    ],
  });

  console.log('✅ Certificates created');

  await prisma.leaderboard.createMany({
    data: [
      { userId: alice.id, hackathonId: 'hack-001', score: 950, rank: 1 },
      { userId: bob.id, hackathonId: 'hack-001', score: 820, rank: 2 },
      { userId: alice.id, hackathonId: 'hack-005', score: 780, rank: 3 },
    ],
  });

  console.log('✅ Leaderboard entries created');

  await prisma.hackathonParticipant.createMany({
    data: [
      { userId: alice.id, hackathonId: 'hack-001' },
      { userId: bob.id, hackathonId: 'hack-001' },
      { userId: alice.id, hackathonId: 'hack-005' },
      { userId: bob.id, hackathonId: 'hack-002' },
    ],
    skipDuplicates: true,
  });

  await prisma.activity.createMany({
    data: [
      { userId: alice.id, type: 'JOINED_HACKATHON', description: 'Joined hackathon: AI Innovation Challenge 2024' },
      { userId: alice.id, type: 'CREATED_TEAM', description: 'Created team: Neural Ninjas' },
      { userId: alice.id, type: 'COMPLETED_TEST', description: 'Completed test: JavaScript Fundamentals with score 50/50' },
      { userId: alice.id, type: 'EARNED_CERTIFICATE', description: 'Earned certificate for: JavaScript Fundamentals' },
      { userId: alice.id, type: 'APPLIED_JOB', description: 'Applied for: Senior Full-Stack Engineer at TechCorp Inc.' },
      { userId: bob.id, type: 'JOINED_HACKATHON', description: 'Joined hackathon: Web3 DeFi Hackathon' },
      { userId: bob.id, type: 'CREATED_TEAM', description: 'Created team: DeFi Dragons' },
      { userId: bob.id, type: 'COMPLETED_TEST', description: 'Completed test: Data Structures & Algorithms with score 80/100' },
      { userId: bob.id, type: 'EARNED_CERTIFICATE', description: 'Earned certificate for: Data Structures & Algorithms' },
    ],
  });

  console.log('✅ Activities created');

  await prisma.testResult.createMany({
    data: [
      {
        userId: alice.id,
        testId: test1.id,
        answers: [{ questionId: 'q1', answer: 'object', isCorrect: true }],
        score: 50,
        accuracy: 100,
        duration: 18,
        status: 'COMPLETED',
        attemptNumber: 1,
        completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: bob.id,
        testId: test2.id,
        answers: [{ questionId: 'q1', answer: 'O(log n)', isCorrect: true }],
        score: 80,
        accuracy: 80,
        duration: 55,
        status: 'COMPLETED',
        attemptNumber: 1,
        completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Test results created');
  console.log('\n🎉 Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@cosmic.dev / admin123');
  console.log('  Alice: alice@example.com / user123');
  console.log('  Bob:   bob@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
