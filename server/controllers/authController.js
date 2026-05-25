import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

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
