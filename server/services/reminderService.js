import Task from '../models/Task.js';
import { sendTaskReminderEmail } from './emailService.js';

const ONE_HOUR_MS = 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

let reminderInterval = null;

const sendDueSoonReminders = async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + ONE_HOUR_MS);

  const tasks = await Task.find({
    completed: false,
    dueDate: { $ne: null, $gt: now, $lte: oneHourFromNow },
    reminderEmailSent: false
  }).populate('user', 'name email');

  for (const task of tasks) {
    if (!task.user?.email) {
      continue;
    }

    try {
      const sent = await sendTaskReminderEmail({ user: task.user, task });

      if (sent) {
        task.reminderEmailSent = true;
        await task.save();
      }
    } catch (error) {
      console.error(`Reminder email failed for task ${task._id}: ${error.message}`);
    }
  }
};

export const startReminderService = () => {
  if (reminderInterval) {
    return;
  }

  sendDueSoonReminders().catch((error) => {
    console.error(`Initial reminder check failed: ${error.message}`);
  });

  reminderInterval = setInterval(() => {
    sendDueSoonReminders().catch((error) => {
      console.error(`Reminder check failed: ${error.message}`);
    });
  }, CHECK_INTERVAL_MS);

  console.log('Task reminder service started');
};
