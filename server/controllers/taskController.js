import Task from '../models/Task.js';
import { sendTaskCreatedEmail } from '../services/emailService.js';

const parseDueDate = (dueDate) => {
  if (!dueDate) {
    return null;
  }

  const parsedDate = new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error('Deadline date and time is invalid');
    error.statusCode = 400;
    throw error;
  }

  return parsedDate;
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const parsedDueDate = parseDueDate(dueDate);

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate: parsedDueDate
    });

    try {
      const sent = await sendTaskCreatedEmail({ user: req.user, task });

      if (sent) {
        task.taskEmailSent = true;
        await task.save();
      }
    } catch (error) {
      console.error(`Task-created email failed for task ${task._id}: ${error.message}`);
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.completed = req.body.completed ?? task.completed;

    if ('dueDate' in req.body) {
      const previousDueDate = task.dueDate?.getTime() || null;
      const nextDueDate = parseDueDate(req.body.dueDate);

      task.dueDate = nextDueDate;

      if ((nextDueDate?.getTime() || null) !== previousDueDate) {
        task.reminderEmailSent = false;
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
