import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { startReminderService } from './services/reminderService.js';
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
