import jwt from 'jsonwebtoken';

export const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Admin authorization token missing');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      res.status(403);
      throw new Error('Admin access required');
    }

    req.admin = { email: decoded.email };
    next();
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(401);
    }
    next(error);
  }
};
