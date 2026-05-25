import nodemailer from 'nodemailer';

const requiredEmailConfig = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
const EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS || 10000);
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const isPlaceholderValue = (value) => {
  return !value || value.startsWith('your_') || value.includes('your_email');
};

const isEmailConfigured = () => {
  return requiredEmailConfig.every((key) => Boolean(process.env[key])) &&
    !isPlaceholderValue(process.env.SMTP_USER) &&
    !isPlaceholderValue(process.env.SMTP_PASS) &&
    !isPlaceholderValue(process.env.MAIL_FROM);
};

const getSmtpPassword = () => {
  if (process.env.SMTP_HOST?.includes('gmail.com')) {
    return process.env.SMTP_PASS.replace(/\s/g, '');
  }

  return process.env.SMTP_PASS;
};

const parseMailFrom = () => {
  const mailFrom = process.env.MAIL_FROM || '';
  const match = mailFrom.match(/^(.*)<(.+)>$/);

  if (!match) {
    return {
      name: process.env.MAIL_FROM_NAME || 'Task Notes',
      email: mailFrom.replace(/"/g, '').trim()
    };
  }

  return {
    name: match[1].replace(/"/g, '').trim() || 'Task Notes',
    email: match[2].trim()
  };
};

const isBrevoConfigured = () => Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM);

const getTransporter = () => {
  if (!isEmailConfigured()) {
    const missingKeys = requiredEmailConfig.filter((key) => !process.env[key]);
    if (missingKeys.length) {
      console.log(`Email not configured. Missing: ${missingKeys.join(', ')}`);
    }

    return null;
  }

  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: getSmtpPassword()
    },
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS
  });
};

export const verifyEmailConnection = async () => {
  if (isBrevoConfigured()) {
    return { ok: true, provider: 'brevo' };
  }

  const transporter = getTransporter();

  if (!transporter) {
    return {
      ok: false,
      error: 'Email environment variables are missing or placeholder values.'
    };
  }

  try {
    await transporter.verify();
    return { ok: true, provider: 'smtp' };
  } catch (error) {
    return {
      ok: false,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      error: error.message
    };
  }
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

const sendEmail = async ({ to, subject, text }) => {
  if (isBrevoConfigured()) {
    const sender = parseMailFrom();
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        textContent: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo email failed: ${response.status} ${errorText}`);
    }

    return true;
  }

  const transporter = getTransporter();

  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text
  });

  return true;
};

export const sendTaskCreatedEmail = async ({ user, task }) => {
  const sent = await sendEmail({
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

  if (!sent) {
    console.log('Email not configured. Skipping task-created email.');
    return false;
  }

  return true;
};

export const sendTaskReminderEmail = async ({ user, task }) => {
  const sent = await sendEmail({
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

  if (!sent) {
    console.log('Email not configured. Skipping reminder email.');
    return false;
  }

  return true;
};
