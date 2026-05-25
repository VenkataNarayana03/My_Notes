import nodemailer from 'nodemailer';

const requiredEmailConfig = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

const isPlaceholderValue = (value) => {
  return !value || value.startsWith('your_') || value.includes('your_email');
};

const isEmailConfigured = () => {
  return requiredEmailConfig.every((key) => Boolean(process.env[key])) &&
    !isPlaceholderValue(process.env.SMTP_USER) &&
    !isPlaceholderValue(process.env.SMTP_PASS) &&
    !isPlaceholderValue(process.env.MAIL_FROM);
};

const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const formatDateTime = (date) => {
  if (!date) {
    return 'No deadline set';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: process.env.APP_TIMEZONE || 'Asia/Kolkata'
  }).format(new Date(date));
};

export const sendTaskCreatedEmail = async ({ user, task }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('Email not configured. Skipping task-created email.');
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: user.email,
    subject: `Task created: ${task.title}`,
    text: [
      `Hi ${user.name},`,
      '',
      'Your task has been created.',
      '',
      `Title: ${task.title}`,
      `Deadline: ${formatDateTime(task.dueDate)}`,
      task.description ? `Note: ${task.description}` : '',
      '',
      'Open Task Notes to view or edit it.'
    ].filter(Boolean).join('\n')
  });

  return true;
};

export const sendTaskReminderEmail = async ({ user, task }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('Email not configured. Skipping reminder email.');
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: user.email,
    subject: `Reminder: ${task.title} is due soon`,
    text: [
      `Hi ${user.name},`,
      '',
      'This is your reminder to complete the task below.',
      '',
      `Title: ${task.title}`,
      `Deadline: ${formatDateTime(task.dueDate)}`,
      task.description ? `Note: ${task.description}` : '',
      '',
      'Please complete it before the deadline.'
    ].filter(Boolean).join('\n')
  });

  return true;
};

export const sendLoginOtpEmail = async ({ user, otp }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: user.email,
    subject: 'Your Task Notes login code',
    text: [
      `Hi ${user.name},`,
      '',
      `Your one-time login code is: ${otp}`,
      '',
      'This code expires in 10 minutes.',
      'If you did not request this code, you can ignore this email.'
    ].join('\n')
  });

  return true;
};
