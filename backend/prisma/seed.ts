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
      role: 'ADMIN',
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

  // Create questions for tests
  const jsQuestions = [
    {
      question: 'What is the output of `typeof null` in JavaScript?',
      type: 'MCQ',
      options: ['null', 'undefined', 'object', 'string'],
      correctAnswer: 'object',
      marks: 1,
      explanation: '`typeof null` returns "object" — a well-known quirk of JavaScript.',
      order: 0,
    },
    {
      question: 'Which keyword declares a block-scoped variable in JavaScript?',
      type: 'MCQ',
      options: ['var', 'let', 'function', 'const'],
      correctAnswer: 'let',
      marks: 1,
      explanation: '`let` and `const` are block-scoped; `var` is function-scoped.',
      order: 1,
    },
    {
      question: 'JavaScript is a dynamically typed language.',
      type: 'TRUE_FALSE',
      correctAnswer: 'true',
      marks: 1,
      explanation: 'JavaScript determines types at runtime, making it dynamically typed.',
      order: 2,
    },
    {
      question: 'What does the `===` operator check?',
      type: 'MCQ',
      options: ['Value only', 'Type only', 'Value and type', 'Reference equality'],
      correctAnswer: 'Value and type',
      marks: 1,
      explanation: '`===` is the strict equality operator — it checks both value and type.',
      order: 3,
    },
    {
      question: 'Write a JavaScript function that returns the sum of two numbers.',
      type: 'CODING',
      marks: 5,
      explanation: 'Expected: function sum(a, b) { return a + b; }',
      order: 4,
    },
  ];

  await prisma.question.createMany({
    data: jsQuestions.map((q) => ({ testId: test1.id, ...q, options: q.options ?? undefined })),
  });

  const tsQuestions = [
    {
      question: 'What is a TypeScript interface?',
      type: 'MCQ',
      options: ['A runtime type check', 'A compile-time structural contract', 'A JavaScript class', 'A function type'],
      correctAnswer: 'A compile-time structural contract',
      marks: 2,
      explanation: 'Interfaces define the shape of an object at compile time only.',
      order: 0,
    },
    {
      question: 'TypeScript code is executed directly by the browser without any compilation.',
      type: 'TRUE_FALSE',
      correctAnswer: 'false',
      marks: 1,
      explanation: 'TypeScript must be compiled (transpiled) to JavaScript before running in the browser.',
      order: 1,
    },
    {
      question: 'Which TypeScript utility type makes all properties optional?',
      type: 'MCQ',
      options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Pick<T, K>'],
      correctAnswer: 'Partial<T>',
      marks: 2,
      explanation: '`Partial<T>` constructs a type with all properties of T set to optional.',
      order: 2,
    },
    {
      question: 'What keyword is used to declare a generic type parameter in TypeScript?',
      type: 'MCQ',
      options: ['<T>', 'generic', 'type', 'extends'],
      correctAnswer: '<T>',
      marks: 2,
      explanation: 'Generic type parameters are declared with angle brackets, e.g., function identity<T>(arg: T): T.',
      order: 3,
    },
    {
      question: 'Write a TypeScript generic function that returns the first element of an array.',
      type: 'CODING',
      marks: 5,
      explanation: 'Expected: function first<T>(arr: T[]): T | undefined { return arr[0]; }',
      order: 4,
    },
  ];

  await prisma.question.createMany({
    data: tsQuestions.map((q) => ({ testId: test2.id, ...q, options: q.options ?? undefined })),
  });

  const reactQuestions = [
    {
      question: 'Which hook is used to manage local state in a React functional component?',
      type: 'MCQ',
      options: ['useEffect', 'useContext', 'useState', 'useReducer'],
      correctAnswer: 'useState',
      marks: 1,
      explanation: '`useState` returns a state variable and a setter function.',
      order: 0,
    },
    {
      question: 'React components must always return a single root element.',
      type: 'TRUE_FALSE',
      correctAnswer: 'true',
      marks: 1,
      explanation: 'A React component must return a single root element (or a Fragment).',
      order: 1,
    },
    {
      question: 'What does the `key` prop help React with in lists?',
      type: 'MCQ',
      options: ['Styling list items', 'Uniquely identifying elements for efficient re-rendering', 'Sorting the list', 'Filtering items'],
      correctAnswer: 'Uniquely identifying elements for efficient re-rendering',
      marks: 2,
      explanation: 'The `key` prop helps React identify which items have changed, been added, or removed.',
      order: 2,
    },
    {
      question: 'Which React hook runs a side effect after every render by default?',
      type: 'MCQ',
      options: ['useState', 'useMemo', 'useCallback', 'useEffect'],
      correctAnswer: 'useEffect',
      marks: 2,
      explanation: '`useEffect` with no dependency array runs after every render.',
      order: 3,
    },
    {
      question: 'Explain the difference between controlled and uncontrolled components in React.',
      type: 'ESSAY',
      marks: 5,
      explanation: 'Controlled: form data is handled by React state. Uncontrolled: form data is handled by the DOM.',
      order: 4,
    },
  ];

  await prisma.question.createMany({
    data: reactQuestions.map((q) => ({ testId: test3.id, ...q, options: q.options ?? undefined })),
  });

  console.log('✅ Questions created');
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
