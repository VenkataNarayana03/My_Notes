import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { startReminderService } from './services/reminderService.js';
import { verifyEmailConnection } from './services/emailService.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Task Notes API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'task-email-background-v1',
    emailConfigured: Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
    ),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

app.get('/api/health/email', async (req, res) => {
  const emailStatus = await verifyEmailConnection();
  res.status(emailStatus.ok ? 200 : 503).json(emailStatus);
});

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderService();
});
