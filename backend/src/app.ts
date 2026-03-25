import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import hackathonRoutes from './routes/hackathon.routes';
import teamRoutes from './routes/team.routes';
import interviewRoutes from './routes/interview.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import testRoutes from './routes/test.routes';
import resultRoutes from './routes/result.routes';
import reportRoutes from './routes/report.routes';
import chatRoutes from './routes/chat.routes';
import walletRoutes from './routes/wallet.routes';
import certificateRoutes from './routes/certificate.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import activityRoutes from './routes/activity.routes';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/activities', activityRoutes);

app.use(errorHandler);

export default app;
