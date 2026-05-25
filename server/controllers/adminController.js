import jwt from 'jsonwebtoken';
import Task from '../models/Task.js';
import User from '../models/User.js';

const createAdminToken = (email) => {
  return jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const loginAdmin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      res.status(500);
      throw new Error('Admin credentials are not configured');
    }

    if (!email || !password || email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
      res.status(401);
      throw new Error('Invalid admin credentials');
    }

    res.json({
      admin: { email: adminEmail },
      token: createAdminToken(adminEmail)
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await Task.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User and associated tasks deleted' });
  } catch (error) {
    next(error);
  }
};
