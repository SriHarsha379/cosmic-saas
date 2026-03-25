export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'recruiter';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  _id: string;
  user: string | User;
  bio?: string;
  skills: string[];
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  totalScore: number;
  rank?: number;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  from: string;
  to?: string;
  current: boolean;
  description?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  from: string;
  to?: string;
  current: boolean;
}

export interface Hackathon {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeamSize: number;
  minTeamSize: number;
  prizePool: number;
  tags: string[];
  status: 'upcoming' | 'active' | 'completed';
  participants: string[];
  createdBy: string | User;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  hackathon: string | Hackathon;
  leader: string | User;
  members: TeamMember[];
  maxSize: number;
  isOpen: boolean;
  inviteCode?: string;
  createdAt: string;
}

export interface TeamMember {
  user: string | User;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface Interview {
  _id: string;
  user: string | User;
  type: 'technical' | 'hr' | 'behavioral';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledAt: string;
  duration: number;
  feedback?: string;
  score?: number;
  recordingUrl?: string;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  isActive: boolean;
  postedBy: string | User;
  applicants: string[];
  createdAt: string;
}

export interface Application {
  _id: string;
  job: string | Job;
  applicant: string | User;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: TestQuestion[];
  isActive: boolean;
  createdBy: string | User;
  createdAt: string;
}

export interface TestQuestion {
  _id: string;
  type: 'mcq' | 'coding' | 'essay' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  marks: number;
  explanation?: string;
}

export interface TestResult {
  _id: string;
  test: string | Test;
  user: string | User;
  answers: AnswerEntry[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  submittedAt: string;
}

export interface AnswerEntry {
  question: string;
  answer: string;
  isCorrect?: boolean;
  marksAwarded: number;
}

export interface Wallet {
  _id: string;
  user: string | User;
  balance: number;
  currency: string;
  transactions: Transaction[];
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Certificate {
  _id: string;
  user: string | User;
  title: string;
  type: 'test' | 'hackathon' | 'course';
  issueDate: string;
  expiryDate?: string;
  score?: number;
  verificationCode: string;
  pdfUrl?: string;
  issuedFor: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  user: string | User;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: string | User;
  receiver?: string | User;
  room?: string;
  content: string;
  type: 'text' | 'file' | 'image';
  readBy: string[];
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  totalScore: number;
  testsCompleted: number;
  hackathonsWon: number;
  badges: string[];
}

export interface Progress {
  testsCompleted: number;
  hackathonsJoined: number;
  interviewsCompleted: number;
  jobsApplied: number;
  totalScore: number;
  certificatesEarned: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}
