import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendLoginOtpEmail } from '../services/emailService.js';

const OTP_EXPIRES_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const normalizeEmail = (email) => email?.trim().toLowerCase();

const hashOtp = (otp) => {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(otp)
    .digest('hex');
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: userResponse(user),
      token: createToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      user: userResponse(user),
      token: createToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

export const requestLoginOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      res.status(400);
      throw new Error('Please provide email');
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.json({ message: 'If this email is registered, a login code has been sent.' });
      return;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const loginOtpHash = hashOtp(otp);

    await User.updateOne(
      { _id: user._id },
      {
        loginOtpHash,
        loginOtpExpiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
        loginOtpAttempts: 0
      }
    );

    let sent = false;

    try {
      sent = await sendLoginOtpEmail({ user, otp });
    } catch (error) {
      await User.updateOne(
        { _id: user._id, loginOtpHash },
        { $unset: { loginOtpHash: 1, loginOtpExpiresAt: 1, loginOtpAttempts: 1 } }
      );
      res.status(502);
      throw new Error('Could not send login code. Please use your password or try again.');
    }

    if (!sent) {
      await User.updateOne(
        { _id: user._id, loginOtpHash },
        { $unset: { loginOtpHash: 1, loginOtpExpiresAt: 1, loginOtpAttempts: 1 } }
      );
      res.status(503);
      throw new Error('Email login is not configured. Please use your password.');
    }

    res.json({ message: 'If this email is registered, a login code has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = req.body.otp?.trim();

    if (!email || !/^\d{6}$/.test(otp || '')) {
      res.status(400);
      throw new Error('Please provide your email and 6-digit code');
    }

    const user = await User.findOne({ email }).select('+loginOtpHash +loginOtpExpiresAt +loginOtpAttempts');

    if (!user || !user.loginOtpHash || !user.loginOtpExpiresAt) {
      res.status(401);
      throw new Error('Invalid or expired login code');
    }

    if (user.loginOtpExpiresAt.getTime() <= Date.now() || user.loginOtpAttempts >= OTP_MAX_ATTEMPTS) {
      await User.updateOne(
        { _id: user._id },
        { $unset: { loginOtpHash: 1, loginOtpExpiresAt: 1, loginOtpAttempts: 1 } }
      );
      res.status(401);
      throw new Error('Invalid or expired login code');
    }

    const receivedOtpHash = hashOtp(otp);
    const isValidOtp = crypto.timingSafeEqual(
      Buffer.from(receivedOtpHash, 'hex'),
      Buffer.from(user.loginOtpHash, 'hex')
    );

    if (!isValidOtp) {
      await User.updateOne({ _id: user._id }, { $inc: { loginOtpAttempts: 1 } });
      res.status(401);
      throw new Error('Invalid or expired login code');
    }

    await User.updateOne(
      { _id: user._id },
      { $unset: { loginOtpHash: 1, loginOtpExpiresAt: 1, loginOtpAttempts: 1 } }
    );

    res.json({
      user: userResponse(user),
      token: createToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};
