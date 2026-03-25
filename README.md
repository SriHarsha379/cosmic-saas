# 🚀 Cosmic SaaS Platform

A production-ready, full-stack SaaS platform inspired by Eval8.ai — featuring Hackathon management, AI-powered interview system, Test & Assessment platform (Test Galaxy), Wallet system, and Gamified Learning.

## ✨ Features

- 🔐 **JWT Authentication** — Signup/Login with role-based access (USER/ADMIN/COMPANY)
- 🏆 **Hackathons** — Browse, join, and manage hackathons with team support
- 👥 **Team Management** — Create teams, send/accept join requests
- 🎤 **Interviews** — Schedule, join, and track AI-proctored interviews
- 💼 **Job Listings** — Browse and apply to jobs with advanced filters
- 📝 **Test Galaxy** — Take dynamic tests (MCQ, coding, essay) with real-time scoring
- 📊 **Performance Reports** — Charts and analytics with Recharts
- 💰 **Wallet System** — Add/deduct funds with full transaction history (race-condition safe)
- 🏅 **Certificates** — Earned on test completion (≥70% score)
- 🥇 **Leaderboard** — Dynamic rankings per hackathon or challenge
- 💬 **AI Chat** — Coding assistant & aptitude mentor with history

## 🧱 Tech Stack

### Backend
- Node.js + Express.js (TypeScript)
- Prisma ORM + PostgreSQL
- JWT Authentication
- Zod validation
- Bcrypt password hashing

### Frontend
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS (dark glassmorphism theme)
- TanStack Query (React Query) for server state
- Zustand for client state
- Sonner for toast notifications
- Recharts for analytics
- Lucide React icons

## 🗂️ Project Structure

```
cosmic-saas/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Server entry
│   │   ├── app.ts            # Express app
│   │   ├── middleware/       # Auth + error handlers
│   │   ├── routes/           # 15 API route modules
│   │   └── controllers/      # Business logic
│   ├── prisma/
│   │   ├── schema.prisma     # 20+ DB models
│   │   └── seed.ts           # Sample data
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages (13 modules)
│   │   ├── components/       # Reusable UI components
│   │   ├── store/            # Zustand stores
│   │   ├── lib/              # API client, React Query config
│   │   ├── services/         # API service functions
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/SriHarsha379/cosmic-saas.git
cd cosmic-saas

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Set Up Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cosmic_saas"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Set Up Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### 4. Start Development Servers

**Backend** (runs on http://localhost:5000):
```bash
cd backend && npm run dev
```

**Frontend** (runs on http://localhost:3000):
```bash
cd frontend && npm run dev
```

Open http://localhost:3000 to see the platform.

### 🐳 Docker (Optional)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 5000
- Frontend on port 3000

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cosmic.com | Admin@123 |
| User 1 | alice@cosmic.com | User@123 |
| User 2 | bob@cosmic.com | User@123 |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/hackathons | List all hackathons |
| POST | /api/hackathons/:id/join | Join a hackathon |
| GET | /api/teams | List teams |
| POST | /api/teams | Create team |
| GET | /api/interviews | List interviews |
| GET | /api/jobs | List jobs with filters |
| POST | /api/applications | Apply to job |
| GET | /api/tests | List tests |
| POST | /api/tests/:id/submit | Submit test |
| GET | /api/wallet | Get wallet balance |
| POST | /api/wallet/add-funds | Add funds |
| GET | /api/wallet/transactions | Transaction history |
| GET | /api/reports/performance | Performance stats |
| GET | /api/leaderboard | Global rankings |
| GET | /api/certificates | User certificates |

## 🗄️ Database Models

20+ Prisma models: User, Profile, Hackathon, HackathonParticipant, Team, TeamMember, JoinRequest, Interview, Job, Application, Test, TestQuestion, TestResult, Wallet, Transaction, Certificate, Activity, ChatHistory, CompanyChallenge, Leaderboard, Progress

## 🔒 Security

- Passwords hashed with bcrypt (cost 12)
- JWT tokens with configurable expiry
- Protected routes with middleware
- Input validation with Zod
- CORS configured for frontend origin
- Database transactions for atomic wallet operations

## 📄 License

MIT License — © 2024 SriHarsha379
